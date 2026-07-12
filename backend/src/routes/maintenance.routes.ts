import { Router } from 'express';
import { createMaintenance } from '../controllers/maintenance.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
// Anyone can raise maintenance, assuming they have access to the asset
router.post('/', createMaintenance);

export default router;
