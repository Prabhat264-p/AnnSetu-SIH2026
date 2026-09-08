export type UserRole = 'FARMER' | 'OPERATOR' | 'ADMIN';

export type Language = 'en' | 'hi' | 'mr' | 'bn' | 'te';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  language: Language;
  avatarUrl?: string;
  email?: string;
  district?: string;
  state?: string;
  centreId?: string;
  districtId?: string;
  adminId?: string;
  adminName?: string;
  stateCode?: string;
  stateName?: string;
  districtCode?: string;
  districtName?: string;
  demoScenarioId?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: User;
  role: UserRole;
  token: string;
  loginTime: string;
}

export type LocationSource = 'PROFILE' | 'GPS' | 'DEMO';

export interface OperatorAccount {
  userId: string;
  role: 'OPERATOR';
  username: string;
  passwordHash?: string;
  centreId: string;
  centreName: string;
  stateCode?: string;
  stateName?: string;
  districtCode?: string;
  districtName?: string;
  subdistrictCode?: string;
  subdistrictName?: string;
  isDemo: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
