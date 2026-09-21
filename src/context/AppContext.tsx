import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AnalyticsSummary,
  AppNotification,
  AuthSession,
  CentreStatus,
  FarmerProfile,
  Language,
  ProcurementCentre,
  ProcurementRecord,
  Slot,
  Token,
  TokenStatus,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ANALYTICS,
  INITIAL_CENTRES,
  INITIAL_FARMER_PROFILE,
  INITIAL_NOTIFICATIONS,
  INITIAL_SLOTS,
  INITIAL_TOKENS,
  INITIAL_USER,
  INITIAL_OPERATOR,
  INITIAL_ADMIN,
} from '../data/mockData';
import { playNotificationChime } from '../services/notification/notificationService';
import { TRANSLATIONS } from '../i18n/translations';
import { apiService } from '../services/api/apiService';
import { resolveCentreById } from '../utils/centreResolver';

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  farmerProfile: FarmerProfile;
  isProfileComplete: boolean;
  updateFarmerProfile: (updated: Partial<FarmerProfile>) => Promise<{ success: boolean; profile?: FarmerProfile; error?: string }>;
  centres: ProcurementCentre[];
  slots: Slot[];
  tokens: Token[];
  notifications: AppNotification[];
  procurementRecords: ProcurementRecord[];
  analytics: AnalyticsSummary;
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  sendFarmerOtp: (mobile: string) => Promise<{ success: boolean; isUnregistered?: boolean; message?: string; error?: string; demoOtp?: string }>;
  verifyFarmerOtp: (mobile: string, otp: string) => Promise<{ success: boolean; isNewFarmer?: boolean; profileCompleted?: boolean; error?: string }>;
  registerFarmer: (data: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginOperator: (credentials: { centreId: string; username: string; password: string }) => Promise<{ success: boolean; isUnregistered?: boolean; error?: string }>;
  registerOperator: (data: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginAdmin: (credentials: { adminId: string; password: string }) => Promise<{ success: boolean; isUnregistered?: boolean; error?: string }>;
  registerDistrictAdmin: (data: any) => Promise<{ success: boolean; adminId?: string; message?: string; error?: string }>;
  login: (role: UserRole, credentials?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  activeToken: Token | null;
  bookSlot: (params: {
    centreId: string;
    date: string;
    timeSlot: string;
    crop: string;
    quantityQuintals: number;
  }) => { success: boolean; token?: Token; error?: string };
  updateTokenStatus: (
    tokenId: string,
    newStatus: TokenStatus,
    extra?: {
      moisturePercentage?: number;
      qualityGrade?: 'A' | 'B' | 'FAQ (Fair Average Quality)';
      remarks?: string;
      counterAssigned?: number;
    }
  ) => void;
  callNextFarmer: (centreId: string) => Token | null;
  updateCentreCounters: (centreId: string, activeCounters: number) => void;
  updateCentreStatus: (centreId: string, status: CentreStatus) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  simulateQueueStep: () => void;
  resetToSeedData: () => void;
  resetToCleanState: () => void;
  switchUserRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'annsetu_v1_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_session`);
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_session`);
    return saved ? JSON.parse(saved).isAuthenticated === true : false;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedSession = localStorage.getItem(`${STORAGE_KEY}_session`);
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      if (parsed.user) return parsed.user;
    }
    const savedUser = localStorage.getItem(`${STORAGE_KEY}_user`);
    return savedUser ? JSON.parse(savedUser) : INITIAL_USER;
  });

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_farmerProfile`);
    return saved ? JSON.parse(saved) : INITIAL_FARMER_PROFILE;
  });

  const isProfileComplete = Boolean(
    farmerProfile &&
    farmerProfile.state &&
    farmerProfile.district &&
    farmerProfile.block &&
    farmerProfile.village &&
    typeof farmerProfile.latitude === 'number' &&
    typeof farmerProfile.longitude === 'number'
  );

  const updateFarmerProfile = async (updated: Partial<FarmerProfile>) => {
    const res = await apiService.updateFarmerProfile({
      userId: currentUser.id,
      ...farmerProfile,
      ...updated,
    });
    const profileToSet: FarmerProfile = res && res.profile ? res.profile : { ...farmerProfile, ...updated };
    setFarmerProfile(profileToSet);
    localStorage.setItem(`${STORAGE_KEY}_farmerProfile`, JSON.stringify(profileToSet));
    
    // Also sync user state & district display strings
    setCurrentUser((prev) => ({
      ...prev,
      name: profileToSet.name || prev.name,
      mobile: profileToSet.mobile || prev.mobile,
      state: profileToSet.state,
      district: profileToSet.district,
    }));

    return { success: true, profile: profileToSet };
  };

  const [centres, setCentres] = useState<ProcurementCentre[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_centres`);
    return saved ? JSON.parse(saved) : INITIAL_CENTRES;
  });

  const [slots, setSlots] = useState<Slot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_slots`);
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  const [tokens, setTokens] = useState<Token[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tokens`);
    return saved ? JSON.parse(saved) : INITIAL_TOKENS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [procurementRecords, setProcurementRecords] = useState<ProcurementRecord[]>([]);

  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_analytics`);
    return saved ? JSON.parse(saved) : INITIAL_ANALYTICS;
  });

  const [language, setLanguageState] = useState<Language>(currentUser.language || 'en');

  // Sync with Express REST API & validate session on mount
  useEffect(() => {
    const syncWithApi = async () => {
      // 1. Validate Session with Backend GET /api/auth/me
      const meRes = await apiService.getAuthMe();
      if (meRes && meRes.success && meRes.user) {
        setIsAuthenticated(true);
        setCurrentUser(meRes.user);
        if (meRes.role === 'FARMER' && meRes.farmerProfile) {
          setFarmerProfile(meRes.farmerProfile);
          localStorage.setItem(`${STORAGE_KEY}_farmerProfile`, JSON.stringify(meRes.farmerProfile));
        }
      } else {
        const storedToken = localStorage.getItem('annsetu_auth_token');
        if (storedToken) {
          // Token is invalid or expired
          setIsAuthenticated(false);
          setSessionState(null);
          localStorage.removeItem('annsetu_auth_token');
          localStorage.removeItem(`${STORAGE_KEY}_session`);
        }
      }

      // 2. Sync domain data
      if (meRes && meRes.role === 'ADMIN') {
        const adminCentreRes = await apiService.getAdminCentres();
        if (adminCentreRes && adminCentreRes.centres) {
          setCentres(adminCentreRes.centres);
        }
        const adminAnalyticsRes = await apiService.getAdminAnalytics();
        if (adminAnalyticsRes && adminAnalyticsRes.analytics) {
          setAnalytics(adminAnalyticsRes.analytics);
        }
        const adminTokensRes = await apiService.getAdminTokens();
        if (adminTokensRes && adminTokensRes.tokens) {
          setTokens(adminTokensRes.tokens);
        }
      } else {
        const centreRes = await apiService.getCentres();
        if (centreRes && centreRes.centres && centreRes.centres.length > 0) {
          setCentres(centreRes.centres);
        }
        const tokenRes = await apiService.getTokens();
        if (tokenRes && tokenRes.tokens && tokenRes.tokens.length > 0) {
          setTokens(tokenRes.tokens);
        }
        const analyticsRes = await apiService.getAnalytics();
        if (analyticsRes) {
          setAnalytics(analyticsRes);
        }
      }
      const notifRes = await apiService.getNotifications(currentUser.id);
      if (notifRes && notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
    };
    syncWithApi();
  }, [currentUser.id]);

  // Sync state to localStorage for offline durability
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_centres`, JSON.stringify(centres));
  }, [centres]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tokens`, JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_slots`, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_analytics`, JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_farmerProfile`, JSON.stringify(farmerProfile));
  }, [farmerProfile]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setCurrentUser((prev) => ({ ...prev, language: lang }));
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  // Auth Action Handlers
  const sendFarmerOtp = async (mobile: string) => {
    const res = await apiService.sendFarmerOtp(mobile);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server. Please check network connection.' };
    }
    return res;
  };

  const verifyFarmerOtp = async (mobile: string, otp: string) => {
    const res = await apiService.verifyFarmerOtp(mobile, otp);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server.' };
    }
    if (!res.success) {
      return { success: false, error: res.error || 'OTP verification failed.' };
    }

    if (res.isNewFarmer) {
      return { success: true, isNewFarmer: true, profileCompleted: false };
    }

    if (res.token && res.user) {
      localStorage.setItem('annsetu_auth_token', res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);

      if (res.farmerProfile) {
        setFarmerProfile(res.farmerProfile);
        localStorage.setItem(`${STORAGE_KEY}_farmerProfile`, JSON.stringify(res.farmerProfile));
      }

      const sessionObj: AuthSession = {
        isAuthenticated: true,
        user: res.user,
        role: 'FARMER',
        token: res.token,
        loginTime: new Date().toISOString(),
      };
      setSessionState(sessionObj);
      localStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(sessionObj));
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(res.user));

      return { success: true, profileCompleted: Boolean(res.profileCompleted) };
    }

    return { success: false, error: 'Invalid response from server.' };
  };

  const registerFarmer = async (data: any) => {
    const res = await apiService.registerFarmer(data);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server.' };
    }
    if (!res.success) {
      return { success: false, error: res.error || 'Registration failed.' };
    }

    return {
      success: true,
      message: 'Registration successful. Please log in with your registered mobile number.',
    };
  };

  const loginOperator = async (credentials: { centreId: string; username: string; password: string }) => {
    const res = await apiService.operatorLogin(credentials);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server.' };
    }
    if (!res.success || !res.token || !res.user) {
      return {
        success: false,
        isUnregistered: res.isUnregistered,
        error: res.error || 'Operator login failed.',
      };
    }

    localStorage.setItem('annsetu_auth_token', res.token);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    const centreRes = await apiService.getCentres();
if (centreRes && centreRes.centres) {
  setCentres(centreRes.centres);
}

    const sessionObj: AuthSession = {
      isAuthenticated: true,
      user: res.user,
      role: 'OPERATOR',
      token: res.token,
      loginTime: new Date().toISOString(),
    };
    setSessionState(sessionObj);
    localStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(sessionObj));
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(res.user));

    return { success: true };
  };

  const registerOperator = async (data: any) => {
    const res = await apiService.registerOperator(data);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server.' };
    }
    if (!res.success) {
      return { success: false, error: res.error || 'Operator registration failed.' };
    }

    const centreRes = await apiService.getCentres();
    if (centreRes && centreRes.centres) {
      setCentres(centreRes.centres);
    }

    return {
      success: true,
      message: 'Registration successful. Please log in with your new credentials.',
    };
  };

  const loginAdmin = async (credentials: { adminId: string; password: string }) => {
    const res = await apiService.adminLogin(credentials);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server.' };
    }
    if (!res.success || !res.token || !res.user) {
      return {
        success: false,
        isUnregistered: res.isUnregistered,
        error: res.error || 'Admin login failed.',
      };
    }

    localStorage.setItem('annsetu_auth_token', res.token);
    setCurrentUser(res.user);
    setIsAuthenticated(true);

    const sessionObj: AuthSession = {
      isAuthenticated: true,
      user: res.user,
      role: 'ADMIN',
      token: res.token,
      loginTime: new Date().toISOString(),
    };
    setSessionState(sessionObj);
    localStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(sessionObj));
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(res.user));

    const adminCentreRes = await apiService.getAdminCentres();
    if (adminCentreRes && adminCentreRes.centres) {
      setCentres(adminCentreRes.centres);
    }
    const adminAnalyticsRes = await apiService.getAdminAnalytics();
    if (adminAnalyticsRes && adminAnalyticsRes.analytics) {
      setAnalytics(adminAnalyticsRes.analytics);
    }
    const adminTokensRes = await apiService.getAdminTokens();
    if (adminTokensRes && adminTokensRes.tokens) {
      setTokens(adminTokensRes.tokens);
    }

    return { success: true };
  };

  const registerDistrictAdmin = async (data: any) => {
    const res = await apiService.registerDistrictAdmin(data);
    if (!res) {
      return { success: false, error: 'Unable to connect to AnnSetu server.' };
    }
    if (!res.success) {
      return { success: false, error: res.error || 'District Admin registration failed.' };
    }

    return {
      success: true,
      adminId: res.admin?.adminId,
      message: 'Registration successful. Please log in with your new Admin ID and password.',
    };
  };

  const login = async (role: UserRole, credentials?: any): Promise<{ success: boolean; error?: string }> => {
    if (role === 'OPERATOR') {
      return loginOperator({
        centreId: credentials?.centreId || 'cnt_sinnar',
        username: credentials?.username || 'operator',
        password: credentials?.password || 'demo123',
      });
    }
    if (role === 'ADMIN') {
      return loginAdmin({
        adminId: credentials?.adminId || 'DEMO-ADMIN-NASHIK',
        password: credentials?.password || 'demo123',
      });
    }

    let newUser: User = INITIAL_USER;
    newUser = {
      ...INITIAL_USER,
      mobile: credentials?.mobile || INITIAL_USER.mobile,
    };
    newUser.language = language;

    const res = await apiService.login(role, credentials);
    const userToSet = res && res.user ? res.user : newUser;
    const token = res && res.token ? res.token : `token_${Date.now()}`;

    if (res && res.token) {
      localStorage.setItem('annsetu_auth_token', res.token);
    }

    if (role === 'FARMER' && res && res.farmerProfile) {
      setFarmerProfile(res.farmerProfile);
      localStorage.setItem(`${STORAGE_KEY}_farmerProfile`, JSON.stringify(res.farmerProfile));
    }

    setCurrentUser(userToSet);
    setIsAuthenticated(true);

    const sessionObj: AuthSession = {
      isAuthenticated: true,
      user: userToSet,
      role,
      token,
      loginTime: new Date().toISOString(),
    };
    setSessionState(sessionObj);
    localStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(sessionObj));
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(userToSet));

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionState(null);
    setCentres(INITIAL_CENTRES);
    setTokens([]);
    setAnalytics(INITIAL_ANALYTICS);
    localStorage.removeItem('annsetu_auth_token');
    localStorage.removeItem(`${STORAGE_KEY}_session`);
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    localStorage.removeItem(`${STORAGE_KEY}_centres`);
    localStorage.removeItem(`${STORAGE_KEY}_tokens`);
    localStorage.removeItem(`${STORAGE_KEY}_analytics`);
    apiService.logout();
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  // Find active token for current farmer
  const activeToken =
    tokens.find(
      (t) =>
        t.farmerId === currentUser.id &&
        !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(t.status)
    ) ||
    tokens.find((t) => t.id === 'tkn_active_01') ||
    null;

  // Book a new slot with real-time validation & overbooking prevention
  const bookSlot = ({
    centreId,
    date,
    timeSlot,
    crop,
    quantityQuintals,
  }: {
    centreId: string;
    date: string;
    timeSlot: string;
    crop: string;
    quantityQuintals: number;
  }) => {
    const targetCentre = resolveCentreById(centreId, centres);
    if (!targetCentre) {
      return { success: false, error: 'Procurement centre not found.' };
    }

    if (targetCentre.status === 'CLOSED') {
      return { success: false, error: 'This centre is currently closed for procurement.' };
    }

    // Check slot availability
    const slotIndex = slots.findIndex(
      (s) => s.centreId === centreId && s.date === date && s.timeSlot === timeSlot
    );

    let assignedSlot: Slot;
    if (slotIndex >= 0) {
      if (slots[slotIndex].remainingCapacity <= 0) {
        return { success: false, error: 'Selected time slot is already fully booked! Please choose another slot.' };
      }
      assignedSlot = slots[slotIndex];
    } else {
      assignedSlot = {
        id: `slt_${Date.now()}`,
        centreId,
        date,
        timeSlot,
        capacity: 25,
        bookedCount: 1,
        remainingCapacity: 24,
        expectedQueue: targetCentre.currentQueue + 1,
        estimatedWait: '35 - 45 min',
      };
    }

    // Generate unique readable token number
    const prefix = crop.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const tokenNumber = `${prefix}-${randomNum}`;
    const newQueuePos = targetCentre.currentQueue + 1;

    const newToken: Token = {
      id: `tkn_${Date.now()}`,
      tokenNumber,
      farmerId: currentUser.id,
      farmerName: currentUser.name || 'Ram Das',
      farmerMobile: currentUser.mobile || '+91 98765 43210',
      farmerVillage: farmerProfile.village || 'Panchale, Sinnar',
      centreId: targetCentre.id,
      centreName: targetCentre.name,
      centreDistrict: targetCentre.district,
      crop,
      quantityQuintals,
      date,
      timeSlot,
      queuePosition: newQueuePos,
      estimatedWaitMinutes: 45,
      estimatedWaitFormatted: '45 - 60 min',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      qrData: `ANNSETU:TOKEN:${tokenNumber}:${currentUser.name}:${targetCentre.name}:${quantityQuintals}Q:${crop}`,
      timeline: [
        {
          status: 'SCHEDULED',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Slot booked for ${date}, ${timeSlot} at ${targetCentre.name}.`,
        },
        {
          status: 'CONFIRMED',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Token ${tokenNumber} confirmed. Queue position: ${newQueuePos}.`,
        },
      ],
    };

    // Call REST API in background
    apiService.bookSlot({
      centreId,
      date,
      timeSlot,
      crop,
      quantityQuintals,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerMobile: currentUser.mobile,
    });

    // Update tokens list
    setTokens((prev) => [newToken, ...prev]);

    // Update slots capacity
    if (slotIndex >= 0) {
      setSlots((prev) =>
        prev.map((s, idx) =>
          idx === slotIndex
            ? {
                ...s,
                bookedCount: s.bookedCount + 1,
                remainingCapacity: Math.max(0, s.remainingCapacity - 1),
              }
            : s
        )
      );
    } else {
      setSlots((prev) => [...prev, assignedSlot]);
    }

    // Update centre live stats
    setCentres((prev) =>
      prev.map((c) =>
        c.id === centreId
          ? {
              ...c,
              currentQueue: c.currentQueue + 1,
              availableSlots: Math.max(0, c.availableSlots - 1),
              lastUpdated: 'Just now',
            }
          : c
      )
    );

    // Update analytics
    setAnalytics((prev) => ({
      ...prev,
      totalTokens: prev.totalTokens + 1,
    }));

    // Create confirmation notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `Token Confirmed: ${tokenNumber}`,
      message: `Your appointment is confirmed at ${targetCentre.name} on ${date} (${timeSlot}).`,
      type: 'TOKEN_CONFIRMED',
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokenId: newToken.id,
      tokenNumber,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    playNotificationChime('success');

    return { success: true, token: newToken };
  };

  // Update token status & recalculate queue positions
  const updateTokenStatus = (
    tokenId: string,
    newStatus: TokenStatus,
    extra?: {
      moisturePercentage?: number;
      qualityGrade?: 'A' | 'B' | 'FAQ (Fair Average Quality)';
      remarks?: string;
      counterAssigned?: number;
    }
  ) => {
    let affectedCentreId = '';
    let updatedTokenObj: Token | null = null;

    apiService.updateTokenStatus(tokenId, newStatus, extra);

    setTokens((prev) =>
      prev.map((tkn) => {
        if (tkn.id !== tokenId) return tkn;
        affectedCentreId = tkn.centreId;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let desc = `Status updated to ${newStatus}`;
        if (newStatus === 'VERIFIED') {
          desc = `Documents & moisture checked (${extra?.moisturePercentage || 11.5}%). Move to weighbridge.`;
        } else if (newStatus === 'PROCESSING') {
          desc = `Procurement weighment in progress at Counter ${extra?.counterAssigned || tkn.counterAssigned || 1}.`;
        } else if (newStatus === 'COMPLETED') {
          const mspRate = 2275;
          const payout = tkn.quantityQuintals * mspRate;
          desc = `Procurement completed for ${tkn.quantityQuintals} Qtl @ ₹${mspRate}/Qtl (Total: ₹${payout.toLocaleString()}). Direct Bank Transfer scheduled.`;
        } else if (newStatus === 'NO_SHOW') {
          desc = `Farmer did not report for booked slot. Token status updated to NO_SHOW.`;
        } else if (newStatus === 'CANCELLED') {
          desc = `Booking cancelled by user/operator.`;
        }

        const updated: Token = {
          ...tkn,
          status: newStatus,
          counterAssigned: extra?.counterAssigned || tkn.counterAssigned,
          moisturePercentage: extra?.moisturePercentage || tkn.moisturePercentage,
          verifiedAt: newStatus === 'VERIFIED' ? new Date().toISOString() : tkn.verifiedAt,
          completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : tkn.completedAt,
          procurementAmountRupees:
            newStatus === 'COMPLETED'
              ? tkn.quantityQuintals * 2275
              : tkn.procurementAmountRupees,
          timeline: [
            ...tkn.timeline,
            {
              status: newStatus,
              time: timeStr,
              description: desc,
            },
          ],
        };
        updatedTokenObj = updated;
        return updated;
      })
    );

    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(newStatus)) {
      setCentres((prev) =>
        prev.map((c) =>
          c.id === affectedCentreId
            ? {
                ...c,
                currentQueue: Math.max(0, c.currentQueue - 1),
                completedToday: newStatus === 'COMPLETED' ? c.completedToday + 1 : c.completedToday,
                processingCount: Math.max(0, c.processingCount - 1),
                lastUpdated: 'Just now',
              }
            : c
        )
      );

      if (newStatus === 'COMPLETED' && updatedTokenObj) {
        const uToken = updatedTokenObj as Token;
        const newRecord: ProcurementRecord = {
          id: `rec_${Date.now()}`,
          tokenId: uToken.id,
          tokenNumber: uToken.tokenNumber,
          farmerName: uToken.farmerName,
          farmerMobile: uToken.farmerMobile,
          farmerVillage: uToken.farmerVillage,
          centreId: uToken.centreId,
          centreName: uToken.centreName,
          crop: uToken.crop,
          quantityQuintals: uToken.quantityQuintals,
          moisturePercentage: extra?.moisturePercentage || 11.8,
          qualityGrade: extra?.qualityGrade || 'FAQ (Fair Average Quality)',
          mspRatePerQuintal: 2275,
          totalPayoutRupees: uToken.quantityQuintals * 2275,
          paymentStatus: 'PROCESSED',
          timestamp: new Date().toISOString(),
          operatorId: currentUser.id,
        };
        setProcurementRecords((prev) => [newRecord, ...prev]);

        setAnalytics((prev) => ({
          ...prev,
          totalProcurementQuintals: prev.totalProcurementQuintals + uToken.quantityQuintals,
          totalFarmers: prev.totalFarmers + 1,
        }));
      }
    }

    if (newStatus === 'COMPLETED') {
      playNotificationChime('success');
    } else {
      playNotificationChime('alert');
    }
  };

  const callNextFarmer = (centreId: string): Token | null => {
    apiService.callNextFarmer(centreId);

    const waitingTokens = tokens.filter(
      (t) => t.centreId === centreId && ['WAITING', 'CONFIRMED', 'SCHEDULED'].includes(t.status)
    );

    if (waitingTokens.length === 0) return null;

    const nextToken = waitingTokens[0];
    updateTokenStatus(nextToken.id, 'VERIFIED', { moisturePercentage: 11.9, counterAssigned: 1 });

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: nextToken.farmerId,
      title: `It's Your Turn! (Token ${nextToken.tokenNumber})`,
      message: `Please proceed immediately to Counter 1 at ${nextToken.centreName} for grain weighing & verification.`,
      type: 'PROCEED_TO_CENTRE',
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokenId: nextToken.id,
      tokenNumber: nextToken.tokenNumber,
    };
    setNotifications((prev) => [notif, ...prev]);
    playNotificationChime('alert');

    return nextToken;
  };

  const updateCentreCounters = (centreId: string, activeCounters: number) => {
    apiService.updateCentreCounters(centreId, activeCounters);

    setCentres((prev) =>
      prev.map((c) =>
        c.id === centreId
          ? {
              ...c,
              activeCounters: Math.max(1, Math.min(c.counters, activeCounters)),
              lastUpdated: 'Just now',
            }
          : c
      )
    );
  };

  const updateCentreStatus = (centreId: string, status: CentreStatus) => {
    apiService.updateCentreStatus(centreId, status);

    setCentres((prev) =>
      prev.map((c) =>
        c.id === centreId
          ? {
              ...c,
              status,
              lastUpdated: 'Just now',
            }
          : c
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const simulateQueueStep = () => {
    if (activeToken && activeToken.queuePosition > 1) {
      const newPos = activeToken.queuePosition - 1;
      const newWait = Math.max(5, newPos * 7);
      const newWaitStr = `${newWait - 5} - ${newWait + 5} min`;

      setTokens((prev) =>
        prev.map((t) =>
          t.id === activeToken.id
            ? {
                ...t,
                queuePosition: newPos,
                estimatedWaitMinutes: newWait,
                estimatedWaitFormatted: newWaitStr,
                timeline: [
                  ...t.timeline,
                  {
                    status: t.status,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    description: `Queue moved forward. ${newPos} farmers now ahead of you.`,
                  },
                ],
              }
            : t
        )
      );

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: currentUser.id,
        title: `Queue Advanced: Pos #${newPos}`,
        message: `${newPos} farmers ahead of you. Estimated wait: ${newWaitStr}.`,
        type: 'QUEUE_UPDATED',
        read: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokenId: activeToken.id,
        tokenNumber: activeToken.tokenNumber,
      };
      setNotifications((prev) => [notif, ...prev]);
      playNotificationChime('tick');
    }
  };

  // Development Reset to Seed Data Scenario
  const resetToSeedData = () => {
    localStorage.clear();
    sessionStorage.clear();
    setCentres(INITIAL_CENTRES);
    setTokens(INITIAL_TOKENS);
    setSlots(INITIAL_SLOTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProcurementRecords([]);
    setAnalytics(INITIAL_ANALYTICS);
    apiService.resetDevData('DEMO');
  };

  // Development Reset to Clean Empty State across all 3 roles
  const resetToCleanState = () => {
    localStorage.clear();
    sessionStorage.clear();
    setTokens([]);
    setNotifications([]);
    setProcurementRecords([]);
    setCentres((prev) =>
      prev.map((c) => ({
        ...c,
        currentQueue: 0,
        processingCount: 0,
        completedToday: 0,
        availableSlots: 25,
        lastUpdated: 'Just now',
      }))
    );
    setAnalytics((prev) => ({
      ...prev,
      totalCentres: centres.length,
      activeCentres: centres.filter((c) => c.status === 'OPEN').length,
      totalTokens: 0,
      totalProcurementQuintals: 0,
      totalFarmers: 0,
      districtCongestionScore: 12,
    }));
    apiService.resetDevData('CLEAN');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        farmerProfile,
        isProfileComplete,
        updateFarmerProfile,
        centres,
        slots,
        tokens,
        notifications,
        procurementRecords,
        analytics,
        language,
        t,
        setLanguage,
        sendFarmerOtp,
        verifyFarmerOtp,
        registerFarmer,
        loginOperator,
        registerOperator,
        loginAdmin,
        registerDistrictAdmin,
        login,
        logout,
        switchRole,
        activeToken,
        bookSlot,
        updateTokenStatus,
        callNextFarmer,
        updateCentreCounters,
        updateCentreStatus,
        markNotificationAsRead,
        clearAllNotifications,
        simulateQueueStep,
        resetToSeedData,
        resetToCleanState,
        switchUserRole: switchRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppContextProvider = AppProvider;

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
