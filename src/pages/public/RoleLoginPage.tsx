import React, { useState, useEffect, useMemo } from 'react';
import {
  Tractor,
  Building2,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Phone,
  Lock,
  User as UserIcon,
  Globe,
  KeyRound,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  X,
  MapPin,
  Eye,
  EyeOff,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api/apiService';
import { Language, UserRole } from '../../types';
import { ResetDemoButton } from '../../components/common/ResetDemoButton';
import {
  INDIA_STATES,
  INDIA_UNION_TERRITORIES,
  getDistrictsForState,
  getBlocksForDistrict,
  DISTRICTS_MASTER,
} from '../../services/location/locationService';


interface RoleLoginPageProps {
  role: UserRole;
  onNavigate: (path: string) => void;
  onChangeRole: () => void;
}

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({
  role,
  onNavigate,
  onChangeRole,
}) => {
  const {
    sendFarmerOtp,
    verifyFarmerOtp,
    registerFarmer,
    loginOperator,
    registerOperator,
    loginAdmin,
    registerDistrictAdmin,
    login,
    language,
    setLanguage,
    t,
  } = useApp();

  // Farmer form state
  const [mobile, setMobile] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(30);

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regMobile, setRegMobile] = useState<string>('');
  const [regState, setRegState] = useState<string>('');
  const [regDistrict, setRegDistrict] = useState<string>('');
  const [regBlock, setRegBlock] = useState<string>('');
  const [regVillage, setRegVillage] = useState<string>('');
  const [regPinCode, setRegPinCode] = useState<string>('');

  // Derived location dropdowns for registration
  const allStatesAndUts = useMemo(() => [...INDIA_STATES, ...INDIA_UNION_TERRITORIES], []);
  const regDistrictsList = useMemo(
    () => (regState ? getDistrictsForState(regState).filter((d) => d !== 'All Districts') : []),
    [regState]
  );
  const regBlocksList = useMemo(
    () => (regState && regDistrict ? getBlocksForDistrict(regState, regDistrict).filter((b) => b !== 'All Blocks') : []),
    [regState, regDistrict]
  );

  const handleRegStateChange = (newState: string) => {
    setRegState(newState);
    setRegDistrict('');
    setRegBlock('');
  };

  const handleRegDistrictChange = (newDistrict: string) => {
    setRegDistrict(newDistrict);
    setRegBlock('');
  };


  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [unregisteredModalRole, setUnregisteredModalRole] = useState<UserRole | null>(null);

  // Operator form state (Starts EMPTY for production style)
  const [centreId, setCentreId] = useState<string>('');
  const [opUsername, setOpUsername] = useState<string>('');
  const [opPassword, setOpPassword] = useState<string>('');
  const [showOpPassword, setShowOpPassword] = useState<boolean>(false);

  // Admin form state (Starts EMPTY for production style)
  const [adminId, setAdminId] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);

  // Operator Registration Wizard Modal State
  const [showOpRegModal, setShowOpRegModal] = useState<boolean>(false);
  const [opRegStep, setOpRegStep] = useState<number>(1);
  const [opRegState, setOpRegState] = useState<string>('Bihar');
  const [opRegDistrict, setOpRegDistrict] = useState<string>('Patna');
  const [opRegBlock, setOpRegBlock] = useState<string>('Fatwah');
  const [opRegCentreMode, setOpRegCentreMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [opRegSelectedCentreId, setOpRegSelectedCentreId] = useState<string>('BR_PTN_FATWAH_DEMO_01');
  const [opRegNewCentreName, setOpRegNewCentreName] = useState<string>('');
  const [opRegNewCentreAgency, setOpRegNewCentreAgency] = useState<string>('BSFC / NAFED Joint Division');
  const [opRegNewCentreAddress, setOpRegNewCentreAddress] = useState<string>('');
  const [opRegNewCentreCrops, setOpRegNewCentreCrops] = useState<string[]>(['Wheat', 'Paddy', 'Gram (Chana)']);
  const [opRegNewCentreCapacity, setOpRegNewCentreCapacity] = useState<number>(300);
  const [opRegNewCentreCounters, setOpRegNewCentreCounters] = useState<number>(3);
  const [opRegName, setOpRegName] = useState<string>('');
  const [opRegMobile, setOpRegMobile] = useState<string>('');
  const [opRegUsername, setOpRegUsername] = useState<string>('');
  const [opRegPassword, setOpRegPassword] = useState<string>('');
  const [opRegConfirmPassword, setOpRegConfirmPassword] = useState<string>('');
  const [opRegError, setOpRegError] = useState<string>('');
  const [opRegIsSubmitting, setOpRegIsSubmitting] = useState<boolean>(false);

  // District Admin Registration Wizard Modal State
  const [showAdminRegModal, setShowAdminRegModal] = useState<boolean>(false);
  const [adminRegStep, setAdminRegStep] = useState<number>(1);
  const [adminRegState, setAdminRegState] = useState<string>('Bihar');
  const [adminRegDistrict, setAdminRegDistrict] = useState<string>('Patna');
  const [adminRegFullName, setAdminRegFullName] = useState<string>('');
  const [adminRegDesignation, setAdminRegDesignation] = useState<string>('District Procurement Officer');
  const [adminRegDepartment, setAdminRegDepartment] = useState<string>('Department of Food & Public Distribution');
  const [adminRegMobile, setAdminRegMobile] = useState<string>('');
  const [adminRegEmail, setAdminRegEmail] = useState<string>('');
  const [adminRegUsername, setAdminRegUsername] = useState<string>('');
  const [adminRegPassword, setAdminRegPassword] = useState<string>('');
  const [adminRegConfirmPassword, setAdminRegConfirmPassword] = useState<string>('');
  const [adminRegError, setAdminRegError] = useState<string>('');
  const [adminRegIsSubmitting, setAdminRegIsSubmitting] = useState<boolean>(false);

  const { centres: globalCentres } = useApp();

  const opRegDistrictsList = useMemo(
    () => (opRegState ? getDistrictsForState(opRegState).filter((d) => d !== 'All Districts') : []),
    [opRegState]
  );
  const adminRegDistrictsList = useMemo(
    () => (adminRegState ? getDistrictsForState(adminRegState).filter((d) => d !== 'All Districts') : []),
    [adminRegState]
  );
  const opRegBlocksList = useMemo(
    () => (opRegState && opRegDistrict ? getBlocksForDistrict(opRegState, opRegDistrict).filter((b) => b !== 'All Blocks') : []),
    [opRegState, opRegDistrict]
  );
  const opRegCentresList = useMemo(() => {
    if (!opRegState || !opRegDistrict || !opRegBlock) return [];
    return globalCentres.filter(
      (c) =>
        c.state.toLowerCase() === opRegState.toLowerCase() &&
        c.district.toLowerCase() === opRegDistrict.toLowerCase() &&
        c.block.toLowerCase() === opRegBlock.toLowerCase()
    );
  }, [globalCentres, opRegState, opRegDistrict, opRegBlock]);

  const handleOpRegStateChange = (newState: string) => {
    setOpRegState(newState);
    setOpRegDistrict('');
    setOpRegBlock('');
    setOpRegSelectedCentreId('');
  };

  const handleOpRegDistrictChange = (newDistrict: string) => {
    setOpRegDistrict(newDistrict);
    setOpRegBlock('');
    setOpRegSelectedCentreId('');
  };

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Active Demo Scenario on Mount
  useEffect(() => {
    apiService.getDemoScenario().then((res) => {
      if (res && res.success && res.scenario) {
        setRegState(res.scenario.stateName);
        setRegDistrict(res.scenario.districtName);
        setOpRegState(res.scenario.stateName);
        setOpRegDistrict(res.scenario.districtName);
        setAdminRegState(res.scenario.stateName);
        setAdminRegDistrict(res.scenario.districtName);
      }
    }).catch(() => {});
  }, []);

  // OTP Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, resendTimer]);

  const handleFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!otpSent) {
      setIsSubmitting(true);
      const result = await sendFarmerOtp(cleanMobile);
      setIsSubmitting(false);

      if (result.success) {
        setOtpSent(true);
        setResendTimer(30);
        setInfoMsg(result.message || `OTP sent to +91 ${cleanMobile}`);
      } else {
        if (result.isUnregistered) {
          setUnregisteredModalRole('FARMER');
        } else {
          setErrorMsg(result.error || 'Failed to send OTP.');
        }
      }
      return;
    }

    if (!otp || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyFarmerOtp(cleanMobile, otp.trim());
    setIsSubmitting(false);

    if (result.success) {
      if (result.isNewFarmer) {
        setRegMobile(cleanMobile);
        setShowRegModal(true);
        setErrorMsg('');
        setInfoMsg('Mobile number verified! Please complete your registration details.');
      } else if (result.profileCompleted === false) {
        onNavigate('/farmer/onboarding');
      } else {
        onNavigate('/farmer/dashboard');
      }
    } else {
      setErrorMsg(result.error || 'OTP verification failed.');
    }
  };

  const handleFarmerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanMobile = regMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!regState || !regDistrict || !regBlock || !regVillage.trim()) {
      setErrorMsg('Please select your State, District, Block, and enter Village name.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerFarmer({
      mobile: cleanMobile,
      name: regName.trim(),
      stateName: regState,
      districtName: regDistrict,
      subdistrictName: regBlock,
      village: regVillage.trim(),
      pinCode: regPinCode.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      setShowRegModal(false);
      setMobile(cleanMobile);
      setOtpSent(false);
      setOtp('');
      setInfoMsg(result.message || 'Registration successful. Please log in with your registered mobile number.');
    } else {
      setErrorMsg(result.error || 'Registration failed.');
    }
  };

  const handleOperatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!centreId.trim()) {
      setErrorMsg('Please enter Centre ID.');
      return;
    }

    if (!opUsername.trim() || !opPassword.trim()) {
      setErrorMsg('Please enter Username and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginOperator({
      centreId: centreId.trim(),
      username: opUsername.trim(),
      password: opPassword.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      onNavigate('/operator/dashboard');
    } else {
      if (result.isUnregistered) {
        setUnregisteredModalRole('OPERATOR');
      } else {
        setErrorMsg(result.error || 'Operator login failed.');
      }
    }
  };

  const handleOperatorRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpRegError('');

    if (!opRegName.trim() || !opRegMobile.trim() || !opRegUsername.trim() || !opRegPassword.trim()) {
      setOpRegError('Please complete all operator credential fields.');
      return;
    }

    if (opRegPassword !== opRegConfirmPassword) {
      setOpRegError('Passwords do not match. Please verify your password.');
      return;
    }

    if (opRegCentreMode === 'SELECT' && !opRegSelectedCentreId) {
      setOpRegError('Please select a procurement centre.');
      return;
    }

    if (opRegCentreMode === 'CREATE' && !opRegNewCentreName.trim()) {
      setOpRegError('Please enter the name of the new procurement centre.');
      return;
    }

    setOpRegIsSubmitting(true);
    const regPayload: any = {
      operatorName: opRegName.trim(),
      mobile: opRegMobile.trim(),
      username: opRegUsername.trim(),
      password: opRegPassword.trim(),
    };

    if (opRegCentreMode === 'SELECT') {
      regPayload.centreId = opRegSelectedCentreId;
    } else {
      regPayload.newCentre = {
        name: opRegNewCentreName.trim(),
        state: opRegState,
        district: opRegDistrict,
        block: opRegBlock,
        agency: opRegNewCentreAgency.trim(),
        address: opRegNewCentreAddress.trim(),
        supportedCrops: opRegNewCentreCrops,
        dailyCapacity: opRegNewCentreCapacity,
        counters: opRegNewCentreCounters,
      };
    }

    const res = await registerOperator(regPayload);
    setOpRegIsSubmitting(false);

    if (res.success) {
      setShowOpRegModal(false);
      setCentreId(opRegSelectedCentreId || '');
      setOpUsername(opRegUsername.trim());
      setInfoMsg(res.message || 'Registration successful. Please log in with your new credentials.');
    } else {
      setOpRegError(res.error || 'Operator registration failed.');
    }
  };

  const handleAdminRegStateChange = (newState: string) => {
    setAdminRegState(newState);
    const dists = getDistrictsForState(newState).filter((d) => d !== 'All Districts');
    if (dists.length > 0) {
      setAdminRegDistrict(dists[0]);
    } else {
      setAdminRegDistrict('');
    }
  };

  const previewAdminId = useMemo(() => {
    const stateObj = allStatesAndUts.find((s) => s.name === adminRegState);
    const sCode = stateObj ? stateObj.code.toUpperCase() : 'BR';
    const distList = DISTRICTS_MASTER[adminRegState] || [];
    const distObj = distList.find((d) => d.name === adminRegDistrict);
    const rawDCode = distObj ? distObj.code : (adminRegDistrict ? adminRegDistrict.toUpperCase() : 'PAT');
    const cleanDCode = rawDCode.replace(/^[A-Z]{2}_/, '').replace(/[^A-Z0-9]/g, '').slice(0, 4);
    return `ADM_${sCode}_${cleanDCode}_001`;
  }, [allStatesAndUts, adminRegState, adminRegDistrict]);

  const handleAdminRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminRegError('');

    if (!adminRegFullName.trim() || !adminRegDesignation.trim() || !adminRegMobile.trim() || !adminRegDepartment.trim() || !adminRegUsername.trim() || !adminRegPassword.trim()) {
      setAdminRegError('Please complete all required fields.');
      return;
    }

    if (adminRegPassword !== adminRegConfirmPassword) {
      setAdminRegError('Passwords do not match. Please verify your password.');
      return;
    }

    const stateObj = allStatesAndUts.find((s) => s.name === adminRegState);
    const sCode = stateObj ? stateObj.code : 'BR';
    const cleanDCode = adminRegDistrict.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const dCode = `${sCode}_${cleanDCode}`;

    setAdminRegIsSubmitting(true);
    const res = await registerDistrictAdmin({
      stateCode: sCode,
      districtCode: dCode,
      fullName: adminRegFullName.trim(),
      designation: adminRegDesignation.trim(),
      mobile: adminRegMobile.trim(),
      email: adminRegEmail.trim() || undefined,
      department: adminRegDepartment.trim(),
      username: adminRegUsername.trim(),
      password: adminRegPassword.trim(),
    });
    setAdminRegIsSubmitting(false);

    if (res.success) {
      setShowAdminRegModal(false);
      if (res.adminId) {
        setAdminId(res.adminId);
      }
      setInfoMsg(
        res.adminId
          ? `Registration successful! Admin ID created: ${res.adminId}. Please log in with your Admin ID and password.`
          : 'Registration successful. Please log in with your new Admin ID and password.'
      );
    } else {
      setAdminRegError(res.error || 'District Admin registration failed.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminId.trim() || !adminPassword.trim()) {
      setErrorMsg('Please enter Admin ID and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginAdmin({
      adminId: adminId.trim(),
      password: adminPassword.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      onNavigate('/admin/dashboard');
    } else {
      if (result.isUnregistered) {
        setUnregisteredModalRole('ADMIN');
      } else {
        setErrorMsg(result.error || 'District Admin login failed.');
      }
    }
  };


  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#f9faf6] text-[#1a1c1a] flex flex-col justify-between select-none font-sans p-3 sm:p-5 md:p-6">
      {/* Top Navigation Bar */}
      <header className="h-[60px] shrink-0 flex items-center justify-between border-b border-[#c1c8c2]/40 pb-2">
        <button
          onClick={onChangeRole}
          className="flex items-center gap-2 text-xs font-black text-[#012d1d] hover:text-[#2c694e] bg-white px-3.5 py-2 rounded-xl border border-[#c1c8c2]/60 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>

        <div className="flex items-center gap-3">
          <ResetDemoButton />

          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#2c694e] shrink-0" />
            <div className="flex items-center bg-[#f3f4f1] p-1 rounded-xl border border-[#c1c8c2]/60 text-xs font-bold">
              {(['en', 'hi', 'mr', 'bn', 'te'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-white text-[#012d1d] shadow-2xs font-extrabold'
                      : 'text-[#717973] hover:text-[#012d1d]'
                  }`}
                >
                  {lang === 'en'
                    ? 'English'
                    : lang === 'hi'
                    ? 'हिन्दी'
                    : lang === 'mr'
                    ? 'मराठी'
                    : lang === 'bn'
                    ? 'বাংলা'
                    : 'తెలుగు'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Card Canvas (Zero Scroll Viewport Height) */}
      <main className="max-w-md w-full mx-auto my-auto px-4 py-2 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 md:p-7 shadow-xl space-y-5">
          {/* Header Badge & Title */}
          <div className="text-center space-y-1.5">
            <div
              className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-bold text-white shadow-md ${
                role === 'FARMER'
                  ? 'bg-[#012d1d]'
                  : role === 'OPERATOR'
                  ? 'bg-[#1b4332]'
                  : 'bg-[#b78103]'
              }`}
            >
              {role === 'FARMER' ? (
                <Tractor className="w-6 h-6 text-[#aeeecb]" />
              ) : role === 'OPERATOR' ? (
                <Building2 className="w-6 h-6 text-[#aeeecb]" />
              ) : (
                <Landmark className="w-6 h-6 text-amber-200" />
              )}
            </div>

            <h1 className="text-2xl font-black text-[#012d1d] tracking-tight">
              {role === 'FARMER' ? '👨🌾 Farmer Login' : role === 'OPERATOR' ? '🏢 Procurement Centre Login' : '🏛️ District Admin Login'}
            </h1>

            <p className="text-xs text-[#717973] font-medium max-w-xs mx-auto">
              {role === 'FARMER'
                ? 'Welcome back. Enter your mobile number to continue.'
                : role === 'OPERATOR'
                ? 'Sign in to manage your procurement centre.'
                : 'Sign in to monitor procurement across your district.'}
            </p>
          </div>

          {infoMsg && (
            <div className="p-3.5 bg-[#c1ecd4] text-[#002114] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#1b4332]" />
              <span>{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role 1: Farmer OTP Form */}
          {role === 'FARMER' && (
            <form onSubmit={handleFarmerLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#414844] block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717973]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-[#f3f4f1] pl-12 pr-4 py-3 rounded-2xl text-sm font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[48px] bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Sending OTP...' : 'Send OTP'}</span>
                  <ArrowRight className="w-4 h-4 text-[#aeeecb]" />
                </button>
              ) : (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#414844]">
                        Verify Mobile Number (OTP)
                      </label>
                      <span className="text-[10px] text-[#717973] font-medium">
                        Sent to +91 {mobile}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="_ _ _ _ _ _"
                      className="w-full bg-[#f3f4f1] px-4 py-3 rounded-2xl text-center text-lg font-mono font-black tracking-widest text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                    />
                  </div>


                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[48px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Verifying OTP...' : 'Verify & Continue'}</span>
                    <ArrowRight className="w-4 h-4 text-[#aeeecb]" />
                  </button>

                  <div className="text-center pt-1">
                    {resendTimer > 0 ? (
                      <span className="text-[11px] text-[#717973] font-bold">
                        Resend OTP in {resendTimer} seconds
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setErrorMsg('');
                          setInfoMsg('');
                          const res = await sendFarmerOtp(mobile);
                          if (res.success) {
                            setResendTimer(30);
                            setInfoMsg('New OTP sent successfully.');
                          } else {
                            setErrorMsg(res.error || 'Failed to resend OTP.');
                          }
                        }}
                        className="text-[11px] font-black text-[#2c694e] hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Role 2: Procurement Centre Login Form */}
          {role === 'OPERATOR' && (
            <form onSubmit={handleOperatorLogin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#414844] block mb-1">Centre ID</label>
                <input
                  type="text"
                  value={centreId}
                  onChange={(e) => setCentreId(e.target.value)}
                  placeholder="Enter Centre ID (e.g. cnt_sinnar)"
                  className="w-full bg-[#f3f4f1] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#414844] block mb-1">Username</label>
                <input
                  type="text"
                  value={opUsername}
                  onChange={(e) => setOpUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="w-full bg-[#f3f4f1] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#414844] block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showOpPassword ? 'text' : 'password'}
                    value={opPassword}
                    onChange={(e) => setOpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f3f4f1] px-4 py-2.5 pr-10 rounded-2xl text-xs font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpPassword(!showOpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#012d1d] cursor-pointer"
                  >
                    {showOpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4 text-[#aeeecb]" />
              </button>
            </form>
          )}

          {/* Role 3: District Admin Login Form */}
          {role === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#414844] block mb-1">Admin ID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full bg-[#f3f4f1] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#414844] block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f3f4f1] px-4 py-2.5 pr-10 rounded-2xl text-xs font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 focus:border-[#012d1d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#012d1d] cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] bg-[#b78103] hover:bg-[#8f6402] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </button>
            </form>
          )}


          {/* Sub-Actions & Farmer Registration Link */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#717973] border-t border-[#eeeeeb]">
            {role === 'FARMER' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setShowRegModal(true);
                  }}
                  className="font-bold text-[#2c694e] hover:underline cursor-pointer"
                >
                  New farmer? Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowSupportModal(true)}
                  className="hover:underline cursor-pointer"
                >
                  Need Help?
                </button>
              </>
            ) : role === 'OPERATOR' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpRegError('');
                    setOpRegStep(1);
                    setShowOpRegModal(true);
                  }}
                  className="font-bold text-[#2c694e] hover:underline cursor-pointer"
                >
                  First Time? Register Centre / Create Account
                </button>
                <button type="button" onClick={() => setShowSupportModal(true)} className="hover:underline cursor-pointer">
                  Support
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAdminRegError('');
                    setAdminRegStep(1);
                    setShowAdminRegModal(true);
                  }}
                  className="font-bold text-[#b78103] hover:underline cursor-pointer"
                >
                  First Time? Register Admin Account
                </button>
                <button type="button" onClick={() => setShowSupportModal(true)} className="hover:underline cursor-pointer">
                  Support
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-[36px] shrink-0 pt-2 border-t border-[#c1c8c2]/40 flex items-center justify-between text-[10px] sm:text-xs text-[#717973]">
        <span>AnnSetu Smart Procurement Scheduling</span>
        <span>Helpline: 1800-180-1551</span>
      </footer>

      {/* Farmer Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative border border-[#c1c8c2]/60">
            <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
              <h3 className="font-black text-base text-[#012d1d]">
                👨🌾 Create Farmer Account
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFarmerRegistration} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#414844] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#414844] block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                />
              </div>

              {/* Cascading Administrative Location Selector */}
              <div>
                <label className="font-bold text-[#414844] block mb-1">State / Union Territory</label>
                <select
                  required
                  value={regState}
                  onChange={(e) => handleRegStateChange(e.target.value)}
                  className="w-full bg-[#f3f4f1] px-3 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none cursor-pointer"
                >
                  <option value="">-- Select State / UT --</option>
                  {allStatesAndUts.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#414844] block mb-1">District</label>
                  <select
                    required
                    disabled={!regState}
                    value={regDistrict}
                    onChange={(e) => handleRegDistrictChange(e.target.value)}
                    className="w-full bg-[#f3f4f1] px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Select District --</option>
                    {regDistrictsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#414844] block mb-1">Block / Tehsil</label>
                  <select
                    required
                    disabled={!regDistrict}
                    value={regBlock}
                    onChange={(e) => setRegBlock(e.target.value)}
                    className="w-full bg-[#f3f4f1] px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Select Block --</option>
                    {regBlocksList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-bold text-[#414844] block mb-1">Village / Gram</label>
                  <input
                    type="text"
                    required
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    placeholder="Enter village"
                    className="w-full bg-[#f3f4f1] px-3.5 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#414844] block mb-1">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={regPinCode}
                    onChange={(e) => setRegPinCode(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full bg-[#f3f4f1] px-2.5 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs rounded-xl shadow-md cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering Account...' : 'Register & Continue →'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Operator Registration Wizard Modal */}
      {showOpRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative border border-[#c1c8c2]/60 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
              <div>
                <h3 className="font-black text-base text-[#012d1d]">🏢 Register Centre & Operator Account</h3>
                <p className="text-[11px] text-[#717973] font-medium">Step {opRegStep} of 4 — Complete your centre setup</p>
              </div>
              <button onClick={() => setShowOpRegModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-extrabold text-center">
              <div className={`py-1.5 rounded-lg border ${opRegStep >= 1 ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                1. Centre
              </div>
              <div className={`py-1.5 rounded-lg border ${opRegStep >= 2 ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                2. Details
              </div>
              <div className={`py-1.5 rounded-lg border ${opRegStep >= 3 ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                3. Credentials
              </div>
              <div className={`py-1.5 rounded-lg border ${opRegStep >= 4 ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                4. Approval
              </div>
            </div>

            {opRegError && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{opRegError}</span>
              </div>
            )}

            <form onSubmit={handleOperatorRegistrationSubmit} className="space-y-4 text-xs">
              {/* STEP 1: Select Location & Procurement Centre */}
              {opRegStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#414844] block mb-1">State / Union Territory</label>
                    <select
                      value={opRegState}
                      onChange={(e) => handleOpRegStateChange(e.target.value)}
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    >
                      {allStatesAndUts.map((s) => (
                        <option key={s.code} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[#414844] block mb-1">District</label>
                      <select
                        value={opRegDistrict}
                        onChange={(e) => handleOpRegDistrictChange(e.target.value)}
                        className="w-full bg-[#f3f4f1] px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      >
                        {opRegDistrictsList.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Block / Tehsil</label>
                      <select
                        value={opRegBlock}
                        onChange={(e) => setOpRegBlock(e.target.value)}
                        className="w-full bg-[#f3f4f1] px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      >
                        {opRegBlocksList.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Select Procurement Centre Option</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {opRegCentresList.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setOpRegCentreMode('SELECT');
                            setOpRegSelectedCentreId(c.id);
                          }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            opRegCentreMode === 'SELECT' && opRegSelectedCentreId === c.id
                              ? 'border-[#1b4332] bg-[#f3f9f5] font-black'
                              : 'border-[#c1c8c2]/60 hover:border-[#1b4332]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#012d1d]">{c.name}</span>
                            <span className="text-[10px] bg-[#c1ecd4] text-[#002114] px-1.5 py-0.5 rounded font-mono font-bold">{c.id}</span>
                          </div>
                          <p className="text-[10px] text-[#717973] mt-0.5">{c.agency} • {c.address}</p>
                        </div>
                      ))}

                      <div
                        onClick={() => setOpRegCentreMode('CREATE')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2 ${
                          opRegCentreMode === 'CREATE'
                            ? 'border-[#1b4332] bg-[#f3f9f5] font-black'
                            : 'border-[#c1c8c2]/60 hover:border-[#1b4332]'
                        }`}
                      >
                        <PlusCircle className="w-4 h-4 text-[#2c694e]" />
                        <div>
                          <p className="font-bold text-[#012d1d]">+ Register New Custom Procurement Centre</p>
                          <p className="text-[10px] text-[#717973]">Add a new procurement yard for {opRegBlock}, {opRegDistrict}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (opRegCentreMode === 'SELECT' && !opRegSelectedCentreId) {
                        setOpRegError('Please select a procurement centre.');
                        return;
                      }
                      setOpRegError('');
                      setOpRegStep(2);
                    }}
                    className="w-full h-[44px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
                  >
                    Next: Confirm Centre Details →
                  </button>
                </div>
              )}

              {/* STEP 2: Centre Details View / Entry */}
              {opRegStep === 2 && (
                <div className="space-y-3">
                  {opRegCentreMode === 'SELECT' ? (
                    (() => {
                      const selectedCentre = opRegCentresList.find((c) => c.id === opRegSelectedCentreId) || opRegCentresList[0];
                      return (
                        <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#2c694e] uppercase">Selected Centre Master Record</span>
                            <span className="text-[10px] bg-[#c1ecd4] text-[#002114] font-mono font-bold px-2 py-0.5 rounded">{selectedCentre?.id || opRegSelectedCentreId}</span>
                          </div>
                          <h4 className="font-black text-sm text-[#012d1d]">{selectedCentre?.name || 'AnnSetu Demo Centre'}</h4>
                          <p className="text-xs text-[#414844]">{selectedCentre?.address}</p>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#eeeeeb] text-[11px]">
                            <div><span className="font-bold">Agency:</span> {selectedCentre?.agency}</div>
                            <div><span className="font-bold">Hours:</span> {selectedCentre?.workingHours || '8:30 AM - 5:30 PM'}</div>
                            <div><span className="font-bold">Capacity:</span> {selectedCentre?.dailyCapacity || 300} Qtl/Day</div>
                            <div><span className="font-bold">Counters:</span> {selectedCentre?.counters || 3} Active Counters</div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="font-bold text-[#414844] block mb-1">New Centre Name</label>
                        <input
                          type="text"
                          required
                          value={opRegNewCentreName}
                          onChange={(e) => setOpRegNewCentreName(e.target.value)}
                          placeholder="e.g. AnnSetu Procurement Yard - Fatwah East"
                          className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-[#414844] block mb-1">Operating Agency</label>
                          <input
                            type="text"
                            value={opRegNewCentreAgency}
                            onChange={(e) => setOpRegNewCentreAgency(e.target.value)}
                            placeholder="e.g. BSFC / NAFED Division"
                            className="w-full bg-[#f3f4f1] px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[#414844] block mb-1">Daily Capacity (Quintals)</label>
                          <input
                            type="number"
                            value={opRegNewCentreCapacity}
                            onChange={(e) => setOpRegNewCentreCapacity(Number(e.target.value))}
                            className="w-full bg-[#f3f4f1] px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-[#414844] block mb-1">Full Address / Location</label>
                        <input
                          type="text"
                          value={opRegNewCentreAddress}
                          onChange={(e) => setOpRegNewCentreAddress(e.target.value)}
                          placeholder={`APMC Sub-Market Yard, ${opRegBlock}, ${opRegDistrict}`}
                          className="w-full bg-[#f3f4f1] px-3.5 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setOpRegStep(1)}
                      className="w-1/3 h-[44px] bg-[#f3f4f1] text-[#414844] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (opRegCentreMode === 'CREATE' && !opRegNewCentreName.trim()) {
                          setOpRegError('Please enter a centre name.');
                          return;
                        }
                        setOpRegError('');
                        setOpRegStep(3);
                      }}
                      className="w-2/3 h-[44px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      Next: Operator Credentials →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Create Operator Credentials */}
              {opRegStep === 3 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Operator Full Name</label>
                    <input
                      type="text"
                      required
                      value={opRegName}
                      onChange={(e) => setOpRegName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={opRegMobile}
                      onChange={(e) => setOpRegMobile(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Desired Username</label>
                    <input
                      type="text"
                      required
                      value={opRegUsername}
                      onChange={(e) => setOpRegUsername(e.target.value)}
                      placeholder="e.g. operator"
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={opRegPassword}
                        onChange={(e) => setOpRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={opRegConfirmPassword}
                        onChange={(e) => setOpRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setOpRegStep(2)}
                      className="w-1/3 h-[44px] bg-[#f3f4f1] text-[#414844] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!opRegName.trim() || !opRegMobile.trim() || !opRegUsername.trim() || !opRegPassword.trim()) {
                          setOpRegError('Please complete all credential fields.');
                          return;
                        }
                        if (opRegPassword !== opRegConfirmPassword) {
                          setOpRegError('Passwords do not match.');
                          return;
                        }
                        setOpRegError('');
                        setOpRegStep(4);
                      }}
                      className="w-2/3 h-[44px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      Next: Verification & Approval →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Verification & Approval */}
              {opRegStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#f3f9f5] p-4 rounded-2xl border border-[#2c694e]/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5 text-[#1b4332]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#012d1d]">Verification & Approval Ready</h4>
                        <p className="text-[10px] text-[#717973]">Simulated District Administration Approval Active</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#012d1d] pt-2 border-t border-[#c1ecd4]/50">
                      <div><span className="font-bold">Operator Name:</span> {opRegName}</div>
                      <div><span className="font-bold">Username:</span> <span className="font-mono font-bold">{opRegUsername}</span></div>
                      <div><span className="font-bold">Mobile:</span> +91 {opRegMobile}</div>
                      <div><span className="font-bold">Centre:</span> {opRegCentreMode === 'CREATE' ? opRegNewCentreName : opRegSelectedCentreId} ({opRegBlock}, {opRegDistrict})</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#c1ecd4] text-center text-[11px] font-bold text-[#1b4332] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2c694e]" />
                      <span>Demo Verification & Approval ({opRegDistrict} / Prototype Environment)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpRegStep(3)}
                      className="w-1/3 h-[48px] bg-[#f3f4f1] text-[#414844] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={opRegIsSubmitting}
                      className="w-2/3 h-[48px] bg-[#012d1d] hover:bg-[#1b4332] text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>{opRegIsSubmitting ? 'Registering...' : 'Register & Launch Dashboard →'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* District Admin Registration Wizard Modal */}
      {showAdminRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative border border-[#c1c8c2]/60 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
              <div>
                <h3 className="font-black text-base text-[#012d1d]">🏛️ District Admin First-Time Registration</h3>
                <p className="text-[11px] text-[#717973] font-medium">Step {adminRegStep} of 4 — Official District Jurisdiction & Administration</p>
              </div>
              <button onClick={() => setShowAdminRegModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-extrabold text-center">
              <div className={`py-1.5 rounded-lg border ${adminRegStep >= 1 ? 'bg-[#b78103] text-white border-[#b78103]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                1. Jurisdiction
              </div>
              <div className={`py-1.5 rounded-lg border ${adminRegStep >= 2 ? 'bg-[#b78103] text-white border-[#b78103]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                2. Officer Info
              </div>
              <div className={`py-1.5 rounded-lg border ${adminRegStep >= 3 ? 'bg-[#b78103] text-white border-[#b78103]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                3. Credentials
              </div>
              <div className={`py-1.5 rounded-lg border ${adminRegStep >= 4 ? 'bg-[#b78103] text-white border-[#b78103]' : 'bg-[#f3f4f1] text-[#717973] border-[#c1c8c2]/40'}`}>
                4. Verification
              </div>
            </div>

            {adminRegError && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminRegError}</span>
              </div>
            )}

            <form onSubmit={handleAdminRegistrationSubmit} className="space-y-4 text-xs">
              {/* STEP 1: Select Jurisdiction (State & District) */}
              {adminRegStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#414844] block mb-1">State / Union Territory</label>
                    <select
                      value={adminRegState}
                      onChange={(e) => handleAdminRegStateChange(e.target.value)}
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    >
                      {allStatesAndUts.map((s) => (
                        <option key={s.code} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Assigned District</label>
                    <select
                      value={adminRegDistrict}
                      onChange={(e) => setAdminRegDistrict(e.target.value)}
                      className="w-full bg-[#f3f4f1] px-3 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    >
                      {adminRegDistrictsList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-[#fff9eb] p-3 rounded-2xl border border-[#b78103]/30 text-[11px] text-[#563c00] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-[#8f6402]">
                      <Landmark className="w-4 h-4" />
                      <span>District-Wide Supervisory Access</span>
                    </div>
                    <p>
                      As District Admin for <strong>{adminRegDistrict} District, {adminRegState}</strong>, you will manage, monitor queues, and view live intelligence for all procurement centres in this district.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!adminRegState || !adminRegDistrict) {
                        setAdminRegError('Please select state and district.');
                        return;
                      }
                      setAdminRegError('');
                      setAdminRegStep(2);
                    }}
                    className="w-full h-[48px] bg-[#b78103] hover:bg-[#8f6402] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <span>Next: Officer Information →</span>
                  </button>
                </div>
              )}

              {/* STEP 2: Officer & Department Information */}
              {adminRegStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Officer Full Name</label>
                    <input
                      type="text"
                      value={adminRegFullName}
                      onChange={(e) => setAdminRegFullName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Kumar, IAS"
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Designation</label>
                      <input
                        type="text"
                        value={adminRegDesignation}
                        onChange={(e) => setAdminRegDesignation(e.target.value)}
                        placeholder="e.g. District Procurement Officer"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Department</label>
                      <input
                        type="text"
                        value={adminRegDepartment}
                        onChange={(e) => setAdminRegDepartment(e.target.value)}
                        placeholder="e.g. Food & Civil Supplies"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={adminRegMobile}
                        onChange={(e) => setAdminRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Official Email (Optional)</label>
                      <input
                        type="email"
                        value={adminRegEmail}
                        onChange={(e) => setAdminRegEmail(e.target.value)}
                        placeholder="admin@gov.in"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminRegStep(1)}
                      className="w-1/3 h-[48px] bg-[#f3f4f1] text-[#414844] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!adminRegFullName.trim() || !adminRegDesignation.trim() || !adminRegDepartment.trim() || !adminRegMobile.trim()) {
                          setAdminRegError('Please complete all officer information fields.');
                          return;
                        }
                        if (adminRegMobile.trim().length !== 10) {
                          setAdminRegError('Mobile number must be exactly 10 digits.');
                          return;
                        }
                        setAdminRegError('');
                        setAdminRegStep(3);
                      }}
                      className="w-2/3 h-[48px] bg-[#b78103] hover:bg-[#8f6402] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <span>Next: Credentials →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Credentials & Auto-Generated Admin ID */}
              {adminRegStep === 3 && (
                <div className="space-y-3">
                  <div className="bg-[#012d1d] text-white p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c1ecd4] block">Auto-Generated Admin ID Preview</span>
                    <span className="text-lg font-black font-mono tracking-wide text-amber-300 block">{previewAdminId}</span>
                    <span className="text-[10px] text-[#c1ecd4]/80 block">Formatted automatically based on state ({adminRegState}) and district ({adminRegDistrict}).</span>
                  </div>

                  <div>
                    <label className="font-bold text-[#414844] block mb-1">Login Username</label>
                    <input
                      type="text"
                      value={adminRegUsername}
                      onChange={(e) => setAdminRegUsername(e.target.value)}
                      placeholder="e.g. patna_admin"
                      className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Password</label>
                      <input
                        type="password"
                        value={adminRegPassword}
                        onChange={(e) => setAdminRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#414844] block mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={adminRegConfirmPassword}
                        onChange={(e) => setAdminRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminRegStep(2)}
                      className="w-1/3 h-[48px] bg-[#f3f4f1] text-[#414844] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!adminRegUsername.trim() || !adminRegPassword.trim() || !adminRegConfirmPassword.trim()) {
                          setAdminRegError('Please fill in username and password.');
                          return;
                        }
                        if (adminRegPassword !== adminRegConfirmPassword) {
                          setAdminRegError('Passwords do not match.');
                          return;
                        }
                        setAdminRegError('');
                        setAdminRegStep(4);
                      }}
                      className="w-2/3 h-[48px] bg-[#b78103] hover:bg-[#8f6402] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <span>Next: Verification →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Verification / Approval */}
              {adminRegStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#fff9eb] p-4 rounded-2xl border border-[#b78103]/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#563c00] flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5 text-[#b78103]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#012d1d]">Verification & Approval Ready</h4>
                        <p className="text-[10px] text-[#717973]">Prototype Verification & Approval Workflow Active</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#012d1d] pt-2 border-t border-[#b78103]/30">
                      <div><span className="font-bold">Generated Admin ID:</span> <span className="font-mono font-bold text-[#b78103]">{previewAdminId}</span></div>
                      <div><span className="font-bold">Officer Name:</span> {adminRegFullName} ({adminRegDesignation})</div>
                      <div><span className="font-bold">Department:</span> {adminRegDepartment}</div>
                      <div><span className="font-bold">Jurisdiction:</span> {adminRegDistrict} District, Government of {adminRegState}</div>
                      <div><span className="font-bold">Mobile:</span> +91 {adminRegMobile}</div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-center text-[11px] font-bold text-[#8f6402] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#b78103]" />
                      <span>Approved for District Procurement Supervisory Role</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminRegStep(3)}
                      className="w-1/3 h-[48px] bg-[#f3f4f1] text-[#414844] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={adminRegIsSubmitting}
                      className="w-2/3 h-[48px] bg-[#012d1d] hover:bg-[#1b4332] text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>{adminRegIsSubmitting ? 'Generating Admin ID...' : 'Complete Admin Registration →'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Account Not Registered Modal */}
      {unregisteredModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative border border-[#c1c8c2]/60">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>

            <div>
              <h3 className="font-black text-base text-[#012d1d]">
                Account Not Registered
              </h3>
              <p className="text-xs text-[#717973] font-medium mt-1">
                {unregisteredModalRole === 'FARMER' &&
                  'This mobile number is not registered with AnnSetu. Please register first to continue.'}
                {unregisteredModalRole === 'OPERATOR' &&
                  'This centre/operator account is not registered with AnnSetu. Please register first to continue.'}
                {unregisteredModalRole === 'ADMIN' &&
                  'This Admin account is not registered with AnnSetu. Please register first to continue.'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnregisteredModalRole(null)}
                className="flex-1 h-[44px] bg-[#f3f4f1] hover:bg-[#e4e6e1] text-[#012d1d] font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetRole = unregisteredModalRole;
                  setUnregisteredModalRole(null);
                  if (targetRole === 'FARMER') {
                    setRegMobile(mobile);
                    setShowRegModal(true);
                  } else if (targetRole === 'OPERATOR') {
                    setShowOpRegModal(true);
                    setOpRegStep(1);
                  } else if (targetRole === 'ADMIN') {
                    setShowAdminRegModal(true);
                  }
                }}
                className="flex-1 h-[44px] bg-[#2c694e] hover:bg-[#012d1d] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support / Helpline Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative border border-[#c1c8c2]/60">
            <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center mx-auto text-xl font-bold">
              📞
            </div>

            <div>
              <h3 className="font-black text-base text-[#012d1d]">
                AnnSetu Kisan Helpline
              </h3>
              <p className="text-xs text-[#717973] font-medium mt-1">
                24x7 Support in English, Hindi, Marathi, Bengali, Telugu
              </p>
            </div>

            <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 text-center">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Toll-Free Helpline</p>
              <p className="text-xl font-black text-[#2c694e] font-mono mt-0.5">1800-180-1551</p>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full h-[44px] bg-[#012d1d] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
