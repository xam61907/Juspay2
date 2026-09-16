import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { GlobalChatbot } from './components/GlobalChatbot';
import { NotificationModal } from './components/NotificationModal';
import { EmailAuthModal } from './components/EmailAuthModal';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { StatisticsScreen } from './screens/StatisticsScreen';
import { ToolWalletScreen } from './screens/ToolWalletScreen';
import { TaskRewardsScreen } from './screens/TaskRewardsScreen';
import { TeamReferralScreen } from './screens/TeamReferralScreen';
import { CustomerServiceScreen } from './screens/CustomerServiceScreen';
import { DepositScreen } from './screens/DepositScreen';
import { WithdrawalScreen } from './screens/WithdrawalScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminPanel } from './screens/AdminPanel';

const AppContent: React.FC = () => {
  const { 
    activeScreen, 
    setActiveScreen, 
    currentUser, 
    isAuthenticated,
    switchUser,
    toastMessage, 
    isAuthModalOpen, 
    setIsAuthModalOpen 
  } = useApp();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Discrete URL hash support for administrators (e.g. #admin)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        switchUser('admin');
        setActiveScreen('admin');
      } else if (hash === '#user' || hash === '') {
        if (activeScreen === 'admin') {
          switchUser('user');
          setActiveScreen('home');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [switchUser, setActiveScreen, activeScreen]);

  // If the user is NOT authenticated, show ONLY the Login & Signup screen
  if (!isAuthenticated || currentUser.id === 'guest') {
    return (
      <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased flex flex-col justify-start items-center">
        <div className="w-full max-w-md min-h-screen bg-[#F8FAFC] shadow-[0_10px_40px_rgba(15,23,42,0.08)] relative flex flex-col border-x border-slate-200">
          
          <main className="flex-1 overflow-x-hidden">
            <AuthScreen />
          </main>

          {/* Persistent Floating Chatbot Robot */}
          <GlobalChatbot />

          {/* Dynamic Toast Feedback Notification */}
          {toastMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md flex items-center gap-2 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{toastMessage}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Render current active screen when user IS logged in
  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onOpenNotifications={() => setIsNotificationOpen(true)} />;
      case 'payment':
        return <PaymentScreen />;
      case 'tool':
        return <ToolWalletScreen />;
      case 'statistics':
        return <StatisticsScreen />;
      case 'profile':
        return <ProfileScreen onOpenNotifications={() => setIsNotificationOpen(true)} />;
      case 'deposit':
        return <DepositScreen />;
      case 'withdraw':
        return <WithdrawalScreen />;
      case 'task':
        return <TaskRewardsScreen />;
      case 'team':
        return <TeamReferralScreen />;
      case 'service':
        return <CustomerServiceScreen />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomeScreen onOpenNotifications={() => setIsNotificationOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased flex flex-col justify-start items-center">
      
      {/* Mobile Device Canvas Wrapper (Max 480px width mobile-first) */}
      <div className="w-full max-w-md min-h-screen bg-[#F8FAFC] shadow-[0_10px_40px_rgba(15,23,42,0.08)] relative flex flex-col border-x border-slate-200">
        
        {/* Top Header - Shown on primary views, or simplified header on admin */}
        {activeScreen !== 'admin' && (
          <Header onOpenNotifications={() => setIsNotificationOpen(true)} />
        )}

        {/* Main Screen Content Area */}
        <main className="flex-1 p-3.5 overflow-x-hidden">
          {renderScreen()}
        </main>

        {/* Sticky Bottom Navigation (Hidden on admin full-screen view) */}
        {activeScreen !== 'admin' && (
          <BottomNavigation />
        )}

        {/* Persistent Floating Chatbot Robot */}
        <GlobalChatbot />

        {/* Notification Modal Drawer */}
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />

        {/* Email OTP Auth Modal */}
        <EmailAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Dynamic Toast Feedback Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md flex items-center gap-2 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
