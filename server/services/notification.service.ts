import { dbNotifications } from '../data/db';

export class NotificationService {
  static getNotifications(userId?: string) {
    let filtered = [...dbNotifications];
    if (userId) {
      filtered = filtered.filter((n) => n.userId === String(userId));
    }
    return { status: 200, data: { count: filtered.length, notifications: filtered } };
  }
}
