import { Request } from 'express';
import { dbRecords, dbSessions } from '../data/db';

export class ProcurementService {
  static getRecords(req: Request) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const session = dbSessions[token];

    let filtered = [...dbRecords];
    if (session && session.role === 'OPERATOR' && session.centreId) {
      filtered = filtered.filter((r) => r.centreId === session.centreId);
    }
    return { status: 200, data: { count: filtered.length, records: filtered } };
  }
}
