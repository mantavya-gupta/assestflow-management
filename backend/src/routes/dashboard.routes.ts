import { Router } from 'express';
import { getDashboardSummary, getEmployeeDashboardSummary } from '../controllers/dashboard.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Global org data, requires admin-level roles
router.get('/summary', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getDashboardSummary);

// Personalized employee data
router.get('/employee-summary', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getEmployeeDashboardSummary);

export default router;
