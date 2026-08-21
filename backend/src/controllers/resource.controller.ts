import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { resourceService } from '../services/resource.service';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
} from '../schemas/resource.schema';

export class ResourceController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = resourceQuerySchema.parse(req.query);
      const result = await resourceService.list(req.user!.id, query);
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
      const item = await resourceService.getById(req.user!.id, id);
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
      const validatedData = createResourceSchema.parse(req.body);
      const item = await resourceService.create(req.user!.id, validatedData);
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
      const validatedData = updateResourceSchema.parse(req.body);
      const item = await resourceService.update(req.user!.id, id, validatedData);
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
      const result = await resourceService.delete(req.user!.id, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const resourceController = new ResourceController();
