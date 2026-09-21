import React from 'react';
import {
  Building2,
  Play,
  Minus,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCentreSafe } from '../../utils/centreResolver';

interface OperatorDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const OperatorDashboardPage: React.FC<OperatorDashboardPageProps> = ({
  onNavigate,
}) => {
  const {
    currentUser,
    centres,
    tokens,
    callNextFarmer,
    updateCentreCounters,
  } = useApp();

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

  const waitingCount = centreTokens.filter((t) =>
    ['WAITING', 'CONFIRMED', 'SCHEDULED'].includes(t.status)
  ).length;
  const processingCount = centreTokens.filter((t) =>
    ['VERIFIED', 'PROCESSING', 'ARRIVED'].includes(t.status)
  ).length;
  const completedCount = centreTokens.filter((t) => t.status === 'COMPLETED').length;

  const mspRate = 2275; // Wheat MSP
  const totalQuantityQuintals = centreTokens
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.quantityQuintals, 0);
  const totalDisbursedRupees = totalQuantityQuintals * mspRate;

  // Crop summary calculation
  const cropSummary = ['Wheat', 'Soybean', 'Paddy', 'Gram (Chana)'].map((cropName) => {
    const cropTokens = centreTokens.filter((t) => t.crop.toLowerCase().includes(cropName.toLowerCase()));
    const qtl = cropTokens.reduce((sum, t) => sum + t.quantityQuintals, 0);
    return { name: cropName, count: cropTokens.length, quantity: qtl };
  });

  const handleCallNext = () => {
    const called = callNextFarmer(centre.id);
    if (!called) {
      alert('No more waiting farmers in queue today!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans select-none">
      {/* Top Header & Centre Controller */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-[#f3f4f1] text-[#012d1d] px-2 py-0.5 rounded font-bold">
                {centre.officialId || centre.id}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  centre.status === 'OPEN'
                    ? 'bg-[#aeeecb] text-[#002114]'
                    : centre.status === 'BUSY'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {centre.status}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#012d1d] tracking-tight mt-0.5">
              Centre Dashboard
            </h1>
          </div>
        </div>

        {/* Counter Stepper & Call Next */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f3f4f1] p-1.5 rounded-2xl border border-[#c1c8c2]/50">
            <span className="text-xs font-bold text-[#414844] px-2">Active Counters:</span>
            <button
              type="button"
              onClick={() => updateCentreCounters(centre.id, centre.activeCounters - 1)}
              disabled={centre.activeCounters <= 1}
              className="w-7 h-7 rounded-xl bg-white text-[#012d1d] flex items-center justify-center font-bold hover:bg-[#eeeeeb] disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-sm text-[#012d1d] w-6 text-center">
              {centre.activeCounters}
            </span>
            <button
              type="button"
              onClick={() => updateCentreCounters(centre.id, centre.activeCounters + 1)}
              disabled={centre.activeCounters >= centre.counters}
              className="w-7 h-7 rounded-xl bg-white text-[#012d1d] flex items-center justify-center font-bold hover:bg-[#eeeeeb] disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCallNext}
            className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#aeeecb] fill-current" />
            <span>Call Next Farmer</span>
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Total Daily Tokens</p>
          <p className="text-3xl font-black text-[#012d1d]">{centreTokens.length}</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">Registered Bookings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Waiting in Queue</p>
          <p className="text-3xl font-black text-[#ba1a1a]">{waitingCount}</p>
          <p className="text-[11px] text-[#717973]">Est. {centre.estimatedWaitingTime}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">In Verification / Weighing</p>
          <p className="text-3xl font-black text-[#1b4332]">{processingCount}</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">At {centre.activeCounters} active counters</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Completed & Disbursed</p>
          <p className="text-3xl font-black text-[#2c694e]">{completedCount}</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">₹ {totalDisbursedRupees.toLocaleString()}</p>
        </div>
      </div>

      {/* Today's Procurement Summary & Active Counters Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Crop Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
            <h3 className="font-bold text-base text-[#012d1d]">Today's Procurement by Crop</h3>
            <button
              type="button"
              onClick={() => onNavigate('/operator/procurement-records')}
              className="text-xs font-bold text-[#2c694e] hover:underline cursor-pointer"
            >
              View Records →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {cropSummary.map((item) => (
              <div key={item.name} className="bg-[#f9faf6] p-3.5 rounded-2xl border border-[#c1c8c2]/40 space-y-1">
                <span className="text-xs font-bold text-[#717973]">{item.name}</span>
                <p className="text-lg font-black text-[#012d1d]">{item.quantity} Qtl</p>
                <p className="text-[10px] text-[#2c694e] font-semibold">{item.count} Tokens</p>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Status Overview */}
        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
            <h3 className="font-bold text-base text-[#012d1d]">Active Weighbridge Counters</h3>
            <span className="text-xs font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-0.5 rounded-md">
              {centre.activeCounters} / {centre.counters} Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Array.from({ length: centre.counters }).map((_, idx) => {
              const counterNum = idx + 1;
              const isActive = counterNum <= centre.activeCounters;
              return (
                <div
                  key={counterNum}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isActive
                      ? 'bg-[#f3f9f5] border-[#2c694e]/40'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold ${
                        isActive ? 'bg-[#1b4332] text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      C{counterNum}
                    </div>
                    <div>
                      <p className="font-extrabold text-[#012d1d]">Counter {counterNum}</p>
                      <p className="text-[10px] text-[#717973]">
                        {isActive ? 'Active Weighment Station' : 'Standby / Inactive'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#c1ecd4] text-[#002114]' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isActive ? 'Operational' : 'Offline'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('/operator/queue')}
          className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/60 hover:border-[#1b4332] text-center space-y-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <h4 className="font-extrabold text-xs text-[#012d1d]">Live Queue</h4>
          <p className="text-[10px] text-[#717973]">{waitingCount} Waiting</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/operator/token-list')}
          className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/60 hover:border-[#1b4332] text-center space-y-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <h4 className="font-extrabold text-xs text-[#012d1d]">Token Directory</h4>
          <p className="text-[10px] text-[#717973]">{centreTokens.length} Tokens</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/operator/procurement-records')}
          className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/60 hover:border-[#1b4332] text-center space-y-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <h4 className="font-extrabold text-xs text-[#012d1d]">Procurement Records</h4>
          <p className="text-[10px] text-[#717973]">{completedCount} Completed</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/operator/reports')}
          className="bg-white p-4 rounded-2xl border border-[#c1c8c2]/60 hover:border-[#1b4332] text-center space-y-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <h4 className="font-extrabold text-xs text-[#012d1d]">Centre Reports</h4>
          <p className="text-[10px] text-[#717973]">Daily Analytics</p>
        </button>
      </div>
    </div>
  );
};
