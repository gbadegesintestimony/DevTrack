import { Router } from 'express';
import { healthRouter } from './health.router';
import { authRouter } from './auth.router';
import { technologyRouter } from './technology.router';
import { goalRouter } from './goal.router';
import { resourceRouter } from './resource.router';
import { sessionRouter } from './session.router';
import { noteRouter } from './note.router';
import { dashboardRouter } from './dashboard.router';

export const apiV1Router = Router();

// Health check route: /api/v1/health
apiV1Router.use('/health', healthRouter);

// Authentication routes: /api/v1/auth
apiV1Router.use('/auth', authRouter);

// Core Data routes (Phase 3)
apiV1Router.use('/technologies', technologyRouter);
apiV1Router.use('/goals', goalRouter);
apiV1Router.use('/resources', resourceRouter);
apiV1Router.use('/sessions', sessionRouter);
apiV1Router.use('/notes', noteRouter);

// Dashboard & Analytics routes (Phase 4)
apiV1Router.use('/dashboard', dashboardRouter);

// Root info route: /api/v1
apiV1Router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'DevTrack API',
      version: '1.0.0',
      description: 'Secure Full-Stack Developer Learning & Progress Platform API',
      documentation: '/api/v1/docs',
    },
  });
});
