import { Router } from 'express';
import { createAuditCycle, getAuditCycles, getAuditCycle, updateAuditRecord, closeAuditCycle } from '../controllers/audit.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getAuditCycles);
router.post('/', requireRole('ADMIN', 'ASSET_MANAGER'), createAuditCycle);
router.get('/:id', getAuditCycle);
router.post('/:id/close', requireRole('ADMIN', 'ASSET_MANAGER'), closeAuditCycle);
router.put('/records/:id', updateAuditRecord);

export default router;
