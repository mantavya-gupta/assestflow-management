import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Previously unauthenticated: anyone could read asset/allocation/assignee
// data for the whole org. Now requires a valid session.
router.get('/summary', requireAuth, getDashboardSummary);

export default router;
