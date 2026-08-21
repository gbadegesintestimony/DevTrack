import { Router } from 'express';
import { goalController } from '../controllers/goal.controller';
import { requireAuth } from '../middleware/auth';

export const goalRouter = Router();

goalRouter.use(requireAuth);

goalRouter.get('/', (req, res, next) => goalController.list(req, res, next));
goalRouter.post('/', (req, res, next) => goalController.create(req, res, next));
goalRouter.get('/:id', (req, res, next) => goalController.getById(req, res, next));
goalRouter.patch('/:id', (req, res, next) => goalController.update(req, res, next));
goalRouter.delete('/:id', (req, res, next) => goalController.delete(req, res, next));
