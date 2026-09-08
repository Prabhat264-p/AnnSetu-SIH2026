import {
  dbCentres,
  dbSlots,
  dbFarmerProfiles,
  dbTokens,
  dbNotifications,
  dbAnalytics,
  currentDemoScenario,
} from '../data/db';
import { normalizeDate } from '../../src/utils/dateUtils';
import { INITIAL_FARMER_PROFILE } from '../../src/data/mockData';
import { Token, AppNotification } from '../../src/types';

import { getSlotsForCentreAndDate } from '../../src/services/centre/centreGeneratorService';

export class BookingService {
  static getSlots(centreId?: string, date?: string) {
    let filtered = [...dbSlots];

    if (centreId) {
      filtered = filtered.filter((s) => s.centreId === String(centreId));
    }
    if (date) {
      const normDate = normalizeDate(String(date));
      filtered = filtered.filter((s) => s.date === normDate);
    }

    if (centreId && filtered.length === 0) {
      const centre = dbCentres.find((c) => c.id === String(centreId));
      if (centre) {
        filtered = getSlotsForCentreAndDate(centre, date ? normalizeDate(String(date)) : normalizeDate(new Date().toISOString()));
      }
    }

    return { status: 200, data: { count: filtered.length, slots: filtered } };
  }

  static bookSlot(body: any) {
    const { centreId, date, timeSlot, crop, quantityQuintals, farmerId, farmerName, farmerMobile } = body || {};
    const normDate = normalizeDate(date);

    const targetCentre = dbCentres.find((c) => c.id === centreId);
    if (!targetCentre) {
      return { status: 400, data: { error: 'Procurement centre not found' } };
    }

    if (targetCentre.status === 'CLOSED') {
      return { status: 400, data: { error: 'This centre is currently closed for procurement.' } };
    }

    const farmerProfile = farmerId ? dbFarmerProfiles[farmerId] : null;
    if (farmerProfile) {
      const fDist = (farmerProfile.districtCode || '').toLowerCase().replace('br_ptn', 'br_pat');
      const cDist = (targetCentre.districtCode || '').toLowerCase().replace('br_ptn', 'br_pat');
      if (fDist && cDist && fDist !== cDist && (fDist === 'br_pat' || cDist === 'br_pat' || fDist === 'mh_nsk' || cDist === 'mh_nsk')) {
        return { status: 400, data: { success: false, error: 'Demo entities must belong to the same district.' } };
      }
    }

    const slotIndex = dbSlots.findIndex(
      (s) => s.centreId === centreId && s.date === normDate && s.timeSlot === timeSlot
    );

    if (slotIndex >= 0 && dbSlots[slotIndex].remainingCapacity <= 0) {
      return { status: 400, data: { error: 'Selected time slot is already fully booked! Please choose another slot.' } };
    }

    if (slotIndex >= 0) {
      dbSlots[slotIndex].bookedCount += 1;
      dbSlots[slotIndex].remainingCapacity = Math.max(0, dbSlots[slotIndex].remainingCapacity - 1);
    }

    targetCentre.currentQueue += 1;
    targetCentre.availableSlots = Math.max(0, targetCentre.availableSlots - 1);
    targetCentre.lastUpdated = 'Just now';

    const prefix = (crop || 'WHT').slice(0, 3).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const tokenNumber = `${prefix}-${randomNum}`;
    const queuePos = targetCentre.currentQueue;

    const newToken: Token = {
      id: `tkn_${Date.now()}`,
      tokenNumber,
      farmerId: farmerId || 'usr_farmer_01',
      farmerName: farmerName || 'Ram Das',
      farmerMobile: farmerMobile || '+91 98765 43210',
      farmerVillage: INITIAL_FARMER_PROFILE.village,
      centreId: targetCentre.id,
      centreName: targetCentre.name,
      centreDistrict: targetCentre.district,
      crop: crop || 'Wheat',
      quantityQuintals: Number(quantityQuintals) || 45,
      date: normDate,
      timeSlot: timeSlot || '11:00 AM - 12:00 PM',
      queuePosition: queuePos,
      estimatedWaitMinutes: Math.max(10, queuePos * 8),
      estimatedWaitFormatted: `${Math.max(10, queuePos * 7)} - ${Math.max(15, queuePos * 9)} min`,
      status: 'CONFIRMED',
      demoScenarioId: currentDemoScenario.id,
      createdAt: new Date().toISOString(),
      qrData: `ANNSETU:TOKEN:${tokenNumber}:${farmerName || 'Ram Das'}:${targetCentre.name}:${quantityQuintals}Q:${crop}`,
      timeline: [
        {
          status: 'SCHEDULED',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Slot booked for ${normDate}, ${timeSlot} at ${targetCentre.name}.`,
        },
        {
          status: 'CONFIRMED',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Token ${tokenNumber} confirmed. Queue position: #${queuePos}.`,
        },
      ],
    };

    dbTokens.unshift(newToken);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: newToken.farmerId,
      title: `Token Confirmed: ${tokenNumber} 🎉`,
      message: `Your slot is confirmed at ${targetCentre.name} on ${date} (${timeSlot}).`,
      type: 'TOKEN_CONFIRMED',
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokenId: newToken.id,
      tokenNumber,
    };
    dbNotifications.unshift(notif);

    dbAnalytics.totalTokens += 1;

    return { status: 200, data: { success: true, token: newToken } };
  }
}
