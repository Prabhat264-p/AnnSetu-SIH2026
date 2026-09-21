import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

export interface LanguageOption {
  code: Language;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
];

interface LanguageSelectorProps {
  /**
   * 'pills': On desktop (sm:), displays horizontal language pills. On mobile (<sm), displays compact dropdown.
   * 'dropdown': Displays compact dropdown trigger on both mobile and desktop.
   */
  variant?: 'pills' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'pills',
  className = '',
}) => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Desktop Horizontal Pills view (Only active when variant === 'pills' on sm screens and above) */}
      {variant === 'pills' && (
        <div className="hidden sm:flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#2c694e] shrink-0" />
          <div className="flex items-center bg-[#f3f4f1] p-1 rounded-xl border border-[#c1c8c2]/60 text-xs font-bold">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === opt.code
                    ? 'bg-white text-[#012d1d] shadow-2xs font-extrabold'
                    : 'text-[#717973] hover:text-[#012d1d]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compact Dropdown Trigger (Active on Mobile for 'pills', or All Screens for 'dropdown') */}
      <div className={variant === 'pills' ? 'block sm:hidden' : 'block'}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Select application language"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-2 bg-[#ffffff] text-[#012d1d] px-3 py-2 rounded-xl border border-[#c1c8c2]/70 shadow-2xs hover:border-[#012d1d] transition-all text-xs font-bold min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#012d1d] active:scale-98"
        >
          <Globe className="w-4 h-4 text-[#2c694e] shrink-0" />
          <span className="font-bold text-[#012d1d]">{currentOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#717973] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Compact Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            aria-label="Languages"
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#c1c8c2]/60 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full text-left px-3.5 py-3 text-xs flex items-center justify-between transition-colors min-h-[44px] cursor-pointer active:bg-[#f3f4f1] ${
                    isSelected
                      ? 'font-extrabold text-[#012d1d] bg-[#aeeecb]/30'
                      : 'text-[#414844] hover:bg-[#f3f4f1] font-medium'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#2c694e] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
