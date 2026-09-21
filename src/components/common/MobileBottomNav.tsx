import React from 'react';
import {
  LayoutDashboard,
  Search,
  Ticket,
  User,
  ListOrdered,
  Building2,
  BarChart3,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, onNavigate }) => {
  const { currentUser, t } = useApp();

  if (currentUser.role === 'FARMER') {
    const tabs = [
      { label: t('dashboard'), path: '/farmer/dashboard', icon: LayoutDashboard },
      { label: t('findProcurementCentre'), path: '/farmer/centres', icon: Search },
      { label: t('myTurn'), path: '/farmer/live-queue', icon: Ticket },
      { label: t('myBookings'), path: '/farmer/my-bookings', icon: History },
      { label: t('profile'), path: '/farmer/profile', icon: User },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#c1c8c2]/50 px-2 py-1.5 flex justify-around items-center shadow-lg font-sans select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(tab.path));
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all min-w-[56px] min-h-[48px] cursor-pointer ${
                isActive ? 'text-[#012d1d] font-black' : 'text-[#717973]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#c1ecd4]' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[65px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  if (currentUser.role === 'OPERATOR') {
    const tabs = [
      { label: 'Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
      { label: 'Live Queue', path: '/operator/queue', icon: ListOrdered },
      { label: 'Tokens', path: '/operator/tokens', icon: Ticket },
      { label: 'Verify', path: '/operator/verification', icon: Building2 },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#c1c8c2]/50 px-2 py-1.5 flex justify-around items-center shadow-lg font-sans select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all min-w-[60px] min-h-[48px] cursor-pointer ${
                isActive ? 'text-[#012d1d] font-bold' : 'text-[#717973]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#c1ecd4]' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Admin
  const tabs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Centres', path: '/admin/centres', icon: Building2 },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Tokens', path: '/admin/tokens', icon: Ticket },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#c1c8c2]/50 px-2 py-1.5 flex justify-around items-center shadow-lg font-sans select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => onNavigate(tab.path)}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all min-w-[60px] min-h-[48px] cursor-pointer ${
              isActive ? 'text-[#012d1d] font-bold' : 'text-[#717973]'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-[#c1ecd4]' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
