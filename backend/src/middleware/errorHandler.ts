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
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn({ requestId, validationErrors: formattedErrors }, 'Input validation failed');

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: formattedErrors.map((e) => `${e.field ? `${e.field}: ` : ''}${e.message}`).join(', ') || 'Invalid request data',
        details: formattedErrors,
      },
    });
    return;
  }

  // Handle custom AppErrors
  if (err instanceof AppError) {
    logger.warn({ requestId, err: { message: err.message, code: err.code, statusCode: err.statusCode } }, err.message);

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle generic / unexpected internal errors (Never leak raw stack traces or internal DB info in production)
  logger.error({ requestId, err: { message: err.message, stack: err.stack, name: err.name } }, 'Unhandled Internal Server Error');

  const isDev = env.NODE_ENV === 'development';

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred. Please try again later.',
      details: isDev ? { stack: err.stack } : undefined,
    },
  });
};
