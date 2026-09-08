import React from 'react';
import {
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Tractor,
  Wheat,
  ShieldCheck,
} from 'lucide-react';
import { Token } from '../../types';
import { useApp } from '../../context/AppContext';

interface DigitalTokenCardProps {
  token: Token;
  onViewLiveQueue?: () => void;
  showFullDetails?: boolean;
}

export const DigitalTokenCard: React.FC<DigitalTokenCardProps> = ({
  token,
  onViewLiveQueue,
  showFullDetails = true,
}) => {
  const { t } = useApp();

  if (!token) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const passContent = `=====================================================
ANNSETU DIGITAL PROCUREMENT TOKEN (SIH26032)
Govt. of India & State Agriculture Marketing Board
=====================================================
Token Number : ${token.tokenNumber}
Status       : ${token.status}
Farmer Name  : ${token.farmerName}
Proc. Centre : ${token.centreName}
District     : ${token.centreDistrict}
Crop / Yield : ${token.crop} (${token.quantityQuintals} Quintals)
Slot Date    : ${token.date}
Time Slot    : ${token.timeSlot}
Current Queue: Position #${token.queuePosition}
Est. Wait    : ${token.estimatedWaitFormatted}
Helpline     : 1800-180-1551 (Toll-Free)
=====================================================`;

    const blob = new Blob([passContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AnnSetu_Token_${token.tokenNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'SCHEDULED':
        return { bg: 'bg-[#aeeecb]', text: 'text-[#002114]', border: 'border-[#2c694e]/30', label: '🟢 Booking Confirmed' };
      case 'WAITING':
        return { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', border: 'border-amber-400', label: '🟡 Turn Approaching' };
      case 'VERIFIED':
        return { bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]', border: 'border-blue-300', label: '🔵 Documents Verified' };
      case 'PROCESSING':
        return { bg: 'bg-[#e0e7ff]', text: 'text-[#3730a3]', border: 'border-indigo-300', label: '🟣 At Weighbridge' };
      case 'COMPLETED':
        return { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', border: 'border-emerald-500', label: '✓ Visit Completed' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: status };
    }
  };

  const statusBadge = getStatusBadge(token.status);

  return (
    <div className="bg-white rounded-3xl border-2 border-[#1b4332]/20 overflow-hidden shadow-xl transition-all w-full select-none print:hidden">
      {/* 1. Header & Big Token ID */}
      <div className="bg-[#012d1d] text-white p-5 relative overflow-hidden">
        <Wheat className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-[#c1ecd4] flex items-center justify-center font-bold">
              <Tractor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">🎟️ Procurement Pass</h3>
              <p className="text-[10px] text-[#c1ecd4] font-medium">Govt APMC Platform</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Most Prominent Token ID Display */}
        <div className="mt-4 p-4 bg-[#1b4332]/90 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#aeeecb] font-black tracking-wider uppercase">
              YOUR TOKEN
            </p>
            <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider mt-0.5">
              {token.tokenNumber}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-[#aeeecb] font-black tracking-wider uppercase">
              FARMER
            </p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">
              {token.farmerName}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Ticket Body */}
      <div className="p-5 sm:p-6 relative bg-white space-y-5">
        {/* Decorative Ticket Punch Notches */}
        <div className="absolute -top-3.5 -left-3.5 w-7 h-7 bg-[#f9faf6] rounded-full border-r border-[#c1c8c2]"></div>
        <div className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-[#f9faf6] rounded-full border-l border-[#c1c8c2]"></div>

        {/* Booking Details Grid */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-[#717973] border-b border-[#eeeeeb] pb-1.5">
            BOOKING DETAILS
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
              <span className="text-[10px] text-[#717973] font-bold block">🌾 Crop</span>
              <span className="font-black text-[#012d1d] text-xs sm:text-sm block mt-0.5">{token.crop}</span>
            </div>

            <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
              <span className="text-[10px] text-[#717973] font-bold block">⚖️ Quantity</span>
              <span className="font-black text-[#2c694e] text-xs sm:text-sm block mt-0.5">{token.quantityQuintals} Quintals</span>
            </div>
          </div>

          <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40 text-xs">
            <span className="text-[10px] text-[#717973] font-bold block">📍 Procurement Centre</span>
            <span className="font-black text-[#012d1d] block mt-0.5">{token.centreName}</span>
            <span className="text-[11px] text-[#717973] block">{token.centreDistrict} District</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
              <span className="text-[10px] text-[#717973] font-bold block">📅 Date</span>
              <span className="font-bold text-[#012d1d] block mt-0.5">{token.date}</span>
            </div>

            <div className="bg-[#f9faf6] p-3 rounded-2xl border border-[#c1c8c2]/40">
              <span className="text-[10px] text-[#717973] font-bold block">🕐 Time Slot</span>
              <span className="font-bold text-[#012d1d] block mt-0.5">{token.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* 3. QR Code Section */}
        {showFullDetails && (
          <div className="pt-3 border-t border-[#eeeeeb] space-y-4">
            <div className="flex items-center gap-4 bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40">
              {/* Crisp SVG QR Code */}
              <div className="w-20 h-20 bg-white p-1.5 border-2 border-[#1b4332] rounded-2xl flex flex-col items-center justify-center shadow-2xs shrink-0">
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

              <div>
                <p className="text-xs font-black text-[#012d1d] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#2c694e]" />
                  <span>SCAN AT CENTRE</span>
                </p>
                <p className="text-[11px] text-[#717973] font-medium leading-tight mt-0.5">
                  Show this QR code at the procurement centre.
                </p>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="grid grid-cols-2 gap-3 print:hidden">
              <button
                type="button"
                onClick={handleDownload}
                className="h-[44px] bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] text-xs font-black rounded-xl border border-[#c1c8c2]/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-[#2c694e]" />
                <span>Download Pass</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="h-[44px] bg-[#1b4332] hover:bg-[#012d1d] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
