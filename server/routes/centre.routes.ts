import { Router } from 'express';
import { CentreController } from '../controllers/centre.controller';

const router = Router();

router.get('/locations/states', CentreController.getStates);
router.get('/locations/union-territories', CentreController.getUnionTerritories);
router.get('/locations/districts', CentreController.getDistricts);
router.get('/locations/subdistricts', CentreController.getSubdistricts);

router.get('/crops', CentreController.getCrops);

router.get('/centres/nearby', CentreController.getNearbyCentres);
router.get('/centres', CentreController.getCentres);
router.get('/centres/:id', CentreController.getCentreById);
router.get('/operator/centre', CentreController.getOperatorCentre);

router.post('/recommendations', CentreController.getRecommendations);

export default router;
