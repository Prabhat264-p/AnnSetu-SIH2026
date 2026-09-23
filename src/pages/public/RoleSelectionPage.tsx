import React, { useState } from 'react';
import {
  Tractor,
  User,
  Building2,
  Landmark,
  Globe,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language, UserRole } from '../../types';
import { ResetDemoButton } from '../../components/common/ResetDemoButton';
import { LanguageSelector } from '../../components/common/LanguageSelector';

interface RoleSelectionPageProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
  const { language, setLanguage } = useApp();
  // No role selected by default
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const roleCards: {
    role: UserRole;
    title: string;
    titleHi: string;
    titleMr: string;
    titleBn: string;
    titleTe: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    capabilities: string[];
    accentColor: string;
    badgeBg: string;
  }[] = [
    {
      role: 'FARMER',
      title: 'Farmer',
      titleHi: 'किसान',
      titleMr: 'शेतकरी',
      titleBn: 'কৃষক',
      titleTe: 'రైతు',
      subtitle: 'Book slots • Get digital tokens • Track queue',
      icon: User,
      capabilities: ['Book slots', 'Digital tokens', 'Track queue'],
      accentColor: '#1b4332',
      badgeBg: 'bg-[#c1ecd4] text-[#002114]',
    },
    {
      role: 'OPERATOR',
      title: 'Procurement Centre',
      titleHi: 'खरीद केंद्र',
      titleMr: 'खरेदी केंद्र',
      titleBn: 'সংগ্রহ কেন্দ্র',
      titleTe: 'కొనుగోలు కేంద్రం',
      subtitle: 'Manage queue • Verify farmers • Process',
      icon: Building2,
      capabilities: ['Manage queue', 'Verify farmers', 'Process'],
      accentColor: '#1b4332',
      badgeBg: 'bg-[#c1ecd4] text-[#002114]',
    },
    {
      role: 'ADMIN',
      title: 'District Admin',
      titleHi: 'जिला प्रशासन',
      titleMr: 'जिल्हा प्रशासन',
      titleBn: 'জেলা প্রশাসন',
      titleTe: 'జిల్లా పాలన',
      subtitle: 'Monitor centres • Analytics • Workload',
      icon: Landmark,
      capabilities: ['Monitor centres', 'Analytics', 'Workload'],
      accentColor: '#b78103',
      badgeBg: 'bg-[#fef3c7] text-[#78350f]',
    },
  ];

  const handleCardClick = (role: UserRole) => {
    setSelectedRole(role);
  };

  const getLocalizedTitle = (card: typeof roleCards[0]) => {
    if (language === 'hi') return card.titleHi;
    if (language === 'mr') return card.titleMr;
    if (language === 'bn') return card.titleBn;
    if (language === 'te') return card.titleTe;
    return card.title;
  };

  const getRoleDisplayName = (role: UserRole) => {
    if (role === 'FARMER') {
      if (language === 'hi') return 'किसान';
      if (language === 'mr') return 'शेतकरी';
      if (language === 'bn') return 'কৃষক';
      if (language === 'te') return 'రైతు';
      return 'Farmer';
    }
    if (role === 'OPERATOR') {
      if (language === 'hi') return 'खरीद केंद्र';
      if (language === 'mr') return 'खरेदी केंद्र';
      if (language === 'bn') return 'সংগ্রহ কেন্দ্র';
      if (language === 'te') return 'కొనుగోలు కేంద్రం';
      return 'Procurement Centre';
    }
    if (language === 'hi') return 'जिला प्रशासन';
    if (language === 'mr') return 'जिल्हा प्रशासन';
    if (language === 'bn') return 'জেলা প্রশাসন';
    if (language === 'te') return 'జిల్లా పాలన';
    return 'District Admin';
  };

  return (
    <div className="min-h-[100dvh] min-h-screen w-full bg-[#f9faf6] text-[#1a1c1a] flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none font-sans overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="w-full shrink-0 border-b border-[#c1c8c2]/40 pb-3 mb-2">
        {/* Row 1: AnnSetu Branding (Left) + Language Selector (Right) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Tractor className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-xl sm:text-2xl text-[#012d1d] tracking-tight">AnnSetu</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#414844] font-medium leading-none mt-1 truncate">
                Smart Queue. Smart Farming. Stronger India.
              </p>
            </div>
          </div>

          {/* Top-Right Language Selector */}
          <div className="shrink-0">
            <LanguageSelector variant="pills" />
          </div>
        </div>

        {/* Row 2: Centered Reset Demo Button */}
        <div className="flex justify-center mt-2.5">
          <ResetDemoButton />
        </div>
      </header>

      {/* Main Center Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-3 py-4 my-auto">
        {/* Welcome Section */}
        <div className="text-center space-y-0.5 mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#012d1d] tracking-tight leading-none mb-2">
            Welcome to AnnSetu
          </h1>

          <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#2c694e]">
            “Who are you?” — Select your role to continue
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 w-full mb-6 max-w-4xl">
          {roleCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedRole === card.role;
            const localizedTitle = getLocalizedTitle(card);

            return (
              <div
                key={card.role}
                onClick={() => handleCardClick(card.role)}
                className={`h-auto min-h-[180px] md:min-h-[208px] rounded-2xl sm:rounded-3xl border-2 p-3.5 sm:p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2c694e] bg-white ring-3 ring-[#aeeecb]/50 shadow-lg scale-[1.01]'
                    : 'border-[#c1c8c2]/60 bg-white hover:border-[#1b4332] hover:shadow-xs'
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-[#2c694e] text-white p-0.5 rounded-full shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#aeeecb]" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: card.accentColor }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${card.badgeBg}`}>
                        {card.role}
                      </span>
                      <h2 className="text-sm sm:text-base md:text-lg font-black text-[#012d1d] truncate mt-0.5">
                        {localizedTitle}
                      </h2>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs font-medium text-[#414844] leading-tight">
                    {card.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {card.capabilities.map((cap) => (
                      <span key={cap} className="text-[9px] sm:text-[10px] font-bold bg-[#f3f4f1] text-[#012d1d] px-1.5 py-0.5 rounded-md border border-[#c1c8c2]/40">
                        • {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#eeeeeb]">
                  <span className={`text-[10px] sm:text-xs font-extrabold flex items-center justify-between ${isSelected ? 'text-[#2c694e]' : 'text-[#717973]'}`}>
                    <span>{isSelected ? '✓ Selected' : 'Tap to select'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Continue Button (Disabled until explicit role selection) */}
        <div className="w-full max-w-[420px] mx-auto text-center">
          <button
            type="button"
            disabled={selectedRole === null}
            onClick={() => {
              if (selectedRole) onSelectRole(selectedRole);
            }}
            className={`w-full min-h-[52px] h-auto py-3 px-4 font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md ${
              selectedRole === null
                ? 'bg-[#e0e2de] text-[#717973] border border-[#c1c8c2]/50 cursor-not-allowed opacity-80'
                : 'bg-[#012d1d] hover:bg-[#1b4332] text-white cursor-pointer shadow-lg active:scale-98'
            }`}
          >
            <span>
              {selectedRole === null
                ? 'Select a role to continue →'
                : `Continue as ${getRoleDisplayName(selectedRole)} →`}
            </span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="min-h-[36px] shrink-0 py-3 mt-auto border-t border-[#c1c8c2]/40 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-[#717973]">
        <div className="flex items-center gap-1 font-semibold">
          <span className="text-[#012d1d] font-bold">AnnSetu Platform</span>
          <span>• Helpline: 1800-180-1551</span>
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="text-[#2c694e] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need Help?</span>
        </button>
      </footer>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#012d1d]">AnnSetu Helpline</h3>
                <p className="text-[10px] text-[#717973]">Toll-Free 24x7 Support</p>
              </div>
            </div>

            <div className="bg-[#f9faf6] p-3.5 rounded-2xl border border-[#c1c8c2]/40 space-y-1 text-xs text-[#414844]">
              <p className="font-bold text-[#012d1d]">Helpline Number:</p>
              <p className="text-base font-black text-[#2c694e] font-mono">1800-180-1551</p>
              <p className="text-[10px] text-[#717973]">
                Support available in English, Hindi, Marathi, Bengali, and Telugu.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-[#012d1d] text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
