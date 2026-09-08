import { Router } from 'express';
import { OperatorController } from '../controllers/operator.controller';

const router = Router();

router.post('/queue/call-next', OperatorController.callNext);
router.get('/records', OperatorController.getRecords);

export default router;
