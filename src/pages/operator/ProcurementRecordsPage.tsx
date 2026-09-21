import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Download,
  Filter,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProcurementRecord } from '../../types';

import { getCentreSafe } from '../../utils/centreResolver';

interface ProcurementRecordsPageProps {
  onNavigate?: (path: string) => void;
}

export const ProcurementRecordsPage: React.FC<ProcurementRecordsPageProps> = ({
  onNavigate,
}) => {
  const { currentUser, centres, tokens, procurementRecords } = useApp();

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

  // Derive completed procurement records from tokens if procurementRecords is empty
  const completedTokens = tokens.filter(
    (t) => (t.centreId === centre.id || t.centreId === centre.officialId) && t.status === 'COMPLETED'
  );

  const displayRecords: ProcurementRecord[] =
    procurementRecords.length > 0
      ? procurementRecords.filter((r) => r.centreId === centre.id)
      : completedTokens.map((tkn, idx) => ({
          id: `rec_${tkn.id}`,
          tokenId: tkn.id,
          tokenNumber: tkn.tokenNumber,
          farmerName: tkn.farmerName,
          farmerMobile: tkn.farmerMobile,
          farmerVillage: tkn.farmerVillage,
          centreId: tkn.centreId,
          centreName: tkn.centreName,
          crop: tkn.crop,
          quantityQuintals: tkn.quantityQuintals,
          moisturePercentage: tkn.moisturePercentage || 11.5,
          qualityGrade: 'FAQ (Fair Average Quality)',
          mspRatePerQuintal: 2275,
          totalPayoutRupees: tkn.quantityQuintals * 2275,
          paymentStatus: 'PROCESSED',
          timestamp: tkn.completedAt || new Date().toISOString(),
          operatorId: 'usr_op_01',
        }));

  const [search, setSearch] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<ProcurementRecord | null>(null);

  const filteredRecords = displayRecords.filter((rec) => {
    const matchSearch =
      !search ||
      rec.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      rec.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      rec.farmerMobile.includes(search);

    const matchCrop =
      selectedCrop === 'ALL' || rec.crop.toLowerCase().includes(selectedCrop.toLowerCase());

    return matchSearch && matchCrop;
  });

  const totalQuantitySum = filteredRecords.reduce((sum, r) => sum + r.quantityQuintals, 0);
  const totalPayoutSum = filteredRecords.reduce((sum, r) => sum + r.totalPayoutRupees, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans select-none">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#012d1d] tracking-tight">
              Procurement Records
            </h1>
            <p className="text-xs text-[#717973] font-medium">
              Completed procurement transactions from this centre
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Exporting Official Procurement Ledger (CSV)...')}
          className="bg-[#1b4332] hover:bg-[#012d1d] text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#aeeecb]" />
          <span>Export Ledger</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Completed Transactions</p>
          <p className="text-3xl font-black text-[#012d1d]">{filteredRecords.length}</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">Farmers Served Today</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Total Net Weight Processed</p>
          <p className="text-3xl font-black text-[#1b4332]">{totalQuantitySum} Qtl</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">Verified Grain Weighment</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-1">
          <p className="text-[10px] text-[#717973] uppercase font-bold">Total MSP Settlement Value</p>
          <p className="text-3xl font-black text-[#2c694e]">₹ {totalPayoutSum.toLocaleString()}</p>
          <p className="text-[11px] text-[#2c694e] font-semibold">Scheduled Bank Transfers</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search record #, token # or farmer..."
            className="w-full bg-[#f9faf6] pl-9 pr-3 py-2 rounded-2xl text-xs text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-[#f3f4f1] text-[#012d1d] font-bold text-xs px-3 py-2 rounded-xl border border-[#c1c8c2]/60 outline-none cursor-pointer"
          >
            <option value="ALL">All Crops</option>
            <option value="Wheat">Wheat</option>
            <option value="Soybean">Soybean</option>
            <option value="Paddy">Paddy</option>
            <option value="Gram">Gram / Chana</option>
          </select>
        </div>
      </div>

      {/* Procurement Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f3f4f1] text-[#717973] uppercase font-bold text-[10px] border-b border-[#eeeeeb]">
              <tr>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Token #</th>
                <th className="px-4 py-3">Farmer Name</th>
                <th className="px-4 py-3">Crop</th>
                <th className="px-4 py-3">Net Weight</th>
                <th className="px-4 py-3">Moisture %</th>
                <th className="px-4 py-3">MSP Settlement (₹)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeeb]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs font-bold text-[#717973]">
                    No completed procurement records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#f9faf6] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#717973]">
                      {rec.id}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#012d1d]">
                      {rec.tokenNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#012d1d]">{rec.farmerName}</p>
                      <p className="text-[11px] text-[#717973]">{rec.farmerMobile}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#012d1d]">
                      {rec.crop}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#2c694e]">
                      {rec.quantityQuintals} Qtl
                    </td>
                    <td className="px-4 py-3 font-medium text-[#414844]">
                      {rec.moisturePercentage}%
                    </td>
                    <td className="px-4 py-3 font-black text-[#012d1d]">
                      ₹ {rec.totalPayoutRupees.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(rec)}
                        className="bg-[#f3f4f1] hover:bg-[#c1ecd4] text-[#012d1d] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer ml-auto border border-[#c1c8c2]/40"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2c694e]" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 relative border border-[#c1c8c2]/60">
            <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
              <div>
                <span className="text-[10px] font-mono bg-[#c1ecd4] text-[#002114] px-2 py-0.5 rounded font-bold">
                  {selectedRecord.tokenNumber}
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-1">Official Procurement Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 space-y-1">
                <span className="text-[10px] text-[#717973] font-bold block">FARMER & LOCATION</span>
                <p className="font-extrabold text-[#012d1d] text-sm">{selectedRecord.farmerName}</p>
                <p className="text-[#414844]">Mobile: {selectedRecord.farmerMobile}</p>
                <p className="text-[#414844]">Village: {selectedRecord.farmerVillage}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[10px] text-[#717973] font-bold block">CROP COMMODITY</span>
                  <p className="font-bold text-[#012d1d]">{selectedRecord.crop}</p>
                </div>

                <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[10px] text-[#717973] font-bold block">NET GRAIN WEIGHT</span>
                  <p className="font-bold text-[#2c694e]">{selectedRecord.quantityQuintals} Quintals</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[10px] text-[#717973] font-bold block">MOISTURE CONTENT</span>
                  <p className="font-bold text-[#012d1d]">{selectedRecord.moisturePercentage}%</p>
                </div>

                <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
                  <span className="text-[10px] text-[#717973] font-bold block">QUALITY GRADE</span>
                  <p className="font-bold text-[#012d1d]">{selectedRecord.qualityGrade}</p>
                </div>
              </div>

              <div className="bg-[#f3f9f5] p-3 rounded-2xl border border-[#2c694e]/40 space-y-1">
                <span className="text-[10px] text-[#2c694e] font-bold block">MSP SETTLEMENT AMOUNT</span>
                <p className="font-black text-[#012d1d] text-base">
                  ₹ {selectedRecord.totalPayoutRupees.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#717973]">Rate: ₹{selectedRecord.mspRatePerQuintal}/Qtl</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 bg-[#012d1d] text-white font-extrabold text-xs rounded-2xl cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
