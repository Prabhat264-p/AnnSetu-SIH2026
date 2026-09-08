import React, { useState } from 'react';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MapPin,
  Building2,
  Calendar,
  Bell,
  ArrowLeft,
  Navigation,
  Wheat,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../../components/farmer/InteractiveMap';
import { DigitalTokenCard } from '../../components/farmer/DigitalTokenCard';

import { getCentreSafe } from '../../utils/centreResolver';

interface LiveQueuePageProps {
  onNavigate: (path: string) => void;
}

export const LiveQueuePage: React.FC<LiveQueuePageProps> = ({ onNavigate }) => {
  const { activeToken, tokens, centres, simulateQueueStep, language, t } = useApp();
  const [isSimulating, setIsSimulating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const completedToken = tokens.find((tok) => tok.status === 'COMPLETED');

  const handleRefreshStatus = () => {
    setIsSimulating(true);
    simulateQueueStep();
    setTimeout(() => setIsSimulating(false), 400);
  };

  // 1. EMPTY STATE (No Active Booking)
  if (!activeToken) {
    if (completedToken) {
      return (
        <div className="space-y-6 max-w-2xl mx-auto pb-20 font-sans select-none animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 sm:p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#c1ecd4] text-[#002114] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-[#2c694e]" />
            </div>

            <div>
              <span className="text-xs font-black uppercase text-[#2c694e] tracking-wider">
                ✓ Visit Completed
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#012d1d] mt-1">
                🌾 {completedToken.crop} ({completedToken.quantityQuintals} Qtl)
              </h2>
              <p className="text-xs text-[#717973] font-medium mt-0.5">
                📍 {completedToken.centreName} • Token: <span className="font-mono font-bold text-[#012d1d]">{completedToken.tokenNumber}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/farmer/my-bookings')}
                className="w-full sm:w-auto bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-extrabold text-xs px-5 py-3 rounded-2xl border border-[#c1c8c2]/60 cursor-pointer"
              >
                📋 View Visit Details
              </button>
              <button
                onClick={() => onNavigate('/farmer/centres')}
                className="w-full sm:w-auto bg-[#1b4332] hover:bg-[#012d1d] text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md cursor-pointer"
              >
                📍 Find Centre to Book Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-md mx-auto pb-20 font-sans select-none animate-in fade-in">
        <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#f3f9f5] text-[#2c694e] flex items-center justify-center mx-auto text-3xl shadow-xs">
            🎟️
          </div>

          <div>
            <h2 className="text-xl font-black text-[#012d1d]">
              🎟️ No Active Turn
            </h2>
            <p className="text-xs text-[#717973] font-medium mt-1">
              You don't have a booked turn yet. Find a nearby procurement centre to schedule your visit.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/farmer/centres')}
            className="w-full min-h-[50px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
          >
            <span>📍 Find Centre</span>
            <ArrowRight className="w-4 h-4 text-[#aeeecb]" />
          </button>
        </div>
      </div>
    );
  }

  const centre = getCentreSafe(activeToken.centreId, centres);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 font-sans select-none animate-in fade-in">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/farmer/dashboard')}
              className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </button>
            <span className="text-xs text-[#717973]">/</span>
            <span className="text-xs font-bold text-[#2c694e]">🎟️ My Turn</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#012d1d] tracking-tight mt-1">
            🎟️ My Turn
          </h1>
          <p className="text-xs text-[#717973] font-medium">
            Your token, booking and live queue status
          </p>
        </div>
      </div>

      {/* 2. Balanced 2-Column Desktop Layout (~50% Left / ~50% Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Digital Token & Booking Pass */}
        <div className="w-full">
          <DigitalTokenCard
            token={activeToken}
            onViewLiveQueue={() => {}}
          />
        </div>

        {/* RIGHT COLUMN: Live Turn Dial + Queue Sequence + Action Buttons */}
        <div className="w-full space-y-6">
          {/* Dominant Live Turn Card */}
          <div className="bg-white rounded-3xl border-3 border-[#2c694e] p-6 shadow-xl text-center space-y-5">
            <div className="bg-[#f3f9f5] p-5 rounded-3xl border border-[#2c694e]/30 space-y-2">
              <span className="text-xs font-black text-[#2c694e] uppercase tracking-wider block">
                🟢 YOUR TURN
              </span>

              {/* Dominant Turn Number */}
              <div className="text-6xl sm:text-7xl font-black text-[#012d1d] font-mono tracking-tight my-1">
                #{activeToken.queuePosition}
              </div>

              <div className="text-sm font-black text-[#012d1d]">
                👥 {Math.max(0, activeToken.queuePosition - 1)} farmers ahead of you
              </div>

              <div className="text-xs font-black text-[#2c694e] bg-white px-3.5 py-1.5 rounded-full border border-[#2c694e]/20 inline-block shadow-2xs">
                ⏱️ Expected wait: ~{activeToken.estimatedWaitMinutes} min
              </div>
            </div>

            {/* Dynamic Queue Status Banner */}
            <div className="bg-[#f3f4f1] p-3 rounded-2xl border border-[#c1c8c2]/50 text-xs font-extrabold text-[#012d1d] flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2c694e] animate-pulse"></span>
              <span>🟢 Queue is moving smoothly ({centre?.activeCounters || 2} weighbridges active)</span>
            </div>

            {/* Live Queue Sequence */}
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-[#717973]">
                LIVE QUEUE SEQUENCE
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-3 bg-[#f9faf6] rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[9px] uppercase font-bold text-[#717973] block">NOW SERVING</span>
                  <span className="font-mono font-black text-[#012d1d] text-xs sm:text-sm block mt-0.5">WHT-08427</span>
                </div>

                <div className="p-3 bg-[#f9faf6] rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[9px] uppercase font-bold text-[#717973] block">NEXT</span>
                  <span className="font-mono font-black text-[#012d1d] text-xs sm:text-sm block mt-0.5">WHT-08428</span>
                </div>

                <div className="p-3 bg-[#c1ecd4] rounded-2xl border border-[#2c694e]/40 text-[#002114]">
                  <span className="text-[9px] uppercase font-black block">YOUR TURN</span>
                  <span className="font-mono font-black text-xs sm:text-sm block mt-0.5">#{activeToken.queuePosition}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#eeeeeb]">
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="h-[48px] bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-extrabold text-xs px-4 rounded-2xl border border-[#c1c8c2]/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#2c694e]" />
                <span>📍 Get Directions</span>
              </button>

              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isSimulating}
                className="h-[48px] bg-[#e9c46a] hover:bg-[#dfb552] text-[#002114] font-extrabold text-xs px-4 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>🔄 Refresh Status</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Directions Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#012d1d]">
                Directions to {activeToken.centreName} ({centre?.distanceKm || 0} km)
              </h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-xs font-bold bg-[#f3f4f1] text-[#414844] px-3 py-1 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
            <InteractiveMap
              centres={centre ? [centre] : []}
              selectedCentreId={centre?.id}
              onSelectCentre={() => {}}
              onBookCentre={() => setShowMapModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
