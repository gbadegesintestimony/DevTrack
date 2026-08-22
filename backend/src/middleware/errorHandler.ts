import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested page or resource (${req.originalUrl}) could not be found.`,
    },
  });
};

const friendlyFieldNames: Record<string, string> = {
  emailOrUsername: 'Email or Username',
  email: 'Email address',
  username: 'Username',
  password: 'Password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  confirmPassword: 'Password confirmation',
  name: 'Name',
  bio: 'Bio',
  learningPreferences: 'Learning preferences',
  title: 'Title',
  category: 'Category',
  status: 'Status',
  proficiency: 'Proficiency level',
  targetDate: 'Target date',
  startDate: 'Start date',
  durationMinutes: 'Duration in minutes',
  topicsCovered: 'Topics covered',
  content: 'Content',
  url: 'URL link',
};

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | ZodError | any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  // 1. Handle Zod validation errors with clear, human-friendly messages
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => {
      const fieldPath = e.path.join('.');
      const readableField = friendlyFieldNames[fieldPath] || fieldPath;
      return {
        field: fieldPath,
        message: e.message,
        friendlyText: readableField ? `${readableField}: ${e.message}` : e.message,
      };
    });

    const combinedMessage = formattedErrors.map((e) => e.friendlyText).join('. ') || 'Please check your input and try again.';

    logger.warn({ requestId, validationErrors: formattedErrors }, 'Input validation failed');

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: combinedMessage,
        details: formattedErrors,
      },
    });
    return;
  }

  // 2. Handle known client errors (AppError or any error with an explicit HTTP status code < 500)
  const explicitStatusCode = err.statusCode || (err instanceof AppError ? err.statusCode : undefined);
  const explicitCode = err.code || (err instanceof AppError ? err.code : undefined);

  if (explicitStatusCode && explicitStatusCode >= 400 && explicitStatusCode < 500) {
    logger.warn({ requestId, err: { message: err.message, code: explicitCode, statusCode: explicitStatusCode } }, err.message);

    res.status(explicitStatusCode).json({
      success: false,
      error: {
        code: explicitCode || 'CLIENT_ERROR',
        message: err.message || 'Invalid request. Please check your data and try again.',
        details: err.details,
      },
    });
    return;
  }

  // 3. Handle CSRF Token errors
  if (err.code === 'EBADCSRFTOKEN' || err.message?.includes('CSRF')) {
    logger.warn({ requestId }, 'CSRF token mismatch');
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      error: {
        code: 'CSRF_ERROR',
        message: 'Security validation failed. Please refresh the page and try again.',
      },
    });
    return;
  }

  // 4. Handle unexpected internal server errors (500)
  logger.error({ requestId, err: { message: err.message, stack: err.stack, name: err.name } }, 'Unhandled Internal Server Error');

  const isDev = env.NODE_ENV === 'development';

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred on the server. Please try again in a few moments.',
      details: isDev ? { stack: err.stack } : undefined,
    },
  });
};
