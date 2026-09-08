import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.get('/admin/overview', AdminController.getOverview);
router.get('/admin/centres', AdminController.getCentres);
router.get('/admin/farmers', AdminController.getFarmers);
router.get('/admin/tokens', AdminController.getTokens);
router.get('/admin/procurement', AdminController.getProcurement);
router.get('/admin/reports', AdminController.getReports);
router.get('/admin/analytics', AdminController.getAnalytics);
router.get('/admin/alerts', AdminController.getAlerts);
router.get('/admin/queue', AdminController.getQueue);
router.get('/admin/transactions', AdminController.getTransactions);
router.get('/admin/centres/:id', AdminController.getCentreById);

router.put('/centres/:id/counters', AdminController.updateCentreCounters);
router.put('/centres/:id/status', AdminController.updateCentreStatus);

export default router;
