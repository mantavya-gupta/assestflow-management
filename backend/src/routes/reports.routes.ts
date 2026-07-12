import { Router } from 'express';
import { getDashboardReports } from '../controllers/reports.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
// Only admins/managers can see global reports
router.get('/dashboard', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getDashboardReports);

export default router;
