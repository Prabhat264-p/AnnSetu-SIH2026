import { Request, Response } from 'express';
import { CentreService } from '../services/centre.service';
import { recommendCentres } from '../../src/services/recommendation/recommendationEngine';
import { INITIAL_FARMER_PROFILE } from '../../src/data/mockData';
import { dbCentres } from '../data/db';
import {
  INDIA_STATES,
  INDIA_UNION_TERRITORIES,
  INDIA_STATES_UTS,
  getDistrictsForState,
  getBlocksForDistrict,
} from '../../src/services/location/locationService';

export class CentreController {
  static getNearbyCentres(req: Request, res: Response) {
    const result = CentreService.getNearbyCentres(req.query.district as string, req.query.crop as string);
    return res.status(result.status).json(result.data);
  }

  static getCentres(req: Request, res: Response) {
    const result = CentreService.getCentres(req.query);
    return res.status(result.status).json(result.data);
  }

  static getCentreById(req: Request, res: Response) {
    const result = CentreService.getCentreById(req.params.id);
    return res.status(result.status).json(result.data);
  }

  static getOperatorCentre(req: Request, res: Response) {
    const result = CentreService.getOperatorCentre(req);
    return res.status(result.status).json(result.data);
  }

  static getRecommendations(req: Request, res: Response) {
    const { farmer, selectedCrop } = req.body;
    const recommendations = recommendCentres(
      farmer || INITIAL_FARMER_PROFILE,
      dbCentres,
      selectedCrop || 'Wheat'
    );
    return res.json({
      count: recommendations.length,
      crop: selectedCrop || 'Wheat',
      algorithm: 'Weighted Multi-Criteria Decision Model (Wait: 30%, Dist: 25%, Slots: 20%, Cap: 15%, Crop: 10%)',
      recommendations,
    });
  }

  static getStates(req: Request, res: Response) {
    const { type } = req.query;
    if (type === 'STATE') {
      return res.json({ count: INDIA_STATES.length, locations: INDIA_STATES });
    }
    if (type === 'UNION_TERRITORY') {
      return res.json({ count: INDIA_UNION_TERRITORIES.length, locations: INDIA_UNION_TERRITORIES });
    }
    return res.json({
      count: INDIA_STATES_UTS.length,
      states: INDIA_STATES,
      unionTerritories: INDIA_UNION_TERRITORIES,
      allLocations: INDIA_STATES_UTS,
    });
  }

  static getUnionTerritories(req: Request, res: Response) {
    return res.json({ count: INDIA_UNION_TERRITORIES.length, locations: INDIA_UNION_TERRITORIES });
  }

  static getDistricts(req: Request, res: Response) {
    const { state } = req.query;
    const districts = getDistrictsForState(String(state || 'All India'));
    return res.json({ state: state || 'All India', count: districts.length, districts });
  }

  static getSubdistricts(req: Request, res: Response) {
    const { state, district } = req.query;
    const blocks = getBlocksForDistrict(String(state || 'All India'), String(district || 'All Districts'));
    return res.json({
      state: state || 'All India',
      district: district || 'All Districts',
      count: blocks.length,
      subdistricts: blocks,
    });
  }

  static getCrops(req: Request, res: Response) {
    const crops = [
      { id: 'crop_wheat', name: 'Wheat', icon: '🌾', mspRupeesPerQtl: 2275, category: 'Rabi' },
      { id: 'crop_paddy', name: 'Paddy', icon: '🌾', mspRupeesPerQtl: 2300, category: 'Kharif' },
      { id: 'crop_maize', name: 'Maize', icon: '🌽', mspRupeesPerQtl: 2225, category: 'Kharif' },
      { id: 'crop_soybean', name: 'Soybean', icon: '🌱', mspRupeesPerQtl: 4892, category: 'Kharif' },
      { id: 'crop_cotton', name: 'Cotton', icon: '☁️', mspRupeesPerQtl: 7121, category: 'Kharif' },
      { id: 'crop_gram', name: 'Chickpea / Chana', icon: '🫘', mspRupeesPerQtl: 5440, category: 'Rabi' },
    ];
    return res.json({ count: crops.length, crops });
  }
}
