import { Language, LocationSource } from './user';

export interface FarmerProfile {
  id: string;
  userId: string;
  name: string;
  mobile: string;

  stateCode?: string;
  stateName?: string;

  districtCode?: string;
  districtName?: string;

  subdistrictCode?: string;
  subdistrictName?: string;

  // Primary administrative strings
  state: string;
  district: string;
  block: string;
  village: string;
  pinCode?: string;

  latitude?: number;
  longitude?: number;
  locationSource: LocationSource;

  aadhaarLast4?: string;
  kisanCreditCardNo?: string;
  preferredLanguage?: Language;
  landAreaAcres?: number;
  crops?: {
    cropName: string;
    variety: string;
    estimatedYieldQuintals: number;
    harvestDate: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
  profileCompleted?: boolean;
}
