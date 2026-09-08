import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';

const router = Router();

router.get('/tokens', TokenController.getTokens);
router.get('/tokens/:id', TokenController.getTokenById);
router.put('/tokens/:id/status', TokenController.updateTokenStatus);

export default router;
