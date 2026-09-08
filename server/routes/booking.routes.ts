import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

const router = Router();

router.get('/slots', BookingController.getSlots);
router.post('/slots/book', BookingController.bookSlot);

export default router;
