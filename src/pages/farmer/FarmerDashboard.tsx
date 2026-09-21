import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Phone,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FarmerDashboardProps {
  onNavigate: (path: string) => void;
  onSelectCentre: (centreId: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onNavigate,
  onSelectCentre,
}) => {
  const { currentUser, farmerProfile, activeToken, tokens, t } = useApp();

  // Find last completed booking if any
  const completedToken = tokens.find((tok) => tok.status === 'COMPLETED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans select-none">
      {/* 1. Welcome Header Banner */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#1b4332] to-[#2c694e] text-white p-5 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#aeeecb] text-[#002114] px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2c694e]" />
              <span>AnnSetu APMC Procurement Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Namaste, {currentUser?.name || 'Farmer'}!
            </h1>
            <p className="text-xs sm:text-sm text-[#c1ecd4] mt-1 font-medium max-w-lg">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN STATUS SECTION: MY TURN STATUS OR PRIMARY FIND CENTRE CTA */}
      {activeToken ? (
        /* ACTIVE BOOKING: MY TURN STATUS CARD */
        <div className="bg-white border-3 border-[#2c694e] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 relative overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2c694e] animate-pulse"></span>
              <span className="text-xs font-black text-[#2c694e] uppercase tracking-wider">
                MY TURN STATUS
              </span>
            </div>
            <span className="text-sm font-mono font-black text-[#012d1d] bg-[#f3f4f1] px-3 py-1 rounded-xl border border-[#c1c8c2]/50">
              TOKEN: {activeToken.tokenNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left side booking details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#717973]">
                <span className="bg-[#c1ecd4] text-[#002114] font-black px-2.5 py-0.5 rounded">
                  {activeToken.crop}
                </span>
                <span className="font-extrabold text-[#012d1d]">{activeToken.quantityQuintals} Quintals</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-[#012d1d]">
                {activeToken.centreName}
              </h3>

              <p className="text-xs font-bold text-[#414844] flex items-center gap-3">
                <span>{activeToken.date}</span>
                <span>•</span>
                <span>{activeToken.timeSlot}</span>
              </p>
            </div>

            {/* Right side Live Turn Callout */}
            <div className="bg-[#f3f9f5] p-4 rounded-2xl border border-[#2c694e]/30 text-center space-y-2">
              <div className="text-xs font-black text-[#2c694e] uppercase tracking-wider">
                YOUR TURN: #{activeToken.queuePosition}
              </div>

              <p className="text-sm font-bold text-[#012d1d]">
                {Math.max(0, activeToken.queuePosition - 1)} Farmers ahead of you
              </p>

              <p className="text-xs font-extrabold text-[#717973]">
                Expected Wait: ~{activeToken.estimatedWaitMinutes} min
              </p>

              <button
                onClick={() => onNavigate('/farmer/live-queue')}
                className="w-full bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>See My Turn →</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* NO ACTIVE BOOKING: PRIMARY FIND CENTRE CTA CARD */
        <div className="bg-white border-2 border-[#2c694e] rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center mx-auto shadow-2xs">
            <Building2 className="w-7 h-7 text-[#2c694e]" />
          </div>

          <div>
            <h3 className="text-xl font-black text-[#012d1d]">
              Find a Procurement Centre
            </h3>
            <p className="text-xs sm:text-sm text-[#717973] font-medium max-w-md mx-auto mt-1">
              Select a nearby APMC procurement centre to schedule your crop turn and receive your digital token.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/farmer/centres')}
            className="bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-98 inline-flex items-center gap-2"
          >
            <span>Find a Procurement Centre</span>
            <ArrowRight className="w-4 h-4 text-[#aeeecb]" />
          </button>
        </div>
      )}

      {/* 3. RECENT COMPLETED VISIT CALLOUT (If available & no active token) */}
      {!activeToken && completedToken && (
        <div className="bg-white border border-[#c1c8c2]/60 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-[#2c694e]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#2c694e] tracking-wider">
                LAST VISIT • COMPLETED
              </span>
              <h4 className="font-extrabold text-sm text-[#012d1d]">
                {completedToken.crop} ({completedToken.quantityQuintals} Qtl) • {completedToken.centreName}
              </h4>
              <p className="text-xs text-[#717973]">Completed on {completedToken.date}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/farmer/my-bookings')}
            className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] text-xs font-extrabold px-4 py-2.5 rounded-xl border border-[#c1c8c2]/60 cursor-pointer"
          >
            View Past Visits
          </button>
        </div>
      )}

      {/* 4. MSP PROCUREMENT RATES REFERENCE GRID */}
      <div className="bg-[#f3f4f1] p-5 rounded-3xl border border-[#c1c8c2]/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2c694e]" />
            <h3 className="font-extrabold text-xs text-[#012d1d] uppercase tracking-wider">
              MSP Procurement Rates (2025-26)
            </h3>
          </div>
          <span className="text-[11px] text-[#717973] font-bold">Direct DBT Bank Payout</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-[#c1c8c2]/40">
            <p className="text-[11px] text-[#717973] font-medium">Wheat (Lokwan)</p>
            <p className="text-sm font-black text-[#012d1d] mt-0.5">₹ 2,275 / Qtl</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#c1c8c2]/40">
            <p className="text-[11px] text-[#717973] font-medium">Soybean (Yellow)</p>
            <p className="text-sm font-black text-[#012d1d] mt-0.5">₹ 4,892 / Qtl</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#c1c8c2]/40">
            <p className="text-[11px] text-[#717973] font-medium">Paddy (Common)</p>
            <p className="text-sm font-black text-[#012d1d] mt-0.5">₹ 2,300 / Qtl</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-[#c1c8c2]/40">
            <p className="text-[11px] text-[#717973] font-medium">Gram / Chana</p>
            <p className="text-sm font-black text-[#012d1d] mt-0.5">₹ 5,440 / Qtl</p>
          </div>
        </div>
      </div>

      {/* 5. HELPLINE & GUIDELINES BANNER */}
      <div className="bg-[#f3f9f5] p-4 rounded-2xl border border-[#2c694e]/30 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
            <Phone className="w-4 h-4 text-[#2c694e]" />
          </div>
          <div>
            <p className="font-extrabold text-[#012d1d]">AnnSetu Kisan Helpline</p>
            <p className="text-[11px] text-[#717973]">Toll-Free 24x7 Support: <span className="font-mono font-bold text-[#2c694e]">1800-180-1551</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
