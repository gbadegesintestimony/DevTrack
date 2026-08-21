import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]({
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    }, `${req.method} ${req.originalUrl || req.url} ${res.statusCode} in ${duration}ms`);
  });

  next();
};
