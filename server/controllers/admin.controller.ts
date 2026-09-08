import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static getOverview(req: Request, res: Response) {
    const result = AdminService.getOverview(req);
    return res.status(result.status).json(result.data);
  }

  static getCentres(req: Request, res: Response) {
    const result = AdminService.getCentres(req);
    return res.status(result.status).json(result.data);
  }

  static getFarmers(req: Request, res: Response) {
    const result = AdminService.getFarmers(req);
    return res.status(result.status).json(result.data);
  }

  static getTokens(req: Request, res: Response) {
    const result = AdminService.getTokens(req);
    return res.status(result.status).json(result.data);
  }

  static getProcurement(req: Request, res: Response) {
    const result = AdminService.getProcurement(req);
    return res.status(result.status).json(result.data);
  }

  static getReports(req: Request, res: Response) {
    const result = AdminService.getReports(req);
    return res.status(result.status).json(result.data);
  }

  static getAnalytics(req: Request, res: Response) {
    const result = AdminService.getAnalytics(req);
    return res.status(result.status).json(result.data);
  }

  static getAlerts(req: Request, res: Response) {
    const result = AdminService.getAlerts(req);
    return res.status(result.status).json(result.data);
  }

  static getQueue(req: Request, res: Response) {
    const result = AdminService.getQueue(req);
    return res.status(result.status).json(result.data);
  }

  static getTransactions(req: Request, res: Response) {
    const result = AdminService.getTransactions(req);
    return res.status(result.status).json(result.data);
  }

  static getCentreById(req: Request, res: Response) {
    const result = AdminService.getCentreById(req, req.params.id);
    return res.status(result.status).json(result.data);
  }

  static updateCentreCounters(req: Request, res: Response) {
    const result = AdminService.updateCentreCounters(req, req.params.id, req.body?.activeCounters);
    return res.status(result.status).json(result.data);
  }

  static updateCentreStatus(req: Request, res: Response) {
    const result = AdminService.updateCentreStatus(req, req.params.id, req.body?.status);
    return res.status(result.status).json(result.data);
  }
}
