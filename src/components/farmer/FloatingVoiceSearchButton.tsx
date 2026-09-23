import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FloatingVoiceSearchButtonProps {
  onClick: () => void;
}

export const FloatingVoiceSearchButton: React.FC<FloatingVoiceSearchButtonProps> = ({
  onClick,
}) => {
  const { language } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipMap: Record<string, string> = {
    en: 'Speak to Search',
    hi: 'बोलकर सेंटर खोजें',
    mr: 'बोलून सेंटर शोधा',
    bn: 'ভয়েস সার্চ',
    te: 'వాయిస్ శోధన',
  };

  const tooltipText = tooltipMap[language] || 'Speak to Search';

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-8 right-4 sm:right-7 z-50 animate-in slide-in-from-bottom duration-300 pointer-events-auto select-none group flex items-center gap-2">
      {/* Tooltip on Hover / Focus */}
      <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#012d1d] text-white text-xs font-black px-3 py-1.5 rounded-xl border border-[#aeeecb]/40 shadow-lg whitespace-nowrap">
        {tooltipText}
      </div>

      {/* Small Circular Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Speak to Search"
        className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#012d1d] hover:bg-[#1b4332] text-white border-2 border-[#aeeecb] shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer focus:ring-4 focus:ring-[#aeeecb]/40 relative"
      >
        <Mic className="w-6 h-6 text-[#aeeecb] animate-pulse" />
      </button>
    </div>
  );
};
