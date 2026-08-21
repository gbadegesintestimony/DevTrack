import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth';

export const dashboardRouter = Router();

// All dashboard endpoints require active authentication
dashboardRouter.use(requireAuth);

dashboardRouter.get('/stats', (req, res, next) => dashboardController.getStats(req, res, next));
dashboardRouter.get('/activity', (req, res, next) => dashboardController.getActivity(req, res, next));
dashboardRouter.get('/summary', (req, res, next) => dashboardController.getSummary(req, res, next));
