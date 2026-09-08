import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Wheat,
  Scale,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  FileCheck,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Token } from '../../types';

interface FarmerVerificationPageProps {
  initialTokenId?: string;
  onNavigate: (path: string) => void;
}

import { getCentreSafe } from '../../utils/centreResolver';

export const FarmerVerificationPage: React.FC<FarmerVerificationPageProps> = ({
  initialTokenId,
  onNavigate,
}) => {
  const { currentUser, tokens, updateTokenStatus, centres } = useApp();

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

  // Default initial token selection if passed
  const initialToken =
    centreTokens.find((t) => t.id === initialTokenId) ||
    centreTokens.find((t) => ['WAITING', 'CALLED', 'VERIFIED', 'PROCESSING'].includes(t.status)) ||
    null;

  const [tokenSearchInput, setTokenSearchInput] = useState<string>(
    initialToken ? initialToken.tokenNumber : ''
  );
  const [activeToken, setActiveToken] = useState<Token | null>(initialToken);
  const [searchError, setSearchError] = useState<string>('');

  // Step 3: Moisture & Quality
  const [moisture, setMoisture] = useState<number>(11.5);
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'FAQ (Fair Average Quality)'>(
    'FAQ (Fair Average Quality)'
  );

  // Step 4: Weighbridge Gross & Tare
  const [grossWeight, setGrossWeight] = useState<number>(activeToken ? activeToken.quantityQuintals + 12 : 50);
  const [tareWeight, setTareWeight] = useState<number>(12);
  const [counter, setCounter] = useState<number>(1);

  // Confirmation Modal & Done State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [completedToken, setCompletedToken] = useState<Token | null>(null);

  // Auto calculate net weight
  const netWeight = Math.max(0, grossWeight - tareWeight);

  const mspRate = 2275; // ₹/Qtl
  const totalPayout = netWeight * mspRate;

  useEffect(() => {
    if (activeToken) {
      setGrossWeight(activeToken.quantityQuintals + tareWeight);
    }
  }, [activeToken]);

  const handleFetchToken = () => {
    setSearchError('');
    if (!tokenSearchInput.trim()) {
      setSearchError('Please enter a valid token number.');
      return;
    }

    const found = centreTokens.find(
      (t) => t.tokenNumber.toUpperCase() === tokenSearchInput.trim().toUpperCase()
    );

    if (found) {
      setActiveToken(found);
    } else {
      setActiveToken(null);
      setSearchError(`No token record found matching "${tokenSearchInput}". Please verify token number.`);
    }
  };

  const handleVerifyFarmerIdentity = () => {
    if (!activeToken) return;
    updateTokenStatus(activeToken.id, 'VERIFIED', {
      moisturePercentage: moisture,
      qualityGrade,
      counterAssigned: counter,
    });
  };

  const handleConfirmProcurementCompletion = () => {
    if (!activeToken) return;

    updateTokenStatus(activeToken.id, 'COMPLETED', {
      moisturePercentage: moisture,
      qualityGrade,
      counterAssigned: counter,
    });

    setShowConfirmModal(false);
    setIsDone(true);
    setCompletedToken({
      ...activeToken,
      status: 'COMPLETED',
      moisturePercentage: moisture,
      procurementAmountRupees: totalPayout,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 font-sans select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#012d1d] tracking-tight">
            🛡️ Farmer Verification & Weighbridge Intake
          </h1>
          <p className="text-xs text-[#717973] mt-0.5">
            Single token verification workflow for {centre.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/operator/queue')}
          className="text-xs font-extrabold bg-white text-[#012d1d] px-4 py-2 rounded-xl border border-[#c1c8c2]/50 hover:bg-[#f3f4f1] cursor-pointer"
        >
          ← Live Queue
        </button>
      </div>

      {/* STEP 1: Search / Fetch Token */}
      <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-2">
        <label className="text-xs font-bold text-[#717973] block pl-1">
          STEP 1 — SEARCH & FETCH FARMER TOKEN RECORD
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#717973] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tokenSearchInput}
              onChange={(e) => setTokenSearchInput(e.target.value)}
              placeholder="Enter token number (e.g. WHT-08432 or WHT-12345)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs font-bold text-[#012d1d] bg-[#f9faf6] rounded-2xl border border-[#c1c8c2]/60 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleFetchToken}
            className="bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow-xs cursor-pointer"
          >
            Fetch Token
          </button>
        </div>

        {searchError && (
          <p className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1 pt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {searchError}
          </p>
        )}
      </div>

      {/* COMPLETED SUCCESS STATE */}
      {isDone && completedToken ? (
        <div className="bg-white p-8 rounded-3xl border-2 border-[#2c694e] shadow-xl text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-[#c1ecd4] text-[#002114] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-[#012d1d]" />
          </div>
          <h2 className="text-2xl font-black text-[#012d1d]">
            Procurement Successfully Completed!
          </h2>
          <p className="text-xs text-[#717973] max-w-md mx-auto">
            Token <strong className="font-mono text-[#012d1d]">{completedToken.tokenNumber}</strong> for{' '}
            <strong className="text-[#012d1d]">{completedToken.farmerName}</strong> has been verified, weighed, and saved into the official procurement ledger.
          </p>

          <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 max-w-sm mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#717973]">Net Grain Weight</span>
              <span className="font-black text-[#012d1d]">{netWeight} Quintals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#717973]">Moisture Content</span>
              <span className="font-bold text-[#2c694e]">{moisture}% (Standard ≤12%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#717973]">MSP Rate</span>
              <span className="font-bold text-[#012d1d]">₹ 2,275 / Qtl</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#eeeeeb] font-black text-sm">
              <span className="text-[#012d1d]">Calculated Settlement</span>
              <span className="text-[#2c694e]">₹ {totalPayout.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-[#f3f4f1] text-[#012d1d] font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-[#c1c8c2]/50 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#2c694e]" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDone(false);
                setTokenSearchInput('');
                setActiveToken(null);
                onNavigate('/operator/queue');
              }}
              className="bg-[#1b4332] hover:bg-[#012d1d] text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-xs cursor-pointer"
            >
              Return to Live Queue →
            </button>
          </div>
        </div>
      ) : activeToken ? (
        <div className="space-y-6">
          {/* STEP 2: Farmer & Booking Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-[#f3f4f1] text-[#012d1d] px-2 py-0.5 rounded font-bold">
                    {activeToken.tokenNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    {activeToken.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#012d1d] mt-0.5">
                  {activeToken.farmerName}
                </h3>
                <p className="text-xs text-[#717973]">{activeToken.farmerMobile} • {activeToken.farmerVillage}</p>
              </div>
            </div>

            <div className="bg-[#f9faf6] px-4 py-2.5 rounded-2xl text-right border border-[#c1c8c2]/40">
              <p className="text-[10px] text-[#717973] uppercase font-bold">Scheduled Booking</p>
              <p className="font-extrabold text-xs text-[#012d1d]">
                {activeToken.crop} • {activeToken.quantityQuintals} Quintals
              </p>
              <p className="text-[10px] text-[#2c694e] font-semibold">{activeToken.timeSlot}</p>
            </div>
          </div>

          {/* Form Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STEP 3: Grain Quality & Moisture */}
            <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#012d1d] flex items-center gap-2 border-b border-[#eeeeeb] pb-2">
                <Wheat className="w-4 h-4 text-[#2c694e]" />
                <span>STEP 3 — Grain Quality & Moisture</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-[#717973] mb-1 block">
                  Moisture Content (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full bg-[#f9faf6] px-3.5 py-2.5 rounded-2xl font-bold text-sm text-[#012d1d] outline-none border border-[#c1c8c2]/60"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2c694e]">
                    {moisture <= 12 ? 'Passed (≤12%)' : 'High Moisture'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#717973] mb-1 block">
                  Quality Standard Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full bg-[#f9faf6] px-3.5 py-2.5 rounded-2xl font-bold text-xs text-[#012d1d] outline-none border border-[#c1c8c2]/60 cursor-pointer"
                >
                  <option value="FAQ (Fair Average Quality)">FAQ (Fair Average Quality)</option>
                  <option value="A">Grade A (Premium Grain)</option>
                  <option value="B">Grade B (Standard Grain)</option>
                </select>
              </div>
            </div>

            {/* STEP 4: Weighbridge Gross/Tare/Net Calculation */}
            <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#012d1d] flex items-center gap-2 border-b border-[#eeeeeb] pb-2">
                <Scale className="w-4 h-4 text-[#2c694e]" />
                <span>STEP 4 — Weighbridge Net Weight</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-[#717973] mb-1 block">
                  Assigned Counter
                </label>
                <select
                  value={counter}
                  onChange={(e) => setCounter(Number(e.target.value))}
                  className="w-full bg-[#f9faf6] px-3.5 py-2 rounded-2xl font-bold text-xs text-[#012d1d] outline-none border border-[#c1c8c2]/60 cursor-pointer"
                >
                  <option value={1}>Counter 1 (North Weighbridge)</option>
                  <option value={2}>Counter 2 (Central Weighbridge)</option>
                  <option value={3}>Counter 3 (South Weighbridge)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-[#717973] mb-1 block">Gross Weight (Qtl)</label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full bg-[#f9faf6] px-3 py-2 rounded-xl font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#717973] mb-1 block">Tare Weight (Qtl)</label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full bg-[#f9faf6] px-3 py-2 rounded-xl font-bold text-[#012d1d] border border-[#c1c8c2]/60 outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#f3f9f5] p-3 rounded-2xl border border-[#2c694e]/40 flex justify-between items-center">
                <span className="text-xs font-bold text-[#717973]">Calculated Net Weight:</span>
                <span className="font-black text-[#012d1d] text-base">{netWeight} Quintals</span>
              </div>
            </div>
          </div>

          {/* STEP 5: Settlement & Authorization */}
          <div className="bg-[#012d1d] text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#aeeecb] uppercase font-bold">Calculated MSP Settlement</p>
              <p className="text-2xl font-black text-[#e9c46a] mt-0.5">
                ₹ {totalPayout.toLocaleString()}{' '}
                <span className="text-xs text-white font-medium">
                  ({netWeight} Qtl @ ₹{mspRate}/Qtl)
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="bg-[#e9c46a] hover:bg-[#dfb552] text-[#002114] font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Authorize & Complete Procurement</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State when no active token selected */
        <div className="bg-white p-12 rounded-3xl border border-[#c1c8c2]/60 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f3f4f1] text-[#717973] flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-[#012d1d]">Enter a valid token to begin verification</h3>
          <p className="text-xs text-[#717973] max-w-sm mx-auto">
            Search a token number in Step 1 or select a farmer directly from the Live Queue.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && activeToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 border border-[#c1c8c2]/60 text-center">
            <div className="w-12 h-12 rounded-full bg-[#c1ecd4] text-[#002114] flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6 text-[#012d1d]" />
            </div>

            <div>
              <h3 className="font-black text-lg text-[#012d1d]">Confirm Procurement Completion?</h3>
              <p className="text-xs text-[#717973] mt-1">
                Are you sure you want to authorize procurement for Token <strong className="font-mono text-[#012d1d]">{activeToken.tokenNumber}</strong>?
              </p>
            </div>

            <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#717973]">Farmer</span>
                <span className="font-bold text-[#012d1d]">{activeToken.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717973]">Net Grain Weight</span>
                <span className="font-bold text-[#2c694e]">{netWeight} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717973]">Settlement Amount</span>
                <span className="font-black text-[#012d1d]">₹ {totalPayout.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-white text-[#717973] font-bold text-xs rounded-xl border border-[#c1c8c2]/60 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmProcurementCompletion}
                className="flex-1 py-2.5 bg-[#1b4332] text-white font-black text-xs rounded-xl cursor-pointer"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
