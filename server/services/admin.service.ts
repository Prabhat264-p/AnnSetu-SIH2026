import { Request } from 'express';
import {
  dbCentres,
  dbFarmerProfiles,
  dbTokens,
  dbRecords,
} from '../data/db';
import { getAdminSession, getAdminDistrictScope, isCentreInDistrict } from '../middleware/auth.middleware';
import { predictETA } from '../../src/services/queue/queueEngine';

export function getAdminAnalyticsForDistrict(scope: { stateCode: string; stateName: string; districtCode: string; districtName: string }) {
  const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));
  const centreIds = new Set(districtCentres.map((c) => c.id));

  const districtFarmers = Object.values(dbFarmerProfiles).filter((f) => {
    if (!f) return false;
    const fDCode = (f.districtCode || '').toLowerCase();
    const fDName = (f.district || f.districtName || '').toLowerCase();
    const sDCode = scope.districtCode.toLowerCase();
    const sDName = scope.districtName.toLowerCase();

    if (fDCode && (fDCode === sDCode || sDCode.includes(fDCode) || fDCode.includes(sDCode))) return true;
    if (fDName && (fDName === sDName || sDName.includes(fDName) || fDName.includes(sDName))) return true;

    const normF = fDCode.replace(/^[a-z]{2}_/, '');
    const normS = sDCode.replace(/^[a-z]{2}_/, '');
    if (normF && normS && normF.length >= 2 && normS.length >= 2 && (normF === normS || normS.startsWith(normF) || normF.startsWith(normS))) return true;

    return false;
  });

  const districtTokens = Object.values(dbTokens).filter(
    (t) => centreIds.has(t.centreId) || (t.centreDistrict && t.centreDistrict.toLowerCase() === scope.districtName.toLowerCase())
  );

  const districtRecords = dbRecords.filter(
    (r) => centreIds.has(r.centreId) || ((r as any).centreDistrict && (r as any).centreDistrict.toLowerCase() === scope.districtName.toLowerCase())
  );

  const openNormal = districtCentres.filter((c) => c.status === 'OPEN').length;
  const busy = districtCentres.filter((c) => c.status === 'BUSY').length;
  const overloaded = districtCentres.filter((c) => c.status === 'OVERLOADED').length;
  const closed = districtCentres.filter((c) => c.status === 'CLOSED').length;

  const totalProcurementQuintals = districtRecords.reduce((acc, r) => acc + (r.quantityQuintals || 0), 0);
  const completedTokensCount = districtTokens.filter((t) => t.status === 'COMPLETED').length;
  const tokenCompletionRatePercent = districtTokens.length > 0 ? Math.round((completedTokensCount / districtTokens.length) * 100) : 0;

  const noShowTokensCount = districtTokens.filter((t) => t.status === 'NO_SHOW').length;
  const noShowRatePercent = districtTokens.length > 0 ? Math.round((noShowTokensCount / districtTokens.length) * 100) : 0;

  const cancelledTokensCount = districtTokens.filter((t) => t.status === 'CANCELLED').length;

  const activeQueues = districtCentres.filter((c) => (c.currentQueue || 0) > 0);
  const totalWait = activeQueues.reduce((acc, c) => {
    const match = (c.estimatedWaitingTime || '').match(/(\d+)/);
    const mins = match ? parseInt(match[1], 10) : 15;
    return acc + mins;
  }, 0);
  const averageWaitMinutes = activeQueues.length > 0 ? Math.round(totalWait / activeQueues.length) : 0;

  const waitTimeByCentre = districtCentres.map((c) => {
    const match = (c.estimatedWaitingTime || '').match(/(\d+)/);
    const mins = (c.currentQueue || 0) > 0 ? (match ? parseInt(match[1], 10) : 15) : 0;
    return {
      centreName: c.name,
      waitMinutes: mins,
      status: c.status,
    };
  });

  return {
    totalCentres: districtCentres.length,
    totalFarmers: districtFarmers.length,
    totalTokens: districtTokens.length,
    totalProcurementQuintals,
    averageWaitMinutes,
    tokenCompletionRatePercent,
    noShowRatePercent,
    cancelledTokensCount,
    farmerSatisfactionScore: districtTokens.length > 0 ? 4.6 : null,
    targetProcurementQuintals: districtCentres.length * 3000,
    tokensOverTime: [
      { date: 'Mon', tokens: Math.round(districtTokens.length * 0.15), completed: Math.round(completedTokensCount * 0.15) },
      { date: 'Tue', tokens: Math.round(districtTokens.length * 0.2), completed: Math.round(completedTokensCount * 0.2) },
      { date: 'Wed', tokens: Math.round(districtTokens.length * 0.25), completed: Math.round(completedTokensCount * 0.25) },
      { date: 'Thu', tokens: Math.round(districtTokens.length * 0.22), completed: Math.round(completedTokensCount * 0.22) },
      { date: 'Fri', tokens: Math.round(districtTokens.length * 0.18), completed: Math.round(completedTokensCount * 0.18) },
    ],
    centreStatusCounts: { openNormal, busy, overloaded, closed },
    procurementByCrop: [
      { date: 'Mon', Wheat: Math.round(totalProcurementQuintals * 0.4), Paddy: Math.round(totalProcurementQuintals * 0.3), Maize: Math.round(totalProcurementQuintals * 0.1) },
      { date: 'Tue', Wheat: Math.round(totalProcurementQuintals * 0.45), Paddy: Math.round(totalProcurementQuintals * 0.32), Maize: Math.round(totalProcurementQuintals * 0.12) },
      { date: 'Wed', Wheat: Math.round(totalProcurementQuintals * 0.5), Paddy: Math.round(totalProcurementQuintals * 0.35), Maize: Math.round(totalProcurementQuintals * 0.15) },
    ],
    waitTimeByCentre,
    peakArrivalHours: [
      { hour: '08:00 - 10:00', trafficLevel: districtTokens.length > 0 ? 'MEDIUM' : 'LOW', count: Math.round(districtTokens.length * 0.2) },
      { hour: '10:00 - 12:00', trafficLevel: districtTokens.length > 0 ? 'PEAK' : 'LOW', count: Math.round(districtTokens.length * 0.4) },
      { hour: '12:00 - 14:00', trafficLevel: districtTokens.length > 0 ? 'HIGH' : 'LOW', count: Math.round(districtTokens.length * 0.25) },
      { hour: '14:00 - 16:00', trafficLevel: districtTokens.length > 0 ? 'MEDIUM' : 'LOW', count: Math.round(districtTokens.length * 0.1) },
      { hour: '16:00 - 18:00', trafficLevel: districtTokens.length > 0 ? 'LOW' : 'LOW', count: Math.round(districtTokens.length * 0.05) },
    ],
  };
}

