import { Router } from 'express';
import { createBooking, getBookings, cancelBooking } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
