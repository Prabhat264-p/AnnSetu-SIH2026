import { Router } from 'express';
import { FarmerController } from '../controllers/farmer.controller';

const router = Router();

router.get('/farmers/me', FarmerController.getFarmerMe);
router.get('/farmers/profile', FarmerController.getFarmerProfile);
router.post('/farmers/profile', FarmerController.updateFarmerProfile);

export default router;
