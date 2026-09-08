export interface ProcurementRecord {
  id: string;
  tokenId: string;
  tokenNumber: string;
  farmerName: string;
  farmerMobile: string;
  farmerVillage: string;
  centreId: string;
  centreName: string;
  crop: string;
  quantityQuintals: number;
  moisturePercentage: number;
  qualityGrade: 'A' | 'B' | 'FAQ (Fair Average Quality)';
  mspRatePerQuintal: number;
  totalPayoutRupees: number;
  paymentStatus: 'PROCESSED' | 'PENDING_BANK' | 'DISBURSED';
  timestamp: string;
  operatorId: string;
}
