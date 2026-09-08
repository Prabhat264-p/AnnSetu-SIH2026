/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AnnSetu Deterministic Demo Procurement Centre Generator Service
 * Sourced from Government of India LGD Location Master
 */

import { ProcurementCentre, Slot } from '../../types';
import { INDIA_STATES_UTS, DISTRICTS_MASTER, getCoordinatesForSubdistrict } from '../location/locationService';
import { normalizeDate } from '../../utils/dateUtils';

// Base coordinates dictionary for state capitals / district centers
const BASE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Maharashtra: { lat: 19.8512, lng: 74.0041 },
  Punjab: { lat: 30.901, lng: 75.8573 },
  Haryana: { lat: 29.6857, lng: 76.9905 },
  'Madhya Pradesh': { lat: 22.7485, lng: 75.8542 },
  'Uttar Pradesh': { lat: 26.915, lng: 80.932 },
  Rajasthan: { lat: 26.812, lng: 75.765 },
  Gujarat: { lat: 22.925, lng: 72.583 },
  Karnataka: { lat: 12.283, lng: 76.662 },
  'Tamil Nadu': { lat: 11.0168, lng: 76.9558 },
  'West Bengal': { lat: 23.2324, lng: 87.8615 },
  Telangana: { lat: 17.472, lng: 78.481 },
  Bihar: { lat: 25.612, lng: 85.168 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973 },
  Ladakh: { lat: 34.1526, lng: 77.5771 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  'Andaman and Nicobar Islands': { lat: 11.6234, lng: 92.7265 },
  'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.4283, lng: 72.8397 },
  Lakshadweep: { lat: 10.5667, lng: 72.6417 },
  Puducherry: { lat: 11.9416, lng: 79.8083 },
  'Arunachal Pradesh': { lat: 27.1004, lng: 93.6166 },
  Goa: { lat: 15.4909, lng: 73.8278 },
  Manipur: { lat: 24.8170, lng: 93.9368 },
  Meghalaya: { lat: 25.5788, lng: 91.8933 },
  Mizoram: { lat: 23.7271, lng: 92.7176 },
  Nagaland: { lat: 25.6751, lng: 94.1086 },
  Sikkim: { lat: 27.3389, lng: 88.6065 },
  Tripura: { lat: 23.8315, lng: 91.2868 },
};

// Regional crop recommendations for demo variety
const CROP_PRESETS: Record<string, string[][]> = {
  NORTH: [
    ['Wheat', 'Paddy', 'Maize', 'Mustard', 'Gram (Chana)'],
    ['Wheat', 'Paddy', 'Gram (Chana)', 'Potato', 'Pulses'],
    ['Wheat', 'Paddy', 'Cotton', 'Maize', 'Mustard'],
  ],
  WEST_CENTRAL: [
    ['Wheat', 'Soybean', 'Gram (Chana)', 'Maize', 'Paddy'],
    ['Soybean', 'Wheat', 'Cotton', 'Mustard', 'Gram (Chana)'],
    ['Wheat', 'Gram (Chana)', 'Paddy', 'Pulses', 'Potato'],
  ],
  EAST: [
    ['Paddy', 'Wheat', 'Mustard', 'Maize', 'Pulses'],
    ['Paddy', 'Potato', 'Mustard', 'Gram (Chana)', 'Wheat'],
    ['Paddy', 'Wheat', 'Maize', 'Soybean', 'Pulses', 'Potato'],
  ],
  SOUTH: [
    ['Paddy', 'Maize', 'Pulses', 'Cotton', 'Wheat'],
    ['Paddy', 'Ragi', 'Groundnut', 'Mustard', 'Gram (Chana)'],
    ['Paddy', 'Maize', 'Soybean', 'Wheat', 'Pulses'],
  ],
};

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
];

/**
 * Generate at least 2-3 deterministic demo procurement centres for EVERY block in India
 */
