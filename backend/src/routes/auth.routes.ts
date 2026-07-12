import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword, logout, me } from '../controllers/auth.controller';
import { loginRateLimiter, authActionRateLimiter } from '../middleware/rate-limit.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', authActionRateLimiter, signup);
router.post('/login', loginRateLimiter, login);
router.post('/forgot-password', authActionRateLimiter, forgotPassword);
router.post('/reset-password', authActionRateLimiter, resetPassword);

router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
