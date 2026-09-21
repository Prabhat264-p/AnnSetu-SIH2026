import React from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  Users,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { SmartRecommendation } from '../../types';
import { useApp } from '../../context/AppContext';

interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  onBook: () => void;
  onViewDetails: () => void;
}

export const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  recommendation,
  onBook,
  onViewDetails,
}) => {
  if (!recommendation || !recommendation.centre) {
    return null;
  }

  const { centre, score, distanceKm, estimatedWait, isRecommended, reason } = recommendation;
  const { t } = useApp();

  return (
    <div
      onClick={onViewDetails}
      className={`rounded-3xl border-2 transition-all relative overflow-hidden bg-white p-5 md:p-6 cursor-pointer select-none ${
        isRecommended
          ? 'border-[#2c694e] shadow-md ring-4 ring-[#aeeecb]/30'
          : 'border-[#c1c8c2]/50 hover:border-[#1b4332] shadow-sm'
      }`}
    >
      {/* Top Badge */}
      {isRecommended && (
        <div className="bg-[#1b4332] text-[#c1ecd4] px-4 py-1 rounded-full inline-flex items-center gap-1.5 text-xs font-extrabold shadow-xs mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#e9c46a]" />
          <span>{t('recommendedForYou')}</span>
          <span className="bg-[#aeeecb] text-[#002114] text-[10px] px-1.5 py-0.2 rounded font-black ml-1">
            {score}% Match
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Centre Info */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black text-[#012d1d] group-hover:text-[#2c694e] transition-colors">
              {centre.name}
            </h3>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                centre.status === 'OPEN'
                  ? 'bg-[#aeeecb] text-[#002114]'
                  : centre.status === 'BUSY'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {centre.status}
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                centre.source === 'OFFICIAL_GOVT'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {centre.source === 'OFFICIAL_GOVT' ? '✓ Verified APMC' : 'Demo Centre'}
            </span>
          </div>

          <p className="text-xs text-[#414844] flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#2c694e] shrink-0" />
            <span>{centre.address}</span>
          </p>

          {/* Explainability pill */}
          <div className="flex items-center gap-1.5 text-xs text-[#2c694e] bg-[#f3f9f5] px-3 py-1 rounded-xl w-fit font-extrabold mt-2 border border-[#2c694e]/20">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{reason}</span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 text-center min-w-[280px]">
          <div>
            <p className="text-[10px] text-[#717973] uppercase font-bold">{t('distance')}</p>
            <p className="text-sm font-black text-[#012d1d] mt-0.5">{distanceKm} km</p>
          </div>
          <div>
            <p className="text-[10px] text-[#717973] uppercase font-bold">{t('queue')}</p>
            <p className="text-sm font-black text-[#012d1d] mt-0.5">{centre.currentQueue} In Line</p>
          </div>
          <div>
            <p className="text-[10px] text-[#717973] uppercase font-bold">{t('waitTime')}</p>
            <p className="text-sm font-black text-[#2c694e] mt-0.5">{estimatedWait}</p>
          </div>
        </div>
      </div>

      {/* Footer Controls & Supported Crops (Single Primary Action: View Centre ->) */}
      <div className="mt-4 pt-4 border-t border-[#eeeeeb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#717973] font-bold">Supported Crops:</span>
          {centre.supportedCrops.slice(0, 4).map((crop) => (
            <span
              key={crop}
              className="text-[10px] bg-[#eeeeeb] text-[#012d1d] font-bold px-2 py-0.5 rounded-md"
            >
              {crop}
            </span>
          ))}
          {centre.supportedCrops.length > 4 && (
            <span className="text-[10px] text-[#717973] font-bold">+{centre.supportedCrops.length - 4}</span>
          )}
        </div>

        {/* SINGLE PRIMARY ACTION BUTTON ON LIST CARD */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="bg-[#1b4332] hover:bg-[#012d1d] text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
        >
          <span>View Centre</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#aeeecb]" />
        </button>
      </div>
    </div>
  );
};
