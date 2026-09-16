import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Wallet, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  Lock,
  Clock,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SecurityPinModal } from '../components/SecurityPinModal';

export const WithdrawalScreen: React.FC = () => {
  const { currentUser, isAuthenticated, setIsAuthModalOpen, userWallets, submitWithdrawal, setActiveScreen, showToast } = useApp();

  const [amount, setAmount] = useState<string>('500');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    userWallets.length > 0 ? userWallets[0].id : ''
  );
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const boundWallets = userWallets.filter(w => w.user_id === currentUser.id);

  const handleInitiateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      showToast('Please log in with email OTP to withdraw funds.');
      return;
    }
    if (boundWallets.length === 0) {
      showToast('Please link a payout account (UPI / Paytm / PhonePe) before withdrawing.');
      setActiveScreen('tool');
      return;
    }
    if (parsedAmount <= 0) {
      showToast('Please enter a valid withdrawal amount.');
      return;
    }
    if (parsedAmount > currentUser.available_balance) {
      showToast('Withdrawal amount exceeds your available balance.');
      return;
    }
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = (pin: string) => {
    const res = submitWithdrawal(parsedAmount, selectedWalletId, pin);
    if (res.success) {
      setActiveScreen('home');
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => setActiveScreen('profile')}
          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-xs border border-slate-200 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>Payout & Withdrawal</span>
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[9px] rounded border border-blue-200">
              IMPS / UPI
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Direct settlement to verified banking & UPI tools</p>
        </div>
      </div>

      {/* Available Balance Card */}
      <div className="fintech-card p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wide">Available Vault Balance</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5 block tabular-nums">
            ₹{currentUser.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
          <ArrowUpRight className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleInitiateWithdrawal} className="fintech-card p-4 space-y-4">
        
        {/* Select Destination Wallet */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-900">
              Select Verified Payout Handle
            </label>
            <button
              type="button"
              onClick={() => setActiveScreen('tool')}
              className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link New Account</span>
            </button>
          </div>

          {boundWallets.length === 0 ? (
            <div className="fintech-card-soft p-3 rounded-xl border border-amber-200 text-center space-y-2">
              <p className="text-xs text-amber-900 font-semibold">No payout account linked yet</p>
              <p className="text-[11px] text-slate-600">Link your UPI ID, Paytm, or PhonePe account to receive withdrawals.</p>
              <button
                type="button"
                onClick={() => setActiveScreen('tool')}
                className="fintech-btn-primary px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Link Payout Account Now
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {boundWallets.map((wallet) => (
                <label
                  key={wallet.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedWalletId === wallet.id
                      ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payoutWallet"
                      value={wallet.id}
                      checked={selectedWalletId === wallet.id}
                      onChange={() => setSelectedWalletId(wallet.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{wallet.provider_name}</span>
                      <span className="text-[11px] font-mono text-slate-600">{wallet.account_number}</span>
                      <span className="text-[10px] text-slate-400 block">{wallet.account_holder}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-1">
            Withdrawal Amount (INR)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              min="50"
              className="w-full fintech-inset pl-8 pr-3.5 py-2.5 text-base font-bold font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {['100', '500', '1000', '5000'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  amount === preset
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Institutional SLA Notice */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Settlement Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Payout requests are processed within 24 hours via automated IMPS / UPI bank rails. You will be prompted for your 6-digit Security PIN to authorize this transfer.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={boundWallets.length === 0 || parsedAmount <= 0}
          className="w-full fintech-btn-emerald py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>Authorize Payout (Requires 6-Digit PIN)</span>
        </button>

      </form>

      {/* Security PIN Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="Authorize Withdrawal"
        description={`Enter your 6-digit Security PIN to confirm payout of ₹${parsedAmount.toLocaleString('en-IN')}.`}
      />

    </div>
  );
};
