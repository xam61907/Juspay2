import React, { useState } from 'react';
import { Bell, Copy, Check, LogIn, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC<{ onOpenNotifications: () => void }> = ({ onOpenNotifications }) => {
  const { currentUser, isAuthenticated, unreadNotificationCount, stats, showToast, setIsAuthModalOpen } = useApp();
  const [copied, setCopied] = useState(false);

  const copyUserId = () => {
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      return;
    }
    navigator.clipboard.writeText(currentUser.referral_code || currentUser.id);
    setCopied(true);
    showToast(`Account ID ${currentUser.referral_code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white px-4 py-2.5 border-b border-slate-200 shadow-xs">
      <div className="max-w-md mx-auto space-y-2">
        
        {/* Top Mini Trust Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-700 font-medium px-0.5 border-b border-slate-200 pb-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="tracking-tight">256-Bit SSL Encrypted Vault</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono font-bold">1 USDT = ₹{stats.realtime_exchange_rate}</span>
            <span className="text-[9px] bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold border border-emerald-300">
              AUDITED PEG
            </span>
          </div>
        </div>

        {/* Main User Identity & Actions Row */}
        <div className="flex items-center justify-between">
          
          {/* Left: Avatar & Verification Badge */}
          <div className="flex items-center gap-2.5">
            <div 
              onClick={() => setIsAuthModalOpen(true)}
              className="relative cursor-pointer group"
              title={isAuthenticated ? 'Account Profile' : 'Click to log in'}
            >
              <div className={`w-9 h-9 rounded-full bg-slate-100 p-0.5 border ${isAuthenticated ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-300'} overflow-hidden flex items-center justify-center shadow-xs`}>
                {isAuthenticated && currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-800">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isAuthenticated ? 'bg-emerald-600' : 'bg-slate-500'}`} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">
                  {currentUser.username}
                </span>
                {isAuthenticated ? (
                  currentUser.role === 'admin' ? (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white font-extrabold text-[9px] rounded-md tracking-wider">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-900 font-extrabold text-[9px] rounded-md border border-emerald-300 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                      <span>KYC VERIFIED</span>
                    </span>
                  )
                ) : (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-[9px] rounded-md border border-slate-200">
                    Guest Mode
                  </span>
                )}
              </div>

              {isAuthenticated ? (
                <button
                  onClick={copyUserId}
                  className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-950 transition-colors mt-0.5 font-medium"
                >
                  <span>UID: <strong className="text-slate-900 font-mono font-bold">{currentUser.referral_code}</strong></span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-600" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline mt-0.5 block"
                >
                  Secure Login with Email OTP →
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="fintech-btn-emerald px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              id="notification-bell-btn"
              className="relative w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-rose-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
