import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Printer,
  Download,
  Share2,
  ListOrdered,
  LayoutDashboard,
  MapPin,
} from 'lucide-react';
import { Token } from '../../types';
import { DigitalTokenCard } from '../../components/farmer/DigitalTokenCard';
import { useApp } from '../../context/AppContext';

interface TokenConfirmationPageProps {
  token: Token | null;
  onNavigate: (path: string) => void;
}

export const TokenConfirmationPage: React.FC<TokenConfirmationPageProps> = ({
  token,
  onNavigate,
}) => {
  const { activeToken, t } = useApp();
  const currentToken = token || activeToken;

  useEffect(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#012d1d', '#2c694e', '#e9c46a', '#aeeecb'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  if (!currentToken) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-bold text-[#012d1d]">No active token found.</p>
        <button
          onClick={() => onNavigate('/farmer/dashboard')}
          className="mt-3 bg-[#1b4332] text-white px-4 py-2 rounded-xl text-xs cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 font-sans select-none animate-in fade-in">
      {/* Success Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[#c1ecd4] text-[#002114] flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8 text-[#012d1d]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#012d1d] tracking-tight">
          {t('tokenConfirmedTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#414844] font-medium max-w-md mx-auto">
          {t('pleaseArriveEarly')}
        </p>
      </div>

      {/* Arrival Reminder Alert Card */}
      <div className="bg-[#fff8e1] border border-amber-300 p-4 rounded-2xl text-xs font-bold text-[#7a5802] flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
        <div>
          <p className="font-extrabold">Reminder for Kisan:</p>
          <p className="text-[11px] font-medium">Please bring your Kisan Credit Card / Aadhaar ID and arrive 10–15 minutes before {currentToken.timeSlot}.</p>
        </div>
      </div>

      {/* Digital Token Pass */}
      <DigitalTokenCard
        token={currentToken}
        onViewLiveQueue={() => onNavigate('/farmer/live-queue')}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => onNavigate('/farmer/live-queue')}
          className="min-h-[50px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
        >
          <ListOrdered className="w-4 h-4 text-[#aeeecb]" />
          <span>Track Live Queue Turn</span>
        </button>

        <button
          onClick={() => onNavigate('/farmer/dashboard')}
          className="min-h-[50px] bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl border border-[#c1c8c2]/60 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-[#717973]" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
