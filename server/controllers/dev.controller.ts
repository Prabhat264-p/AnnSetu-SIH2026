import { Request, Response } from 'express';
import { DemoService } from '../services/demo.service';
import { NotificationService } from '../services/notification.service';
import { dbAnalytics } from '../data/db';

export class DevController {
  static devReset(req: Request, res: Response) {
    const result = DemoService.devReset(req.body?.mode);
    return res.status(result.status).json(result.data);
  }

  static demoReset(req: Request, res: Response) {
    const result = DemoService.demoReset(req.body?.mode);
    return res.status(result.status).json(result.data);
  }

  static getScenario(req: Request, res: Response) {
    const result = DemoService.getScenario();
    return res.status(result.status).json(result.data);
  }

  static updateScenario(req: Request, res: Response) {
    const result = DemoService.updateScenario(req.body);
    return res.status(result.status).json(result.data);
  }

  static getDemoCoverage(req: Request, res: Response) {
    const result = DemoService.getDemoCoverage();
    return res.status(result.status).json(result.data);
  }

  static repairDemoCoverage(req: Request, res: Response) {
    const result = DemoService.repairDemoCoverage();
    return res.status(result.status).json(result.data);
  }

  static getCentreConsistency(req: Request, res: Response) {
    const result = DemoService.getCentreConsistency();
    return res.status(result.status).json(result.data);
  }

  static getNotifications(req: Request, res: Response) {
    const result = NotificationService.getNotifications(req.query.userId as string);
    return res.status(result.status).json(result.data);
  }

  static getAnalytics(req: Request, res: Response) {
    return res.json(dbAnalytics);
  }
}
