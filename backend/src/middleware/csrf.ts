import { Request, Response, NextFunction } from 'express';
import { CSRF_COOKIE_NAME, getCsrfCookieOptions } from '../lib/session';
import { generateSecureToken } from '../lib/crypto';

/**
 * Middleware ensuring a CSRF cookie exists for the client.
 */
export const ensureCsrfCookie = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    const token = generateSecureToken(24);
    res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
  }
  next();
};

/**
 * Middleware that verifies CSRF tokens on state-changing requests.
 * Uses the Double-Submit Cookie pattern.
 */
export const verifyCsrf = (req: Request, res: Response, next: NextFunction): void => {
  // Safe HTTP methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  // Exempt initial auth endpoints that create the first session/csrf cookie if unauthenticated
  const exemptPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password'];
  if (exemptPaths.some((p) => req.path.startsWith(p))) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      },
    });
    return;
  }

  next();
};
