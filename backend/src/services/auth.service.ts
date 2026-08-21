import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateSecureToken, hashToken } from '../lib/crypto';
import { RegisterInput, LoginInput, ResetPasswordInput, ChangePasswordInput, UpdateProfileInput } from '../schemas/auth.schema';
import { logger } from '../lib/logger';

export class AuthService {
  /**
   * Registers a new user account.
   */
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { username: input.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === input.email.toLowerCase()) {
        const error = new Error('An account with this email address already exists.');
        (error as any).statusCode = 409;
        (error as any).code = 'EMAIL_ALREADY_EXISTS';
        throw error;
      }
      if (existingUser.username.toLowerCase() === input.username.toLowerCase()) {
        const error = new Error('This username is already taken. Please choose another one.');
        (error as any).statusCode = 409;
        (error as any).code = 'USERNAME_ALREADY_EXISTS';
        throw error;
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        name: input.name || null,
        bio: input.bio || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        learningPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ userId: user.id, username: user.username }, 'New user successfully registered');
    return user;
  }

  /**
   * Authenticates a user by email or username and password.
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.emailOrUsername.toLowerCase() },
          { username: input.emailOrUsername.toLowerCase() },
        ],
      },
    });

    // Constant-time simulated password check if user not found (prevents timing attacks)
    if (!user) {
      await hashPassword('dummy-password-for-timing-consistency');
      const error = new Error('Invalid email/username or password.');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      const error = new Error('Invalid email/username or password.');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    logger.info({ userId: user.id, username: user.username }, 'User successfully authenticated');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      learningPreferences: user.learningPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Initiates a password reset flow by creating a secure reset token.
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Do not reveal whether user exists or not
      return { message: 'If an account exists with this email, a reset link will be sent.' };
    }

    // Invalidate existing unused reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    logger.info({ userId: user.id }, 'Password reset token generated');

    // In production, an email would be dispatched.
    // For development, we return token metadata or log it safely.
    return {
      message: 'If an account exists with this email, a reset link will be sent.',
      resetToken: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
    };
  }

  /**
   * Resets a user's password using a valid reset token.
   */
  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashToken(input.token);

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt.getTime() < Date.now()) {
      const error = new Error('Password reset token is invalid or has expired.');
      (error as any).statusCode = 400;
      (error as any).code = 'INVALID_RESET_TOKEN';
      throw error;
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all existing sessions upon password reset
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    logger.info({ userId: resetRecord.userId }, 'Password successfully reset and sessions revoked');

    return { message: 'Password has been successfully reset. Please log in with your new password.' };
  }

  /**
   * Updates an authenticated user's profile details.
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.learningPreferences !== undefined && {
          learningPreferences: input.learningPreferences === null ? undefined : (input.learningPreferences as any),
        }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        learningPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Changes the password for an already authenticated user.
   */
  async changePassword(userId: string, currentSessionId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('User not found.');
      (error as any).statusCode = 404;
      (error as any).code = 'USER_NOT_FOUND';
      throw error;
    }

    const isCurrentValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      const error = new Error('The current password you provided is incorrect.');
      (error as any).statusCode = 400;
      (error as any).code = 'INCORRECT_CURRENT_PASSWORD';
      throw error;
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      // Invalidate other sessions, keep current active session
      prisma.session.deleteMany({
        where: {
          userId,
          id: { not: currentSessionId },
        },
      }),
    ]);

    return { message: 'Password changed successfully.' };
  }
}

export const authService = new AuthService();
