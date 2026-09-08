import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/auth/farmer/send-otp', AuthController.sendFarmerOtp);
router.post('/auth/farmer/verify-otp', AuthController.verifyFarmerOtp);
router.post('/auth/farmer/register', AuthController.registerFarmer);

router.post('/auth/operator/login', AuthController.loginOperator);
router.post('/auth/operator/register', AuthController.registerOperator);
router.get('/operators/me', AuthController.getOperatorMe);

router.post('/auth/admin/register', AuthController.registerAdmin);
router.post('/auth/admin/login', AuthController.loginAdmin);
router.get('/admin/me', AuthController.getAdminMe);

router.post('/auth/login', AuthController.loginGeneral);
router.get('/auth/me', AuthController.getAuthMe);
router.post('/auth/logout', AuthController.logout);

export default router;
