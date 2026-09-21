import React, { useState } from 'react';
import {
  Sliders,
  Building2,
  Clock,
  CheckCircle2,
  Save,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getCentreSafe } from '../../utils/centreResolver';

interface OperatorSettingsPageProps {
  onNavigate: (path: string) => void;
}

export const OperatorSettingsPage: React.FC<OperatorSettingsPageProps> = ({
  onNavigate,
}) => {
  const { currentUser, centres, updateCentreCounters, updateCentreStatus } = useApp();

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

  const officialIdDisplay = centre.officialId || centre.id;

  const [centreName, setCentreName] = useState(centre.name);
  const [workingHours, setWorkingHours] = useState(centre.workingHours);
  const [dailyCapacity, setDailyCapacity] = useState(centre.dailyCapacity);
  const [countersCount, setCountersCount] = useState(centre.counters);
  const [activeCounters, setActiveCounters] = useState(centre.activeCounters);
  const [contactPhone, setContactPhone] = useState(centre.contactPhone);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCentreCounters(centre.id, activeCounters);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 font-sans select-none">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#012d1d] tracking-tight">
              Centre Settings
            </h1>
            <p className="text-xs text-[#717973] font-medium">
              Manage operating parameters, weighbridge counters, and capacity for {officialIdDisplay}
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="text-xs font-black bg-[#c1ecd4] text-[#002114] px-3 py-1.5 rounded-xl flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#2c694e]" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Centre Profile */}
        <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#012d1d] border-b border-[#eeeeeb] pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2c694e]" />
            <span>Centre Profile & Agency Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Centre Name</label>
              <input
                type="text"
                value={centreName}
                onChange={(e) => setCentreName(e.target.value)}
                className="w-full bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/60 font-bold text-[#012d1d] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Official ID</label>
              <input
                type="text"
                value={officialIdDisplay}
                disabled
                className="w-full bg-[#f3f4f1] p-2.5 rounded-xl border border-[#c1c8c2]/40 font-mono font-bold text-[#717973]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Procurement Agency</label>
              <input
                type="text"
                value={centre.agency}
                disabled
                className="w-full bg-[#f3f4f1] p-2.5 rounded-xl border border-[#c1c8c2]/40 font-bold text-[#717973]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Helpline Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/60 font-bold text-[#012d1d] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Hours & Counter Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#012d1d] border-b border-[#eeeeeb] pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2c694e]" />
            <span>Operating Hours & Weighbridge Counters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Working Hours</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/60 font-bold text-[#012d1d] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Daily Intake Capacity (Qtl)</label>
              <input
                type="number"
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(Number(e.target.value))}
                className="w-full bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/60 font-bold text-[#012d1d] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#717973] block">Active Counters</label>
              <select
                value={activeCounters}
                onChange={(e) => setActiveCounters(Number(e.target.value))}
                className="w-full bg-[#f9faf6] p-2.5 rounded-xl border border-[#c1c8c2]/60 font-bold text-[#012d1d] outline-none cursor-pointer"
              >
                {Array.from({ length: countersCount }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Counters Active
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-[#1b4332] hover:bg-[#012d1d] text-white font-black text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#aeeecb]" />
            <span>Save Centre Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