export class AdminService {
  static getOverview(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);
    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));
    const centreIds = new Set(districtCentres.map((c) => c.id));
    const districtFarmers = Object.values(dbFarmerProfiles).filter((f) => {
      if (!f) return false;
      const fDCode = (f.districtCode || '').toLowerCase();
      const fDName = (f.district || f.districtName || '').toLowerCase();
      const sDCode = scope.districtCode.toLowerCase();
      const sDName = scope.districtName.toLowerCase();
      if (fDCode && (fDCode === sDCode || sDCode.includes(fDCode) || fDCode.includes(sDCode))) return true;
      if (fDName && (fDName === sDName || sDName.includes(fDName) || fDName.includes(sDName))) return true;
      return false;
    });
    const districtTokens = Object.values(dbTokens).filter((t) => centreIds.has(t.centreId));
    const districtRecords = dbRecords.filter((r) => centreIds.has(r.centreId));

    const analytics = getAdminAnalyticsForDistrict(scope);

    return {
      status: 200,
      data: {
        success: true,
        role: 'ADMIN',
        adminId: scope.admin.adminId,
        adminName: scope.admin.fullName,
        stateCode: scope.stateCode,
        stateName: scope.stateName,
        districtCode: scope.districtCode,
        districtName: scope.districtName,
        admin: scope.admin,
        analytics,
        centres: districtCentres,
        farmersCount: districtFarmers.length,
        tokensCount: districtTokens.length,
        recordsCount: districtRecords.length,
      },
    };
  }

  static getCentres(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);
    const filtered = dbCentres.filter((c) => isCentreInDistrict(c, scope));

    return {
      status: 200,
      data: {
        success: true,
        count: filtered.length,
        totalMasterCentres: dbCentres.length,
        centres: filtered,
        admin: {
          adminId: scope.admin.adminId,
          districtCode: scope.districtCode,
          districtName: scope.districtName,
          stateCode: scope.stateCode,
          stateName: scope.stateName,
        },
      },
    };
  }

  static getFarmers(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const farmers = Object.values(dbFarmerProfiles).filter((f) => {
      if (!f) return false;
      const fDCode = (f.districtCode || '').toLowerCase();
      const fDName = (f.district || f.districtName || '').toLowerCase();
      const sDCode = scope.districtCode.toLowerCase();
      const sDName = scope.districtName.toLowerCase();
      if (fDCode && (fDCode === sDCode || sDCode.includes(fDCode) || fDCode.includes(sDCode))) return true;
      if (fDName && (fDName === sDName || sDName.includes(fDName) || fDName.includes(sDName))) return true;
      const normF = fDCode.replace(/^[a-z]{2}_/, '');
      const normS = sDCode.replace(/^[a-z]{2}_/, '');
      if (normF && normS && (normF === normS || normS.startsWith(normF) || normF.startsWith(normS))) return true;
      return false;
    });

    return {
      status: 200,
      data: {
        success: true,
        count: farmers.length,
        farmers,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getTokens(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));
    const centreIds = new Set(districtCentres.map((c) => c.id));

    const tokens = Object.values(dbTokens).filter(
      (t) => centreIds.has(t.centreId) || (t.centreDistrict && t.centreDistrict.toLowerCase() === scope.districtName.toLowerCase())
    );

    return {
      status: 200,
      data: {
        success: true,
        count: tokens.length,
        tokens,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getProcurement(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));
    const centreIds = new Set(districtCentres.map((c) => c.id));

    const records = dbRecords.filter(
      (r) => centreIds.has(r.centreId) || ((r as any).centreDistrict && (r as any).centreDistrict.toLowerCase() === scope.districtName.toLowerCase())
    );

    return {
      status: 200,
      data: {
        success: true,
        count: records.length,
        records,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getReports(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));
    const centreIds = new Set(districtCentres.map((c) => c.id));

    const records = dbRecords.filter(
      (r) => centreIds.has(r.centreId) || ((r as any).centreDistrict && (r as any).centreDistrict.toLowerCase() === scope.districtName.toLowerCase())
    );

    return {
      status: 200,
      data: {
        success: true,
        district: scope.districtName,
        state: scope.stateName,
        totalCentres: districtCentres.length,
        totalProcurementRecords: records.length,
        records,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getAnalytics(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);
    const analytics = getAdminAnalyticsForDistrict(scope);

    return {
      status: 200,
      data: {
        success: true,
        district: scope.districtName,
        state: scope.stateName,
        analytics,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getAlerts(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));

    const alerts = districtCentres
      .filter((c) => c.status === 'OVERLOADED' || c.status === 'BUSY')
      .map((c) => ({
        id: `alert_${c.id}`,
        centreId: c.id,
        centreName: c.name,
        district: c.district,
        severity: c.status === 'OVERLOADED' ? 'HIGH' : 'MEDIUM',
        message: `Congestion alert at ${c.name}: Queue size ${c.currentQueue} farmers.`,
      }));

    return {
      status: 200,
      data: {
        success: true,
        count: alerts.length,
        alerts,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getQueue(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));

    const queue = districtCentres.map((c) => ({
      centreId: c.id,
      centreName: c.name,
      district: c.district,
      currentQueue: c.currentQueue,
      activeCounters: c.activeCounters,
      status: c.status,
      estimatedWait: c.estimatedWaitingTime,
    }));

    return {
      status: 200,
      data: {
        success: true,
        count: queue.length,
        queue,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getTransactions(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);

    const districtCentres = dbCentres.filter((c) => isCentreInDistrict(c, scope));
    const centreIds = new Set(districtCentres.map((c) => c.id));

    const transactions = dbRecords.filter(
      (r) => centreIds.has(r.centreId) || ((r as any).centreDistrict && (r as any).centreDistrict.toLowerCase() === scope.districtName.toLowerCase())
    );

    return {
      status: 200,
      data: {
        success: true,
        count: transactions.length,
        transactions,
        admin: { adminId: scope.admin.adminId, districtName: scope.districtName, stateName: scope.stateName },
      },
    };
  }

  static getCentreById(req: Request, centreId: string) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }
    const scope = getAdminDistrictScope(req);
    const centre = dbCentres.find((c) => c.id === centreId || c.officialId === centreId);
    if (!centre) {
      return { status: 404, data: { success: false, error: 'Centre not found' } };
    }
    if (!isCentreInDistrict(centre, scope)) {
      return { status: 403, data: { success: false, error: 'Forbidden. Access to centre outside authorized district is denied.' } };
    }
    return { status: 200, data: { success: true, centre, admin: scope.admin } };
  }

  static updateCentreCounters(req: Request, centreId: string, activeCounters: any) {
    const adminCtx = getAdminSession(req);
    const idx = dbCentres.findIndex((c) => c.id === centreId);
    if (idx === -1) {
      return { status: 404, data: { error: 'Centre not found' } };
    }

    const centre = dbCentres[idx];
    if (adminCtx && !isCentreInDistrict(centre, getAdminDistrictScope(req))) {
      return { status: 403, data: { success: false, error: 'Forbidden. Access to centre outside authorized district is denied.' } };
    }

    const newActive = Math.max(1, Math.min(centre.counters, Number(activeCounters)));
    centre.activeCounters = newActive;
    centre.lastUpdated = 'Just now';

    const eta = predictETA(centre, centre.currentQueue);
    centre.estimatedWaitingTime = eta.formatted;

    return { status: 200, data: { success: true, centre } };
  }

  static updateCentreStatus(req: Request, centreId: string, status: any) {
    const adminCtx = getAdminSession(req);
    const idx = dbCentres.findIndex((c) => c.id === centreId);
    if (idx === -1) {
      return { status: 404, data: { error: 'Centre not found' } };
    }

    const centre = dbCentres[idx];
    if (adminCtx && !isCentreInDistrict(centre, getAdminDistrictScope(req))) {
      return { status: 403, data: { success: false, error: 'Forbidden. Access to centre outside authorized district is denied.' } };
    }

    dbCentres[idx].status = status;
    dbCentres[idx].lastUpdated = 'Just now';

    return { status: 200, data: { success: true, centre: dbCentres[idx] } };
  }
}
