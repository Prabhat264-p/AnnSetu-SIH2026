import React, { useState } from 'react';
import {
  Search,
  Filter,
  Ticket,
  Calendar,
  Eye,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Token } from '../../types';

import { getCentreSafe } from '../../utils/centreResolver';

interface OperatorTokenListPageProps {
  onNavigate: (path: string) => void;
}

export const OperatorTokenListPage: React.FC<OperatorTokenListPageProps> = ({
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

  const [search, setSearch] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTokenDetail, setSelectedTokenDetail] = useState<Token | null>(null);

  const filteredTokens = centreTokens.filter((tkn) => {
    const matchSearch =
      !search ||
      tkn.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      tkn.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      tkn.farmerMobile.includes(search);

    const matchCrop = selectedCrop === 'ALL' || tkn.crop.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || tkn.status === selectedStatus;

    return matchSearch && matchCrop && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans select-none">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#012d1d] tracking-tight">
              Token List
            </h1>
            <p className="text-xs text-[#717973] font-medium">
              Search and inspect all active and historical procurement tokens for {centre.name}
            </p>
          </div>
        </div>

        <span className="text-xs font-black bg-[#c1ecd4] text-[#002114] px-3 py-1.5 rounded-xl border border-[#aeeecb]">
          {filteredTokens.length} Total Tokens
        </span>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by token #, farmer name or mobile..."
            className="w-full bg-[#f9faf6] pl-9 pr-3 py-2 rounded-2xl text-xs text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Crop Filter */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-[#f3f4f1] text-[#012d1d] font-bold text-xs px-3 py-2 rounded-xl border border-[#c1c8c2]/60 outline-none cursor-pointer"
          >
            <option value="ALL">🌾 All Crops</option>
            <option value="Wheat">Wheat (गेहूं)</option>
            <option value="Soybean">Soybean (सोयाबीन)</option>
            <option value="Paddy">Paddy (धान)</option>
            <option value="Gram">Gram / Chana (चना)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#f3f4f1] text-[#012d1d] font-bold text-xs px-3 py-2 rounded-xl border border-[#c1c8c2]/60 outline-none cursor-pointer"
          >
            <option value="ALL">🏷️ All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="NO_SHOW">NO_SHOW</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Tokens Directory Table */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f3f4f1] text-[#717973] uppercase font-bold text-[10px] border-b border-[#eeeeeb]">
              <tr>
                <th className="px-4 py-3">Token #</th>
                <th className="px-4 py-3">Farmer Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Crop / Yield</th>
                <th className="px-4 py-3">Slot Date & Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeeb]">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs font-bold text-[#717973]">
                    No tokens match the search query or selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((tkn) => (
                  <tr key={tkn.id} className="hover:bg-[#f9faf6] transition-colors">
                    <td className="px-4 py-3 font-mono font-black text-[#012d1d]">
                      {tkn.tokenNumber}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#012d1d]">
                      {tkn.farmerName}
                    </td>
                    <td className="px-4 py-3 text-[#717973]">
                      {tkn.farmerMobile}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#012d1d]">{tkn.crop}</span>
                      <span className="text-[11px] text-[#2c694e] font-semibold block">
                        {tkn.quantityQuintals} Quintals
                      </span>
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
                            : tkn.status === 'NO_SHOW'
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tkn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTokenDetail(tkn)}
                          className="bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer border border-[#c1c8c2]/50"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2c694e]" />
                          <span>Inspect</span>
                        </button>
                        {tkn.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => onNavigate(`/operator/verification?tokenId=${tkn.id}`)}
                            className="bg-[#1b4332] text-white px-2.5 py-1 rounded-xl font-bold cursor-pointer hover:bg-[#012d1d]"
                          >
                            Verify →
                          </button>
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

      {/* Inspection Modal */}
      {selectedTokenDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 relative border border-[#c1c8c2]/60">
            <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
              <div>
                <span className="text-[10px] font-mono bg-[#f3f4f1] text-[#012d1d] px-2 py-0.5 rounded font-bold">
                  {selectedTokenDetail.tokenNumber}
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-1">Token Full Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTokenDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 space-y-1">
                <span className="text-[10px] text-[#717973] font-bold block">FARMER INFORMATION</span>
                <p className="font-extrabold text-[#012d1d] text-sm">{selectedTokenDetail.farmerName}</p>
                <p className="text-[#414844]">Mobile: {selectedTokenDetail.farmerMobile}</p>
                <p className="text-[#414844]">Village: {selectedTokenDetail.farmerVillage}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[10px] text-[#717973] font-bold block">CROP</span>
                  <p className="font-bold text-[#012d1d]">{selectedTokenDetail.crop}</p>
                </div>

                <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[10px] text-[#717973] font-bold block">QUANTITY</span>
                  <p className="font-bold text-[#2c694e]">{selectedTokenDetail.quantityQuintals} Quintals</p>
                </div>
              </div>

              <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 space-y-1">
                <span className="text-[10px] text-[#717973] font-bold block">SLOT & TIME</span>
                <p className="font-bold text-[#012d1d]">{selectedTokenDetail.date} ({selectedTokenDetail.timeSlot})</p>
                <p className="text-[#414844]">Centre: {selectedTokenDetail.centreName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTokenDetail(null)}
              className="w-full py-2.5 bg-[#012d1d] text-white font-extrabold text-xs rounded-2xl cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
