import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Building2,
  CheckCircle2,
  Navigation,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  INDIA_STATES,
  INDIA_UNION_TERRITORIES,
  getDistrictsForState,
  getBlocksForDistrict,
  getCoordinatesForSubdistrict,
} from '../../services/location/locationService';

interface FarmerOnboardingPageProps {
  onComplete: () => void;
}

export const FarmerOnboardingPage: React.FC<FarmerOnboardingPageProps> = ({ onComplete }) => {
  const { farmerProfile, currentUser, updateFarmerProfile, t } = useApp();

  const [name, setName] = useState<string>(farmerProfile.name || currentUser.name || '');
  const [mobile, setMobile] = useState<string>(farmerProfile.mobile || currentUser.mobile || '');

  // Cascading location state (Prompt new farmers to select location)
  const [selectedState, setSelectedState] = useState<string>(farmerProfile.state || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(farmerProfile.district || '');
  const [selectedBlock, setSelectedBlock] = useState<string>(farmerProfile.block || '');
  const [village, setVillage] = useState<string>(farmerProfile.village || '');
  const [pinCode, setPinCode] = useState<string>(farmerProfile.pinCode || '');

  // GPS state
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(
    farmerProfile.latitude && farmerProfile.longitude
      ? { lat: farmerProfile.latitude, lng: farmerProfile.longitude }
      : null
  );
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Derived cascading dropdown lists
  const districtsList = useMemo(
    () => (selectedState ? getDistrictsForState(selectedState).filter((d) => d !== 'All Districts') : []),
    [selectedState]
  );
  const blocksList = useMemo(
    () => (selectedState && selectedDistrict ? getBlocksForDistrict(selectedState, selectedDistrict).filter((b) => b !== 'All Blocks') : []),
    [selectedState, selectedDistrict]
  );

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('');
    setSelectedBlock('');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedBlock('');
  };

  const handleRequestGps = () => {
    setIsGettingGps(true);
    setGpsMessage('');
    setErrorMsg('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(4));
          const lng = Number(position.coords.longitude.toFixed(4));
          setGpsLocation({ lat, lng });
          setIsGettingGps(false);
          setGpsMessage(`Live GPS coordinates acquired: (${lat}, ${lng})`);
        },
        (error) => {
          setIsGettingGps(false);
          setGpsMessage('Unable to access GPS permission. Using selected Block administrative coordinates as DEMO location.');
          console.warn('Geolocation error:', error.message);
        },
        { timeout: 8000 }
      );
    } else {
      setIsGettingGps(false);
      setGpsMessage('Browser does not support GPS. Using selected Block administrative coordinates as DEMO location.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!mobile || mobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedState || !selectedDistrict || !selectedBlock || !village.trim()) {
      setErrorMsg('Please complete all administrative location fields (State, District, Block, Village).');
      return;
    }

    setIsSubmitting(true);

    // Resolve lat/lng coordinates
    let lat: number;
    let lng: number;
    let locationSource: 'GPS' | 'DEMO' | 'PROFILE' = 'DEMO';

    if (gpsLocation) {
      lat = gpsLocation.lat;
      lng = gpsLocation.lng;
      locationSource = 'GPS';
    } else {
      const demoCoords = getCoordinatesForSubdistrict(selectedState, selectedDistrict, selectedBlock);
      lat = demoCoords.latitude;
      lng = demoCoords.longitude;
      locationSource = 'DEMO';
    }

    const stateObj = [...INDIA_STATES, ...INDIA_UNION_TERRITORIES].find(s => s.name === selectedState);
    const stateCode = stateObj ? stateObj.code : selectedState.slice(0, 2).toUpperCase();

    const result = await updateFarmerProfile({
      name,
      mobile,
      stateCode,
      stateName: selectedState,
      districtCode: `${stateCode}_${selectedDistrict.slice(0, 3).toUpperCase()}`,
      districtName: selectedDistrict,
      subdistrictCode: `${stateCode}_${selectedBlock.slice(0, 3).toUpperCase()}`,
      subdistrictName: selectedBlock,
      state: selectedState,
      district: selectedDistrict,
      block: selectedBlock,
      village,
      pinCode,
      latitude: lat,
      longitude: lng,
      locationSource,
    });

    setIsSubmitting(false);

    if (result.success) {
      onComplete();
    } else {
      setErrorMsg(result.error || 'Failed to save farmer profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5] flex items-center justify-center p-4 py-12 font-sans select-none">
      <div className="bg-white max-w-xl w-full rounded-3xl border border-[#c1c8c2]/60 shadow-lg p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#e8f5e9] text-[#1b4332] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-7 h-7 text-[#2c694e]" />
          </div>
          <h1 className="text-2xl font-black text-[#012d1d] tracking-tight">
            Complete Your Farmer Profile
          </h1>
          <p className="text-xs md:text-sm text-[#414844] font-medium max-w-md mx-auto">
            Set your primary farming location to calculate accurate centre distances, estimated queue times, and MSP recommendations.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-800 p-3.5 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#012d1d] mb-1.5 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-[#2c694e]" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ram Das"
                className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#012d1d] mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#2c694e]" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none"
              />
            </div>
          </div>

          {/* Cascading Administrative Location Section */}
          <div className="space-y-4 pt-2 border-t border-[#eeeeeb]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2c694e] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2c694e]" />
              <span>Administrative Location Hierarchy</span>
            </h3>

            {/* State & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#012d1d] mb-1.5 block">
                  State / Union Territory *
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-[#f3f4f1] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer"
                >
                  <option value="">-- Select State / UT --</option>
                  <optgroup label="──────── STATES ────────">
                    {INDIA_STATES.map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="──────── UNION TERRITORIES ────────">
                    {INDIA_UNION_TERRITORIES.map((ut) => (
                      <option key={ut.code} value={ut.name}>
                        {ut.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#012d1d] mb-1.5 block">
                  District *
                </label>
                <select
                  disabled={!selectedState}
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-[#f3f4f1] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- Select District --</option>
                  {districtsList.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Block & Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#012d1d] mb-1.5 block">
                  Block / Tehsil / Sub-District *
                </label>
                <select
                  disabled={!selectedDistrict}
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="w-full bg-[#f3f4f1] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- Select Block --</option>
                  {blocksList.map((blk) => (
                    <option key={blk} value={blk}>
                      {blk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#012d1d] mb-1.5 block">
                  Village / Gram Panchayat *
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Fatwah Central"
                  className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none"
                />
              </div>
            </div>

            {/* PIN Code */}
            <div>
              <label className="text-xs font-bold text-[#012d1d] mb-1.5 block">
                PIN Code (Optional)
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g. 803201"
                maxLength={6}
                className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none"
              />
            </div>
          </div>

          {/* Optional GPS Location Card */}
          <div className="bg-[#f0f7f3] p-4 rounded-2xl border border-[#c1ecd4] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#1b4332]" />
                <span className="text-xs font-bold text-[#012d1d]">Precise GPS Location (Optional)</span>
              </div>
              <button
                type="button"
                onClick={handleRequestGps}
                disabled={isGettingGps}
                className="px-3 py-1 bg-[#1b4332] hover:bg-[#2d5a45] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                {isGettingGps ? 'Locating...' : 'Use Live GPS'}
              </button>
            </div>
            {gpsMessage && (
              <p className="text-[11px] font-medium text-[#2c694e]">{gpsMessage}</p>
            )}
            {!gpsMessage && (
              <p className="text-[11px] text-[#414844]">
                If skipped, distances will be measured relative to administrative coordinates of <strong>{selectedBlock}, {selectedDistrict}</strong>.
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1b4332] hover:bg-[#2d5a45] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving Profile...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile & Enter Dashboard</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
