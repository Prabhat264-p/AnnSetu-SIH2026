import React from 'react';
import { useApp } from '../../context/AppContext';

interface UniversalCropSelectorProps {
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
}

export const UniversalCropSelector: React.FC<UniversalCropSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
}) => {
  const { t } = useApp();

  const crops = [
    { name: 'Wheat', label: '🌾 Wheat', icon: '🌾' },
    { name: 'Paddy', label: '🌾 Paddy / Rice', icon: '🌾' },
    { name: 'Maize', label: '🌽 Maize / Corn', icon: '🌽' },
    { name: 'Soybean', label: '🌱 Soybean', icon: '🌱' },
    { name: 'Cotton', label: '☁️ Cotton', icon: '☁️' },
    { name: 'Other', label: '🌱 Other Crop', icon: '🌱' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-[#012d1d]">
          🌾 {t('whatCrop')}
        </h3>
        <p className="text-xs text-[#717973] font-medium">
          Select the agricultural crop you are bringing for government procurement.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {crops.map((c) => {
          const isSelected = selectedCrop === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onSelectCrop(c.name)}
              className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[90px] ${
                isSelected
                  ? 'border-[#2c694e] bg-[#f3f9f5] ring-3 ring-[#aeeecb]/40 shadow-md scale-[1.02]'
                  : 'border-[#c1c8c2]/60 bg-white hover:border-[#1b4332]'
              }`}
            >
              <span className="text-2xl sm:text-3xl">{c.icon}</span>
              <span className="font-extrabold text-xs sm:text-sm text-[#012d1d]">{c.name}</span>
              {isSelected && (
                <span className="text-[9px] font-black bg-[#2c694e] text-white px-2 py-0.2 rounded-full">
                  ✓ Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
