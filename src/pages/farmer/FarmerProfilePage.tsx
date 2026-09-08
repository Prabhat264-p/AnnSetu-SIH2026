import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Wheat,
  Phone,
  CreditCard,
  Globe,
  Award,
  CheckCircle2,
  Navigation,
  Edit2,
  Save,
  X,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  INDIA_STATES,
  INDIA_UNION_TERRITORIES,
  getDistrictsForState,
  getBlocksForDistrict,
  getCoordinatesForSubdistrict,
} from '../../services/location/locationService';
import { DEMO_FARMER_A, DEMO_FARMER_B, DEMO_FARMER_C } from '../../data/mockData';

export const FarmerProfilePage: React.FC = () => {
  const { currentUser, farmerProfile, updateFarmerProfile, language, setLanguage } = useApp();

  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>(farmerProfile.state || 'Bihar');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(farmerProfile.district || 'Patna');
  const [selectedBlock, setSelectedBlock] = useState<string>(farmerProfile.block || 'Fatwah');
  const [village, setVillage] = useState<string>(farmerProfile.village || 'Fatwah Central');
  const [pinCode, setPinCode] = useState<string>(farmerProfile.pinCode || '803201');
  const [farmerName, setFarmerName] = useState<string>(farmerProfile.name || currentUser.name || 'Ram Das');

  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(
    farmerProfile.latitude && farmerProfile.longitude
      ? { lat: farmerProfile.latitude, lng: farmerProfile.longitude }
      : null
  );
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state when farmerProfile changes externally
  useEffect(() => {
    setSelectedState(farmerProfile.state || 'Bihar');
    setSelectedDistrict(farmerProfile.district || 'Patna');
    setSelectedBlock(farmerProfile.block || 'Fatwah');
    setVillage(farmerProfile.village || 'Fatwah Central');
    setPinCode(farmerProfile.pinCode || '803201');
    setFarmerName(farmerProfile.name || currentUser.name || 'Ram Das');
    if (farmerProfile.latitude && farmerProfile.longitude) {
      setGpsLocation({ lat: farmerProfile.latitude, lng: farmerProfile.longitude });
    }
  }, [farmerProfile, currentUser]);

  const districtsList = useMemo(() => getDistrictsForState(selectedState).filter(d => d !== 'All Districts'), [selectedState]);
  const blocksList = useMemo(
    () => getBlocksForDistrict(selectedState, selectedDistrict).filter(b => b !== 'All Blocks'),
    [selectedState, selectedDistrict]
  );

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const newDistricts = getDistrictsForState(newState).filter(d => d !== 'All Districts');
    const firstDist = newDistricts[0] || `${newState} Central`;
    setSelectedDistrict(firstDist);
    const newBlocks = getBlocksForDistrict(newState, firstDist).filter(b => b !== 'All Blocks');
    setSelectedBlock(newBlocks[0] || `${firstDist} Main`);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const newBlocks = getBlocksForDistrict(selectedState, newDistrict).filter(b => b !== 'All Blocks');
    setSelectedBlock(newBlocks[0] || `${newDistrict} Main`);
  };

  const handleRequestGps = () => {
    setIsGettingGps(true);
    setGpsMessage('');

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

  const handleSaveLocation = async () => {
    setIsSubmitting(true);
    setSaveSuccessMsg('');

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
      name: farmerName,
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
      setIsEditingLocation(false);
      setSaveSuccessMsg('Location origin updated successfully! Find Centre will calculate distances from this location.');
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    }
  };

  const handleSwitchDemoProfile = async (preset: typeof DEMO_FARMER_A) => {
    setIsSubmitting(true);
    await updateFarmerProfile(preset);
    setIsSubmitting(false);
    setSaveSuccessMsg(`Switched to Demo Farmer profile: ${preset.name} (${preset.village}, ${preset.block}, ${preset.district}, ${preset.state})`);
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 font-sans select-none">
      {saveSuccessMsg && (
        <div className="bg-[#e8f5e9] text-[#002114] p-4 rounded-2xl border border-[#c1ecd4] font-bold text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#2c694e] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header Profile Hero */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-24 h-24 rounded-3xl bg-[#c1ecd4] border-4 border-white shadow-md overflow-hidden shrink-0">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-[#012d1d]">{farmerProfile.name || currentUser.name}</h1>
              <span className="bg-[#aeeecb] text-[#002114] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#2c694e]" /> Verified Farmer Profile
              </span>
            </div>

            <p className="text-xs text-[#414844] flex items-center justify-center sm:justify-start gap-1 font-semibold">
              <MapPin className="w-4 h-4 text-[#2c694e]" />
              <span>
                {farmerProfile.village}, {farmerProfile.block} Block, {farmerProfile.district}, {farmerProfile.state}
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px]">
              <span className="bg-[#f0f7f3] text-[#1b4332] px-2.5 py-0.5 rounded-md font-extrabold border border-[#c1ecd4]">
                Origin: ({farmerProfile.latitude || 25.612}, {farmerProfile.longitude || 85.168})
              </span>
              <span className="bg-[#e2f3eb] text-[#002114] px-2 py-0.5 rounded-md font-bold uppercase text-[9px]">
                Source: {farmerProfile.locationSource || 'DEMO'}
              </span>
            </div>

            <p className="text-xs text-[#717973] flex items-center justify-center sm:justify-start gap-1 pt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{farmerProfile.mobile || currentUser.mobile}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 text-center sm:text-right">
            <button
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d5a45] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 justify-center cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingLocation ? 'Cancel Edit' : 'Edit Location Origin'}</span>
            </button>

            <div className="bg-[#f3f9f5] px-4 py-2.5 rounded-2xl border border-[#2c694e]/20">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Land Holding</p>
              <p className="text-base font-extrabold text-[#012d1d]">{farmerProfile.landAreaAcres || 5.0} Acres</p>
            </div>
          </div>
        </div>

        {/* Location Edit Form */}
        {isEditingLocation && (
          <div className="mt-6 pt-6 border-t border-[#eeeeeb] space-y-4 bg-[#f9faf6] p-5 rounded-2xl border border-[#c1c8c2]/50">
            <h3 className="text-xs font-black uppercase text-[#012d1d] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2c694e]" />
              <span>Update Primary Farmer Location & Distance Origin</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#717973] uppercase block mb-1">State / UT</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                >
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
                <label className="text-[10px] font-bold text-[#717973] uppercase block mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                >
                  {districtsList.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#717973] uppercase block mb-1">Block / Tehsil</label>
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                >
                  {blocksList.map((blk) => (
                    <option key={blk} value={blk}>
                      {blk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#717973] uppercase block mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleRequestGps}
                disabled={isGettingGps}
                className="px-3 py-1.5 bg-[#e8f5e9] text-[#1b4332] text-xs font-bold rounded-xl hover:bg-[#c1ecd4] transition-all flex items-center gap-1.5 border border-[#c1ecd4] cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isGettingGps ? 'Acquiring GPS...' : 'Use Live GPS Location'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(false)}
                  className="px-3 py-1.5 bg-white text-[#717973] hover:text-[#012d1d] text-xs font-bold rounded-xl border border-[#c1c8c2]/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#1b4332] hover:bg-[#2d5a45] text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Location'}</span>
                </button>
              </div>
            </div>
            {gpsMessage && <p className="text-[11px] text-[#2c694e] font-semibold">{gpsMessage}</p>}
          </div>
        )}
      </div>

      {/* Multi-Demo Farmer Quick Switch Presets */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2c694e]" />
          <h3 className="font-bold text-sm text-[#012d1d]">Multi-Region Demo Farmer Selector (Testing Tool)</h3>
        </div>
        <p className="text-xs text-[#717973]">
          Quickly switch farmer origin to test multi-state distance calculations across India:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => handleSwitchDemoProfile(DEMO_FARMER_A)}
            className="p-3 bg-[#f9faf6] hover:bg-[#e8f5e9] rounded-2xl border border-[#c1c8c2]/50 text-left transition-all cursor-pointer space-y-1"
          >
            <p className="font-extrabold text-xs text-[#012d1d]">Bihar Demo Farmer</p>
            <p className="text-[11px] font-semibold text-[#2c694e]">Ram Das</p>
            <p className="text-[10px] text-[#717973]">Patna → Fatwah (25.61, 85.16)</p>
          </button>

          <button
            onClick={() => handleSwitchDemoProfile(DEMO_FARMER_B)}
            className="p-3 bg-[#f9faf6] hover:bg-[#e8f5e9] rounded-2xl border border-[#c1c8c2]/50 text-left transition-all cursor-pointer space-y-1"
          >
            <p className="font-extrabold text-xs text-[#012d1d]">Maharashtra Demo Farmer</p>
            <p className="text-[11px] font-semibold text-[#2c694e]">Suresh Patil</p>
            <p className="text-[10px] text-[#717973]">Nashik → Sinnar (19.85, 74.00)</p>
          </button>

          <button
            onClick={() => handleSwitchDemoProfile(DEMO_FARMER_C)}
            className="p-3 bg-[#f9faf6] hover:bg-[#e8f5e9] rounded-2xl border border-[#c1c8c2]/50 text-left transition-all cursor-pointer space-y-1"
          >
            <p className="font-extrabold text-xs text-[#012d1d]">Tamil Nadu Demo Farmer</p>
            <p className="text-[11px] font-semibold text-[#2c694e]">Karthik Raja</p>
            <p className="text-[10px] text-[#717973]">Coimbatore → Pollachi (10.66, 77.00)</p>
          </button>
        </div>
      </div>

      {/* KYC & Identity Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#012d1d] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2c694e]" />
            <span>Government ID & Kisan Verification</span>
          </h3>

          <div className="space-y-3 text-xs text-[#414844]">
            <div className="flex items-center justify-between py-2 border-b border-[#eeeeeb]">
              <span className="text-[#717973]">Aadhaar Masked</span>
              <span className="font-mono font-bold text-[#012d1d]">XXXX-XXXX-{farmerProfile.aadhaarLast4 || '8432'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#eeeeeb]">
              <span className="text-[#717973]">Kisan Credit Card (KCC)</span>
              <span className="font-mono font-bold text-[#012d1d]">{farmerProfile.kisanCreditCardNo || 'KCC-BR-PTN-2024-1109'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#eeeeeb]">
              <span className="text-[#717973]">e-KYC Status</span>
              <span className="text-[#2c694e] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Biometric Verified
              </span>
            </div>
          </div>
        </div>

        {/* Language Preference Settings */}
        <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#012d1d] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2c694e]" />
            <span>Preferred Language</span>
          </h3>
          <p className="text-xs text-[#717973]">
            Receive queue updates and token receipts in your preferred regional language.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-[#012d1d] text-white' : 'bg-[#f3f4f1] text-[#414844]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'hi' ? 'bg-[#012d1d] text-white' : 'bg-[#f3f4f1] text-[#414844]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'mr' ? 'bg-[#012d1d] text-white' : 'bg-[#f3f4f1] text-[#414844]'
              }`}
            >
              मराठी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
