export type CentreStatus = 'OPEN' | 'BUSY' | 'OVERLOADED' | 'CLOSED';

export interface ProcurementCentre {
  id: string;
  officialId: string;
  name: string;
  state: string;
  stateCode?: string;
  district: string;
  districtCode?: string;
  block: string;
  subdistrictCode?: string;
  village: string;
  latitude: number;
  longitude: number;
  agency: string; // e.g. FCI, NAFED, MSAMB, State Civil Supplies
  supportedCrops: string[];
  dailyCapacity: number; // e.g. 300 Farmers / 5000 Quintals
  workingHours: string; // e.g. "9:00 AM - 5:00 PM"
  counters: number; // total counters
  activeCounters: number;
  status: CentreStatus;
  season: string; // e.g. "Rabi 2025-26"
  contactPhone: string;
  imageUrl: string;
  address: string;
  source: 'OFFICIAL_GOVT' | 'DEMO_SIMULATED';
  isDemo?: boolean;
  lastVerified: string;
  // Live Status
  currentQueue: number;
  processingCount: number;
  completedToday: number;
  availableSlots: number;
  averageProcessingTime: number; // in minutes per farmer
  estimatedWaitingTime: string; // e.g. "45 - 60 min"
  lastUpdated: string;
  distanceKm?: number;
  demoScenarioId?: string;
}
