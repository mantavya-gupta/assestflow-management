import { Router } from 'express';
import { 
  createDepartment, 
  getDepartments, 
  updateDepartment,
  getEligibleHeads
} from '../controllers/department.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect all department routes, only ADMIN can access
router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/', getDepartments);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);

// Helper route to get users eligible to be a Department Head
router.get('/eligible-heads', getEligibleHeads);

export default router;
