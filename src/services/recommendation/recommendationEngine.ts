import { FarmerProfile, ProcurementCentre, SmartRecommendation } from '../../types';
import { calculateDistanceKm, predictETA } from '../queue/queueEngine';
import { normalizeDate } from '../../utils/dateUtils';
import { getSlotsForCentreAndDate } from '../centre/centreGeneratorService';

/**
 * Smart Centre Recommendation Engine
 * Weighted Multi-Criteria Decision Model:
 * - Waiting Time: 30%
 * - Distance: 25%
 * - Slot Availability: 20%
 * - Centre Daily Capacity: 15%
 * - Crop Compatibility: 10%
 */
export function recommendCentres(
  farmer: Partial<FarmerProfile> | null,
  centres: ProcurementCentre[],
  selectedCrop: string = 'Wheat',
  selectedDate?: string
): SmartRecommendation[] {
  const normDate = normalizeDate(selectedDate);

  // Extract farmer profile coordinates as distance origin
  const originLat = typeof farmer?.latitude === 'number' ? farmer.latitude : undefined;
  const originLng = typeof farmer?.longitude === 'number' ? farmer.longitude : undefined;
  const hasCoordinates = typeof originLat === 'number' && typeof originLng === 'number';

  const scoredCentres: SmartRecommendation[] = centres.map((centre) => {
    // 1. Distance Calculation (KM) relative to authenticated farmer location origin
    let distanceKm: number | undefined = undefined;

    if (hasCoordinates) {
      const rawDistance = calculateDistanceKm(
        originLat!,
        originLng!,
        centre.latitude,
        centre.longitude
      );
      distanceKm = Number(rawDistance.toFixed(1));

      // DEV Sanity Check & Logging (Requirements 30 & 31)
      if (process.env.NODE_ENV !== 'production') {
        const farmerBlock = farmer?.block || farmer?.subdistrictName || '';
        const centreBlock = centre.block || '';

        if (
          farmerBlock &&
          centreBlock &&
          farmerBlock.toLowerCase() === centreBlock.toLowerCase() &&
          distanceKm > 100
        ) {
          console.warn(
            `[DEV DISTANCE WARNING] Suspicious distance detected! Farmer block '${farmerBlock}' matches Centre block '${centreBlock}', but distance is ${distanceKm} km! Check farmer coords (${originLat}, ${originLng}) vs centre coords (${centre.latitude}, ${centre.longitude}).`
          );
        }
      }
    }

    // 2. Date-specific Slots and Queue state
    const dateSlots = getSlotsForCentreAndDate(centre, normDate);
    const dateAvailableSlots = dateSlots.reduce((acc, s) => acc + s.remainingCapacity, 0);

    // 3. Crop Compatibility
    const isCropSupported =
      !selectedCrop ||
      selectedCrop === 'All Crops' ||
      centre.supportedCrops.some(
        (c) =>
          c.toLowerCase().includes(selectedCrop.toLowerCase()) ||
          selectedCrop.toLowerCase().includes(c.toLowerCase())
      );

    // 4. ETA calculation
    const eta = predictETA(centre, centre.currentQueue, '11:00', selectedCrop);

    // 5. Normalized sub-scores (0 to 100)
    // Waiting Time Score (30% weight): Lower wait = higher score
    const avgWaitMin = (eta.minMinutes + eta.maxMinutes) / 2;
    const waitingTimeScore = Math.max(0, Math.min(100, 100 - (avgWaitMin / 120) * 100));

    // Distance Score (25% weight): Shorter distance = higher score (normalized to 50km benchmark range)
    let distanceScore = 50; // default neutral if distance unavailable
    if (typeof distanceKm === 'number') {
      distanceScore = Math.max(0, Math.min(100, 100 - (distanceKm / 50) * 100));
    }

    // Slot Score (20% weight): Available slots vs max benchmark
    const effectiveSlots = dateAvailableSlots > 0 ? dateAvailableSlots : centre.availableSlots;
    const slotScore = Math.min(100, (effectiveSlots / 40) * 100);

    // Capacity Score (15% weight): Daily throughput capacity
    const capacityScore = Math.min(100, (centre.dailyCapacity / 400) * 100);

    // Crop Score (10% weight)
    const cropScore = isCropSupported ? 100 : 0;

    // Calculate total weighted recommendation score
    let totalScore =
      waitingTimeScore * 0.3 +
      distanceScore * 0.25 +
      slotScore * 0.2 +
      capacityScore * 0.15 +
      cropScore * 0.1;

    // Penalty if closed or overloaded
    if (centre.status === 'CLOSED') {
      totalScore *= 0.1;
    } else if (centre.status === 'OVERLOADED') {
      totalScore *= 0.65;
    }

    const normalizedScore = Math.round(Math.max(0, Math.min(100, totalScore)));

    // Generate human-friendly explainability reasons
    const reasons: string[] = [];
    if (avgWaitMin <= 60) reasons.push('Low waiting time');
    if (typeof distanceKm === 'number' && distanceKm <= 10) reasons.push(`Nearest (${distanceKm} km)`);
    if (effectiveSlots >= 10) reasons.push(`${effectiveSlots} slots available`);
    if (isCropSupported) reasons.push(`Specialized ${selectedCrop} testing`);
    if (centre.activeCounters >= 3) reasons.push(`${centre.activeCounters} active weighbridge counters`);

    const summaryReason =
      reasons.length > 0
        ? reasons.slice(0, 3).join(' • ')
        : 'Open for procurement with active counters';

    return {
      centre,
      score: normalizedScore,
      distanceKm,
      estimatedWait: eta.formatted,
      isRecommended: false,
      scoreBreakdown: {
        waitingTimeScore: Math.round(waitingTimeScore),
        distanceScore: Math.round(distanceScore),
        slotScore: Math.round(slotScore),
        capacityScore: Math.round(capacityScore),
        cropScore: Math.round(cropScore),
      },
      reason: summaryReason,
    };
  });

  // Sort descending by score
  scoredCentres.sort((a, b) => b.score - a.score);

  // Mark top eligible centre as Recommended
  if (scoredCentres.length > 0 && scoredCentres[0].score >= 50) {
    scoredCentres[0].isRecommended = true;
  }

  return scoredCentres;
}
