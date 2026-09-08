import React, { useState } from 'react';
import { Minus, Plus, Scale } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UniversalQuantityInputProps {
  crop: string;
  quantity: number;
  onChangeQuantity: (val: number) => void;
}

export const UniversalQuantityInput: React.FC<UniversalQuantityInputProps> = ({
  crop,
  quantity,
  onChangeQuantity,
}) => {
  const { t } = useApp();
  const [inputVal, setInputVal] = useState<string>(quantity ? quantity.toString() : '25');

  const presets = [10, 25, 50, 100];
  const isPresetSelected = presets.includes(Number(inputVal));

  const handleStep = (delta: number) => {
    const current = Number(inputVal) || 0;
    const newVal = Math.max(1, Math.min(1000, current + delta));
    setInputVal(newVal.toString());
    onChangeQuantity(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setInputVal(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num > 0) {
      onChangeQuantity(num);
    } else {
      onChangeQuantity(0);
    }
  };

  const handlePresetClick = (q: number) => {
    setInputVal(q.toString());
    onChangeQuantity(q);
  };

  const isValid = Number(inputVal) > 0;

  return (
    <div className="space-y-5 select-none">
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-[#012d1d]">
          ⚖️ How much crop?
        </h3>
        <p className="text-xs text-[#717973] font-medium">
          Enter your yield quantity manually or choose a quick option.
        </p>
      </div>

      <div className="bg-[#f9faf6] p-6 sm:p-7 rounded-3xl border border-[#c1c8c2]/50 text-center space-y-5 max-w-md mx-auto shadow-xs">
        <div className="inline-flex items-center gap-1.5 bg-[#f3f9f5] border border-[#2c694e]/30 px-3.5 py-1 rounded-full text-xs font-bold text-[#012d1d]">
          <Scale className="w-3.5 h-3.5 text-[#2c694e]" />
          <span>Selected Crop: {crop}</span>
        </div>

        {/* Large Direct Editable Numeric Input Box with Plus & Minus */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="w-14 h-14 rounded-2xl bg-white text-[#012d1d] border-2 border-[#c1c8c2]/60 flex items-center justify-center font-black text-2xl hover:bg-[#f3f4f1] active:scale-95 shadow-xs cursor-pointer shrink-0"
            aria-label="Decrease quantity"
          >
            <Minus className="w-6 h-6" />
          </button>

          <div className="w-48 px-3 py-2 bg-white rounded-2xl border-3 border-[#2c694e] shadow-sm flex flex-col items-center justify-center focus-within:ring-2 focus-within:ring-[#aeeecb]">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="1"
              max="1000"
              value={inputVal}
              onFocus={(e) => e.target.select()}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full text-center text-3xl sm:text-4xl font-black text-[#012d1d] font-mono outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs font-black text-[#2c694e] uppercase tracking-wider block">
              Quintals
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleStep(1)}
            className="w-14 h-14 rounded-2xl bg-white text-[#012d1d] border-2 border-[#c1c8c2]/60 flex items-center justify-center font-black text-2xl hover:bg-[#f3f4f1] active:scale-95 shadow-xs cursor-pointer shrink-0"
            aria-label="Increase quantity"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {!isValid && (
          <p className="text-xs font-bold text-[#ba1a1a] animate-in fade-in">
            ⚠️ Please enter a valid quantity greater than 0.
          </p>
        )}

        {/* Custom Quantity Indicator */}
        {!isPresetSelected && isValid && (
          <div className="inline-block bg-[#e9c46a]/20 border border-[#e9c46a] px-3 py-1 rounded-xl text-[11px] font-black text-[#7a5802] animate-in fade-in">
            CUSTOM QUANTITY • {inputVal} Quintals
          </div>
        )}

        {/* Quick Presets Shortcuts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#717973] block">
            QUICK OPTIONS
          </span>

          <div className="grid grid-cols-4 gap-2">
            {presets.map((q) => {
              const isSelected = Number(inputVal) === q;

              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => handlePresetClick(q)}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-2xs'
                      : 'bg-white text-[#012d1d] border-[#c1c8c2]/60 hover:bg-[#f3f4f1]'
                  }`}
                >
                  {q} Qtl
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
