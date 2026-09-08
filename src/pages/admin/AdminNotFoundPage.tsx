import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminNotFoundPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 font-sans">
      <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-[#012d1d]">Page Not Found</h2>
      <p className="text-xs md:text-sm text-[#414844] max-w-md">
        The requested District Admin route does not exist or has been relocated.
      </p>
      <button
        onClick={() => onNavigate('/admin/dashboard')}
        className="px-6 py-2.5 bg-[#1b4332] hover:bg-[#2c694e] text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Return to Overview Dashboard</span>
      </button>
    </div>
  );
};
