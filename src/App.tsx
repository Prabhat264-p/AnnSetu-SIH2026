/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppContextProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { PrintablePass } from './components/farmer/PrintablePass';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Farmer Voice Search Global Components
import { FloatingVoiceSearchButton } from './components/farmer/FloatingVoiceSearchButton';
import { VoiceSearchModal } from './components/farmer/VoiceSearchModal';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { SearchCentresPage } from './pages/farmer/SearchCentresPage';
import { CentreDetailsPage } from './pages/farmer/CentreDetailsPage';
import { ChooseSlotPage } from './pages/farmer/ChooseSlotPage';
import { TokenConfirmationPage } from './pages/farmer/TokenConfirmationPage';
import { LiveQueuePage } from './pages/farmer/LiveQueuePage';
import { MyBookingsPage } from './pages/farmer/MyBookingsPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';
import { FarmerOnboardingPage } from './pages/farmer/FarmerOnboardingPage';

// Operator Dedicated Pages
import { OperatorDashboardPage } from './pages/operator/OperatorDashboardPage';
import { OperatorLiveQueuePage } from './pages/operator/OperatorLiveQueuePage';
import { OperatorTokenListPage } from './pages/operator/OperatorTokenListPage';
import { FarmerVerificationPage } from './pages/operator/FarmerVerificationPage';
import { ProcurementRecordsPage } from './pages/operator/ProcurementRecordsPage';
import { OperatorReportsPage } from './pages/operator/OperatorReportsPage';
import { OperatorSettingsPage } from './pages/operator/OperatorSettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCentresPage } from './pages/admin/AdminCentresPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminFarmersPage } from './pages/admin/AdminFarmersPage';
import { AdminTokensPage } from './pages/admin/AdminTokensPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminNotFoundPage } from './pages/admin/AdminNotFoundPage';

