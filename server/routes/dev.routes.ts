import { Router } from 'express';
import { DevController } from '../controllers/dev.controller';

const router = Router();

router.post('/dev/reset', DevController.devReset);
router.post('/demo/reset', DevController.demoReset);
router.get('/demo/scenario', DevController.getScenario);
router.post('/demo/scenario', DevController.updateScenario);

router.get('/dev/demo-coverage', DevController.getDemoCoverage);
router.post('/dev/repair-coverage', DevController.repairDemoCoverage);
router.get('/dev/centre-consistency', DevController.getCentreConsistency);

router.get('/notifications', DevController.getNotifications);
router.get('/analytics', DevController.getAnalytics);

export default router;
