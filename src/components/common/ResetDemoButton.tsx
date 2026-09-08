import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ResetDevModal } from './ResetDevModal';

interface ResetDemoButtonProps {
  className?: string;
}

export const ResetDemoButton: React.FC<ResetDemoButtonProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDevMode = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : true;

  if (!isDevMode) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'flex items-center gap-1.5 bg-[#eeeeeb] hover:bg-[#c1ecd4] text-[#012d1d] hover:text-[#002114] px-3 py-1.5 rounded-xl border border-[#c1c8c2]/80 transition-all text-xs font-extrabold cursor-pointer shadow-2xs select-none'
        }
        title="Reset demo bookings, tokens and operational state"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[#2c694e]" />
        <span>Reset Demo</span>
      </button>

      <ResetDevModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
