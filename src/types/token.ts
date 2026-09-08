import { ProcurementCentre } from './centre';

export type TokenStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'VERIFIED'
  | 'WAITING'
  | 'CALLED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Token {
  id: string;
  tokenNumber: string; // e.g. "WHT-08432"
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  farmerVillage: string;
  centreId: string;
  centreName: string;
  centreDistrict: string;
  crop: string;
  quantityQuintals: number;
  date: string;
  timeSlot: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  estimatedWaitFormatted: string; // "45 - 60 min"
  status: TokenStatus;
  counterAssigned?: number;
  createdAt: string;
  verifiedAt?: string;
  completedAt?: string;
  qrData?: string;
  moisturePercentage?: number;
  procurementAmountRupees?: number;
  remarks?: string;
  demoScenarioId?: string;
  timeline: {
    status: TokenStatus;
    time: string;
    description: string;
  }[];
}

export interface QueueEntry {
  id: string;
  tokenId: string;
  tokenNumber: string;
  centreId: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  position: number;
  status: TokenStatus;
  arrivalTime: string;
  serviceStart?: string;
  serviceEnd?: string;
  calledAt?: string;
  estimatedWait: string;
  crop: string;
  quantity: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'TOKEN_CONFIRMED'
    | 'SLOT_BOOKED'
    | 'QUEUE_UPDATED'
    | 'ETA_CHANGED'
    | 'TURN_APPROACHING'
    | 'PROCEED_TO_CENTRE'
    | 'PROCUREMENT_COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
  read: boolean;
  createdAt: string;
  tokenId?: string;
  tokenNumber?: string;
}

export interface SmartRecommendation {
  centre: ProcurementCentre;
  score: number; // 0 - 100
  distanceKm: number;
  estimatedWait: string;
  isRecommended: boolean;
  scoreBreakdown: {
    waitingTimeScore: number; // 30%
    distanceScore: number;    // 25%
    slotScore: number;        // 20%
    capacityScore: number;    // 15%
    cropScore: number;        // 10%
  };
  reason: string; // e.g. "Low waiting time + suitable crop + 5 slots available"
}
