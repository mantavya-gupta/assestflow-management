import { Router } from 'express';
import { createMaintenance, listMaintenanceRequests, updateMaintenanceStatus } from '../controllers/maintenance.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), listMaintenanceRequests);
router.post('/', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), createMaintenance);
router.put('/:id/status', requireRole('ADMIN', 'ASSET_MANAGER'), updateMaintenanceStatus);

export default router;
