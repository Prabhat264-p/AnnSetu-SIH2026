import { Request, Response, NextFunction } from 'express';
import { dbSessions, dbAdminAccounts, DEFAULT_SEED_ADMIN, SessionData } from '../data/db';
import { AdminAccount, ProcurementCentre } from '../../src/types';

export function getAdminSession(req: Request): { session: SessionData; admin: AdminAccount } | null {
  const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string) || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const session = dbSessions[token];
  if (!session || session.role !== 'ADMIN') return null;

  let adminAcc = session.adminId ? dbAdminAccounts[session.adminId] : null;
  if (!adminAcc) {
    adminAcc = Object.values(dbAdminAccounts).find(
      (a) => a.userId === session.userId || (session.adminId && a.adminId.toLowerCase() === session.adminId.toLowerCase())
    );
  }
  if (!adminAcc && (session.adminId === 'DEMO-ADMIN-001' || session.userId === 'usr_admin_001')) {
    adminAcc = DEFAULT_SEED_ADMIN;
  }
  if (!adminAcc) return null;
  return { session, admin: adminAcc };
}

export function getAdminDistrictScope(req: Request): {
  admin: AdminAccount;
  stateCode: string;
  stateName: string;
  districtCode: string;
  districtName: string;
} {
  const adminCtx = getAdminSession(req);
  if (!adminCtx) {
    throw new Error('Admin authentication required');
  }
  return {
    admin: adminCtx.admin,
    stateCode: adminCtx.admin.stateCode,
    stateName: adminCtx.admin.stateName,
    districtCode: adminCtx.admin.districtCode,
    districtName: adminCtx.admin.districtName,
  };
}

export function isCentreInDistrict(
  centre: ProcurementCentre,
  scope: { stateCode?: string; stateName?: string; districtCode: string; districtName: string }
): boolean {
  if (!centre) return false;

  // 1. Check State isolation (if state is present on both and different, reject)
  const cStateCode = (centre.stateCode || '').toLowerCase().trim();
  const sStateCode = (scope.stateCode || '').toLowerCase().trim();
  if (cStateCode && sStateCode && cStateCode !== sStateCode) {
    return false;
  }

  const cStateName = (centre.state || '').toLowerCase().trim();
  const sStateName = (scope.stateName || '').toLowerCase().trim();
  if (cStateName && sStateName && cStateName !== sStateName) {
    return false;
  }

  const cDCode = (centre.districtCode || '').toLowerCase().trim();
  const cDName = (centre.district || '').toLowerCase().trim();
  const sDCode = (scope.districtCode || '').toLowerCase().trim();
  const sDName = (scope.districtName || '').toLowerCase().trim();

  // 2. Direct code match
  if (cDCode && sDCode && cDCode === sDCode) return true;
  // Direct name match
  if (cDName && sDName && cDName === sDName) return true;

  // 3. Normalized short code matching (e.g. BR_PAT vs BR_PTN)
  const normC = cDCode.replace(/^[a-z]{2}_/, '').trim();
  const normS = sDCode.replace(/^[a-z]{2}_/, '').trim();

  if (normC && normS && normC.length >= 2 && normS.length >= 2) {
    if (normC === normS || normS.startsWith(normC) || normC.startsWith(normS)) return true;
  }

  // 4. Alias / Name substring matching (only with non-empty, meaningful strings)
  if (cDName && sDName) {
    if (cDName.includes(sDName) || sDName.includes(cDName)) return true;
    if (normC && normC.length >= 3 && sDName.includes(normC)) return true;
    if (normS && normS.length >= 3 && cDName.includes(normS)) return true;
  }

  return false;
}
