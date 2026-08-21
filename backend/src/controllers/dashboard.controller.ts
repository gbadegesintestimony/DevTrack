import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getStats(req.user!.id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) || 7 : 7;
      const activity = await dashboardService.getActivity(req.user!.id, Math.min(days, 90));
      res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dashboardService.getSummary(req.user!.id);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
