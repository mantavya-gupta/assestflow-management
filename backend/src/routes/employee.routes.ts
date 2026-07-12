import { Router } from 'express';
import { getEmployees, updateEmployee } from '../controllers/employee.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect all employee routes, only ADMIN can access
router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/', getEmployees);
router.put('/:id', updateEmployee);

export default router;
