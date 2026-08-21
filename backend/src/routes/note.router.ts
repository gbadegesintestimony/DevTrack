import { Router } from 'express';
import { noteController } from '../controllers/note.controller';
import { requireAuth } from '../middleware/auth';

export const noteRouter = Router();

noteRouter.use(requireAuth);

noteRouter.get('/', (req, res, next) => noteController.list(req, res, next));
noteRouter.post('/', (req, res, next) => noteController.create(req, res, next));
noteRouter.get('/:id', (req, res, next) => noteController.getById(req, res, next));
noteRouter.patch('/:id', (req, res, next) => noteController.update(req, res, next));
noteRouter.delete('/:id', (req, res, next) => noteController.delete(req, res, next));
