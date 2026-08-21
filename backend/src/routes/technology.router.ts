import { Router } from 'express';
import { technologyController } from '../controllers/technology.controller';
import { requireAuth } from '../middleware/auth';

export const technologyRouter = Router();

// All technology operations require an active session
technologyRouter.use(requireAuth);

technologyRouter.get('/', (req, res, next) => technologyController.list(req, res, next));
technologyRouter.post('/', (req, res, next) => technologyController.create(req, res, next));
technologyRouter.get('/:id', (req, res, next) => technologyController.getById(req, res, next));
technologyRouter.patch('/:id', (req, res, next) => technologyController.update(req, res, next));
technologyRouter.delete('/:id', (req, res, next) => technologyController.delete(req, res, next));
