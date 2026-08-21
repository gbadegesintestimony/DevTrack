import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { requestIdMiddleware } from './middleware/requestId';
import { securityHeadersMiddleware } from './middleware/securityHeaders';
import { corsMiddleware } from './middleware/cors';
import { requestLoggerMiddleware } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ensureCsrfCookie, verifyCsrf } from './middleware/csrf';
import { apiLimiter } from './middleware/rateLimiter';
import { apiV1Router } from './routes/api.router';

export const createApp = (): Express => {
  const app = express();

  // Trust reverse proxy if in production
  app.set('trust proxy', 1);

  // Disable 'X-Powered-By' header
  app.disable('x-powered-by');

  // Baseline Security Middleware
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);

  // Request Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // CSRF token cookie initialization & double-submit verification
  app.use(ensureCsrfCookie);
  app.use(verifyCsrf);

  // General API Rate Limiter
  app.use('/api', apiLimiter);

  // Request Logging
  app.use(requestLoggerMiddleware);

  // API Routes
  app.use('/api/v1', apiV1Router);

  // Handle 404
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
