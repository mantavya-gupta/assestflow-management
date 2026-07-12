import { Router } from 'express';
import { createAllocation, returnAllocation, getAllocations } from '../controllers/allocation.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ASSET_MANAGER'), getAllocations);
router.post('/', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), createAllocation);
router.put('/:id/return', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), returnAllocation);

export default router;
