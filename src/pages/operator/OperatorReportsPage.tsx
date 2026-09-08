import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  CheckCircle2,
  Users,
  Download,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { getCentreSafe } from '../../utils/centreResolver';

interface OperatorReportsPageProps {
  onNavigate?: (path: string) => void;
}

export const OperatorReportsPage: React.FC<OperatorReportsPageProps> = ({
  onNavigate,
}) => {
  const { currentUser, centres, tokens } = useApp();

  const targetCentreId = currentUser.centreId || 'cnt_sinnar';
  const centre = getCentreSafe(targetCentreId, centres);

  if (!centre) {
    return (
      <div className="p-8 text-center font-sans max-w-xl mx-auto my-12 bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-sm">
        <h3 className="text-base font-black text-[#012d1d]">Centre information loading...</h3>
        <p className="text-xs text-[#717973] mt-1">Please wait while procurement centre information is retrieved.</p>
      </div>
    );
  }

  const centreTokens = tokens.filter((t) => t.centreId === centre.id || t.centreId === centre.officialId);

  const completedTokens = centreTokens.filter((t) => t.status === 'COMPLETED');
  const waitingTokens = centreTokens.filter((t) =>
    ['WAITING', 'CONFIRMED', 'SCHEDULED'].includes(t.status)
  );
  const noShowTokens = centreTokens.filter((t) => t.status === 'NO_SHOW');
  const cancelledTokens = centreTokens.filter((t) => t.status === 'CANCELLED');

  const totalVolumeQuintals = completedTokens.reduce((sum, t) => sum + t.quantityQuintals, 0);
  const noShowRate =
    centreTokens.length > 0
      ? Math.round((noShowTokens.length / centreTokens.length) * 100)
      : 0;

  // Crop-wise distribution calculations
  const cropStats = ['Wheat', 'Soybean', 'Paddy', 'Gram (Chana)'].map((cropName) => {
    const matching = completedTokens.filter((t) =>
      t.crop.toLowerCase().includes(cropName.toLowerCase())
    );
    const volume = matching.reduce((sum, t) => sum + t.quantityQuintals, 0);
    return { name: cropName, count: matching.length, volume };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans select-none">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#012d1d] tracking-tight">
              Centre Reports & Analytics
            </h1>
            <p className="text-xs text-[#717973] font-medium">
              Operational KPIs, throughput trends, and performance metrics for {centre.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Generating Comprehensive Centre Performance Report (PDF)...')}
          className="bg-[#1b4332] hover:bg-[#012d1d] text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#aeeecb]" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Primary Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Total Procurement Volume</p>
          <p className="text-3xl font-black text-[#012d1d]">{totalVolumeQuintals} Qtl</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">Net Grain Processed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Avg Processing Time</p>
          <p className="text-3xl font-black text-[#1b4332]">{centre.averageProcessingTime} min</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">Per Farmer Weighment</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Counter Efficiency</p>
          <p className="text-3xl font-black text-[#2c694e]">
            {Math.round((centre.activeCounters / centre.counters) * 100)}%
          </p>
          <p className="text-[11px] text-[#2c694e] font-semibold">
            {centre.activeCounters} of {centre.counters} Active
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">No-Show / Cancel Rate</p>
          <p className="text-3xl font-black text-amber-800">{noShowRate}%</p>
          <p className="text-[11px] text-[#717973]">{noShowTokens.length} No-Shows Today</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop-Wise Breakdown Chart Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
            <h3 className="font-bold text-base text-[#012d1d]">🌾 Crop Procurement Volume (Qtl)</h3>
            <span className="text-xs font-bold text-[#2c694e]">{completedTokens.length} Completed Tokens</span>
          </div>

          <div className="space-y-3">
            {cropStats.map((stat) => {
              const maxVol = Math.max(...cropStats.map((s) => s.volume), 1);
              const percentage = Math.round((stat.volume / maxVol) * 100);
              return (
                <div key={stat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#012d1d]">
                    <span>{stat.name}</span>
                    <span>{stat.volume} Qtl ({stat.count} Tokens)</span>
                  </div>
                  <div className="w-full bg-[#f3f4f1] h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1b4332] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slot Utilization & Throughput */}
        <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
            <h3 className="font-bold text-base text-[#012d1d]">⏰ Time Slot Capacity Utilization</h3>
            <span className="text-xs font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-0.5 rounded-md">
              {centre.availableSlots} Slots Available
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#f9faf6] rounded-2xl border border-[#c1c8c2]/40 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-[#012d1d]">Morning Session (08:30 AM - 12:00 PM)</p>
                <p className="text-[10px] text-[#717973]">High Demand Period</p>
              </div>
              <span className="font-black text-[#2c694e]">92% Booked</span>
            </div>

            <div className="p-3 bg-[#f9faf6] rounded-2xl border border-[#c1c8c2]/40 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-[#012d1d]">Afternoon Session (12:30 PM - 03:30 PM)</p>
                <p className="text-[10px] text-[#717973]">Moderate Demand</p>
              </div>
              <span className="font-black text-[#2c694e]">78% Booked</span>
            </div>

            <div className="p-3 bg-[#f9faf6] rounded-2xl border border-[#c1c8c2]/40 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-[#012d1d]">Evening Session (03:30 PM - 05:30 PM)</p>
                <p className="text-[10px] text-[#717973]">Standard Flow</p>
              </div>
              <span className="font-black text-[#2c694e]">64% Booked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
