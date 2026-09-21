import React from 'react';
import {
  LayoutDashboard,
  Search,
  Ticket,
  User,
  HelpCircle,
  LogOut,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  Building2,
  ListOrdered,
  FileSpreadsheet,
  Tractor,
  Layers,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { currentUser, logout, t } = useApp();

  const getMenuItems = () => {
    if (currentUser.role === 'FARMER') {
      return [
        { label: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
        { label: t('findProcurementCentre'), path: '/farmer/centres', icon: Search },
        { label: t('myTurn'), path: '/farmer/live-queue', icon: Ticket },
        { label: t('myBookings'), path: '/farmer/my-bookings', icon: History },
        { label: t('profile'), path: '/farmer/profile', icon: User },
      ];
    }

    if (currentUser.role === 'OPERATOR') {
      return [
        { label: 'Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
        { label: 'Live Queue', path: '/operator/live-queue', icon: ListOrdered },
        { label: 'Token List', path: '/operator/token-list', icon: Ticket },
        { label: 'Farmer Verification', path: '/operator/farmer-verification', icon: ShieldCheck },
        { label: 'Procurement Records', path: '/operator/procurement-records', icon: FileSpreadsheet },
        { label: 'Centre Reports', path: '/operator/centre-reports', icon: BarChart3 },
        { label: 'Centre Settings', path: '/operator/centre-settings', icon: Settings },
      ];
    }

    // Admin
    return [
      { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Centres Management', path: '/admin/centres', icon: Building2 },
      { label: 'Farmers Directory', path: '/admin/farmers', icon: Users },
      { label: 'Token Auditor', path: '/admin/tokens', icon: Ticket },
      { label: 'Reports & Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'System Settings', path: '/admin/settings', icon: Settings },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex flex-col w-full h-full bg-[#f3f4f1] rounded-3xl border border-[#c1c8c2]/50 p-4 font-sans select-none overflow-y-auto shrink-0 shadow-2xs">
      {/* Role Title Banner */}
      <div className="px-3 py-2 mb-4 bg-[#ffffff] rounded-2xl border border-[#c1c8c2]/40 shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1b4332] text-[#c1ecd4] flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.role === 'FARMER' ? (
              <Tractor className="w-4 h-4" />
            ) : currentUser.role === 'OPERATOR' ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#012d1d] truncate">
              {currentUser.role === 'FARMER'
                ? 'Farmer Portal'
                : currentUser.role === 'OPERATOR'
                ? 'Operator Terminal'
                : 'District HQ Portal'}
            </p>
            <p className="text-[10px] text-[#414844] truncate">
              {currentUser.name}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b4332] text-[#ffffff] shadow-sm'
                  : 'text-[#414844] hover:bg-[#e8e8e5] hover:text-[#012d1d]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#aeeecb]' : 'text-[#717973]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="pt-4 mt-auto border-t border-[#c1c8c2]/50 space-y-1 shrink-0">
        <button
          onClick={() => {
            alert(
              'AnnSetu Farmer & Operator Support Helpline: 1800-180-1551 (Toll-Free, 24x7 in Hindi, Marathi & English)'
            );
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#414844] hover:bg-[#e8e8e5] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#717973]" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
};
