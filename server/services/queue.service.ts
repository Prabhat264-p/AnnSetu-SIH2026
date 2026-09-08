import { Request } from 'express';
import { dbTokens, dbSessions, dbNotifications } from '../data/db';

export class QueueService {
  static callNextFarmer(req: Request, centreIdBody?: string) {
    const authHeader = req.headers.authorization || '';
    const sessionToken = authHeader.replace('Bearer ', '').trim();
    const session = dbSessions[sessionToken];

    let targetCentreId = centreIdBody;
    if (session && session.role === 'OPERATOR' && session.centreId) {
      targetCentreId = session.centreId;
    }

    const waitingTokens = dbTokens.filter(
      (t) => t.centreId === targetCentreId && ['WAITING', 'CONFIRMED', 'SCHEDULED'].includes(t.status)
    );

    if (waitingTokens.length === 0) {
      return { status: 200, data: { success: false, message: 'No waiting farmers in queue' } };
    }

    const nextToken = waitingTokens[0];
    nextToken.status = 'VERIFIED';
    nextToken.verifiedAt = new Date().toISOString();
    nextToken.counterAssigned = 1;

    nextToken.timeline.push({
      status: 'VERIFIED',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: 'Operator called your turn! Please proceed to Counter 1 weighbridge.',
    });

    dbNotifications.unshift({
      id: `notif_${Date.now()}`,
      userId: nextToken.farmerId,
      title: `It's Your Turn! (Token ${nextToken.tokenNumber}) 🔔`,
      message: `Please proceed immediately to Counter 1 at ${nextToken.centreName} for grain weighing & verification.`,
      type: 'PROCEED_TO_CENTRE',
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokenId: nextToken.id,
      tokenNumber: nextToken.tokenNumber,
    });

    return { status: 200, data: { success: true, token: nextToken } };
  }
}
