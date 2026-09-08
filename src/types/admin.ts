import { CentreStatus } from './centre';

export interface AdminAccount {
  userId: string;
  adminId: string;
  role: 'ADMIN';
  username: string;
  passwordHash?: string;
  fullName: string;
  designation: string;
  mobile: string;
  email?: string;
  department: string;
  stateCode: string;
  stateName: string;
  districtCode: string;
  districtName: string;
  isDemo?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsSummary {
  totalCentres: number;
  activeCentres?: number;
  totalFarmers: number;
  totalTokens: number;
  totalProcurementQuintals: number;
  averageWaitMinutes: number;
  tokenCompletionRatePercent: number;
  noShowRatePercent: number;
  cancelledTokensCount: number;
  farmerSatisfactionScore: number;
  targetProcurementQuintals: number;
  districtCongestionScore?: number;
  tokensOverTime: {
    date: string;
    tokens: number;
    completed: number;
  }[];
  centreStatusCounts: {
    openNormal: number;
    busy: number;
    overloaded: number;
    closed: number;
  };
  procurementByCrop: {
    date: string;
    Wheat: number;
    Paddy: number;
    Maize: number;
  }[];
  waitTimeByCentre: {
    centreName: string;
    waitMinutes: number;
    status: CentreStatus;
  }[];
  peakArrivalHours: {
    hour: string;
    trafficLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
    count: number;
  }[];
  topCentresByQueue: {
    id: string;
    name: string;
    district: string;
    queueSize: number;
    avgWaitTime: string;
    status?: CentreStatus;
  }[];
}
