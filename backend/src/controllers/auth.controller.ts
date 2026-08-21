import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { createSession, destroySession, CSRF_COOKIE_NAME, getCsrfCookieOptions } from '../lib/session';
import { generateSecureToken } from '../lib/crypto';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  /**
   * Generates or returns a CSRF token for the frontend.
   */
  async getCsrfToken(req: Request, res: Response, _next: NextFunction): Promise<void> {
    let token = req.cookies?.[CSRF_COOKIE_NAME];
    if (!token) {
      token = generateSecureToken(24);
      res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
    }
    res.status(200).json({
      success: true,
      data: { csrfToken: token },
    });
  }

  /**
   * Registers a new user account, creates an active session, and sets secure cookies.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.register(validatedData);

      const sessionResult = await createSession(user.id, req, res);

      res.status(201).json({
        success: true,
        data: {
          user: sessionResult.user,
          csrfToken: sessionResult.csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticates user, creates session, and sets secure cookies.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await authService.login(validatedData);

      const sessionResult = await createSession(user.id, req, res);

      res.status(200).json({
        success: true,
        data: {
          user: sessionResult.user,
          csrfToken: sessionResult.csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs out the user by invalidating the session in DB and clearing cookies.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await destroySession(req, res);
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully.' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns current authenticated user profile.
   */
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates current authenticated user profile.
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        });
        return;
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await authService.updateProfile(req.user.id, validatedData);

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Changes password for authenticated user.
   */
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.sessionId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        });
        return;
      }

      const validatedData = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(req.user.id, req.sessionId, validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiates password reset request.
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await authService.requestPasswordReset(validatedData.email);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completes password reset with token.
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
