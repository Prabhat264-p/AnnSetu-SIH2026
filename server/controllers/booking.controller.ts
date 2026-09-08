import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  static getSlots(req: Request, res: Response) {
    const result = BookingService.getSlots(req.query.centreId as string, req.query.date as string);
    return res.status(result.status).json(result.data);
  }

  static bookSlot(req: Request, res: Response) {
    const result = BookingService.bookSlot(req.body);
    return res.status(result.status).json(result.data);
  }
}
