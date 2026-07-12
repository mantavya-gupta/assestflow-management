import { Router } from 'express';
import { createTransferRequest, approveTransfer, getTransfers } from '../controllers/transfer.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getTransfers);
router.post('/', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), createTransferRequest);
router.put('/:id/approve', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), approveTransfer);

export default router;
