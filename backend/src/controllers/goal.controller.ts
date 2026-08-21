import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { goalService } from '../services/goal.service';
import { createGoalSchema, updateGoalSchema, goalQuerySchema } from '../schemas/goal.schema';

export class GoalController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = goalQuerySchema.parse(req.query);
      const result = await goalService.list(req.user!.id, query);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await goalService.getById(req.user!.id, id);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createGoalSchema.parse(req.body);
      const item = await goalService.create(req.user!.id, validatedData);
      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updateGoalSchema.parse(req.body);
      const item = await goalService.update(req.user!.id, id, validatedData);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await goalService.delete(req.user!.id, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const goalController = new GoalController();
