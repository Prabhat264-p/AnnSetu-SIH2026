import React, { useState } from 'react';
import {
  Tractor,
  Building2,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Wheat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { switchUserRole } = useApp();
  const [mobile, setMobile] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('4829');

  const handleRoleSelect = (role: UserRole, targetPath: string) => {
    switchUserRole(role);
    onNavigate(targetPath);
  };

  return (
    <div className="max-w-md mx-auto py-12 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center mx-auto shadow-md">
          <Wheat className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-[#012d1d] tracking-tight">
          Sign In to AnnSetu
        </h1>
        <p className="text-xs text-[#414844]">
          Choose a pre-configured persona or sign in with your Kisan mobile number.
        </p>
      </div>

      {/* 1-Click Role Personas (Instant Access) */}
      <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#717973]">
          1-Click Demo Personas
        </p>

        {/* Farmer */}
        <button
          onClick={() => handleRoleSelect('FARMER', '/farmer/dashboard')}
          className="w-full p-3.5 rounded-2xl border border-[#c1c8c2]/50 hover:border-[#1b4332] bg-[#f9faf6] hover:bg-[#f3f9f5] transition-all flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center font-bold">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-[#012d1d]">Ram Das (Farmer)</p>
              <p className="text-[10px] text-[#717973]">Panchale Village • Wheat & Soybean</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#2c694e]" />
        </button>

        {/* Operator */}
        <button
          onClick={() => handleRoleSelect('OPERATOR', '/operator/dashboard')}
          className="w-full p-3.5 rounded-2xl border border-[#c1c8c2]/50 hover:border-[#1b4332] bg-[#f9faf6] hover:bg-[#f3f9f5] transition-all flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f3f4f1] text-[#2c694e] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-[#012d1d]">Ramesh Patil (Operator)</p>
              <p className="text-[10px] text-[#717973]">Sinnar Yard Terminal • Counter 1</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#2c694e]" />
        </button>

        {/* Admin */}
        <button
          onClick={() => handleRoleSelect('ADMIN', '/admin/dashboard')}
          className="w-full p-3.5 rounded-2xl border border-[#c1c8c2]/50 hover:border-[#1b4332] bg-[#f9faf6] hover:bg-[#f3f9f5] transition-all flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff8e1] text-[#b78103] flex items-center justify-center font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-[#012d1d]">Dr. Sanjay Sharma (Admin)</p>
              <p className="text-[10px] text-[#717973]">District Magistrate • Nashik HQ</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#2c694e]" />
        </button>
      </div>

      {/* Mobile OTP Login Form */}
      <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#717973]">
          Or Mobile Number Login
        </p>

        <div>
          <label className="text-xs font-bold text-[#414844] block mb-1">
            Registered Kisan Mobile
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60"
            />
            <button
              onClick={() => setOtpSent(true)}
              className="bg-[#012d1d] text-white text-xs font-bold px-3 py-2 rounded-xl"
            >
              {otpSent ? 'Resend' : 'Send OTP'}
            </button>
          </div>
        </div>

        {otpSent && (
          <div className="space-y-2 pt-2 animate-in fade-in">
            <label className="text-xs font-bold text-[#414844] block">
              Enter 4-Digit OTP (Use: 4829)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-[#f3f4f1] px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#012d1d] outline-none border border-[#c1c8c2]/60 text-center tracking-widest text-base"
            />
            <button
              onClick={() => handleRoleSelect('FARMER', '/farmer/dashboard')}
              className="w-full bg-[#1b4332] text-white font-extrabold text-xs py-3 rounded-xl shadow-xs"
            >
              Verify OTP & Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
