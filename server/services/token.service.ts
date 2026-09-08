import { Request } from 'express';
import {
  dbTokens,
  dbSessions,
  dbCentres,
  dbRecords,
  dbNotifications,
  dbAnalytics,
} from '../data/db';
import { TokenStatus } from '../../src/types';

export class TokenService {
  static getTokens(req: Request) {
    const { farmerId, centreId, status } = req.query;
    let filtered = [...dbTokens];

    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const session = dbSessions[token];

    if (session && session.role === 'OPERATOR' && session.centreId) {
      filtered = filtered.filter((t) => t.centreId === session.centreId);
    } else {
      if (farmerId) {
        filtered = filtered.filter((t) => t.farmerId === String(farmerId));
      }
      if (centreId) {
        filtered = filtered.filter((t) => t.centreId === String(centreId));
      }
    }

    if (status) {
      filtered = filtered.filter((t) => t.status === String(status));
    }

    return { status: 200, data: { count: filtered.length, tokens: filtered } };
  }

  static getTokenById(id: string) {
    const token = dbTokens.find((t) => t.id === id || t.tokenNumber === id);
    if (!token) {
      return { status: 404, data: { success: false, error: 'Token not found' } };
    }
    return { status: 200, data: token };
  }

  static updateTokenStatus(req: Request, tokenId: string, status: string, extra?: any) {
    const authHeader = req.headers.authorization || '';
    const sessionToken = authHeader.replace('Bearer ', '').trim();
    const session = dbSessions[sessionToken];

    const token = dbTokens.find((t) => t.id === tokenId);
    if (!token) {
      return { status: 404, data: { error: 'Token not found' } };
    }

    if (session && session.role === 'OPERATOR' && session.centreId) {
      if (token.centreId !== session.centreId) {
        return { status: 403, data: { error: 'Forbidden: You cannot modify tokens belonging to another procurement centre.' } };
      }
    }

    token.status = status as TokenStatus;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let desc = `Status updated to ${status}`;
    if (status === 'VERIFIED') {
      desc = `Documents & moisture checked (${extra?.moisturePercentage || 11.8}%). Move to weighbridge.`;
      token.verifiedAt = new Date().toISOString();
    } else if (status === 'COMPLETED') {
      desc = `Procurement completed for ${token.quantityQuintals} Quintals. Direct Bank Transfer initiated.`;
      token.completedAt = new Date().toISOString();
      token.procurementAmountRupees = token.quantityQuintals * 2275;

      const c = dbCentres.find((cnt) => cnt.id === token.centreId);
      if (c) {
        c.currentQueue = Math.max(0, c.currentQueue - 1);
        c.completedToday += 1;
      }

      dbRecords.unshift({
        id: `rec_${Date.now()}`,
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        farmerName: token.farmerName,
        farmerMobile: token.farmerMobile,
        farmerVillage: token.farmerVillage,
        centreId: token.centreId,
        centreName: token.centreName,
        crop: token.crop,
        quantityQuintals: token.quantityQuintals,
        moisturePercentage: extra?.moisturePercentage || 11.8,
        qualityGrade: extra?.qualityGrade || 'FAQ (Fair Average Quality)',
        mspRatePerQuintal: 2275,
        totalPayoutRupees: token.quantityQuintals * 2275,
        paymentStatus: 'PROCESSED',
        timestamp: new Date().toISOString(),
        operatorId: 'usr_op_01',
      });

      dbAnalytics.totalProcurementQuintals += token.quantityQuintals;
    } else if (status === 'NO_SHOW') {
      desc = `Farmer did not arrive for scheduled slot. Token marked NO_SHOW.`;
      dbAnalytics.cancelledTokensCount += 1;
    } else if (status === 'CANCELLED') {
      desc = `Booking cancelled by user/operator.`;
      dbAnalytics.cancelledTokensCount += 1;
    }

    token.timeline.push({
      status: status as TokenStatus,
      time: timeStr,
      description: desc,
    });

    dbNotifications.unshift({
      id: `notif_${Date.now()}`,
      userId: token.farmerId,
      title: `Token Status Update (${token.tokenNumber}): ${status}`,
      message: desc,
      type: status === 'COMPLETED' ? 'PROCUREMENT_COMPLETED' : status === 'NO_SHOW' ? 'NO_SHOW' : 'QUEUE_UPDATED',
      read: false,
      createdAt: timeStr,
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
    });

    return { status: 200, data: { success: true, token } };
  }
}
