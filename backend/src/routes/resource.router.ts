import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { requireAuth } from '../middleware/auth';

export const resourceRouter = Router();

resourceRouter.use(requireAuth);

resourceRouter.get('/', (req, res, next) => resourceController.list(req, res, next));
resourceRouter.post('/', (req, res, next) => resourceController.create(req, res, next));
resourceRouter.get('/:id', (req, res, next) => resourceController.getById(req, res, next));
resourceRouter.patch('/:id', (req, res, next) => resourceController.update(req, res, next));
resourceRouter.delete('/:id', (req, res, next) => resourceController.delete(req, res, next));
