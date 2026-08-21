import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SESSION_COOKIE_NAME, validateSessionToken } from '../lib/session';

/**
 * Middleware that requires a valid, active session.
 * Rejects unauthenticated requests with HTTP 401.
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in to continue.',
      },
    });
    return;
  }

  try {
    const session = await validateSessionToken(token);

    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Your session has expired or is invalid. Please log in again.',
        },
      });
      return;
    }

    req.user = session.user;
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware that optionally attaches the authenticated user if a valid session exists,
 * but allows unauthenticated requests to proceed.
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    next();
    return;
  }

  try {
    const session = await validateSessionToken(token);
    if (session) {
      req.user = session.user;
      req.sessionId = session.id;
    }
  } catch {
    // Silently continue for optional auth
  }

  next();
};
