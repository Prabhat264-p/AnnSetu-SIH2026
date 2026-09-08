import {
  ProcurementCentre,
  Slot,
  Token,
  AppNotification,
  ProcurementRecord,
  AnalyticsSummary,
  FarmerProfile,
  OperatorAccount,
  AdminAccount,
} from '../../src/types';
import {
  INITIAL_CENTRES,
  INITIAL_SLOTS,
  INITIAL_TOKENS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANALYTICS,
  DEMO_FARMERS_MAP,
} from '../../src/data/mockData';
import { generateAllDemoCentres } from '../../src/services/centre/centreGeneratorService';

export interface DemoScenario {
  id: string;
  stateCode: string;
  stateName: string;
  districtCode: string;
  districtName: string;
  createdAt: string;
}

export interface SessionData {
  token: string;
  userId: string;
  role: 'FARMER' | 'OPERATOR' | 'ADMIN';
  mobile?: string;
  centreId?: string;
  adminId?: string;
  stateCode?: string;
  districtCode?: string;
  createdAt: number;
  expiresAt: number;
}

export interface OtpData {
  mobile: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

// Single Source of Truth In-Memory Data Stores
export let dbCentres: ProcurementCentre[] = generateAllDemoCentres([...INITIAL_CENTRES]);
export let dbSlots: Slot[] = [...INITIAL_SLOTS];
export let dbTokens: Token[] = [...INITIAL_TOKENS];
export let dbNotifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
export let dbRecords: ProcurementRecord[] = [];
export let dbAnalytics: AnalyticsSummary = { ...INITIAL_ANALYTICS };
export let dbFarmerProfiles: Record<string, FarmerProfile> = { ...DEMO_FARMERS_MAP };

export const SEED_OPERATOR_ACCOUNTS: OperatorAccount[] = [
  {
    userId: 'usr_op_fatwah_01',
    role: 'OPERATOR',
    username: 'operator',
    centreId: 'BR_PTN_FATWAH_DEMO_01',
    centreName: 'AnnSetu Demo Centre – Fatwah 01',
    stateName: 'Bihar',
    districtName: 'Patna',
    subdistrictName: 'Fatwah',
    isDemo: true,
    isActive: true,
  },
  {
    userId: 'usr_op_sinnar_01',
    role: 'OPERATOR',
    username: 'operator',
    centreId: 'cnt_sinnar',
    centreName: 'Sinnar Central Procurement Centre',
    stateName: 'Maharashtra',
    districtName: 'Nashik',
    subdistrictName: 'Sinnar',
    isDemo: true,
    isActive: true,
  },
  {
    userId: 'usr_op_pollachi_01',
    role: 'OPERATOR',
    username: 'operator',
    centreId: 'cnt_demo_tn_tn_cbe_pollachi_01',
    centreName: 'AnnSetu Demo Centre – Pollachi 01',
    stateName: 'Tamil Nadu',
    districtName: 'Coimbatore',
    subdistrictName: 'Pollachi',
    isDemo: true,
    isActive: true,
  },
  {
    userId: 'usr_op_srinagar_01',
    role: 'OPERATOR',
    username: 'operator',
    centreId: 'cnt_demo_jk_jk_sgr_srinagarnorth_01',
    centreName: 'AnnSetu Demo Centre – Srinagar North 01',
    stateName: 'Jammu & Kashmir',
    districtName: 'Srinagar',
    subdistrictName: 'Srinagar North',
    isDemo: true,
    isActive: true,
  },
  {
    userId: 'usr_op_alipore_01',
    role: 'OPERATOR',
    username: 'operator',
    centreId: 'cnt_demo_wb_wb_kol_alipore_01',
    centreName: 'AnnSetu Demo Centre – Alipore 01',
    stateName: 'West Bengal',
    districtName: 'Kolkata',
    subdistrictName: 'Alipore',
    isDemo: true,
    isActive: true,
  },
  {
    userId: 'usr_op_leh_01',
    role: 'OPERATOR',
    username: 'operator',
    centreId: 'cnt_demo_la_la_leh_lehtown_01',
    centreName: 'AnnSetu Demo Centre – Leh Town 01',
    stateName: 'Ladakh',
    districtName: 'Leh',
    subdistrictName: 'Leh Town',
    isDemo: true,
    isActive: true,
  },
  {
    userId: 'usr_op_inactive_01',
    role: 'OPERATOR',
    username: 'inactive_op',
    centreId: 'demo_inactive_01',
    centreName: 'Inactive Procurement Centre',
    stateName: 'Bihar',
    districtName: 'Patna',
    subdistrictName: 'Fatwah',
    isDemo: true,
    isActive: false,
  },
];

export let dbOperatorAccounts: Record<string, OperatorAccount> = {};

export function ensureDemoOperatorForCentre(centre: ProcurementCentre): OperatorAccount {
  const existing = dbOperatorAccounts[centre.id];
  if (existing) return existing;

  const newOp: OperatorAccount = {
    userId: `usr_op_${centre.id}`,
    role: 'OPERATOR',
    username: 'operator',
    centreId: centre.id,
    centreName: centre.name,
    stateName: centre.state,
    districtName: centre.district,
    subdistrictName: centre.block,
    isDemo: true,
    isActive: true,
  };
  dbOperatorAccounts[centre.id] = newOp;
  return newOp;
}

export function initOperatorAccounts() {
  dbOperatorAccounts = {};
  SEED_OPERATOR_ACCOUNTS.forEach((op) => {
    dbOperatorAccounts[op.centreId] = op;
  });
  dbCentres.forEach((centre) => {
    if (!dbOperatorAccounts[centre.id]) {
      ensureDemoOperatorForCentre(centre);
    }
  });
}

initOperatorAccounts();

export const DEMO_ADMIN_NASHIK: AdminAccount = {
  userId: 'usr_admin_nashik',
  adminId: 'DEMO-ADMIN-NASHIK',
  role: 'ADMIN',
  username: 'nashik_admin',
  passwordHash: 'demo123',
  fullName: 'District Admin (Nashik HQ)',
  designation: 'District Procurement Officer',
  mobile: '+91 98000 22222',
  email: 'admin.nashik@annsetu.in',
  department: 'District Food & Civil Supplies',
  stateCode: 'MH',
  stateName: 'Maharashtra',
  districtCode: 'MH_NSK',
  districtName: 'Nashik',
  isDemo: true,
  isActive: true,
};

export const DEMO_ADMIN_PATNA: AdminAccount = {
  userId: 'usr_admin_patna',
  adminId: 'DEMO-ADMIN-PATNA',
  role: 'ADMIN',
  username: 'patna_admin',
  passwordHash: 'demo123',
  fullName: 'Patna District Administration',
  designation: 'District Magistrate & Collector',
  mobile: '+91 98000 33333',
  email: 'collector.patna@bihar.gov.in',
  department: 'Food & Civil Supplies Department',
  stateCode: 'BR',
  stateName: 'Bihar',
  districtCode: 'BR_PAT',
  districtName: 'Patna',
  isDemo: true,
  isActive: true,
};

export const DEMO_ADMIN_KOLKATA: AdminAccount = {
  userId: 'usr_admin_kolkata',
  adminId: 'DEMO-ADMIN-KOLKATA',
  role: 'ADMIN',
  username: 'kolkata_admin',
  passwordHash: 'demo123',
  fullName: 'Kolkata District Administration',
  designation: 'District Magistrate',
  mobile: '+91 98000 44444',
  email: 'dm.kolkata@wb.gov.in',
  department: 'Food & Supplies Department',
  stateCode: 'WB',
  stateName: 'West Bengal',
  districtCode: 'WB_KOL',
  districtName: 'Kolkata',
  isDemo: true,
  isActive: true,
};

export const DEFAULT_SEED_ADMIN: AdminAccount = DEMO_ADMIN_NASHIK;

export let dbAdminAccounts: Record<string, AdminAccount> = {
  'DEMO-ADMIN-NASHIK': DEMO_ADMIN_NASHIK,
  'DEMO-ADMIN-PATNA': DEMO_ADMIN_PATNA,
  'DEMO-ADMIN-KOLKATA': DEMO_ADMIN_KOLKATA,
  'DEMO-ADMIN-001': DEMO_ADMIN_NASHIK,
  admin: DEMO_ADMIN_NASHIK,
  patna_admin: DEMO_ADMIN_PATNA,
  kolkata_admin: DEMO_ADMIN_KOLKATA,
  nashik_admin: DEMO_ADMIN_NASHIK,
};

export let currentDemoScenario: DemoScenario = {
  id: 'DEMO-BR-PAT-001',
  stateCode: 'BR',
  stateName: 'Bihar',
  districtCode: 'BR_PAT',
  districtName: 'Patna',
  createdAt: new Date().toISOString(),
};

export function setCurrentDemoScenario(scenario: DemoScenario) {
  currentDemoScenario = scenario;
}

export let dbOtpStore: Record<string, OtpData> = {};
export let dbSessions: Record<string, SessionData> = {};

export function setDbCentres(centres: ProcurementCentre[]) {
  dbCentres = centres;
}

export function handleReset(mode?: string) {
  if (mode === 'CLEAN') {
    dbTokens.length = 0;
    dbNotifications.length = 0;
    dbRecords.length = 0;
    dbCentres = dbCentres.map((c) => ({
      ...c,
      currentQueue: 0,
      processingCount: 0,
      completedToday: 0,
      availableSlots: 25,
      lastUpdated: 'Just now',
    }));
  } else {
    dbCentres = generateAllDemoCentres([...INITIAL_CENTRES]);
    dbSlots = [...INITIAL_SLOTS];
    dbTokens = [...INITIAL_TOKENS];
    dbNotifications = [...INITIAL_NOTIFICATIONS];
    dbRecords.length = 0;
    dbAnalytics = { ...INITIAL_ANALYTICS };
  }
  initOperatorAccounts();
}
