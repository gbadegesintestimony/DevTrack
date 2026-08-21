import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const responseData = {
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    services: {
      api: 'healthy',
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  };

  const statusCode = dbStatus === 'healthy' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
  res.status(statusCode).json({
    success: dbStatus === 'healthy',
    data: responseData,
  });
});
