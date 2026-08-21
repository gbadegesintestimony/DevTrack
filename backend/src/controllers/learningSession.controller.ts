import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { learningSessionService } from '../services/learningSession.service';
import {
  createSessionSchema,
  updateSessionSchema,
  sessionQuerySchema,
} from '../schemas/session.schema';

export class LearningSessionController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = sessionQuerySchema.parse(req.query);
      const result = await learningSessionService.list(req.user!.id, query);
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
      const item = await learningSessionService.getById(req.user!.id, id);
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
      const validatedData = createSessionSchema.parse(req.body);
      const item = await learningSessionService.create(req.user!.id, validatedData);
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
      const validatedData = updateSessionSchema.parse(req.body);
      const item = await learningSessionService.update(req.user!.id, id, validatedData);
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
      const result = await learningSessionService.delete(req.user!.id, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const learningSessionController = new LearningSessionController();
