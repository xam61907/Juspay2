import React, { useState } from 'react';
import { 
  Wallet, 
  Coins, 
  Headphones, 
  Bell, 
  KeyRound, 
  LogOut, 
  LogIn,
  User as UserIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Award,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC<{ onOpenNotifications: () => void }> = ({ onOpenNotifications }) => {
  const { 
    currentUser, 
    isAuthenticated,
    logout, 
    setActiveScreen, 
    updateSecurityPin, 
    showToast,
    setIsAuthModalOpen 
  } = useApp();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    updateSecurityPin(newPin);
    setIsPinModalOpen(false);
    setNewPin('');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      
      {/* Profile Info Header Card */}
      <div className="fintech-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-xl bg-slate-100 p-0.5 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {isAuthenticated && currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-900 truncate">
                {currentUser.username}
              </h2>
              {isAuthenticated ? (
                currentUser.role === 'admin' ? (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white font-extrabold text-[9px] rounded">
                    ADMIN
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold text-[9px] rounded border border-emerald-200">
                    VIP {currentUser.points > 500 ? '2' : '1'}
                  </span>
                )
              ) : (
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 font-bold text-[9px] rounded">
                  Logged Out
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">
              {isAuthenticated ? currentUser.email : 'Not logged in'}
            </p>

            <span className="text-[11px] text-slate-600 block mt-0.5">
              {isAuthenticated ? (
                <>Referral Code: <strong className="text-emerald-700 font-mono font-bold">{currentUser.referral_code}</strong></>
              ) : (
                <span>Sign in to manage vault</span>
              )}
            </span>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isAuthenticated ? 'Switch' : 'Sign In'}
          </button>
        </div>

        {/* Quick Deposit & Withdrawal Button Bar */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveScreen('deposit')}
            className="fintech-btn-emerald py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit USDT</span>
          </button>

          <button
            onClick={() => setActiveScreen('withdraw')}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Withdraw Funds</span>
          </button>
        </div>
      </div>

      {/* 1. Asset Cards: Deposit, Withdraw, Commission */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* Deposit Balance */}
        <div className="fintech-card p-3 text-center">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1 border border-emerald-100">
            <ArrowDownLeft className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Deposit</span>
          <span className="text-xs font-extrabold font-mono text-slate-900 block mt-0.5 truncate tabular-nums">
            ₹{currentUser.deposit_balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
        </div>

        {/* Withdraw Balance */}
        <div className="fintech-card p-3 text-center">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-1 border border-amber-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Withdraw</span>
          <span className="text-xs font-extrabold font-mono text-slate-900 block mt-0.5 truncate tabular-nums">
            ₹{currentUser.withdrawal_balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
        </div>

        {/* Commission Balance */}
        <div className="fintech-card p-3 text-center">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-1 border border-purple-100">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Commission</span>
          <span className="text-xs font-extrabold font-mono text-purple-800 block mt-0.5 truncate tabular-nums">
            ₹{currentUser.commission_balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
        </div>

      </div>

      {/* 2. Utility Grid: Wallet, Integral, Service, Message, Security PIN, Tutorial */}
      <div className="fintech-card p-4 space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Platform Security & Services
        </span>

        <div className="grid grid-cols-3 gap-2.5">
          
          {/* 1. Wallet */}
          <button
            onClick={() => setActiveScreen('tool')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs text-emerald-700 flex items-center justify-center mb-1.5 border border-slate-200">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Payout Tools</span>
            <span className="text-[9px] text-slate-500">UPI / Paytm</span>
          </button>

          {/* 2. Integral / Points */}
          <button
            onClick={() => setActiveScreen('task')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs text-amber-700 flex items-center justify-center mb-1.5 border border-slate-200">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Integral</span>
            <span className="text-[9px] text-slate-500 font-semibold">Task Rewards</span>
          </button>

          {/* 3. Service */}
          <button
            onClick={() => setActiveScreen('service')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs text-blue-700 flex items-center justify-center mb-1.5 border border-slate-200">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">24/7 Desk</span>
            <span className="text-[9px] text-slate-500">Priority Support</span>
          </button>

          {/* 4. Message / Notifications */}
          <button
            onClick={onOpenNotifications}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs text-purple-700 flex items-center justify-center mb-1.5 border border-slate-200">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Notices</span>
            <span className="text-[9px] text-slate-500">Alerts & Logs</span>
          </button>

          {/* 5. Security PIN */}
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs text-teal-700 flex items-center justify-center mb-1.5 border border-slate-200">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">Security PIN</span>
            <span className="text-[9px] text-slate-500">Update PIN</span>
          </button>

          {/* 6. Tutorial */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-white shadow-xs text-rose-700 flex items-center justify-center mb-1.5 border border-slate-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">User Guide</span>
            <span className="text-[9px] text-slate-500">Documentation</span>
          </button>

        </div>
      </div>

      {/* 3. Footer: Version tag (v1.2.3) and Logout */}
      <div className="pt-2 text-center space-y-3">
        {isAuthenticated ? (
          <button
            id="logout-btn"
            onClick={logout}
            className="fintech-card px-6 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        ) : (
          <button
            id="login-profile-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="fintech-card px-6 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200 inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In with Email OTP</span>
          </button>
        )}

        <div className="text-[11px] text-slate-500 font-medium">
          <span>juspay Institutional Client • </span>
          <strong className="font-mono text-slate-700">v1.2.3</strong>
        </div>
      </div>

      {/* Security PIN Change Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleSavePin} className="w-full max-w-xs fintech-card p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Update Security PIN</h3>
            <p className="text-xs text-slate-500">
              Enter a 6-digit numeric PIN used to authorize withdrawals and tool bindings.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                New 6-Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="6 digits"
                className="w-full text-center tracking-[8px] font-mono text-lg font-bold fintech-inset py-2 text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold text-white fintech-btn-emerald rounded-lg shadow-xs cursor-pointer"
              >
                Save PIN
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tutorial Walkthrough Modal */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm fintech-card p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>juspay Institutional Guide</span>
              </h3>
              <button
                onClick={() => setIsTutorialOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <strong className="text-emerald-950 block mb-1">1. Deposit USDT & Guaranteed 1:111 Peg</strong>
                <span>Deposit crypto at 1 USDT = 111 INR with zero conversion fees on TRC20 or BSC. Once approved by admin, funds are immediately credited.</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <strong className="text-amber-950 block mb-1">2. Earn 4% Cashback Orders</strong>
                <span>Visit the Earn tab during reward hours to claim active orders. Each claim credits instant income and auto-distributes affiliate earnings.</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <strong className="text-purple-950 block mb-1">3. Automated 2-Tier Referral System</strong>
                <span>Earn 5% on direct referrals (Level A) and 2.5% on indirect referrals (Level B). All earnings are calculated automatically and added to your balance.</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <strong className="text-blue-950 block mb-1">4. ₹50 Binding Bonus</strong>
                <span>Bind a Business payment tool (GooglePay Business or Paytm Business) to receive an instant ₹50 bonus credited to your available balance.</span>
              </div>
            </div>

            <button
              onClick={() => setIsTutorialOpen(false)}
              className="fintech-btn-emerald w-full py-2.5 text-xs font-bold rounded-lg cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
