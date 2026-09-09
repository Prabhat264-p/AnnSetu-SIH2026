import { Request, Response } from 'express';
import {
  dbOtpStore,
  dbSessions,
  dbFarmerProfiles,
  dbCentres,
  dbOperatorAccounts,
  dbAdminAccounts,
  currentDemoScenario,
  ensureDemoOperatorForCentre,
  DEFAULT_SEED_ADMIN,
  SEED_OPERATOR_ACCOUNTS,
} from '../data/db';
import { DEMO_MODE } from '../config/constants';
import { normalizeMobileNumber } from '../utils/helpers';
import { User, FarmerProfile, OperatorAccount, AdminAccount, ProcurementCentre } from '../../src/types';
import { DISTRICTS_MASTER, INDIA_STATES_UTS, getCoordinatesForSubdistrict } from '../../src/services/location/locationService';
import { getAdminSession } from '../middleware/auth.middleware';

export class AuthService {
  static sendFarmerOtp(mobile: string) {
    const normMobile = normalizeMobileNumber(mobile);
    if (!normMobile || normMobile.length !== 10 || !/^[6-9]\d{9}$/.test(normMobile)) {
      return { status: 400, data: { success: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9.' } };
    }

    const existingFarmerId = Object.keys(dbFarmerProfiles).find(
      (key) => normalizeMobileNumber(dbFarmerProfiles[key].mobile) === normMobile
    );

    if (!existingFarmerId || !dbFarmerProfiles[existingFarmerId]) {
      return {
        status: 404,
        data: {
          success: false,
          isUnregistered: true,
          error: 'This mobile number is not registered with AnnSetu. Please register first to continue.',
        },
      };
    }

    const existingOtp = dbOtpStore[normMobile];
    const now = Date.now();

    if (existingOtp && now - existingOtp.lastSentAt < 30000) {
      const remainingSecs = Math.ceil((30000 - (now - existingOtp.lastSentAt)) / 1000);
      return {
        status: 429,
        data: {
          success: false,
          error: `Please wait ${remainingSecs} seconds before requesting a new OTP.`,
          cooldownSeconds: remainingSecs,
        },
      };
    }

    const otp = DEMO_MODE ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000;

    dbOtpStore[normMobile] = {
      mobile: normMobile,
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    };

    return {
      status: 200,
      data: {
        success: true,
        message: `OTP sent successfully to +91 ${normMobile}`,
        expiresSeconds: 300,
        cooldownSeconds: 30,
        demoOtp: DEMO_MODE ? '123456' : undefined,
      },
    };
  }

  static verifyFarmerOtp(mobile: string, otp: string) {
    const normMobile = normalizeMobileNumber(mobile);
    if (!normMobile || normMobile.length !== 10) {
      return { status: 400, data: { success: false, error: 'Invalid mobile number.' } };
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
      return { status: 400, data: { success: false, error: 'Please enter the 6-digit OTP.' } };
    }

    const otpRecord = dbOtpStore[normMobile];
    const cleanOtp = otp.trim();
    const isDemoOtpMatch = DEMO_MODE && cleanOtp === '123456';

    if (!isDemoOtpMatch) {
      if (!otpRecord) {
        return { status: 400, data: { success: false, error: 'OTP expired or not requested. Please request a new OTP.' } };
      }
      if (Date.now() > otpRecord.expiresAt) {
        delete dbOtpStore[normMobile];
        return { status: 400, data: { success: false, error: 'OTP expired. Please request a new OTP.' } };
      }
      if (otpRecord.attempts >= 5) {
        delete dbOtpStore[normMobile];
        return { status: 429, data: { success: false, error: 'Maximum OTP verification attempts exceeded. Please request a new OTP.' } };
      }

      otpRecord.attempts++;

      if (otpRecord.otp !== cleanOtp) {
        const remaining = 5 - otpRecord.attempts;
        return {
          status: 400,
          data: { success: false, error: `Incorrect OTP. ${remaining} attempt(s) remaining.` },
        };
      }
    }

    delete dbOtpStore[normMobile];

    const existingFarmerId = Object.keys(dbFarmerProfiles).find(
      (key) => normalizeMobileNumber(dbFarmerProfiles[key].mobile) === normMobile
    );

    if (existingFarmerId && dbFarmerProfiles[existingFarmerId]) {
      const profile = dbFarmerProfiles[existingFarmerId];
      const farmerId = profile.id || profile.userId || existingFarmerId;
      const token = `tok_farmer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

      dbSessions[token] = {
        token,
        userId: farmerId,
        role: 'FARMER',
        mobile: normMobile,
        createdAt: Date.now(),
        expiresAt,
      };

      const user: User = {
        id: farmerId,
        name: profile.name || 'Farmer',
        mobile: profile.mobile || `+91 ${normMobile}`,
        role: 'FARMER',
        language: profile.preferredLanguage || 'en',
        district: profile.district,
        state: profile.state,
      };

      const isComplete = Boolean(
        profile.profileCompleted !== false &&
        profile.state &&
        profile.district &&
        profile.block &&
        profile.village
      );

      return {
        status: 200,
        data: {
          success: true,
          token,
          user,
          farmerProfile: profile,
          profileCompleted: isComplete,
        },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        isNewFarmer: true,
        mobile: normMobile,
        profileCompleted: false,
      },
    };
  }

  static registerFarmer(body: any) {
    const {
      name,
      mobile,
      stateCode,
      stateName,
      districtCode,
      districtName,
      subdistrictCode,
      subdistrictName,
      village,
      pinCode,
      latitude,
      longitude,
      locationSource,
    } = body || {};

    const normMobile = normalizeMobileNumber(mobile);
    if (!normMobile || normMobile.length !== 10) {
      return { status: 400, data: { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' } };
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return { status: 400, data: { success: false, error: 'Please enter your full name.' } };
    }

    if (!stateName || !districtName || !subdistrictName || !village || typeof village !== 'string' || village.trim().length === 0) {
      return { status: 400, data: { success: false, error: 'Please complete all location fields (State, District, Block, Village).' } };
    }

    const existingFarmerKey = Object.keys(dbFarmerProfiles).find(
      (key) => normalizeMobileNumber(dbFarmerProfiles[key].mobile) === normMobile
    );
    if (existingFarmerKey) {
      return {
        status: 400,
        data: { success: false, error: 'An account already exists for this mobile number. Please login with OTP.' },
      };
    }

    const districts = DISTRICTS_MASTER[stateName] || [];
    const distObj = districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
    if (districts.length > 0 && !distObj) {
      return { status: 400, data: { success: false, error: `District '${districtName}' does not belong to State '${stateName}'.` } };
    }

    const sCode = stateCode || (stateName === 'West Bengal' ? 'WB' : stateName.slice(0, 2).toUpperCase());
    const dCode = districtCode || `${sCode}_${districtName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;

    const farmerId = `usr_farmer_${Date.now()}`;
    const subCode = subdistrictCode || `${dCode}_${subdistrictName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`;

    let lat = latitude;
    let lng = longitude;
    let locSource: 'GPS' | 'DEMO' | 'PROFILE' = locationSource || 'DEMO';

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      const coords = getCoordinatesForSubdistrict(stateName, districtName, subdistrictName);
      lat = coords.latitude;
      lng = coords.longitude;
      locSource = 'DEMO';
    }

    const newProfile: FarmerProfile = {
      id: farmerId,
      userId: farmerId,
      name: name.trim(),
      mobile: `+91 ${normMobile}`,
      stateCode: sCode,
      stateName,
      districtCode: dCode,
      districtName,
      subdistrictCode: subCode,
      subdistrictName,
      state: stateName,
      district: districtName,
      block: subdistrictName,
      village: village.trim(),
      pinCode: pinCode || '',
      latitude: lat,
      longitude: lng,
      locationSource: locSource,
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbFarmerProfiles[farmerId] = newProfile;

    const token = `tok_farmer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    dbSessions[token] = {
      token,
      userId: farmerId,
      role: 'FARMER',
      mobile: normMobile,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    const user: User = {
      id: farmerId,
      name: newProfile.name,
      mobile: newProfile.mobile,
      role: 'FARMER',
      language: 'en',
      districtId: dCode,
      stateCode: sCode,
      districtCode: dCode,
      district: districtName,
      state: stateName,
    };

    return {
      status: 200,
      data: {
        success: true,
        token,
        user,
        farmerProfile: newProfile,
        profileCompleted: true,
      },
    };
  }

  static loginOperator(body: any) {
    const { centreId, username, password } = body || {};

    if (!centreId || !username || !password) {
      return { status: 400, data: { success: false, error: 'Please enter Centre ID, Username, and Password.' } };
    }

    const cleanCentreId = String(centreId).trim();
    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    let centre = dbCentres.find((c) => c.id === cleanCentreId || c.officialId === cleanCentreId);
    let opAccount = centre ? dbOperatorAccounts[centre.id] : dbOperatorAccounts[cleanCentreId];

    if (!opAccount) {
      const matchOp = Object.values(dbOperatorAccounts).find(
        (o) => o.centreId && o.centreId.toLowerCase() === cleanCentreId.toLowerCase()
      );
      if (matchOp) {
        opAccount = matchOp;
        if (!centre && matchOp.centreId) {
          centre = dbCentres.find((c) => c.id === matchOp.centreId);
        }
      }
    }

    if (!opAccount && centre) {
      opAccount = ensureDemoOperatorForCentre(centre);
    }

    if (!centre && !opAccount) {
      return {
        status: 404,
        data: {
          success: false,
          isUnregistered: true,
          error: 'This centre/operator account is not registered with AnnSetu. Please register first to continue.',
        },
      };
    }

    const isUserValid = opAccount ? cleanUsername.toLowerCase() === opAccount.username.toLowerCase() : cleanUsername.toLowerCase() === 'operator';
    const isPassValid = opAccount && opAccount.passwordHash ? cleanPassword === opAccount.passwordHash : cleanPassword === 'demo123';

    if (opAccount && opAccount.isActive === false) {
      return {
        status: 403,
        data: { success: false, isUnregistered: false, error: 'Your operator account is inactive. Please contact the district administrator.' },
      };
    }

    if (!centre || !opAccount || !isUserValid || !isPassValid) {
      return { status: 401, data: { success: false, isUnregistered: false, error: 'Invalid Centre ID, username, or password.' } };
    }

    const userId = opAccount.userId;
    const token = `tok_op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    dbSessions[token] = {
      token,
      userId,
      role: 'OPERATOR',
      centreId: centre.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    return {
      status: 200,
      data: {
        success: true,
        token,
        user: {
  id: userId,
  userId,
  name: centre.name ? `Operator (${centre.name})` : 'Procurement Centre Operator',
  mobile: '+91 98000 11111',
  role: 'OPERATOR',
  language: 'en',
  centreId: centre.id,
  centreName: centre.name,
  state: centre.state,
  district: centre.district,
  block: centre.block,
},
        role: 'OPERATOR',
        centreId: centre.id,
        centreName: centre.name,
        loginTime: new Date().toISOString(),
      },
    };
  }

  static registerOperator(body: any) {
    const { centreId, operatorName, mobile, username, password, newCentre } = body || {};

    if (!operatorName || !mobile || !username || !password) {
      return { status: 400, data: { success: false, error: 'Please fill in all required operator registration fields.' } };
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();
    let targetCentre: ProcurementCentre | undefined;

    if (newCentre && newCentre.name && newCentre.state && newCentre.district && newCentre.block) {
      const generatedId = `cnt_reg_${Date.now()}`;
      targetCentre = {
        id: generatedId,
        officialId: `${newCentre.stateCode || 'DEMO'}-${(newCentre.districtCode || 'DST').replace(/^WB_/, '')}-REG-01`,
        name: newCentre.name.trim(),
        state: newCentre.state,
        stateCode: newCentre.stateCode || 'DEMO',
        district: newCentre.district,
        districtCode: newCentre.districtCode || 'DEMO_DST',
        block: newCentre.block,
        subdistrictCode: `${newCentre.districtCode || 'DST'}_${newCentre.block.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
        village: newCentre.village || `${newCentre.block} Central Yard`,
        latitude: newCentre.latitude || 20.5937,
        longitude: newCentre.longitude || 78.9629,
        agency: newCentre.agency || 'State Procurement Division',
        supportedCrops: newCentre.supportedCrops || ['Wheat', 'Paddy', 'Gram (Chana)'],
        dailyCapacity: Number(newCentre.dailyCapacity) || 300,
        workingHours: newCentre.workingHours || '8:30 AM - 5:30 PM',
        counters: Number(newCentre.counters) || 3,
        activeCounters: Number(newCentre.activeCounters) || 2,
        status: 'OPEN',
        season: 'Rabi 2025-26',
        contactPhone: mobile,
        address: newCentre.address || `APMC Market Sthal, ${newCentre.block}, ${newCentre.district}, ${newCentre.state}`,
        imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=80',
        source: 'OFFICIAL_GOVT',
        isDemo: true,
        lastVerified: new Date().toISOString(),
        currentQueue: 0,
        processingCount: 0,
        completedToday: 0,
        availableSlots: 25,
        averageProcessingTime: 8,
        estimatedWaitingTime: '15 - 25 min',
        lastUpdated: 'Just now',
      };
      dbCentres.unshift(targetCentre);
    } else if (centreId) {
      const cleanCentreId = String(centreId).trim();
      targetCentre = dbCentres.find((c) => c.id === cleanCentreId || c.officialId === cleanCentreId);
    }

    if (!targetCentre) {
      return { status: 400, data: { success: false, error: 'Target procurement centre not found. Please select or create a centre.' } };
    }

    const userId = `usr_op_reg_${Date.now()}`;
    const newOpAccount: OperatorAccount = {
      userId,
      role: 'OPERATOR',
      username: cleanUsername,
      passwordHash: cleanPassword,
      centreId: targetCentre.id,
      centreName: targetCentre.name,
      stateName: targetCentre.state,
      districtName: targetCentre.district,
      subdistrictName: targetCentre.block,
      isDemo: true,
      isActive: true,
    };

    dbOperatorAccounts[targetCentre.id] = newOpAccount;

    const token = `tok_op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    dbSessions[token] = {
      token,
      userId,
      role: 'OPERATOR',
      centreId: targetCentre.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    return {
      status: 200,
      data: {
        success: true,
        token,
        user: {
  id: userId,
  userId,
  name: operatorName.trim(),
  mobile: `+91 ${normalizeMobileNumber(mobile)}`,
  role: 'OPERATOR',
  language: 'en',
  centreId: targetCentre.id,
  centreName: targetCentre.name,
  state: targetCentre.state,
  district: targetCentre.district,
  block: targetCentre.block,
},
        role: 'OPERATOR',
        centreId: targetCentre.id,
        centreName: targetCentre.name,
        loginTime: new Date().toISOString(),
      },
    };
  }

  static getOperatorMe(authHeader: string) {
    const token = (authHeader || '').replace('Bearer ', '').trim();
    const session = dbSessions[token];

    if (!session || session.role !== 'OPERATOR' || !session.centreId) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active operator session required.' } };
    }

    const opAccount = Object.values(dbOperatorAccounts).find((op) => op.centreId === session.centreId);
    const centre = dbCentres.find((c) => c.id === session.centreId || c.officialId === session.centreId) || {
      id: session.centreId,
      name: opAccount?.centreName || 'Procurement Centre',
      district: opAccount?.districtName || 'Patna',
      state: opAccount?.stateName || 'Bihar',
    };

    const user: User = {
      id: session.userId,
      name: `Operator (${centre.name})`,
      mobile: '+91 98000 11111',
      role: 'OPERATOR',
      language: 'en',
      centreId: session.centreId,
      district: centre.district,
      state: centre.state,
    };

    return {
      status: 200,
      data: {
        success: true,
        user,
        operator: opAccount || {
          userId: session.userId,
          role: 'OPERATOR',
          username: 'operator',
          centreId: session.centreId,
          centreName: centre.name,
          isDemo: true,
          isActive: true,
        },
        centre,
      },
    };
  }

  static registerAdmin(body: any) {
    const {
      stateCode,
      districtCode,
      fullName,
      designation,
      mobile,
      email,
      department,
      username,
      password,
    } = body || {};

    if (!stateCode || !districtCode || !fullName || !designation || !mobile || !department || !username || !password) {
      return { status: 400, data: { success: false, error: 'Please fill in all required District Admin registration fields.' } };
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();
    const normMobile = normalizeMobileNumber(mobile);

    const existingUsername = Object.values(dbAdminAccounts).find(
      (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (existingUsername) {
      return { status: 400, data: { success: false, error: 'An admin account with this username already exists. Please choose another username.' } };
    }

    let stateName = 'Bihar';
    let sCode = String(stateCode).toUpperCase();
    const stateObj = INDIA_STATES_UTS.find((s) => s.code.toUpperCase() === sCode || s.name.toLowerCase() === String(stateCode).toLowerCase());
    if (stateObj) {
      stateName = stateObj.name;
      sCode = stateObj.code;
    }

    let districtName = String(districtCode);
    let dCode = String(districtCode).toUpperCase();
    const districts = DISTRICTS_MASTER[stateName] || [];
    const distObj = districts.find(
      (d) => d.code.toUpperCase() === dCode || d.name.toLowerCase() === String(districtCode).toLowerCase()
    );
    if (distObj) {
      districtName = distObj.name;
      dCode = distObj.code;
    } else {
      districtName = String(districtCode);
      if (!dCode.includes('_')) {
        dCode = `${sCode}_${dCode.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase()}`;
      }
    }

    const cleanDCode = dCode.replace(/^[A-Z]{2}_/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
    const districtAdminsCount = Object.values(dbAdminAccounts).filter(
      (a) => a.districtCode.toLowerCase() === dCode.toLowerCase()
    ).length;

    const nextNumber = String(districtAdminsCount + 1).padStart(3, '0');
    const adminId = `ADM_${sCode}_${cleanDCode}_${nextNumber}`;
    const userId = `usr_admin_${Date.now()}`;

    const newAdmin: AdminAccount = {
      userId,
      adminId,
      role: 'ADMIN',
      username: cleanUsername,
      passwordHash: cleanPassword,
      fullName: fullName.trim(),
      designation: designation.trim(),
      mobile: `+91 ${normMobile}`,
      email: email ? String(email).trim() : undefined,
      department: department.trim(),
      stateCode: sCode,
      stateName,
      districtCode: dCode,
      districtName,
      isDemo: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    dbAdminAccounts[adminId] = newAdmin;
    dbAdminAccounts[cleanUsername] = newAdmin;

    const token = `tok_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    dbSessions[token] = {
      token,
      userId,
      role: 'ADMIN',
      adminId,
      stateCode: sCode,
      districtCode: dCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    const user: User = {
      id: userId,
      name: newAdmin.fullName,
      mobile: newAdmin.mobile,
      role: 'ADMIN',
      language: 'en',
      districtId: dCode,
      district: districtName,
      state: stateName,
    };

    return {
      status: 200,
      data: {
        success: true,
        token,
        role: 'ADMIN',
        user,
        admin: {
          adminId: newAdmin.adminId,
          fullName: newAdmin.fullName,
          designation: newAdmin.designation,
          department: newAdmin.department,
          stateCode: newAdmin.stateCode,
          stateName: newAdmin.stateName,
          districtCode: newAdmin.districtCode,
          districtName: newAdmin.districtName,
        },
        loginTime: new Date().toISOString(),
      },
    };
  }

  static loginAdmin(body: any) {
    const { adminId, password } = body || {};

    if (!adminId || !password) {
      return { status: 400, data: { success: false, error: 'Please enter Admin ID and Password.' } };
    }

    const cleanAdminId = String(adminId).trim();
    const cleanPassword = String(password).trim();

    let adminAcc = dbAdminAccounts[cleanAdminId];
    if (!adminAcc) {
      adminAcc = Object.values(dbAdminAccounts).find(
        (a) => a.adminId.toLowerCase() === cleanAdminId.toLowerCase() || a.username.toLowerCase() === cleanAdminId.toLowerCase()
      );
    }

    if (!adminAcc && (cleanAdminId === 'DEMO-ADMIN-001' || cleanAdminId.toLowerCase() === 'admin')) {
      adminAcc = DEFAULT_SEED_ADMIN;
    }

    if (!adminAcc) {
      return {
        status: 404,
        data: {
          success: false,
          isUnregistered: true,
          error: 'This Admin account is not registered with AnnSetu. Please register first to continue.',
        },
      };
    }

    const isPassValid = adminAcc.passwordHash ? cleanPassword === adminAcc.passwordHash : cleanPassword === 'demo123';
    if (!isPassValid) {
      return { status: 401, data: { success: false, isUnregistered: false, error: 'Invalid Admin ID or password.' } };
    }

    const token = `tok_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    dbSessions[token] = {
      token,
      userId: adminAcc.userId,
      role: 'ADMIN',
      adminId: adminAcc.adminId,
      stateCode: adminAcc.stateCode,
      districtCode: adminAcc.districtCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    const user: User = {
      id: adminAcc.userId,
      name: adminAcc.fullName,
      mobile: adminAcc.mobile,
      role: 'ADMIN',
      language: 'en',
      districtId: adminAcc.districtCode,
      district: adminAcc.districtName,
      state: adminAcc.stateName,
      adminId: adminAcc.adminId,
      adminName: adminAcc.fullName,
      stateCode: adminAcc.stateCode,
      stateName: adminAcc.stateName,
      districtCode: adminAcc.districtCode,
      districtName: adminAcc.districtName,
    };

    return {
      status: 200,
      data: {
        success: true,
        token,
        user,
        role: 'ADMIN',
        admin: {
          adminId: adminAcc.adminId,
          fullName: adminAcc.fullName,
          designation: adminAcc.designation,
          department: adminAcc.department,
          stateCode: adminAcc.stateCode,
          stateName: adminAcc.stateName,
          districtCode: adminAcc.districtCode,
          districtName: adminAcc.districtName,
        },
        districtCode: adminAcc.districtCode,
        loginTime: new Date().toISOString(),
      },
    };
  }

  static getAdminMe(req: Request) {
    const adminCtx = getAdminSession(req);
    if (!adminCtx) {
      return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
    }

    const { admin: adminAcc } = adminCtx;
    const user: User = {
      id: adminAcc.userId,
      name: adminAcc.fullName,
      mobile: adminAcc.mobile,
      role: 'ADMIN',
      language: 'en',
      districtId: adminAcc.districtCode,
      district: adminAcc.districtName,
      state: adminAcc.stateName,
      adminId: adminAcc.adminId,
      adminName: adminAcc.fullName,
      stateCode: adminAcc.stateCode,
      stateName: adminAcc.stateName,
      districtCode: adminAcc.districtCode,
      districtName: adminAcc.districtName,
    };

    return {
      status: 200,
      data: {
        success: true,
        user,
        role: 'ADMIN',
        adminId: adminAcc.adminId,
        name: adminAcc.fullName,
        stateCode: adminAcc.stateCode,
        stateName: adminAcc.stateName,
        districtCode: adminAcc.districtCode,
        districtName: adminAcc.districtName,
        admin: adminAcc,
      },
    };
  }

  static loginGeneral(body: any) {
    const { role, mobile, username, password, centreId, farmerId, adminId } = body || {};

    let user: User = {
      id: 'usr_farmer_01',
      name: 'Ram Das',
      mobile: '+91 98765 43210',
      role: 'FARMER',
      language: 'en',
    };
    let farmerProfile: FarmerProfile | null = null;
    const token = `tok_${(role || 'FARMER').toLowerCase()}_${Date.now()}`;

    if (role === 'OPERATOR') {
      user = {
        id: 'usr_op_01',
        name: 'Sinnar Operator',
        mobile: '+91 98000 11111',
        role: 'OPERATOR',
        language: 'en',
        centreId: centreId || 'cnt_sinnar',
      };
      dbSessions[token] = { token, userId: user.id, role: 'OPERATOR', centreId: user.centreId, createdAt: Date.now(), expiresAt: Date.now() + 86400000 };
    } else if (role === 'ADMIN') {
      let adminAcc = (adminId ? dbAdminAccounts[adminId] : null) || Object.values(dbAdminAccounts).find(a => a.username.toLowerCase() === String(username || '').toLowerCase());
      if (!adminAcc) adminAcc = DEFAULT_SEED_ADMIN;
      user = {
        id: adminAcc.userId,
        name: adminAcc.fullName,
        mobile: adminAcc.mobile,
        role: 'ADMIN',
        language: 'en',
        districtId: adminAcc.districtCode,
        district: adminAcc.districtName,
        state: adminAcc.stateName,
        adminId: adminAcc.adminId,
        adminName: adminAcc.fullName,
        stateCode: adminAcc.stateCode,
        stateName: adminAcc.stateName,
        districtCode: adminAcc.districtCode,
        districtName: adminAcc.districtName,
      };
      dbSessions[token] = {
        token,
        userId: user.id,
        role: 'ADMIN',
        adminId: adminAcc.adminId,
        stateCode: adminAcc.stateCode,
        districtCode: adminAcc.districtCode,
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      };
    } else {
      const norm = normalizeMobileNumber(mobile);
      const existingKey = farmerId || Object.keys(dbFarmerProfiles).find((k) => normalizeMobileNumber(dbFarmerProfiles[k].mobile) === norm) || 'usr_farmer_01';
      farmerProfile = dbFarmerProfiles[existingKey] || dbFarmerProfiles['usr_farmer_01'];
      user = {
        id: farmerProfile?.userId || existingKey,
        name: farmerProfile?.name || 'Ram Das',
        mobile: farmerProfile?.mobile || mobile || '+91 98765 43210',
        role: 'FARMER',
        language: farmerProfile?.preferredLanguage || 'en',
        district: farmerProfile?.district,
        state: farmerProfile?.state,
      };
      dbSessions[token] = { token, userId: user.id, role: 'FARMER', mobile: norm, createdAt: Date.now(), expiresAt: Date.now() + 86400000 };
    }

    return {
      status: 200,
      data: {
        success: true,
        token,
        user,
        farmerProfile,
        role: role || 'FARMER',
        loginTime: new Date().toISOString(),
      },
    };
  }

  static getAuthMe(req: Request) {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);

    if (!authHeader) {
      return { status: 401, data: { success: false, error: 'Unauthenticated. No token header found.' } };
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const session = dbSessions[token];

    if (!session) {
      return { status: 401, data: { success: false, error: 'Invalid or expired session token. Please log in again.' } };
    }

    if (Date.now() > session.expiresAt) {
      delete dbSessions[token];
      return { status: 401, data: { success: false, error: 'Session expired. Please log in again.' } };
    }

    if (session.role === 'OPERATOR') {
      const centre = dbCentres.find((c) => c.id === session.centreId);
      const user: User = {
        id: session.userId,
        name: `Operator (${centre ? centre.name : 'Procurement Centre'})`,
        mobile: '+91 98000 11111',
        role: 'OPERATOR',
        language: 'en',
        centreId: session.centreId || 'cnt_sinnar',
      };
      return { status: 200, data: { success: true, user, role: 'OPERATOR', centreId: session.centreId } };
    }

    if (session.role === 'ADMIN') {
      const adminCtx = getAdminSession(req);
      if (!adminCtx) {
        return { status: 401, data: { success: false, error: 'Unauthorized. Active District Admin session required.' } };
      }
      const { admin: adminAcc } = adminCtx;
      const user: User = {
        id: adminAcc.userId,
        name: adminAcc.fullName,
        mobile: adminAcc.mobile,
        role: 'ADMIN',
        language: 'en',
        districtId: adminAcc.districtCode,
        district: adminAcc.districtName,
        state: adminAcc.stateName,
      };
      return { status: 200, data: { success: true, user, role: 'ADMIN', districtCode: adminAcc.districtCode, admin: adminAcc } };
    }

    const profile = dbFarmerProfiles[session.userId] || Object.values(dbFarmerProfiles).find(p => normalizeMobileNumber(p.mobile) === session.mobile);
    const user: User = {
      id: profile?.id || profile?.userId || session.userId,
      name: profile?.name || 'Farmer',
      mobile: profile?.mobile || session.mobile || '',
      role: 'FARMER',
      language: profile?.preferredLanguage || 'en',
      district: profile?.district,
      state: profile?.state,
    };

    return {
      status: 200,
      data: {
        success: true,
        user,
        farmerProfile: profile,
        role: 'FARMER',
        profileCompleted: Boolean(profile?.profileCompleted),
      },
    };
  }

  static logout(authHeader: string) {
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      delete dbSessions[token];
    }
    return { status: 200, data: { success: true, message: 'Logged out successfully.' } };
  }
}
