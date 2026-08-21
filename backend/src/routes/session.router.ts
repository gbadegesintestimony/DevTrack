import { Router } from 'express';
import { learningSessionController } from '../controllers/learningSession.controller';
import { requireAuth } from '../middleware/auth';

export const sessionRouter = Router();

sessionRouter.use(requireAuth);

sessionRouter.get('/', (req, res, next) => learningSessionController.list(req, res, next));
sessionRouter.post('/', (req, res, next) => learningSessionController.create(req, res, next));
sessionRouter.get('/:id', (req, res, next) => learningSessionController.getById(req, res, next));
sessionRouter.patch('/:id', (req, res, next) => learningSessionController.update(req, res, next));
sessionRouter.delete('/:id', (req, res, next) => learningSessionController.delete(req, res, next));
