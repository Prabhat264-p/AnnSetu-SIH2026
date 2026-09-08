import { Request, Response } from 'express';
import { TokenService } from '../services/token.service';

export class TokenController {
  static getTokens(req: Request, res: Response) {
    const result = TokenService.getTokens(req);
    return res.status(result.status).json(result.data);
  }

  static getTokenById(req: Request, res: Response) {
    const result = TokenService.getTokenById(req.params.id);
    return res.status(result.status).json(result.data);
  }

  static updateTokenStatus(req: Request, res: Response) {
    const result = TokenService.updateTokenStatus(req, req.params.id, req.body?.status, req.body?.extra);
    return res.status(result.status).json(result.data);
  }
}
