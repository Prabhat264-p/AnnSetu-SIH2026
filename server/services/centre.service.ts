import { Request } from 'express';
import { dbCentres, setDbCentres, dbSessions, ensureDemoOperatorForCentre } from '../data/db';
import { DEMO_MODE } from '../config/constants';
import { ensureDemoCentreCoverage } from '../../src/services/centre/centreGeneratorService';

export class CentreService {
  static getNearbyCentres(district?: string, crop?: string) {
    let filtered = [...dbCentres];

    if (district && typeof district === 'string') {
      filtered = filtered.filter((c) => c.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (crop && typeof crop === 'string') {
      filtered = filtered.filter((c) => c.supportedCrops.some((cr) => cr.toLowerCase() === crop.toLowerCase()));
    }

    filtered.sort((a: any, b: any) => (a.distanceKm || 0) - (b.distanceKm || 0));
    return { status: 200, data: { count: filtered.length, centres: filtered } };
  }

  static getCentres(query: any) {
    const { state, district, block, crop, search } = query;

    if (block && String(block) !== 'All Blocks' && DEMO_MODE) {
      const { updatedCentres, addedCount } = ensureDemoCentreCoverage(
        dbCentres,
        String(block),
        state && String(state) !== 'All India' ? String(state) : undefined,
        district && String(district) !== 'All Districts' ? String(district) : undefined
      );
      if (addedCount > 0) {
        setDbCentres(updatedCentres);
        dbCentres.forEach((c) => ensureDemoOperatorForCentre(c));
      }
    }

    let filtered = [...dbCentres];

    if (state && String(state) !== 'All India') {
      filtered = filtered.filter((c) => c.state.toLowerCase() === String(state).toLowerCase());
    }

    const distTarget = (district || query.districtCode || '').toString().toLowerCase();
    if (distTarget && distTarget !== 'all districts' && distTarget !== 'all india') {
      filtered = filtered.filter((c) => {
        const cDCode = (c.districtCode || '').toLowerCase();
        const cDName = (c.district || '').toLowerCase();
        if (cDCode === distTarget || cDName === distTarget) return true;
        if ((distTarget === 'br_pat' || distTarget === 'br_ptn' || distTarget === 'patna') && (cDCode === 'br_pat' || cDCode === 'br_ptn' || cDName === 'patna')) return true;
        if ((distTarget === 'mh_nsk' || distTarget === 'nashik') && (cDCode === 'mh_nsk' || cDName === 'nashik')) return true;
        if ((distTarget === 'wb_kol' || distTarget === 'kolkata') && (cDCode === 'wb_kol' || cDName === 'kolkata')) return true;
        return false;
      });
    }

    if (block && String(block) !== 'All Blocks') {
      filtered = filtered.filter((c) => c.block.toLowerCase() === String(block).toLowerCase());
    }

    if (crop && String(crop) !== 'All Crops') {
      filtered = filtered.filter((c) =>
        c.supportedCrops.some(
          (sc) =>
            sc.toLowerCase().includes(String(crop).toLowerCase()) ||
            String(crop).toLowerCase().includes(sc.toLowerCase())
        )
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.block.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    return { status: 200, data: { count: filtered.length, centres: filtered } };
  }

  static getCentreById(id: string) {
    const centre = dbCentres.find((c) => c.id === id);
    if (!centre) {
      return { status: 404, data: { error: 'Procurement Centre not found' } };
    }
    return { status: 200, data: centre };
  }

  static getOperatorCentre(req: Request) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    const session = dbSessions[token];

    if (!session || session.role !== 'OPERATOR' || !session.centreId) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active operator session required.' } };
    }

    const centre = dbCentres.find((c) => c.id === session.centreId || c.officialId === session.centreId);

    if (!centre) {
      return { status: 404, data: { success: false, error: 'Assigned procurement centre not found in Centre Master.' } };
    }

    const opAccount = ensureDemoOperatorForCentre(centre);

    return {
      status: 200,
      data: {
        success: true,
        centre,
        operator: opAccount,
      },
    };
  }
}
