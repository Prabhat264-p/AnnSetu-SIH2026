import React, { useState } from 'react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Search,
  Plus,
  Wheat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DigitalTokenCard } from '../../components/farmer/DigitalTokenCard';

interface MyBookingsPageProps {
  onNavigate: (path: string) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onNavigate }) => {
  const { tokens, currentUser, t } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedTokenForPass, setSelectedTokenForPass] = useState<string | null>(null);

  const farmerTokens = tokens.filter((t) => t.farmerId === currentUser.id);

  const filteredTokens = farmerTokens.filter((token) => {
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED'].includes(token.status);
    if (filter === 'COMPLETED') return token.status === 'COMPLETED';
    return true;
  });

  const inspectingToken = tokens.find((t) => t.id === selectedTokenForPass);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight">
            {t('myBookings')}
          </h1>
          <p className="text-xs md:text-sm text-[#414844] mt-0.5">
            Your active digital passes, historical procurement records, and slot appointments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/farmer/centres')}
          className="bg-[#1b4332] hover:bg-[#012d1d] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Slot</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#eeeeeb] pb-2">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-[#012d1d] text-white shadow-2xs'
                : 'text-[#717973] hover:bg-[#f3f4f1] hover:text-[#012d1d]'
            }`}
          >
            {tab === 'ALL' ? 'All Tokens' : tab === 'ACTIVE' ? 'Active Slots' : 'Completed Procurement'}
          </button>
        ))}
      </div>

      {/* Token List */}
      <div className="space-y-4">
        {filteredTokens.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-[#c1c8c2]/50">
            <Ticket className="w-12 h-12 text-[#717973] mx-auto mb-3" />
            <h3 className="font-bold text-base text-[#012d1d]">No tokens found</h3>
            <p className="text-xs text-[#717973] mt-1 mb-4">
              You do not have any tokens matching this filter.
            </p>
            <button
              onClick={() => onNavigate('/farmer/centres')}
              className="bg-[#1b4332] text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Book Procurement Slot
            </button>
          </div>
        ) : (
          filteredTokens.map((tkn) => (
            <div
              key={tkn.id}
              className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-5 shadow-xs hover:border-[#1b4332] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm bg-[#f3f4f1] text-[#012d1d] px-2.5 py-0.5 rounded-lg border border-[#c1c8c2]/40">
                    {tkn.tokenNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      tkn.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tkn.status === 'WAITING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {tkn.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#012d1d]">{tkn.centreName}</h3>
                <p className="text-xs text-[#414844] flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2c694e]" />
                    {tkn.date} ({tkn.timeSlot})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Wheat className="w-3.5 h-3.5 text-[#2c694e]" />
                    {tkn.crop} ({tkn.quantityQuintals} Quintals)
                  </span>
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 md:justify-end">
                {tkn.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => onNavigate('/farmer/live-queue')}
                    className="bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    Live Queue (#{tkn.queuePosition})
                  </button>
                ) : (
                  <div className="text-right mr-2">
                    <p className="text-[10px] text-[#717973] uppercase font-bold">Total Payout</p>
                    <p className="text-xs font-bold text-[#2c694e]">
                      ₹ {tkn.procurementAmountRupees?.toLocaleString() || '1,02,375'}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedTokenForPass(tkn.id)}
                  className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#c1c8c2]/50 transition-colors"
                >
                  View Digital Pass
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal to inspect digital token pass */}
      {inspectingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-4 shadow-2xl relative">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelectedTokenForPass(null)}
                className="text-xs font-bold bg-[#f3f4f1] px-3 py-1 rounded-lg text-[#012d1d]"
              >
                Close Pass
              </button>
            </div>
            <DigitalTokenCard token={inspectingToken} />
          </div>
        </div>
      )}
    </div>
  );
};
