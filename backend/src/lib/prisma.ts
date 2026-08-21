import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Log Prisma events through structured logger safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on?.('error', (e: unknown) => {
  logger.error({ err: e }, 'Prisma Database Error');
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on?.('warn', (e: unknown) => {
  logger.warn({ warning: e }, 'Prisma Database Warning');
});
