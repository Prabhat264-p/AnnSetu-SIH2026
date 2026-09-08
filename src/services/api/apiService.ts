import {
  AnalyticsSummary,
  AppNotification,
  CentreStatus,
  ProcurementCentre,
  Slot,
  SmartRecommendation,
  Token,
  TokenStatus,
  User,
  UserRole,
  FarmerProfile,
  DemoScenario,
} from '../../types';

const API_BASE = '/api';

/**
 * Wrapper to fetch from Express REST API with graceful fallback handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = localStorage.getItem('annsetu_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      if (errJson && typeof errJson === 'object') {
        return {
          success: false,
          status: res.status,
          error: errJson.error || errJson.message || `Server returned status ${res.status}`,
          ...errJson,
        } as unknown as T;
      }

      let errorMsg = `Server error (${res.status})`;
      if (res.status === 401) errorMsg = 'Invalid credentials or expired session.';
      else if (res.status === 403) errorMsg = 'Access denied. You do not have permission.';
      else if (res.status === 404) errorMsg = 'Requested account or resource not found.';
      else if (res.status === 409) errorMsg = 'An account already exists for this mobile number.';
      else if (res.status === 429) errorMsg = 'Maximum attempts exceeded. Please try again later.';
      else if (res.status >= 500) errorMsg = 'AnnSetu server encountered an internal error.';

      return {
        success: false,
        status: res.status,
        error: errorMsg,
      } as unknown as T;
    }

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      isNetworkError: true,
      error: 'Unable to connect to AnnSetu server. Please check network connection.',
    } as unknown as T;
  }
}

export const apiService = {
  // Healthcheck
  async checkHealth() {
    return fetchApi<{ status: string; database: string }>('/health');
  },

  // Auth: Farmer OTP & Registration
  async sendFarmerOtp(mobile: string) {
    return fetchApi<{
      success: boolean;
      message?: string;
      error?: string;
      isUnregistered?: boolean;
      expiresSeconds?: number;
      cooldownSeconds?: number;
      demoOtp?: string;
    }>('/auth/farmer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  async verifyFarmerOtp(mobile: string, otp: string) {
    return fetchApi<{
      success: boolean;
      token?: string;
      user?: User;
      farmerProfile?: FarmerProfile;
      isNewFarmer?: boolean;
      profileCompleted?: boolean;
      error?: string;
    }>('/auth/farmer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  },

  async registerFarmer(data: {
    mobile: string;
    name: string;
    stateCode?: string;
    stateName: string;
    districtCode?: string;
    districtName: string;
    subdistrictCode?: string;
    subdistrictName: string;
    village: string;
    pinCode?: string;
    latitude?: number;
    longitude?: number;
    locationSource?: string;
  }) {
    return fetchApi<{
      success: boolean;
      token?: string;
      user?: User;
      farmerProfile?: FarmerProfile;
      profileCompleted?: boolean;
      error?: string;
    }>('/auth/farmer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Auth: Operator & Admin Login
  async operatorLogin(credentials: { centreId: string; username: string; password: string }) {
    return fetchApi<{
      success: boolean;
      token?: string;
      user?: User;
      role?: UserRole;
      centreId?: string;
      isUnregistered?: boolean;
      error?: string;
    }>('/auth/operator/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async registerOperator(data: {
    centreId?: string;
    operatorName: string;
    mobile: string;
    username: string;
    password: string;
    newCentre?: {
      name: string;
      state: string;
      stateCode?: string;
      district: string;
      districtCode?: string;
      block: string;
      village?: string;
      agency?: string;
      supportedCrops?: string[];
      dailyCapacity?: number;
      counters?: number;
      address?: string;
    };
  }) {
    return fetchApi<{
      success: boolean;
      token?: string;
      user?: User;
      role?: UserRole;
      centreId?: string;
      centreName?: string;
      error?: string;
    }>('/auth/operator/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminLogin(credentials: { adminId: string; password: string }) {
    return fetchApi<{
      success: boolean;
      token?: string;
      user?: User;
      role?: UserRole;
      districtCode?: string;
      isUnregistered?: boolean;
      error?: string;
    }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async registerDistrictAdmin(data: {
    stateCode: string;
    districtCode: string;
    fullName: string;
    designation: string;
    mobile: string;
    email?: string;
    department: string;
    username: string;
    password: string;
  }) {
    return fetchApi<{
      success: boolean;
      token?: string;
      role?: UserRole;
      user?: User;
      admin?: {
        adminId: string;
        fullName: string;
        designation: string;
        department: string;
        stateCode: string;
        stateName: string;
        districtCode: string;
        districtName: string;
      };
      error?: string;
    }>('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAuthMe() {
    return fetchApi<{
      success: boolean;
      user?: User;
      farmerProfile?: FarmerProfile;
      role?: UserRole;
      centreId?: string;
      districtCode?: string;
      profileCompleted?: boolean;
      error?: string;
    }>('/auth/me');
  },

  async getOperatorMe() {
    return fetchApi<{
      success: boolean;
      user?: User;
      operator?: any;
      centre?: ProcurementCentre;
      error?: string;
    }>('/operators/me');
  },

  // Legacy / General Auth
  async login(role: UserRole, credentials?: Record<string, any>) {
    return fetchApi<{ success: boolean; token?: string; user: User; farmerProfile?: FarmerProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, ...credentials }),
    });
  },

  async logout() {
    return fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  // Farmer Profile API
  async getFarmerProfile(farmerId?: string) {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    return fetchApi<{ profile: any }>('/farmers/me' + query);
  },

  async updateFarmerProfile(profileData: Partial<any>) {
    return fetchApi<{ success: boolean; profile: any }>('/farmers/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Administrative Locations (LGD Master)
  async getStates(type?: 'STATE' | 'UNION_TERRITORY') {
    const query = type ? `?type=${type}` : '';
    return fetchApi<{ count: number; locations?: any[]; states?: any[]; unionTerritories?: any[] }>(`/locations/states${query}`);
  },

  async getUnionTerritories() {
    return fetchApi<{ count: number; locations: any[] }>('/locations/union-territories');
  },

  async getDistricts(stateName: string) {
    return fetchApi<{ state: string; count: number; districts: string[] }>(`/locations/districts?state=${encodeURIComponent(stateName)}`);
  },

  async getSubdistricts(stateName: string, districtName: string) {
    return fetchApi<{ state: string; district: string; count: number; subdistricts: string[] }>(
      `/locations/subdistricts?state=${encodeURIComponent(stateName)}&district=${encodeURIComponent(districtName)}`
    );
  },

  // Crops
  async getCrops() {
    return fetchApi<{
      count: number;
      crops: { id: string; name: string; icon: string; mspRupeesPerQtl: number; category: string }[];
    }>('/crops');
  },

  // Centres
  async getCentres(params?: { district?: string; crop?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ count: number; centres: ProcurementCentre[] }>(`/centres?${query}`);
  },

  async getNearbyCentres(params?: { district?: string; crop?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ count: number; centres: ProcurementCentre[] }>(`/centres/nearby?${query}`);
  },

  async getCentreById(id: string) {
    return fetchApi<ProcurementCentre>(`/centres/${id}`);
  },

  async updateCentreCounters(id: string, activeCounters: number) {
    return fetchApi<{ success: boolean; centre: ProcurementCentre }>(`/centres/${id}/counters`, {
      method: 'PUT',
      body: JSON.stringify({ activeCounters }),
    });
  },

  async updateCentreStatus(id: string, status: CentreStatus) {
    return fetchApi<{ success: boolean; centre: ProcurementCentre }>(`/centres/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminCentres(params?: { districtCode?: string; state?: string; district?: string; block?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; count: number; totalMasterCentres: number; centres: ProcurementCentre[] }>(`/admin/centres?${query}`);
  },

  async getAdminFarmers(params?: { districtCode?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; count: number; farmers: any[] }>(`/admin/farmers?${query}`);
  },

  async getAdminTokens(params?: { districtCode?: string; status?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; count: number; tokens: Token[] }>(`/admin/tokens?${query}`);
  },

  async getAdminProcurement(params?: { districtCode?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; count: number; records: any[] }>(`/admin/procurement?${query}`);
  },

  async getAdminReports(params?: { districtCode?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; districtCode: string; report: any }>(`/admin/reports?${query}`);
  },

  async getAdminAnalytics(params?: { districtCode?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; districtCode: string; analytics: AnalyticsSummary }>(`/admin/analytics?${query}`);
  },

  async getAdminAlerts(params?: { districtCode?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; districtCode: string; alerts: any[] }>(`/admin/alerts?${query}`);
  },

  async getAdminQueue(params?: { districtCode?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; districtCode: string; queue: any[] }>(`/admin/queue?${query}`);
  },

  async getDemoScenario() {
    return fetchApi<{ success: boolean; scenario: DemoScenario }>('/demo/scenario');
  },

  async setDemoScenario(payload: { stateCode: string; stateName?: string; districtCode: string; districtName?: string }) {
    return fetchApi<{ success: boolean; scenario: DemoScenario }>('/demo/scenario', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAdminTransactions(params?: { districtCode?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ success: boolean; districtCode: string; transactions: any[] }>(`/admin/transactions?${query}`);
  },

  async getCentreConsistency() {
    return fetchApi<{
      centreMasterCount: number;
      farmerVisibleCount: number;
      operatorVisibleCount: number;
      adminVisibleCount: number;
      missingFromFarmer: string[];
      missingFromOperator: string[];
      missingFromAdmin: string[];
      duplicateCentreIds: string[];
      status: 'PASS' | 'FAIL';
    }>('/dev/centre-consistency');
  },

  // Recommendations
  async getRecommendations(crop: string = 'Wheat', farmer?: any) {
    return fetchApi<{
      count: number;
      crop: string;
      algorithm: string;
      recommendations: SmartRecommendation[];
    }>('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ selectedCrop: crop, farmer }),
    });
  },

  // Slots
  async getSlots(centreId: string, date: string) {
    return fetchApi<{ count: number; slots: Slot[] }>(`/slots?centreId=${centreId}&date=${date}`);
  },

  async bookSlot(data: {
    centreId: string;
    date: string;
    timeSlot: string;
    crop: string;
    quantityQuintals: number;
    farmerId?: string;
    farmerName?: string;
    farmerMobile?: string;
  }) {
    return fetchApi<{ success: boolean; token?: Token; error?: string }>('/slots/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Tokens
  async getTokens(params?: { farmerId?: string; centreId?: string; status?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<{ count: number; tokens: Token[] }>(`/tokens?${query}`);
  },

  async updateTokenStatus(tokenId: string, status: TokenStatus, extra?: any) {
    return fetchApi<{ success: boolean; token: Token }>(`/tokens/${tokenId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, extra }),
    });
  },

  // Queue Operations
  async callNextFarmer(centreId: string) {
    return fetchApi<{ success: boolean; token?: Token; message?: string }>('/queue/call-next', {
      method: 'POST',
      body: JSON.stringify({ centreId }),
    });
  },

  // Notifications
  async getNotifications(userId: string) {
    return fetchApi<{ count: number; notifications: AppNotification[] }>(`/notifications?userId=${userId}`);
  },

  // Analytics
  async getAnalytics() {
    return fetchApi<AnalyticsSummary>('/analytics');
  },

  async resetDevData(mode: 'CLEAN' | 'DEMO' = 'CLEAN') {
    return fetchApi<{ success: boolean; message: string }>('/dev/reset', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  },

  async getDemoCoverage() {
    return fetchApi<{
      totalSubdistricts: number;
      subdistrictsWith3Centres: number;
      subdistrictsWith2Centres: number;
      subdistrictsWith1Centre: number;
      subdistrictsWith0Centres: number;
      coveragePercentage: number;
      demoModeEnabled: boolean;
    }>('/dev/demo-coverage');
  },

  async repairDemoCoverage() {
    return fetchApi<{
      success: boolean;
      message: string;
      report: {
        totalSubdistricts: number;
        subdistrictsWith3Centres: number;
        subdistrictsWith2Centres: number;
        subdistrictsWith1Centre: number;
        subdistrictsWith0Centres: number;
        coveragePercentage: number;
        demoModeEnabled: boolean;
      };
    }>('/dev/repair-coverage', { method: 'POST' });
  },

  async transcribeVoice(formData: FormData) {
    try {
      const token = localStorage.getItem('annsetu_auth_token');
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        return {
          success: false,
          status: res.status,
          error: errJson?.error || errJson?.message || `Server returned status ${res.status}`,
          errorCode: errJson?.errorCode || 'API_CONNECTION_FAILED',
          diagnostics: errJson?.diagnostics,
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        error: 'Unable to connect to AnnSetu voice server.',
        errorCode: 'BACKEND_UNAVAILABLE',
      };
    }
  },
};
