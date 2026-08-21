import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { technologyService } from '../services/technology.service';
import {
  createTechnologySchema,
  updateTechnologySchema,
  technologyQuerySchema,
} from '../schemas/technology.schema';

export class TechnologyController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = technologyQuerySchema.parse(req.query);
      const result = await technologyService.list(req.user!.id, query);
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
      const item = await technologyService.getById(req.user!.id, id);
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
      const validatedData = createTechnologySchema.parse(req.body);
      const item = await technologyService.create(req.user!.id, validatedData);
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
      const validatedData = updateTechnologySchema.parse(req.body);
      const item = await technologyService.update(req.user!.id, id, validatedData);
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
      const result = await technologyService.delete(req.user!.id, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const technologyController = new TechnologyController();
