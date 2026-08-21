import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { noteService } from '../services/note.service';
import { createNoteSchema, updateNoteSchema, noteQuerySchema } from '../schemas/note.schema';

export class NoteController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = noteQuerySchema.parse(req.query);
      const result = await noteService.list(req.user!.id, query);
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
      const item = await noteService.getById(req.user!.id, id);
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
      const validatedData = createNoteSchema.parse(req.body);
      const item = await noteService.create(req.user!.id, validatedData);
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
      const validatedData = updateNoteSchema.parse(req.body);
      const item = await noteService.update(req.user!.id, id, validatedData);
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
      const result = await noteService.delete(req.user!.id, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const noteController = new NoteController();
