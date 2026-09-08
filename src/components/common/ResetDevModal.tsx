import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  CheckCircle2,
  Trash2,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ResetDevModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDevModal: React.FC<ResetDevModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resetToCleanState, resetToSeedData } = useApp();
  const [successToast, setSuccessToast] = useState<string>('');

  if (!isOpen) return null;

  const handleCleanReset = () => {
    resetToCleanState();
    setSuccessToast('✓ Demo environment reset successfully! Temporary activity cleared.');
    setTimeout(() => {
      setSuccessToast('');
      onClose();
      window.location.reload();
    }, 1200);
  };

  const handleScenarioReset = () => {
    resetToSeedData();
    setSuccessToast('✓ Demo scenario reloaded successfully!');
    setTimeout(() => {
      setSuccessToast('');
      onClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none font-sans">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative border border-[#c1c8c2]/60">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#eeeeeb] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#c1ecd4] text-[#002114] flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5 text-[#012d1d]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#012d1d]">Reset Demo Environment?</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successToast ? (
          <div className="bg-[#f3f9f5] p-5 rounded-2xl border border-[#2c694e]/40 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-[#2c694e] mx-auto" />
            <p className="font-extrabold text-sm text-[#012d1d]">{successToast}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-[#414844] font-medium leading-relaxed space-y-1.5">
              <p>
                This will clear demo bookings, tokens, queues, procurement activity and temporary operational data.
              </p>
              <p className="font-bold text-[#012d1d]">
                Your demo centres, locations and accounts will be preserved.
              </p>
            </div>

            {/* Reset Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleCleanReset}
                className="w-full py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Demo (Clear Activity)</span>
              </button>

              <button
                type="button"
                onClick={handleScenarioReset}
                className="w-full py-2.5 bg-[#f3f4f1] hover:bg-[#e8e8e5] text-[#012d1d] font-extrabold text-xs rounded-xl border border-[#c1c8c2]/60 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Package className="w-4 h-4 text-[#2c694e]" />
                <span>Reload Initial Demo Seed Scenario</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-[#717973] hover:text-[#012d1d] font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
