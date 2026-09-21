import React, { useState } from 'react';
import {
  Building2,
  Play,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OperatorLiveQueuePageProps {
  onNavigate: (path: string) => void;
}

import { getCentreSafe } from '../../utils/centreResolver';

export const OperatorLiveQueuePage: React.FC<OperatorLiveQueuePageProps> = ({
  onNavigate,
}) => {
  const {
    currentUser,
    centres,
    tokens,
    callNextFarmer,
    updateTokenStatus,
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

  const [filter, setFilter] = useState<string>('ACTIVE');
  const [search, setSearch] = useState<string>('');

  const filteredTokens = centreTokens.filter((tkn) => {
    const matchSearch =
      !search ||
      tkn.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      tkn.farmerName.toLowerCase().includes(search.toLowerCase());

    if (filter === 'ACTIVE') {
      return matchSearch && !['COMPLETED', 'CANCELLED'].includes(tkn.status);
    }
    if (filter === 'COMPLETED') {
      return matchSearch && tkn.status === 'COMPLETED';
    }
    return matchSearch;
  });

  const handleCallNext = () => {
    const called = callNextFarmer(centre.id);
    if (!called) {
      alert('No more waiting farmers in queue today!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans select-none">
      {/* Top Header & Centre State Controller */}
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
              Live Queue
            </h1>
          </div>
        </div>

        {/* Counter Stepper & Call Next */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f3f4f1] p-1.5 rounded-2xl border border-[#c1c8c2]/50">
            <span className="text-xs font-bold text-[#414844] px-2">Counters:</span>
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

      {/* Main Queue Management Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 md:p-5 border-b border-[#eeeeeb] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f9faf6]">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#012d1d]">Real-Time Queue Ledger</h3>
            <span className="text-xs font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-0.5 rounded-md">
              {filteredTokens.length} Farmers
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#717973]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search token # or farmer..."
                className="bg-white pl-8 pr-3 py-1.5 rounded-xl text-xs text-[#012d1d] border border-[#c1c8c2]/60 outline-none w-48"
              />
            </div>

            <div className="flex items-center bg-[#eeeeeb] p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'ACTIVE' ? 'bg-white text-[#012d1d] shadow-2xs' : 'text-[#717973]'
                }`}
              >
                Active Queue
              </button>
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'ALL' ? 'bg-white text-[#012d1d] shadow-2xs' : 'text-[#717973]'
                }`}
              >
                All Tokens
              </button>
            </div>
          </div>
        </div>

        {/* Tokens Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f3f4f1] text-[#717973] uppercase font-bold text-[10px] border-b border-[#eeeeeb]">
              <tr>
                <th className="px-4 py-3">Queue #</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Farmer Details</th>
                <th className="px-4 py-3">Crop / Qtl</th>
                <th className="px-4 py-3">Slot Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeeb]">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs font-bold text-[#717973]">
                    No active farmers in queue for this selection.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((tkn) => (
                  <tr key={tkn.id} className="hover:bg-[#f9faf6] transition-colors">
                    <td className="px-4 py-3 font-black text-sm text-[#012d1d]">
                      #{tkn.queuePosition > 0 ? tkn.queuePosition : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#012d1d]">
                      {tkn.tokenNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#012d1d]">{tkn.farmerName}</p>
                      <p className="text-[11px] text-[#717973]">{tkn.farmerMobile}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#012d1d]">{tkn.crop}</p>
                      <p className="text-[11px] text-[#2c694e] font-semibold">{tkn.quantityQuintals} Quintals</p>
                    </td>
                    <td className="px-4 py-3 text-[#414844]">
                      <p className="font-medium">{tkn.timeSlot}</p>
                      <p className="text-[10px] text-[#717973]">{tkn.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          tkn.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tkn.status === 'VERIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : tkn.status === 'PROCESSING'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tkn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tkn.status !== 'COMPLETED' && tkn.status !== 'CANCELLED' && tkn.status !== 'NO_SHOW' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onNavigate(`/operator/verification?tokenId=${tkn.id}`);
                              }}
                              className="bg-[#1b4332] hover:bg-[#012d1d] text-white px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              Verify & Weigh
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTokenStatus(tkn.id, 'COMPLETED', { moisturePercentage: 11.6 })}
                              className="bg-[#f3f4f1] hover:bg-[#c1ecd4] text-[#012d1d] px-2 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTokenStatus(tkn.id, 'NO_SHOW')}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1.5 rounded-xl text-[11px] font-bold transition-colors border border-amber-200 cursor-pointer"
                              title="Mark Farmer No-Show"
                            >
                              No-Show
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTokenStatus(tkn.id, 'CANCELLED')}
                              className="bg-red-50 hover:bg-red-100 text-red-800 px-2 py-1.5 rounded-xl text-[11px] font-bold transition-colors border border-red-200 cursor-pointer"
                              title="Cancel Token"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {tkn.status === 'COMPLETED' && (
                          <span className="text-[11px] font-bold text-[#2c694e] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                          </span>
                        )}
                        {tkn.status === 'NO_SHOW' && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            No-Show
                          </span>
                        )}
                        {tkn.status === 'CANCELLED' && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
