import { Request } from 'express';
import { dbFarmerProfiles, dbSessions } from '../data/db';
import { FarmerProfile } from '../../src/types';
import { INITIAL_FARMER_PROFILE } from '../../src/data/mockData';
import { getCoordinatesForSubdistrict } from '../../src/services/location/locationService';

export class FarmerService {
  static getFarmerMe(req: Request) {
    const authHeader = req.headers.authorization;
    let targetId = (req.query.farmerId as string) || 'usr_farmer_01';

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (dbSessions[token] && dbSessions[token].role === 'FARMER') {
        targetId = dbSessions[token].userId;
      }
    }

    const profile = dbFarmerProfiles[targetId] || dbFarmerProfiles['usr_farmer_01'] || INITIAL_FARMER_PROFILE;
    return { status: 200, data: { success: true, profile } };
  }

  static getFarmerProfile(farmerId?: string) {
    const targetId = farmerId || 'usr_farmer_01';
    const profile = dbFarmerProfiles[targetId] || dbFarmerProfiles['usr_farmer_01'] || INITIAL_FARMER_PROFILE;
    return { status: 200, data: { success: true, profile } };
  }

  static updateFarmerProfile(body: any) {
    const farmerId = body.userId || body.farmerId || body.id || 'usr_farmer_01';
    const currentProfile = dbFarmerProfiles[farmerId] || { ...INITIAL_FARMER_PROFILE, userId: farmerId };

    const stateName = body.stateName || body.state || currentProfile.stateName || currentProfile.state;
    const districtName = body.districtName || body.district || currentProfile.districtName || currentProfile.district;
    const subdistrictName = body.subdistrictName || body.block || currentProfile.subdistrictName || currentProfile.block;
    const village = body.village || currentProfile.village;

    let lat = body.latitude;
    let lng = body.longitude;
    let source = body.locationSource;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      const demoCoords = getCoordinatesForSubdistrict(stateName, districtName, subdistrictName);
      lat = demoCoords.latitude;
      lng = demoCoords.longitude;
      source = 'DEMO';
    } else if (!source) {
      source = 'GPS';
    }

    const updatedProfile: FarmerProfile = {
      ...currentProfile,
      id: currentProfile.id || `frm_${Date.now()}`,
      userId: farmerId,
      name: body.name || currentProfile.name || 'Ram Das',
      mobile: body.mobile || currentProfile.mobile || '+91 98765 43210',
      stateCode: body.stateCode || currentProfile.stateCode || 'BR',
      stateName,
      districtCode: body.districtCode || currentProfile.districtCode || 'BR_PTN',
      districtName,
      subdistrictCode: body.subdistrictCode || currentProfile.subdistrictCode || 'BR_PTN_FATWAH',
      subdistrictName,
      state: stateName,
      district: districtName,
      block: subdistrictName,
      village,
      pinCode: body.pinCode || currentProfile.pinCode,
      latitude: lat,
      longitude: lng,
      locationSource: source,
      updatedAt: new Date().toISOString(),
    };

    dbFarmerProfiles[farmerId] = updatedProfile;

    return { status: 200, data: { success: true, profile: updatedProfile } };
  }
}
