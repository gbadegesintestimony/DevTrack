import { Request, Response, CookieOptions } from 'express';
import { prisma } from './prisma';
import { env } from '../config/env';
import { generateSecureToken, hashToken } from './crypto';

export const SESSION_COOKIE_NAME = 'devtrack_session';
export const CSRF_COOKIE_NAME = 'devtrack_csrf';
export const SESSION_EXPIRATION_DAYS = 7;
export const SESSION_EXPIRATION_MS = SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export const getSessionCookieOptions = (): CookieOptions => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    maxAge: SESSION_EXPIRATION_MS,
  };
};

export const getCsrfCookieOptions = (): CookieOptions => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: false, // Read by JS to submit with state-changing requests in x-csrf-token header
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    maxAge: SESSION_EXPIRATION_MS,
  };
};

/**
 * Creates a new authenticated session for a user, records it in the database, and sets the session cookie.
 */
export const createSession = async (userId: string, req: Request, res: Response) => {
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_MS);

  const ipAddress = req.ip || req.socket.remoteAddress || undefined;
  const userAgent = req.headers['user-agent'] || undefined;

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
    include: {
      user: {
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
      },
    },
  });

  res.cookie(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions());

  // Also issue fresh CSRF token
  const csrfToken = generateSecureToken(24);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());

  return {
    session,
    csrfToken,
    user: session.user,
  };
};

/**
 * Validates a raw session token from cookies against the database.
 */
export const validateSessionToken = async (rawToken: string) => {
  if (!rawToken || typeof rawToken !== 'string') {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
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
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt.getTime() < Date.now()) {
    // Delete expired session asynchronously
    prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session;
};

/**
 * Invalidates and destroys a session in the database and clears the session cookie.
 */
export const destroySession = async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[SESSION_COOKIE_NAME];

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    try {
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    } catch {
      // Ignore deletion failures if already removed
    }
  }

  res.clearCookie(SESSION_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: env.NODE_ENV === 'production',
  });
  
  res.clearCookie(CSRF_COOKIE_NAME, {
    path: '/',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: env.NODE_ENV === 'production',
  });
};