// Public Auth & Entry Flow Pages
import { RoleSelectionPage } from './pages/public/RoleSelectionPage';
import { RoleLoginPage } from './pages/public/RoleLoginPage';
import { Token, UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated, isProfileComplete, activeToken, tokens } = useApp();
  
  // Set default initial path based on authentication state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (isAuthenticated) {
      if (currentUser.role === 'OPERATOR') return '/operator/dashboard';
      if (currentUser.role === 'ADMIN') return '/admin/dashboard';
      return '/farmer/dashboard';
    }
    return '/';
  });

  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<UserRole>('FARMER');
  const [selectedCentreId, setSelectedCentreId] = useState<string>('cnt_sinnar');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('tkn_001');
  const [confirmedToken, setConfirmedToken] = useState<Token | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  // Global Farmer Voice Search State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [globalVoiceParams, setGlobalVoiceParams] = useState<{
    crop?: string;
    district?: string;
    block?: string;
    quantity?: number;
    rawText: string;
  } | null>(null);

  const printToken = confirmedToken || activeToken || tokens[0];

  // Synchronize path on authentication change
  useEffect(() => {
    if (!isAuthenticated && !currentPath.startsWith('/login') && currentPath !== '/') {
      setCurrentPath('/');
    } else if (isAuthenticated && (currentPath === '/' || currentPath.startsWith('/login'))) {
      if (currentUser.role === 'OPERATOR') setCurrentPath('/operator/dashboard');
      else if (currentUser.role === 'ADMIN') setCurrentPath('/admin/dashboard');
      else setCurrentPath('/farmer/dashboard');
    }
  }, [isAuthenticated, currentUser.role, currentPath]);

  const handleNavigate = (path: string) => {
    if (path.includes('?centreId=')) {
      const parts = path.split('?centreId=');
      setSelectedCentreId(parts[1]);
      setCurrentPath(parts[0]);
      return;
    }
    if (path.includes('?tokenId=')) {
      const parts = path.split('?tokenId=');
      setSelectedTokenId(parts[1]);
      setCurrentPath(parts[0]);
      return;
    }

    setCurrentPath(path);
  };

  const handleSelectRoleFromEntry = (role: UserRole) => {
    setSelectedRoleForLogin(role);
    if (role === 'FARMER') handleNavigate('/login/farmer');
    else if (role === 'OPERATOR') handleNavigate('/login/operator');
    else if (role === 'ADMIN') handleNavigate('/login/admin');
  };

  const handleGlobalVoiceSearch = (params: {
    crop?: string;
    district?: string;
    block?: string;
    quantity?: number;
    rawText: string;
  }) => {
    setGlobalVoiceParams(params);
    handleNavigate('/farmer/centres');
  };

  const isAuthView = currentPath === '/' || currentPath.startsWith('/login');

  // Role-Based Access Control (RBAC) Route Guard Enforcement
  const getEnforcedPath = () => {
    if (!isAuthenticated && !isAuthView) {
      return '/';
    }
    if (isAuthenticated) {
      if (currentUser.role === 'FARMER' && (currentPath.startsWith('/operator') || currentPath.startsWith('/admin'))) {
        return '/farmer/dashboard';
      }
      if (currentUser.role === 'OPERATOR' && (currentPath.startsWith('/farmer') || currentPath.startsWith('/admin'))) {
        return '/operator/dashboard';
      }
      if (currentUser.role === 'ADMIN' && (currentPath.startsWith('/farmer') || currentPath.startsWith('/operator'))) {
        return '/admin/dashboard';
      }
    }
    return currentPath;
  };

  const effectivePath = getEnforcedPath();

  // Strict Farmer Role Isolation for Global Voice Search FAB
  const isFarmerRole =
    isAuthenticated && currentUser?.role === 'FARMER' && effectivePath.startsWith('/farmer');

  const renderCurrentView = () => {
    if (isAuthenticated && currentUser?.role === 'FARMER' && !isProfileComplete) {
      return <FarmerOnboardingPage onComplete={() => handleNavigate('/farmer/dashboard')} />;
    }

    switch (effectivePath) {
      // Entry & Auth Routes
      case '/':
        return <RoleSelectionPage onSelectRole={handleSelectRoleFromEntry} />;
      case '/login/farmer':
        return (
          <RoleLoginPage
            role="FARMER"
            onNavigate={handleNavigate}
            onChangeRole={() => handleNavigate('/')}
          />
        );
      case '/login/operator':
        return (
          <RoleLoginPage
            role="OPERATOR"
            onNavigate={handleNavigate}
            onChangeRole={() => handleNavigate('/')}
          />
        );
      case '/login/admin':
        return (
          <RoleLoginPage
            role="ADMIN"
            onNavigate={handleNavigate}
            onChangeRole={() => handleNavigate('/')}
          />
        );

      // Farmer Views
      case '/farmer/onboarding':
        return <FarmerOnboardingPage onComplete={() => handleNavigate('/farmer/dashboard')} />;
      case '/farmer/dashboard':
        return (
          <FarmerDashboard
            onNavigate={handleNavigate}
            onSelectCentre={(id) => setSelectedCentreId(id)}
          />
        );
      case '/farmer/centres':
        return (
          <SearchCentresPage
            onNavigate={handleNavigate}
            onSelectCentre={(id) => setSelectedCentreId(id)}
            voiceParams={globalVoiceParams}
          />
        );
      case '/farmer/centre-details':
        return (
          <CentreDetailsPage
            centreId={selectedCentreId}
            onNavigate={handleNavigate}
          />
        );
      case '/farmer/book-slot':
        return (
          <ChooseSlotPage
            centreId={selectedCentreId}
            onNavigate={handleNavigate}
            onBookingSuccess={(tkn) => setConfirmedToken(tkn)}
          />
        );
      case '/farmer/token-confirmation':
        return (
          <TokenConfirmationPage
            token={confirmedToken}
            onNavigate={handleNavigate}
          />
        );
      case '/farmer/live-queue':
        return <LiveQueuePage onNavigate={handleNavigate} />;
      case '/farmer/my-bookings':
        return <MyBookingsPage onNavigate={handleNavigate} />;
      case '/farmer/profile':
        return <FarmerProfilePage />;

      // Operator Dedicated Views - Strict Separate Routing
      case '/operator/dashboard':
        return <OperatorDashboardPage onNavigate={handleNavigate} />;

      case '/operator/live-queue':
      case '/operator/queue':
        return <OperatorLiveQueuePage onNavigate={handleNavigate} />;

      case '/operator/token-list':
      case '/operator/tokens':
        return <OperatorTokenListPage onNavigate={handleNavigate} />;

      case '/operator/farmer-verification':
      case '/operator/verification':
        return (
          <FarmerVerificationPage
            initialTokenId={selectedTokenId}
            onNavigate={handleNavigate}
          />
        );

      case '/operator/procurement-records':
      case '/operator/procurement':
      case '/operator/records':
        return <ProcurementRecordsPage onNavigate={handleNavigate} />;

      case '/operator/centre-reports':
      case '/operator/reports':
        return <OperatorReportsPage onNavigate={handleNavigate} />;

      case '/operator/centre-settings':
      case '/operator/settings':
        return <OperatorSettingsPage onNavigate={handleNavigate} />;

      // Admin Views - Strict Purpose-Built Route Mapping
      case '/admin/dashboard':
      case '/admin/overview':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case '/admin/centres':
        return <AdminCentresPage />;
      case '/admin/farmers':
        return <AdminFarmersPage />;
      case '/admin/tokens':
        return <AdminTokensPage />;
      case '/admin/analytics':
      case '/admin/reports':
        return <AdminAnalyticsPage />;
      case '/admin/settings':
        return <AdminSettingsPage />;

      default:
        if (isAuthenticated) {
          if (currentUser.role === 'OPERATOR') return <OperatorDashboardPage onNavigate={handleNavigate} />;
          if (currentUser.role === 'ADMIN') return <AdminDashboard onNavigate={handleNavigate} />;
          return (
            <FarmerDashboard
              onNavigate={handleNavigate}
              onSelectCentre={(id) => setSelectedCentreId(id)}
            />
          );
        }
        return <RoleSelectionPage onSelectRole={handleSelectRoleFromEntry} />;
    }
  };

  // If on public Auth/Role selection screen, render fullscreen view without layout shell
  if (isAuthView && !isAuthenticated) {
    return (
      <div className="min-h-[100dvh] min-h-screen w-full bg-[#f9faf6] text-[#1a1c1a] font-sans selection:bg-[#c1ecd4] selection:text-[#002114] print:hidden overflow-y-auto overflow-x-hidden">
        {renderCurrentView()}
      </div>
    );
  }

  return (
    <>
      {/* Normal On-Screen App Shell (Hidden during @media print) */}
      <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#f9faf6] text-[#1a1c1a] flex flex-col font-sans selection:bg-[#c1ecd4] selection:text-[#002114] overflow-hidden print:hidden relative">
        {/* Top Universal Navbar */}
        <div className="shrink-0 z-40 print:hidden">
          <Navbar
            currentPath={effectivePath}
            onNavigate={handleNavigate}
            onOpenNotifications={() => setIsNotificationOpen(true)}
          />
        </div>

        {/* Main App Canvas */}
        <div className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 gap-6 min-h-0 overflow-hidden print:hidden">
          {/* Left Sidebar */}
          <aside className="w-64 shrink-0 hidden md:flex flex-col h-full overflow-hidden print:hidden">
            <Sidebar currentPath={effectivePath} onNavigate={handleNavigate} />
          </aside>

          {/* Dynamic Route Content */}
          <main className="flex-1 w-full min-w-0 h-full overflow-y-auto overflow-x-hidden pb-28 print:hidden">
            <ErrorBoundary>
              {renderCurrentView()}
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile Sticky Bottom Nav Bar */}
        <div className="print:hidden">
          <MobileBottomNav currentPath={effectivePath} onNavigate={handleNavigate} />
        </div>

        {/* Slide-over Notifications Drawer */}
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Global Farmer Voice Search FAB & Modal (Controlled Strictly by Farmer Role) */}
        {isFarmerRole && (
          <>
            <FloatingVoiceSearchButton onClick={() => setIsVoiceModalOpen(true)} />
            <VoiceSearchModal
              isOpen={isVoiceModalOpen}
              onClose={() => setIsVoiceModalOpen(false)}
              onApplySearch={handleGlobalVoiceSearch}
            />
          </>
        )}
      </div>

      {/* Dedicated Standalone 1-Page Printable Procurement Pass for @media print */}
      {printToken && <PrintablePass token={printToken} />}
    </>
  );
};

export default function App() {
  return (
    <AppContextProvider>
      <MainLayout />
    </AppContextProvider>
  );
}
