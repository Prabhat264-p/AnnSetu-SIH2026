import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static sendFarmerOtp(req: Request, res: Response) {
    const result = AuthService.sendFarmerOtp(req.body?.mobile);
    return res.status(result.status).json(result.data);
  }

  static verifyFarmerOtp(req: Request, res: Response) {
    const result = AuthService.verifyFarmerOtp(req.body?.mobile, req.body?.otp);
    return res.status(result.status).json(result.data);
  }

  static registerFarmer(req: Request, res: Response) {
    const result = AuthService.registerFarmer(req.body);
    return res.status(result.status).json(result.data);
  }

  static loginOperator(req: Request, res: Response) {
    const result = AuthService.loginOperator(req.body);
    return res.status(result.status).json(result.data);
  }

  static registerOperator(req: Request, res: Response) {
    const result = AuthService.registerOperator(req.body);
    return res.status(result.status).json(result.data);
  }

  static getOperatorMe(req: Request, res: Response) {
    const result = AuthService.getOperatorMe(req.headers.authorization || '');
    return res.status(result.status).json(result.data);
  }

  static registerAdmin(req: Request, res: Response) {
    const result = AuthService.registerAdmin(req.body);
    return res.status(result.status).json(result.data);
  }

  static loginAdmin(req: Request, res: Response) {
    const result = AuthService.loginAdmin(req.body);
    return res.status(result.status).json(result.data);
  }

  static getAdminMe(req: Request, res: Response) {
    const result = AuthService.getAdminMe(req);
    return res.status(result.status).json(result.data);
  }

  static loginGeneral(req: Request, res: Response) {
    const result = AuthService.loginGeneral(req.body);
    return res.status(result.status).json(result.data);
  }

  static getAuthMe(req: Request, res: Response) {
    const result = AuthService.getAuthMe(req);
    return res.status(result.status).json(result.data);
  }

  static logout(req: Request, res: Response) {
    const result = AuthService.logout(req.headers.authorization || (req.headers['x-auth-token'] as string));
    return res.status(result.status).json(result.data);
  }
}
