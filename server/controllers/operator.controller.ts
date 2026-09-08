import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import { ProcurementService } from '../services/procurement.service';

export class OperatorController {
  static callNext(req: Request, res: Response) {
    const result = QueueService.callNextFarmer(req, req.body?.centreId);
    return res.status(result.status).json(result.data);
  }

  static getRecords(req: Request, res: Response) {
    const result = ProcurementService.getRecords(req);
    return res.status(result.status).json(result.data);
  }
}
