import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Phone,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  Navigation,
  ArrowRight,
  TrendingDown,
  Wheat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../../components/farmer/InteractiveMap';

import { getCentreSafe } from '../../utils/centreResolver';

interface CentreDetailsPageProps {
  centreId: string;
  onNavigate: (path: string) => void;
}

export const CentreDetailsPage: React.FC<CentreDetailsPageProps> = ({
  centreId,
  onNavigate,
}) => {
  const { centres, t } = useApp();
  const [showMapModal, setShowMapModal] = useState(false);

  const centre = getCentreSafe(centreId, centres);

  if (!centre) {
    return (
      <div className="p-8 text-center font-sans">
        <p className="text-sm font-bold text-[#012d1d]">Centre information unavailable.</p>
        <button
          onClick={() => onNavigate('/farmer/centres')}
          className="mt-4 bg-[#1b4332] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          Back to Centres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 font-sans select-none animate-in fade-in">
      {/* 1. Clean Header Bar with Back Button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/farmer/centres')}
          className="flex items-center gap-2 text-xs font-black text-[#012d1d] hover:text-[#2c694e] bg-white px-3.5 py-2 rounded-xl border border-[#c1c8c2]/60 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Centres</span>
        </button>

        <span className="text-xs font-extrabold text-[#012d1d] bg-[#f3f4f1] px-3 py-1 rounded-xl border border-[#c1c8c2]/50">
          🏢 Centre Details
        </span>
      </div>

      {/* 2. Centre Identity & Hero Banner */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 overflow-hidden shadow-sm space-y-0">
        <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-[#012d1d]">
          <img
            src={centre.imageUrl}
            alt={centre.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d] via-[#012d1d]/40 to-transparent"></div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono bg-white/20 backdrop-blur-md px-2 py-0.5 rounded font-bold">
                {centre.officialId || centre.id}
              </span>
              <span className="text-[11px] text-[#c1ecd4] font-bold">{centre.agency}</span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  centre.source === 'OFFICIAL_GOVT'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'bg-amber-300 text-amber-950'
                }`}
              >
                {centre.source === 'OFFICIAL_GOVT' ? '✓ Verified APMC Data' : 'ℹ️ Simulated Demo Centre'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {centre.name}
            </h1>
            
            <p className="text-xs text-[#c1ecd4] flex items-center gap-1.5 mt-1 font-bold">
              <MapPin className="w-4 h-4 shrink-0 text-[#aeeecb]" />
              <span>{centre.address} • 📍 {centre.distanceKm} km away</span>
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-4 bg-[#f3f9f5] border-b border-[#eeeeeb] flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs uppercase ${
                centre.status === 'OPEN'
                  ? 'bg-[#aeeecb] text-[#002114]'
                  : centre.status === 'BUSY'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              🟢 OPEN NOW ({centre.workingHours})
            </span>
          </div>

          <span className="text-[#2c694e]">Working Hours: 09:00 AM – 05:00 PM</span>
        </div>

        {/* 3. TODAY'S STATUS Metrics Grid */}
        <div className="p-5 sm:p-6 bg-[#f9faf6] border-b border-[#eeeeeb] space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#012d1d]">
            📊 TODAY'S STATUS
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/40 text-center">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Current Queue</p>
              <p className="text-xl font-black text-[#012d1d] mt-1 flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-[#2c694e]" />
                {centre.currentQueue} Farmers
              </p>
              <p className="text-[10px] text-[#2c694e] font-bold mt-0.5">Updated live</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/40 text-center">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Estimated Wait</p>
              <p className="text-xl font-black text-[#2c694e] mt-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {centre.estimatedWaitingTime}
              </p>
              <p className="text-[10px] text-[#717973] mt-0.5">~{centre.averageProcessingTime} min/farmer</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/40 text-center">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Available Slots</p>
              <p className="text-xl font-black text-[#012d1d] mt-1">
                12 Slots
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Slots open today</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/40 text-center">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Active Counters</p>
              <p className="text-xl font-black text-[#012d1d] mt-1">
                {centre.activeCounters} / {centre.counters}
              </p>
              <p className="text-[10px] text-[#717973] mt-0.5">Weighbridges running</p>
            </div>
          </div>
        </div>

        {/* 4. Supported Crops, Working Hours, Facilities */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Supported Crops */}
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#012d1d]">🌾 Supported Commodities</h3>
              <div className="flex flex-wrap gap-2">
                {centre.supportedCrops.map((crop) => (
                  <span
                    key={crop}
                    className="text-xs bg-[#f3f4f1] text-[#012d1d] font-bold px-3 py-1.5 rounded-xl border border-[#c1c8c2]/50 flex items-center gap-1.5"
                  >
                    <Wheat className="w-3.5 h-3.5 text-[#2c694e]" />
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#012d1d]">🕐 Working Hours</h3>
              <div className="bg-[#f9faf6] p-3.5 rounded-2xl border border-[#c1c8c2]/40 text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#012d1d]">
                  <span>Monday – Saturday:</span>
                  <span>9:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between text-[#717973] font-medium">
                  <span>Sunday:</span>
                  <span className="text-red-700 font-bold">Closed</span>
                </div>
              </div>
            </div>

            {/* Centre Facilities */}
            <div className="space-y-2">
              <h3 className="font-black text-sm text-[#012d1d]">🏢 Centre Facilities</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#012d1d]">
                <div className="bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/40 flex items-center gap-2">
                  <span>⚖️ 50 MT Electronic Scale</span>
                </div>
                <div className="bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/40 flex items-center gap-2">
                  <span>🌾 Moisture Testing Lab</span>
                </div>
                <div className="bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/40 flex items-center gap-2">
                  <span>💧 Drinking Water</span>
                </div>
                <div className="bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/40 flex items-center gap-2">
                  <span>🚻 Farmers Restroom</span>
                </div>
                <div className="bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/40 flex items-center gap-2">
                  <span>🅿️ Covered Vehicle Yard</span>
                </div>
                <div className="bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/40 flex items-center gap-2">
                  <span>📞 24x7 Help Desk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Location Map & Primary CTA */}
          <div className="space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm text-[#012d1d]">📍 Location & Map</h3>
                <span className="text-xs text-[#2c694e] font-extrabold">📍 {centre.distanceKm} km away</span>
              </div>

              {/* Map Thumbnail */}
              <div
                onClick={() => setShowMapModal(true)}
                className="bg-[#f3f4f1] h-40 rounded-2xl border border-[#c1c8c2]/60 overflow-hidden relative cursor-pointer group"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                  <div className="bg-white/95 px-4 py-2 rounded-xl text-xs font-bold text-[#012d1d] shadow-sm flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#2c694e]" />
                    <span>Expand Geospatial Map</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="w-full mt-2 bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-bold text-xs py-2.5 px-4 rounded-xl border border-[#c1c8c2]/60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#2c694e]" />
                <span>📍 Get Directions</span>
              </button>
            </div>

            {/* PRIMARY BOOKING CTA AT BOTTOM OF CENTRE DETAILS */}
            <div className="space-y-2 pt-2 border-t border-[#eeeeeb]">
              <button
                onClick={() => onNavigate(`/farmer/book-slot?centreId=${centre.id}`)}
                disabled={centre.status === 'CLOSED'}
                className="w-full min-h-[52px] bg-[#1b4332] hover:bg-[#012d1d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 cursor-pointer"
              >
                <span>📅 {t('bookYourTurn')}</span>
                <ArrowRight className="w-5 h-5 text-[#aeeecb]" />
              </button>
              <p className="text-center text-[11px] text-[#717973] font-medium">
                Free booking • Instant digital token pass with QR code
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#012d1d]">
                Route to {centre.name} ({centre.distanceKm} km)
              </h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-xs font-bold bg-[#f3f4f1] text-[#414844] px-3 py-1 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
            <InteractiveMap
              centres={[centre]}
              selectedCentreId={centre.id}
              onSelectCentre={() => {}}
              onBookCentre={() => {
                setShowMapModal(false);
                onNavigate(`/farmer/book-slot?centreId=${centre.id}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