export const generateAllDemoCentres = (
  baseCentres: ProcurementCentre[]
): ProcurementCentre[] => {
  const result: ProcurementCentre[] = [...baseCentres];

  INDIA_STATES_UTS.forEach((stateObj) => {
    const stateName = stateObj.name;
    const stateCode = stateObj.code;
    const districts = DISTRICTS_MASTER[stateName] || [
      {
        code: `${stateCode}_CENTRAL`,
        name: `${stateName} Central`,
        stateName,
        blocks: [`${stateName} Main`, `${stateName} East`, `${stateName} West`],
      },
    ];

    districts.forEach((distObj) => {
      const distName = distObj.name;
      const distCode = distObj.code;
      const blocks = distObj.blocks;

      blocks.forEach((blockName) => {
        // Find existing centres for this state, district, block
        const existing = result.filter(
          (c) =>
            c.state.toLowerCase() === stateName.toLowerCase() &&
            c.district.toLowerCase() === distName.toLowerCase() &&
            c.block.toLowerCase() === blockName.toLowerCase()
        );

        const targetCount = 3;
        const needed = targetCount - existing.length;

        if (needed > 0) {
          const subdistrictCoords = getCoordinatesForSubdistrict(stateName, distName, blockName);

          for (let i = 0; i < needed; i++) {
            const indexNumber = existing.length + i + 1;
            const blockClean = blockName.replace(/[^a-zA-Z0-9]/g, '');
            const id = `cnt_demo_${stateCode.toLowerCase()}_${distCode.toLowerCase()}_${blockClean.toLowerCase()}_0${indexNumber}`;

            if (result.some((c) => c.id === id)) {
              continue;
            }

            // Determine regional crops
            let cropPresets = CROP_PRESETS.WEST_CENTRAL;
            if (['PB', 'HR', 'UP', 'UK', 'HP', 'JK', 'LA', 'DL', 'CH'].includes(stateCode)) {
              cropPresets = CROP_PRESETS.NORTH;
            } else if (['WB', 'OD', 'BR', 'JH', 'AR', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR'].includes(stateCode)) {
              cropPresets = CROP_PRESETS.EAST;
            } else if (['TN', 'KL', 'KA', 'AP', 'TS', 'GA'].includes(stateCode)) {
              cropPresets = CROP_PRESETS.SOUTH;
            }
            const supportedCrops = cropPresets[i % cropPresets.length];

            // Deterministic offsets for coordinates
            const latOffset = (i + 1) * 0.008 - 0.01;
            const lngOffset = (i + 1) * 0.01 - 0.008;

            // Vary operational metrics per centre
            const dailyCapacity = i % 3 === 0 ? 300 : i % 3 === 1 ? 220 : 180;
            const counters = i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2;
            const activeCounters = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1;
            const status: 'OPEN' | 'BUSY' | 'OVERLOADED' =
              i % 3 === 0 ? 'OPEN' : i % 3 === 1 ? 'BUSY' : 'OPEN';
            const currentQueue = i % 3 === 0 ? 14 : i % 3 === 1 ? 32 : 8;
            const processingCount = i % 3 === 0 ? 8 : i % 3 === 1 ? 15 : 4;
            const completedToday = i % 3 === 0 ? 48 : i % 3 === 1 ? 70 : 25;
            const availableSlots = i % 3 === 0 ? 10 : i % 3 === 1 ? 4 : 14;
            const averageProcessingTime = i % 3 === 0 ? 7 : i % 3 === 1 ? 9 : 6;
            const estimatedWaitingTime =
              i % 3 === 0 ? '20 - 35 min' : i % 3 === 1 ? '50 - 65 min' : '15 - 25 min';

            const cleanDistCode = distCode.replace(/^WB_/, '');
            const demoCentre: ProcurementCentre = {
              id,
              officialId: `${stateCode}-${cleanDistCode}-DEMO-0${indexNumber}`,
              name: `AnnSetu Demo Centre – ${blockName} 0${indexNumber}`,
              state: stateName,
              stateCode: stateCode,
              district: distName,
              districtCode: distCode,
              block: blockName,
              subdistrictCode: `${distCode}_${blockClean.toUpperCase()}`,
              village: `${blockName} Central Yard 0${indexNumber}`,
              latitude: Number((subdistrictCoords.latitude + latOffset).toFixed(4)),
              longitude: Number((subdistrictCoords.longitude + lngOffset).toFixed(4)),
              agency: i % 2 === 0 ? 'NAFED Demo Storage Division' : 'State Civil Supplies (Simulated)',
              supportedCrops,
              dailyCapacity,
              workingHours: '8:30 AM - 5:30 PM',
              counters,
              activeCounters,
              status,
              season: 'Rabi 2025-26',
              contactPhone: `0${100 + i}-2${20000 + i * 1111}`,
              address: `APMC Sub-Market Sthal, Near Tehsil Office, ${blockName}, ${distName}, ${stateName}`,
              imageUrl: IMAGE_PRESETS[i % IMAGE_PRESETS.length],
              source: 'DEMO_SIMULATED',
              isDemo: true,
              lastVerified: new Date().toISOString(),
              currentQueue,
              processingCount,
              completedToday,
              availableSlots,
              averageProcessingTime,
              estimatedWaitingTime,
              lastUpdated: '5 mins ago',
            };

            result.push(demoCentre);
          }
        }
      });
    });
  });

  return result;
};

/**
 * Generate independent time slots for all centres
 */
export const generateSlotsForCentres = (
  centres: ProcurementCentre[],
  dateStr?: string
): Slot[] => {
  const normDate = normalizeDate(dateStr);
  const slots: Slot[] = [];
  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
  ];

  centres.forEach((centre) => {
    timeSlots.forEach((ts, idx) => {
      const capacity = 25;
      const bookedCount = Math.min(25, (idx + 3) * 3 + (centre.currentQueue % 5));
      const remainingCapacity = capacity - bookedCount;

      slots.push({
        id: `slt_${centre.id}_${idx + 1}`,
        centreId: centre.id,
        date: normDate,
        timeSlot: ts,
        capacity,
        bookedCount,
        remainingCapacity,
        expectedQueue: Math.max(2, Math.floor(bookedCount * 0.7)),
        estimatedWait: `${15 + idx * 5} - ${30 + idx * 5} min`,
      });
    });
  });

  return slots;
};

