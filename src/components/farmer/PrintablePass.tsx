import React from 'react';
import { Token } from '../../types';

interface PrintablePassProps {
  token: Token;
}

export const PrintablePass: React.FC<PrintablePassProps> = ({ token }) => {
  if (!token) return null;

  return (
    <div className="hidden print:block print:w-full print:max-w-xl print:mx-auto print:p-6 print:bg-white print:text-[#012d1d] font-sans selection:bg-none">
      {/* 1. Header & Branding */}
      <div className="text-center pb-4 border-b-2 border-[#1b4332]">
        <h1 className="text-2xl font-black text-[#012d1d] tracking-tight">ANNSETU</h1>
        <p className="text-xs font-extrabold text-[#2c694e]">Smart Procurement Scheduling (SIH'26)</p>
        <p className="text-[10px] text-gray-600 font-medium mt-0.5">Govt. of India & State Agriculture Marketing Board</p>
      </div>

      {/* 2. Token & Status */}
      <div className="py-4 text-center border-b border-gray-300 space-y-2">
        <span className="text-xs font-black uppercase text-[#2c694e] tracking-wider">
          🎟️ DIGITAL PROCUREMENT PASS
        </span>

        <div className="p-4 bg-gray-50 border border-gray-300 rounded-2xl max-w-sm mx-auto">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            YOUR TOKEN
          </p>
          <p className="text-4xl font-black font-mono text-[#012d1d] tracking-wider mt-0.5">
            {token.tokenNumber}
          </p>
          <p className="text-xs font-extrabold text-emerald-700 mt-1">
            🟢 Booking Confirmed
          </p>
        </div>
      </div>

      {/* 3. Farmer & Booking Details */}
      <div className="py-4 border-b border-gray-300 space-y-3 text-xs">
        <div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">FARMER NAME</p>
          <p className="text-base font-black text-[#012d1d]">{token.farmerName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">🌾 CROP COMMODITY</p>
            <p className="font-extrabold text-[#012d1d] text-sm">{token.crop}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">⚖️ YIELD QUANTITY</p>
            <p className="font-extrabold text-[#2c694e] text-sm">{token.quantityQuintals} Quintals</p>
          </div>
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">📍 PROCUREMENT CENTRE</p>
          <p className="font-black text-[#012d1d] text-sm">{token.centreName}</p>
          <p className="text-[11px] text-gray-600 font-medium">{token.centreDistrict} District</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">📅 SCHEDULED DATE</p>
            <p className="font-bold text-[#012d1d]">{token.date}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">🕐 TIME SLOT</p>
            <p className="font-bold text-[#012d1d]">{token.timeSlot}</p>
          </div>
        </div>
      </div>

      {/* 4. Crisp QR Code */}
      <div className="py-4 text-center border-b border-gray-300 space-y-2">
        <div className="w-28 h-28 bg-white p-2 border-2 border-[#1b4332] rounded-2xl mx-auto flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="5" y="5" width="28" height="28" fill="#012d1d" rx="4" />
            <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
            <rect x="13" y="13" width="12" height="12" fill="#012d1d" rx="1" />

            <rect x="67" y="5" width="28" height="28" fill="#012d1d" rx="4" />
            <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
            <rect x="75" y="13" width="12" height="12" fill="#012d1d" rx="1" />

            <rect x="5" y="67" width="28" height="28" fill="#012d1d" rx="4" />
            <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
            <rect x="13" y="75" width="12" height="12" fill="#012d1d" rx="1" />

            <rect x="38" y="10" width="8" height="8" fill="#012d1d" />
            <rect x="50" y="15" width="10" height="6" fill="#012d1d" />
            <rect x="38" y="24" width="6" height="8" fill="#012d1d" />
            <rect x="48" y="24" width="12" height="6" fill="#012d1d" />
            <rect x="10" y="38" width="8" height="8" fill="#012d1d" />
            <rect x="24" y="44" width="8" height="12" fill="#012d1d" />
            <rect x="38" y="38" width="24" height="24" fill="#012d1d" rx="2" />
            <rect x="44" y="44" width="12" height="12" fill="#ffffff" rx="1" />
            <rect x="68" y="38" width="10" height="8" fill="#012d1d" />
            <rect x="82" y="44" width="8" height="12" fill="#012d1d" />
            <rect x="38" y="68" width="10" height="14" fill="#012d1d" />
            <rect x="52" y="72" width="12" height="8" fill="#012d1d" />
            <rect x="68" y="68" width="8" height="10" fill="#012d1d" />
            <rect x="80" y="74" width="10" height="14" fill="#012d1d" />
          </svg>
        </div>

        <p className="text-xs font-black text-[#012d1d] tracking-wider uppercase">
          SCAN AT CENTRE
        </p>
        <p className="text-[11px] text-gray-600 font-medium">
          Show this QR code at the procurement centre.
        </p>
      </div>

      {/* 5. Important Instructions & Footer */}
      <div className="pt-4 text-center space-y-2 text-xs">
        <p className="font-bold text-gray-800">
          💡 Please arrive 10–15 minutes before your scheduled time slot with your Kisan ID.
        </p>
        <div className="pt-3 border-t border-gray-300">
          <p className="font-black text-[#012d1d] tracking-wide">AnnSetu</p>
          <p className="text-[10px] text-gray-500 font-medium">Smart Queue. Smart Farming. Stronger India.</p>
        </div>
      </div>
    </div>
  );
};
