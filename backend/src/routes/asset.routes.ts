import { Router } from 'express';
import { createAsset, getAssets, getAssetById } from '../controllers/asset.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getAssets);
router.get('/:id', getAssetById);
// Only admins or asset managers can register assets
router.post('/', requireRole('ADMIN', 'ASSET_MANAGER'), createAsset);

export default router;