/**
 * Lazy generation safety net: ensure a specific subdistrict/block has at least 3 demo centres
 */
export const ensureDemoCentreCoverage = (
  centres: ProcurementCentre[],
  subdistrictName: string,
  stateName?: string,
  districtName?: string
): { updatedCentres: ProcurementCentre[]; addedCount: number } => {
  const result = [...centres];

  const matching = result.filter(
    (c) =>
      c.block.toLowerCase() === subdistrictName.toLowerCase() &&
      (!stateName || c.state.toLowerCase() === stateName.toLowerCase()) &&
      (!districtName || c.district.toLowerCase() === districtName.toLowerCase())
  );

  const needed = 3 - matching.length;
  if (needed <= 0) {
    return { updatedCentres: result, addedCount: 0 };
  }

  const sName = stateName || (matching.length > 0 ? matching[0].state : 'West Bengal');
  const dName = districtName || (matching.length > 0 ? matching[0].district : 'Kolkata');
  const subdistrictCoords = getCoordinatesForSubdistrict(sName, dName, subdistrictName);

  for (let i = 0; i < needed; i++) {
    const idx = matching.length + i + 1;
    const blockClean = subdistrictName.replace(/[^a-zA-Z0-9]/g, '');
    const stateCode = sName === 'West Bengal' ? 'WB' : sName.slice(0, 2).toUpperCase();
    const distCode = dName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const id = `cnt_demo_${stateCode.toLowerCase()}_${distCode.toLowerCase()}_${blockClean.toLowerCase()}_0${idx}`;

    if (result.some((c) => c.id === id)) {
      continue;
    }

    const supportedCrops = ['Paddy', 'Wheat', 'Mustard', 'Maize', 'Soybean', 'Gram (Chana)', 'Potato', 'Pulses'];
    const latOffset = idx * 0.008 - 0.01;
    const lngOffset = idx * 0.01 - 0.008;

    const demoCentre: ProcurementCentre = {
      id,
      officialId: `${stateCode}-${distCode}-DEMO-0${idx}`,
      name: `AnnSetu Demo Centre – ${subdistrictName} 0${idx}`,
      state: sName,
      stateCode: stateCode,
      district: dName,
      districtCode: `${stateCode}_${distCode}`,
      block: subdistrictName,
      subdistrictCode: `${stateCode}_${distCode}_${blockClean.toUpperCase()}`,
      village: `${subdistrictName} Central Yard 0${idx}`,
      latitude: Number((subdistrictCoords.latitude + latOffset).toFixed(4)),
      longitude: Number((subdistrictCoords.longitude + lngOffset).toFixed(4)),
      agency: idx % 2 === 0 ? 'NAFED Demo Storage Division' : 'State Civil Supplies (Simulated)',
      supportedCrops,
      dailyCapacity: idx % 2 === 0 ? 300 : 220,
      workingHours: '8:30 AM - 5:30 PM',
      counters: 3,
      activeCounters: 2,
      status: 'OPEN',
      season: 'Rabi 2025-26',
      contactPhone: `0100-2${20000 + idx * 111}`,
      address: `APMC Sub-Market Sthal, Near Tehsil Office, ${subdistrictName}, ${dName}, ${sName}`,
      imageUrl: IMAGE_PRESETS[idx % IMAGE_PRESETS.length],
      source: 'DEMO_SIMULATED',
      isDemo: true,
      lastVerified: new Date().toISOString(),
      currentQueue: 12 + idx * 5,
      processingCount: 6,
      completedToday: 40,
      availableSlots: 8,
      averageProcessingTime: 7,
      estimatedWaitingTime: `${20 + idx * 10} - ${35 + idx * 10} min`,
      lastUpdated: 'Just now',
    };

    result.push(demoCentre);
  }

  return { updatedCentres: result, addedCount: needed };
};

