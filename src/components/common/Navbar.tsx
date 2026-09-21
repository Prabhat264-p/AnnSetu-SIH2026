/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Globe,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Building2,
  Tractor,
  Layers,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language, UserRole } from '../../types';
import { ResetDemoButton } from './ResetDemoButton';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenNotifications,
}) => {
  const { currentUser, language, setLanguage, logout, notifications, switchRole, t } =
    useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="bg-white border-b border-[#c1c8c2]/50 sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-2xs select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          {/* Logo & Brand Title */}
          <div
            onClick={() => {
              if (currentUser.role === 'FARMER') onNavigate('/farmer/dashboard');
              else if (currentUser.role === 'OPERATOR') onNavigate('/operator/dashboard');
              else onNavigate('/admin/dashboard');
            }}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#012d1d] flex items-center justify-center text-[#c1ecd4] group-hover:scale-105 transition-transform shadow-xs">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl md:text-2xl text-[#012d1d] tracking-tight">
                  AnnSetu
                </span>
              </div>
              <p className="text-[10px] text-[#414844] hidden sm:block leading-none">
                Smart Procurement Scheduling
              </p>
            </div>
          </div>

          {/* Shared Reset Demo Button */}
          <div className="flex items-center">
            <ResetDemoButton />
          </div>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <LanguageSelector variant="dropdown" />

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-[#414844] hover:text-[#012d1d] hover:bg-[#f3f4f1] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Role / Account Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 bg-[#f3f4f1] hover:bg-[#e8e8e5] px-2.5 py-1.5 rounded-xl border border-[#c1c8c2]/50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#012d1d] text-[#c1ecd4] flex items-center justify-center font-bold text-xs">
                  {currentUser.role === 'FARMER' ? (
                    <Tractor className="w-4 h-4" />
                  ) : currentUser.role === 'OPERATOR' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-[#012d1d] leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#717973] uppercase font-semibold leading-tight">
                    {currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-[#717973]" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#c1c8c2]/60 py-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 border-b border-[#eeeeeb]">
                    <p className="text-xs font-bold text-[#012d1d]">{currentUser.name}</p>
                    <p className="text-[10px] text-[#717973]">{currentUser.mobile}</p>
                  </div>

                  <div className="px-2 pt-1">
                    <p className="text-[10px] font-bold text-[#717973] uppercase px-2 mb-1">
                      Switch Role View
                    </p>
                    {[
                      { role: 'FARMER' as UserRole, label: 'Farmer Portal', icon: Tractor },
                      { role: 'OPERATOR' as UserRole, label: 'Centre Operator', icon: Building2 },
                      { role: 'ADMIN' as UserRole, label: 'District Admin', icon: Layers },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => {
                            switchRole(item.role);
                            setShowRoleMenu(false);
                            if (item.role === 'FARMER') onNavigate('/farmer/dashboard');
                            else if (item.role === 'OPERATOR') onNavigate('/operator/dashboard');
                            else onNavigate('/admin/dashboard');
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentUser.role === item.role
                              ? 'bg-[#1b4332] text-white'
                              : 'text-[#414844] hover:bg-[#f3f4f1]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#eeeeeb] pt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                        onNavigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
      </header>
    </>
  );
};
