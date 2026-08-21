import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

// CSRF initialization
authRouter.get('/csrf-token', (req, res, next) => authController.getCsrfToken(req, res, next));

// Public auth endpoints (Rate limited)
authRouter.post('/register', authLimiter, (req, res, next) => authController.register(req, res, next));
authRouter.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
authRouter.post('/forgot-password', authLimiter, (req, res, next) => authController.forgotPassword(req, res, next));
authRouter.post('/reset-password', authLimiter, (req, res, next) => authController.resetPassword(req, res, next));

// Authenticated session endpoints
authRouter.post('/logout', requireAuth, (req, res, next) => authController.logout(req, res, next));
authRouter.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));
authRouter.patch('/profile', requireAuth, (req, res, next) => authController.updateProfile(req, res, next));
authRouter.post('/change-password', requireAuth, (req, res, next) => authController.changePassword(req, res, next));