/**
 * Deterministic Dynamic Slots Calculation for ANY selected date
 */
export const getSlotsForCentreAndDate = (
  centre: ProcurementCentre,
  dateStr: string
): Slot[] => {
  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
  ];

  // Hash string deterministically
  let hash = 0;
  const str = `${centre.id}_${dateStr}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  return timeSlots.map((ts, idx) => {
    const capacity = 25;
    const bookedCount = Math.min(24, ((positiveHash + idx * 7) % 18) + 4);
    const remainingCapacity = capacity - bookedCount;

    return {
      id: `slt_${centre.id}_${dateStr}_${idx + 1}`,
      centreId: centre.id,
      date: dateStr,
      timeSlot: ts,
      capacity,
      bookedCount,
      remainingCapacity,
      expectedQueue: Math.max(1, Math.floor(bookedCount * 0.6)),
      estimatedWait: `${15 + (idx % 3) * 10} - ${30 + (idx % 3) * 10} min`,
    };
  });
};

/**
 * Get Comprehensive Coverage Audit Report
 */
export const getCoverageReport = (
  centres: ProcurementCentre[]
): {
  totalSubdistricts: number;
  subdistrictsWith3Centres: number;
  subdistrictsWith2Centres: number;
  subdistrictsWith1Centre: number;
  subdistrictsWith0Centres: number;
  coveragePercentage: number;
  demoModeEnabled: boolean;
} => {
  let totalSubdistricts = 0;
  let with3 = 0;
  let with2 = 0;
  let with1 = 0;
  let with0 = 0;

  INDIA_STATES_UTS.forEach((stateObj) => {
    const stateName = stateObj.name;
    const districts = DISTRICTS_MASTER[stateName] || [];

    districts.forEach((distObj) => {
      const distName = distObj.name;

      distObj.blocks.forEach((blockName) => {
        totalSubdistricts++;
        const matching = centres.filter(
          (c) =>
            c.state.toLowerCase() === stateName.toLowerCase() &&
            c.district.toLowerCase() === distName.toLowerCase() &&
            c.block.toLowerCase() === blockName.toLowerCase()
        );

        if (matching.length >= 3) with3++;
        else if (matching.length === 2) with2++;
        else if (matching.length === 1) with1++;
        else with0++;
      });
    });
  });

  const covered = with3 + with2 + with1;
  const coveragePercentage = totalSubdistricts > 0 ? Number(((covered / totalSubdistricts) * 100).toFixed(1)) : 100;

  return {
    totalSubdistricts,
    subdistrictsWith3Centres: with3,
    subdistrictsWith2Centres: with2,
    subdistrictsWith1Centre: with1,
    subdistrictsWith0Centres: with0,
    coveragePercentage,
    demoModeEnabled: true,
  };
};

/**
 * Automated Data Quality & Coverage Assertions
 */
export const validateDemoCentresCoverage = (
  centres: ProcurementCentre[]
): {
  isValid: boolean;
  totalCentres: number;
  totalBlocksTested: number;
  minCentresPerBlock: number;
  errors: string[];
} => {
  const errors: string[] = [];
  let totalBlocksTested = 0;
  let minCentresPerBlock = Infinity;

  INDIA_STATES_UTS.forEach((stateObj) => {
    const stateName = stateObj.name;
    const districts = DISTRICTS_MASTER[stateName] || [];

    districts.forEach((distObj) => {
      const distName = distObj.name;

      distObj.blocks.forEach((blockName) => {
        totalBlocksTested++;
        const matching = centres.filter(
          (c) =>
            c.state.toLowerCase() === stateName.toLowerCase() &&
            c.district.toLowerCase() === distName.toLowerCase() &&
            c.block.toLowerCase() === blockName.toLowerCase()
        );

        if (matching.length < minCentresPerBlock) {
          minCentresPerBlock = matching.length;
        }

        if (matching.length < 2) {
          errors.push(
            `Insufficient demo centres for Block '${blockName}' (${distName}, ${stateName}): found ${matching.length}, expected >= 2`
          );
        }
      });
    });
  });

  // Verify unique IDs
  const ids = new Set<string>();
  centres.forEach((c) => {
    if (ids.has(c.id)) {
      errors.push(`Duplicate centre ID detected: '${c.id}'`);
    }
    ids.add(c.id);
  });

  return {
    isValid: errors.length === 0,
    totalCentres: centres.length,
    totalBlocksTested,
    minCentresPerBlock: minCentresPerBlock === Infinity ? 0 : minCentresPerBlock,
    errors,
  };
};
