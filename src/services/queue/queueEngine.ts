import { ProcurementCentre } from '../../types';

/**
 * Calculates basic waiting time in minutes using multi-counter queuing theory.
 * M/M/c queue approximation:
 * Waiting Time = (Farmers Ahead * Average Processing Time) / Active Counters
 */
export function calculateBasicETA(
  farmersAhead: number,
  averageProcessingTime: number = 8,
  activeCounters: number = 3
): number {
  const safeCounters = Math.max(1, activeCounters);
  const safeAvgTime = Math.max(3, averageProcessingTime);

  if (farmersAhead <= 0) return 0;

  // Raw multi-counter queue calculation with slight buffer for document inspection transitions
  const estimatedMins = Math.ceil((farmersAhead * safeAvgTime) / safeCounters);
  return Math.max(5, estimatedMins);
}

/**
 * Predicts waiting time using heuristics ready for machine learning model integration.
 * Factors considered:
 * - Current active queue length
 * - Number of active physical verification/weighbridge counters
 * - Time of day factor (e.g. morning/noon peak vs late afternoon slowdown)
 * - Crop handling factor (e.g., Paddy moisture test takes longer than Wheat or Maize)
 */
export function predictETA(
  centre: ProcurementCentre,
  queueLength: number,
  timeOfDay: string = '11:00',
  cropType: string = 'Wheat'
): {
  minMinutes: number;
  maxMinutes: number;
  formatted: string;
  confidenceScore: number;
} {
  const baseMinutes = calculateBasicETA(
    queueLength,
    centre.averageProcessingTime || 7,
    centre.activeCounters || 2
  );

  // Time of day multiplier (e.g. 10:00 to 13:00 has peak tractor arrivals)
  let timeMultiplier = 1.0;
  const hour = parseInt(timeOfDay.split(':')[0] || '11', 10);
  if (hour >= 10 && hour <= 13) {
    timeMultiplier = 1.15; // Peak rush hour
  } else if (hour >= 14 && hour <= 16) {
    timeMultiplier = 1.05;
  } else {
    timeMultiplier = 0.95;
  }

  // Crop inspection complexity factor
  let cropMultiplier = 1.0;
  if (cropType.toLowerCase() === 'paddy') {
    cropMultiplier = 1.12; // Moisture & husk evaluation
  } else if (cropType.toLowerCase() === 'soybean') {
    cropMultiplier = 1.08;
  }

  const adjustedMinutes = Math.round(baseMinutes * timeMultiplier * cropMultiplier);
  const minMinutes = Math.max(5, Math.floor(adjustedMinutes * 0.85));
  const maxMinutes = Math.max(minMinutes + 10, Math.ceil(adjustedMinutes * 1.15));

  let formatted = '';
  if (maxMinutes <= 60) {
    formatted = `${minMinutes} - ${maxMinutes} min`;
  } else {
    const minHours = Math.floor(minMinutes / 60);
    const minRemMins = minMinutes % 60;
    const maxHours = Math.floor(maxMinutes / 60);
    const maxRemMins = maxMinutes % 60;

    if (minHours === maxHours) {
      formatted = `${minHours}h ${minRemMins > 0 ? minRemMins + 'm' : ''} - ${maxHours}h ${maxRemMins}m`;
    } else {
      formatted = `${minHours}h - ${maxHours}h ${maxRemMins > 0 ? maxRemMins + 'm' : ''}`;
    }
  }

  return {
    minMinutes,
    maxMinutes,
    formatted,
    confidenceScore: 0.94, // 94% demo model confidence
  };
}

/**
 * Calculates geographic distance in KM using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}
