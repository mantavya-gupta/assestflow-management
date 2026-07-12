import { Router } from 'express';
import { getLogs, getNotifications, markNotificationRead } from '../controllers/activity.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/logs', requireRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getLogs);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
