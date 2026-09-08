import { Request, Response } from 'express';
import { FarmerService } from '../services/farmer.service';

export class FarmerController {
  static getFarmerMe(req: Request, res: Response) {
    const result = FarmerService.getFarmerMe(req);
    return res.status(result.status).json(result.data);
  }

  static getFarmerProfile(req: Request, res: Response) {
    const result = FarmerService.getFarmerProfile(req.query.farmerId as string);
    return res.status(result.status).json(result.data);
  }

  static updateFarmerProfile(req: Request, res: Response) {
    const result = FarmerService.updateFarmerProfile(req.body);
    return res.status(result.status).json(result.data);
  }
}
