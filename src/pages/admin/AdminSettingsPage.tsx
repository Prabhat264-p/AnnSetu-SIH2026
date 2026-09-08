import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Sliders,
  Bell,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Save,
  Globe,
  Clock,
  Layers,
  Database,
  Smartphone,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettingsPage: React.FC = () => {
  const { currentUser, resetToSeedData } = useApp();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PROCUREMENT' | 'QUEUE' | 'NOTIFICATIONS' | 'SECURITY' | 'DEMO'>('GENERAL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // General Settings State
  const [districtName, setDistrictName] = useState<string>(currentUser.districtName || currentUser.district || 'District');
  const [stateName, setStateName] = useState<string>(currentUser.stateName || currentUser.state || 'State');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata (IST)');
  const [defaultLanguage, setDefaultLanguage] = useState<string>('hi');

  // Procurement Settings State
  const [season, setSeason] = useState<string>('Rabi 2025-26');
  const [dailyCapacityLimit, setDailyCapacityLimit] = useState<number>(300);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(60);
  const [wheatSupported, setWheatSupported] = useState<boolean>(true);
  const [paddySupported, setPaddySupported] = useState<boolean>(true);
  const [maizeSupported, setMaizeSupported] = useState<boolean>(true);

  // Queue Settings State
  const [overloadThreshold, setOverloadThreshold] = useState<number>(30);
  const [targetWaitMinutes, setTargetWaitMinutes] = useState<number>(45);
  const [autoRebalanceEnabled, setAutoRebalanceEnabled] = useState<boolean>(true);

  // Notification Settings State
  const [smsGatewayEnabled, setSmsGatewayEnabled] = useState<boolean>(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState<boolean>(true);
  const [voiceSearchAiEnabled, setVoiceSearchAiEnabled] = useState<boolean>(true);

  const handleSave = () => {
    setToastMessage(`District settings saved successfully for ${districtName}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1b4332] text-[#c1ecd4] px-5 py-3 rounded-2xl shadow-xl border border-[#c1ecd4]/30 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#aeeecb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#c1c8c2]/60 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-[#c1ecd4] flex items-center justify-center font-bold text-sm">
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold text-[#2c694e] bg-[#f3f4f1] px-2.5 py-0.5 rounded-md">
            District Configuration Engine
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight mt-1">
          System Settings & Operational Control
        </h1>
        <p className="text-xs md:text-sm text-[#414844] mt-0.5">
          Configure district procurement parameters, queue congestion thresholds, notification gateways, and security parameters for {currentUser.districtName || currentUser.district || 'district'}.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-[#c1c8c2]/50 shadow-2xs">
        {[
          { id: 'GENERAL', label: 'General Settings', icon: Globe },
          { id: 'PROCUREMENT', label: 'Procurement Rules', icon: Building2 },
          { id: 'QUEUE', label: 'Queue & Congestion', icon: Sliders },
          { id: 'NOTIFICATIONS', label: 'Notifications & AI', icon: Bell },
          { id: 'SECURITY', label: 'Security & Scope', icon: ShieldCheck },
          { id: 'DEMO', label: 'Demo Controls', icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1b4332] text-white shadow-sm'
                  : 'text-[#414844] hover:bg-[#f3f4f1] hover:text-[#012d1d]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#aeeecb]' : 'text-[#717973]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2]/60 p-6 shadow-2xs">
        {/* GENERAL TAB */}
        {activeTab === 'GENERAL' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-[#012d1d] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#2c694e]" />
              <span>District Administration & Headquarters Profile</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">District Name</label>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">State Administration</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Time Zone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Default Portal Language</label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full bg-[#f3f4f1] font-bold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                >
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="en">English (Official)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eeeeeb] flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#2c694e] text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save General Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* PROCUREMENT TAB */}
        {activeTab === 'PROCUREMENT' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-[#012d1d] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2c694e]" />
              <span>Procurement Season & Commodity Limits</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Active Procurement Season</label>
                <input
                  type="text"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Daily Capacity Limit per Centre (Farmers)</label>
                <input
                  type="number"
                  value={dailyCapacityLimit}
                  onChange={(e) => setDailyCapacityLimit(Number(e.target.value))}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Slot Duration (Minutes)</label>
                <select
                  value={slotDurationMinutes}
                  onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                  className="w-full bg-[#f3f4f1] font-bold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes (Standard)</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-extrabold text-[#012d1d]">Supported Commodities</p>
              <div className="flex gap-4 text-xs font-semibold text-[#012d1d]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wheatSupported}
                    onChange={(e) => setWheatSupported(e.target.checked)}
                    className="accent-[#1b4332] w-4 h-4"
                  />
                  <span>Wheat (गेहूं)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paddySupported}
                    onChange={(e) => setPaddySupported(e.target.checked)}
                    className="accent-[#1b4332] w-4 h-4"
                  />
                  <span>Paddy (धान)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maizeSupported}
                    onChange={(e) => setMaizeSupported(e.target.checked)}
                    className="accent-[#1b4332] w-4 h-4"
                  />
                  <span>Maize (मक्का)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eeeeeb] flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#2c694e] text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Procurement Rules</span>
              </button>
            </div>
          </div>
        )}

        {/* QUEUE TAB */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-[#012d1d] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#2c694e]" />
              <span>Queue Management & Overload Thresholds</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Overload Queue Trigger (Farmers)</label>
                <input
                  type="number"
                  value={overloadThreshold}
                  onChange={(e) => setOverloadThreshold(Number(e.target.value))}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
                <p className="text-[10px] text-[#717973] mt-1">Centres with queues exceeding this threshold trigger OVERLOAD alerts.</p>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Target Max Waiting Time (Minutes)</label>
                <input
                  type="number"
                  value={targetWaitMinutes}
                  onChange={(e) => setTargetWaitMinutes(Number(e.target.value))}
                  className="w-full bg-[#f3f4f1] font-semibold text-[#012d1d] px-3.5 py-2.5 rounded-xl border border-[#c1c8c2]/40 outline-none"
                />
              </div>
            </div>

            <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#012d1d]">Smart Queue Rebalancing Engine</p>
                  <p className="text-[11px] text-[#717973]">Suggest nearby underutilized centres to arriving farmers automatically.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRebalanceEnabled}
                  onChange={(e) => setAutoRebalanceEnabled(e.target.checked)}
                  className="accent-[#1b4332] w-5 h-5"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-[#eeeeeb] flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#2c694e] text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Queue Thresholds</span>
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-[#012d1d] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#2c694e]" />
              <span>SMS Gateway & AI Voice Search Assistant</span>
            </h2>

            <div className="space-y-3">
              <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#012d1d]">SMS Token Notification Dispatcher</p>
                  <p className="text-[11px] text-[#717973]">Dispatch SMS token confirmations & queue alerts to farmer mobile numbers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsGatewayEnabled}
                  onChange={(e) => setSmsGatewayEnabled(e.target.checked)}
                  className="accent-[#1b4332] w-5 h-5"
                />
              </div>

              <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#012d1d]">WhatsApp Queue Link Dispatch</p>
                  <p className="text-[11px] text-[#717973]">Send live queue status tracking links over WhatsApp.</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlertsEnabled}
                  onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                  className="accent-[#1b4332] w-5 h-5"
                />
              </div>

              <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#012d1d]">AI Multilingual Voice Assistant</p>
                  <p className="text-[11px] text-[#717973]">Enable voice search & booking in Hindi & Marathi for farmers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSearchAiEnabled}
                  onChange={(e) => setVoiceSearchAiEnabled(e.target.checked)}
                  className="accent-[#1b4332] w-5 h-5"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#eeeeeb] flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#2c694e] text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'SECURITY' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-[#012d1d] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2c694e]" />
              <span>Admin Account & Authorization Scope</span>
            </h2>

            <div className="bg-[#f9faf6] p-4 rounded-2xl border border-[#c1c8c2]/40 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Admin ID</p>
                  <p className="font-mono font-bold text-[#012d1d] mt-0.5">{currentUser.adminId || 'DEMO-ADMIN-HQ'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Admin Name</p>
                  <p className="font-bold text-[#012d1d] mt-0.5">{currentUser.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Authorized State Code</p>
                  <p className="font-mono font-bold text-[#2c694e] mt-0.5">{currentUser.stateCode || 'BR'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#717973] uppercase font-bold">Authorized District Code</p>
                  <p className="font-mono font-bold text-[#2c694e] mt-0.5">{currentUser.districtCode || 'BR_PAT'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#c1c8c2]/30">
                <p className="text-[10px] text-[#717973] uppercase font-bold">Session Authorization Protocol</p>
                <p className="text-[11px] text-[#012d1d] font-semibold mt-0.5">
                  Server-Enforced Token Scope (Bearer Session Token active). Cross-district API access is strictly forbidden by server authorization layer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DEMO CONTROLS TAB */}
        {activeTab === 'DEMO' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-[#012d1d] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#2c694e]" />
              <span>Demo Environment Controls</span>
            </h2>

            <div className="bg-[#f9faf6] p-5 rounded-2xl border border-[#c1c8c2]/40 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-[#012d1d]">Reset Demo Data</h3>
                <p className="text-xs text-[#414844] mt-1">
                  Resets transient tokens, queue bookings, and simulated operator activity back to clean demo initial state. Preserves shared centre master data, locations, and admin/operator accounts.
                </p>
              </div>

              <button
                onClick={() => {
                  resetToSeedData();
                  setToastMessage('Demo environment data reset to clean initial state!');
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>↻ Reset Demo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
