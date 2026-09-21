import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Wheat,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  Building2,
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Token } from '../../types';
import { UniversalCropSelector } from '../../components/farmer/UniversalCropSelector';
import { UniversalQuantityInput } from '../../components/farmer/UniversalQuantityInput';
import { getTodayNormalized, normalizeDate, getQuickDates, formatDisplayDate } from '../../utils/dateUtils';

import { getCentreSafe } from '../../utils/centreResolver';

interface ChooseSlotPageProps {
  centreId: string;
  onNavigate: (path: string) => void;
  onBookingSuccess: (token: Token) => void;
}

export const ChooseSlotPage: React.FC<ChooseSlotPageProps> = ({
  centreId,
  onNavigate,
  onBookingSuccess,
}) => {
  const { centres, bookSlot, farmerProfile, language, t } = useApp();

  // Read initial date from URL query parameter or fallback to today
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialDateStr = useMemo(() => normalizeDate(urlParams.get('date')), [urlParams]);
  const initialDateObj = useMemo(() => {
    const [y, m, d] = initialDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [initialDateStr]);

  // Step 1: Crop, Step 2: Quantity, Step 3: Time, Step 4: Confirm (Centre is pre-selected)
  const [step, setStep] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [quantity, setQuantity] = useState<number>(25);
  const [selectedCentreId, setSelectedCentreId] = useState<string>(centreId || 'cnt_sinnar');
  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Calendar month state (Dynamic year and month)
  const [currentYear, setCurrentYear] = useState<number>(initialDateObj.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialDateObj.getMonth()); // 0-indexed

  const selectedCentre = getCentreSafe(selectedCentreId || centreId, centres);

  if (!selectedCentre) {
    return (
      <div className="p-8 text-center font-sans max-w-xl mx-auto my-12 bg-white rounded-3xl border border-[#c1c8c2]/60 shadow-sm">
        <h3 className="text-base font-black text-[#012d1d]">Centre information unavailable</h3>
        <p className="text-xs text-[#717973] mt-1">Please select a valid procurement centre to book a slot.</p>
        <button
          onClick={() => onNavigate('/farmer/centres')}
          className="mt-4 bg-[#1b4332] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          Find Procurement Centre
        </button>
      </div>
    );
  }

  const quickDates = useMemo(() => getQuickDates(selectedDate), [selectedDate]);

  // Dynamic Time slots generator based on date
  const getTimeSlotsForDate = (dateStr: string) => {
    const dayNum = parseInt(dateStr.split('-')[2] || '5', 10);
    
    if (dayNum % 3 === 0) {
      return [
        { slot: '08:30 AM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
        { slot: '10:00 AM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
        { slot: '11:30 AM', status: 'Few slots', color: 'bg-amber-100 text-amber-800' },
        { slot: '01:30 PM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
        { slot: '03:00 PM', status: 'Full', color: 'bg-red-100 text-red-800' },
      ];
    }
    
    if (dayNum % 2 === 0) {
      return [
        { slot: '09:00 AM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
        { slot: '10:30 AM', status: 'Few slots', color: 'bg-amber-100 text-amber-800' },
        { slot: '12:00 PM', status: 'Full', color: 'bg-red-100 text-red-800' },
        { slot: '02:00 PM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
        { slot: '03:30 PM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
      ];
    }

    return [
      { slot: '09:00 AM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
      { slot: '10:30 AM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
      { slot: '12:00 PM', status: 'Few slots', color: 'bg-amber-100 text-amber-800' },
      { slot: '02:00 PM', status: 'Available', color: 'bg-emerald-100 text-emerald-800' },
      { slot: '03:30 PM', status: 'Full', color: 'bg-red-100 text-red-800' },
    ];
  };

  const currentSlots = getTimeSlotsForDate(selectedDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatFormattedDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${day} ${monthNames[monthIdx]} ${year}`;
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const getCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (currentMonthIndex + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
      
      let status = 'Available';
      if (d === 8 || d === 15 || d === 22 || d === 29) status = 'Closed';
      else if (d === 10 || d === 18) status = 'Full';
      else if (d === 6 || d === 14) status = 'Few';

      days.push({ day: d, fullDate, status });
    }
    return days;
  };

  const handleFinalConfirm = () => {
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = bookSlot({
        centreId: selectedCentre.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        crop: selectedCrop,
        quantityQuintals: Number(quantity),
      });

      setIsSubmitting(false);
      if (result.success && result.token) {
        onBookingSuccess(result.token);
        onNavigate('/farmer/token-confirmation');
      } else {
        setErrorMsg(result.error || 'Unable to book turn right now. Please try again.');
      }
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 font-sans select-none">
      {/* 1. Header & Pre-Selected Centre Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate(`/farmer/centre-details?centreId=${selectedCentre.id}`)}
            className="flex items-center gap-2 text-xs font-black text-[#012d1d] hover:text-[#2c694e] bg-white px-3.5 py-2 rounded-xl border border-[#c1c8c2]/60 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Centre Details</span>
          </button>

          <span className="text-xs font-extrabold text-[#012d1d] bg-[#f3f4f1] px-3 py-1 rounded-xl border border-[#c1c8c2]/50">
            Booking Turn
          </span>
        </div>

        {/* Selected Centre Callout Card */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#2c694e]/40 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-5 h-5 text-[#2c694e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#012d1d]">{selectedCentre.name}</span>
                <span className="text-[10px] font-black bg-[#2c694e] text-white px-2 py-0.5 rounded">
                  ✓ Centre Selected
                </span>
              </div>
              <p className="text-xs text-[#717973] font-medium">{selectedCentre.address} • {selectedCentre.distanceKm} km away</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowChangeModal(true)}
            className="text-xs font-extrabold text-[#2c694e] hover:underline cursor-pointer shrink-0"
          >
            [ Change Centre ]
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="bg-white p-3 rounded-2xl border border-[#c1c8c2]/60 shadow-xs flex items-center justify-between">
          {[
            { num: 1, label: 'Crop' },
            { num: 2, label: 'Quantity' },
            { num: 3, label: 'Time' },
            { num: 4, label: 'Confirm' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  step === s.num
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : step > s.num
                    ? 'bg-[#c1ecd4] text-[#002114]'
                    : 'bg-[#f3f4f1] text-[#717973]'
                }`}
              >
                {s.num}
              </div>
              <span className={`text-xs font-extrabold ${step === s.num ? 'text-[#012d1d]' : 'text-[#717973]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Select Crop */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c1c8c2]/60 shadow-md space-y-6 animate-in fade-in">
          <UniversalCropSelector
            selectedCrop={selectedCrop}
            onSelectCrop={(c) => setSelectedCrop(c)}
          />

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#eeeeeb]">
            <button
              type="button"
              onClick={() => onNavigate(`/farmer/centre-details?centreId=${selectedCentre.id}`)}
              className="w-full sm:flex-1 h-[52px] bg-white border border-[#1b4332] text-[#012d1d] hover:bg-[#f3f4f1] font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>← Back to Centre Details</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:flex-1 h-[52px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
            >
              <span>Next: Enter Quantity →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Enter Quantity */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c1c8c2]/60 shadow-md space-y-6 animate-in fade-in">
          <UniversalQuantityInput
            crop={selectedCrop}
            quantity={quantity}
            onChangeQuantity={(val) => setQuantity(val)}
          />

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#eeeeeb]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:flex-1 h-[52px] bg-white border border-[#1b4332] text-[#012d1d] hover:bg-[#f3f4f1] font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>← Back to Crop</span>
            </button>

            <button
              type="button"
              disabled={!quantity || quantity <= 0}
              onClick={() => setStep(3)}
              className="w-full sm:flex-1 h-[52px] bg-[#1b4332] hover:bg-[#012d1d] disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
            >
              <span>Next: Choose Time Slot →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Choose Date & Time Slot */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c1c8c2]/60 shadow-md space-y-6 animate-in fade-in">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-[#012d1d]">
              Choose your time slot
            </h3>
            <p className="text-xs text-[#717973] font-medium">
              {selectedCentre.name} • {quantity} Qtl {selectedCrop}
            </p>
          </div>

          {/* Quick Dates Grid + Choose Another Date Button */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#717973] block">
              DATE SELECTION
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickDates.map((item) => (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.date);
                    const slots = getTimeSlotsForDate(item.date);
                    const avail = slots.find(s => s.status !== 'Full');
                    if (avail) setSelectedTimeSlot(avail.slot);
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                    selectedDate === item.date
                      ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                      : 'bg-[#f9faf6] text-[#012d1d] border-[#c1c8c2]/60 hover:bg-[#f3f4f1]'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCalendarModal(true)}
                className="py-2.5 px-3 rounded-2xl text-xs font-black text-[#2c694e] bg-[#f3f9f5] border border-[#2c694e]/40 hover:bg-[#e8f5ed] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Choose another date</span>
              </button>
            </div>
          </div>

          {/* Currently Selected Date Callout */}
          <div className="bg-[#f9faf6] p-3.5 rounded-2xl border border-[#c1c8c2]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2c694e]" />
              <span className="text-xs font-bold text-[#717973]">Selected Date:</span>
              <span className="text-xs font-black text-[#012d1d]">{formatFormattedDate(selectedDate)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              className="text-[11px] font-black text-[#2c694e] hover:underline cursor-pointer"
            >
              Change Date
            </button>
          </div>

          {/* Time Slots Responsive Cards Grid */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#717973] block">
              AVAILABLE TIME SLOTS
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentSlots.map((ts) => {
                const isSelected = selectedTimeSlot === ts.slot;
                const isFull = ts.status === 'Full';

                return (
                  <button
                    key={ts.slot}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedTimeSlot(ts.slot)}
                    className={`h-[98px] p-3 rounded-2xl border-2 transition-all flex flex-col justify-between text-center relative cursor-pointer ${
                      isSelected
                        ? 'border-[#2c694e] bg-[#f3f9f5] ring-2 ring-[#2c694e]/30 shadow-md scale-[1.02]'
                        : isFull
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-[#c1c8c2]/60 bg-white hover:border-[#1b4332] hover:shadow-2xs'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#2c694e] text-white p-0.5 rounded-full text-[9px] font-black shadow-2xs">
                        ✓
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <Clock className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#2c694e]' : 'text-[#717973]'}`} />
                      <span className="font-black text-lg sm:text-xl text-[#012d1d] tracking-tight">{ts.slot}</span>
                    </div>

                    <div className="w-full text-center">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${ts.color}`}>
                        {ts.status === 'Available' ? 'Available' : ts.status === 'Few slots' ? 'Few slots' : 'Full'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Side-by-Side Navigation */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#eeeeeb]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:flex-1 h-[52px] bg-white border border-[#1b4332] text-[#012d1d] hover:bg-[#f3f4f1] font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>← Back to Quantity</span>
            </button>

            <button
              type="button"
              disabled={!selectedTimeSlot}
              onClick={() => setStep(4)}
              className="w-full sm:flex-1 h-[52px] bg-[#1b4332] hover:bg-[#012d1d] disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
            >
              <span>Next: Review Booking →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm Booking */}
      {step === 4 && (
        <div className="bg-[#012d1d] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 animate-in fade-in">
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-[#aeeecb] uppercase tracking-wider">
              Step 4 of 4 • Final Confirmation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              REVIEW YOUR BOOKING
            </h2>
            <p className="text-xs text-[#c1ecd4]">Please review your turn details before generating your token pass.</p>
          </div>

          <div className="bg-white/10 p-5 rounded-2xl border border-white/15 space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#aeeecb] font-bold">Crop Commodity:</span>
              <span className="font-extrabold text-white">{selectedCrop}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#aeeecb] font-bold">Yield Quantity:</span>
              <span className="font-extrabold text-[#e9c46a] text-sm">{quantity} Quintals</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#aeeecb] font-bold">Procurement Centre:</span>
              <span className="font-extrabold text-white">{selectedCentre.name}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-[#aeeecb] font-bold">Scheduled Date:</span>
              <span className="font-extrabold text-white">{formatFormattedDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#aeeecb] font-bold">Time Slot:</span>
              <span className="font-extrabold text-white">{selectedTimeSlot}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full sm:flex-1 h-[52px] bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs sm:text-sm rounded-2xl border border-white/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>← Back to Time</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalConfirm}
              className="w-full sm:flex-1 h-[52px] bg-[#e9c46a] hover:bg-[#dfb552] disabled:opacity-75 text-[#002114] font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Generating Token...</span>
              ) : (
                <>
                  <span>✓ Confirm My Turn</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Calendar Date Selection Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative border border-[#c1c8c2]/60">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2c694e]" />
                <h3 className="font-black text-base text-[#012d1d]">Select Date</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-[#f9faf6] p-2.5 rounded-2xl border border-[#c1c8c2]/40">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-[#e8e8e5] text-[#012d1d] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="font-black text-sm text-[#012d1d]">
                {monthNames[currentMonthIndex]} {currentYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-[#e8e8e5] text-[#012d1d] cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 text-center font-extrabold text-[11px] text-[#717973]">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {getCalendarDays().map((item, idx) => {
                if (!item) {
                  return <div key={`empty-${idx}`} className="h-9"></div>;
                }

                const isSelected = selectedDate === item.fullDate;
                const isClosed = item.status === 'Closed';
                const isFull = item.status === 'Full';

                return (
                  <button
                    key={item.fullDate}
                    type="button"
                    disabled={isClosed}
                    onClick={() => {
                      setSelectedDate(item.fullDate);
                      const slots = getTimeSlotsForDate(item.fullDate);
                      const avail = slots.find(s => s.status !== 'Full');
                      if (avail) setSelectedTimeSlot(avail.slot);
                    }}
                    className={`h-10 rounded-xl font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#012d1d] text-white ring-2 ring-[#aeeecb] shadow-xs'
                        : isClosed
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isFull
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-[#f9faf6] text-[#012d1d] border border-[#c1c8c2]/40 hover:bg-[#c1ecd4]'
                    }`}
                  >
                    <span>{item.day}</span>
                    <span className="text-[8px] leading-none">
                      {isClosed ? 'Closed' : isFull ? 'Full' : isSelected ? '✓' : 'Open'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Date Indicator & Done Button */}
            <div className="pt-3 border-t border-[#eeeeeb] space-y-3">
              <div className="bg-[#f3f9f5] p-3 rounded-2xl border border-[#2c694e]/30 text-center text-xs">
                <span className="text-[#717973] font-bold">Selected Date: </span>
                <span className="font-black text-[#012d1d]">{formatFormattedDate(selectedDate)}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="w-full h-[48px] bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs rounded-2xl shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Centre Confirmation Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative border border-[#c1c8c2]/60">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-xl font-bold">
              <Building2 className="w-6 h-6 text-amber-900" />
            </div>

            <div>
              <h3 className="font-black text-base text-[#012d1d]">
                Change Procurement Centre?
              </h3>
              <p className="text-xs text-[#717973] font-medium mt-1">
                You will return to centre selection to choose another APMC centre.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="w-full h-[48px] bg-[#1b4332] text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Keep This Centre
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowChangeModal(false);
                  onNavigate('/farmer/centres');
                }}
                className="w-full h-[48px] bg-[#f3f4f1] text-[#ba1a1a] font-extrabold text-xs rounded-xl hover:bg-red-50 cursor-pointer"
              >
                Change Centre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
