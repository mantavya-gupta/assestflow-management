import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { loginRateLimiter, authActionRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/signup', authActionRateLimiter, signup);
router.post('/login', loginRateLimiter, login);
router.post('/forgot-password', authActionRateLimiter, forgotPassword);
router.post('/reset-password', authActionRateLimiter, resetPassword);

export default router;
