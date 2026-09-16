import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SecurityPinModal } from '../components/SecurityPinModal';
import { WalletType } from '../types';

interface ProviderConfig {
  name: string;
  type: WalletType;
  payinLimit: string;
  payoutLimit: string;
  hasBonus: boolean;
  color: string;
  iconText: string;
}

const PERSONAL_PROVIDERS: ProviderConfig[] = [
  { name: 'PhonePe UPI', type: 'Personal', payinLimit: '₹100 - ₹1,00,000', payoutLimit: '₹500 - ₹50,000', hasBonus: false, color: 'bg-purple-700', iconText: 'Pe' },
  { name: 'Paytm UPI / Wallet', type: 'Personal', payinLimit: '₹100 - ₹1,00,000', payoutLimit: '₹500 - ₹50,000', hasBonus: false, color: 'bg-sky-700', iconText: 'Pt' },
  { name: 'Mobikwik UPI', type: 'Personal', payinLimit: '₹100 - ₹50,000', payoutLimit: '₹500 - ₹25,000', hasBonus: false, color: 'bg-cyan-700', iconText: 'Mb' },
  { name: 'Freecharge UPI', type: 'Personal', payinLimit: '₹100 - ₹50,000', payoutLimit: '₹500 - ₹25,000', hasBonus: false, color: 'bg-amber-600', iconText: 'Fc' },
  { name: 'IndusPay IMPS', type: 'Personal', payinLimit: '₹500 - ₹2,00,000', payoutLimit: '₹1,000 - ₹1,00,000', hasBonus: false, color: 'bg-red-800', iconText: 'In' },
  { name: 'BharatPe Merchant', type: 'Personal', payinLimit: '₹500 - ₹2,00,000', payoutLimit: '₹500 - ₹50,000', hasBonus: false, color: 'bg-teal-700', iconText: 'BP' },
  { name: 'Navi UPI', type: 'Personal', payinLimit: '₹200 - ₹1,00,000', payoutLimit: '₹500 - ₹50,000', hasBonus: false, color: 'bg-emerald-700', iconText: 'Nv' },
];

const BUSINESS_PROVIDERS: ProviderConfig[] = [
  { name: 'GooglePay Business', type: 'Business', payinLimit: '₹500 - ₹5,00,000', payoutLimit: '₹1,000 - ₹2,00,000', hasBonus: true, color: 'bg-blue-700', iconText: 'GPay' },
  { name: 'Paytm Merchant Business', type: 'Business', payinLimit: '₹500 - ₹5,00,000', payoutLimit: '₹1,000 - ₹2,00,000', hasBonus: true, color: 'bg-sky-800', iconText: 'PtBiz' },
];

export const ToolWalletScreen: React.FC = () => {
  const { userWallets, currentUser, bindWallet, stats, showToast } = useApp();
  
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [walletSegment, setWalletSegment] = useState<WalletType>('Business');
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig>(BUSINESS_PROVIDERS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const userSavedWallets = userWallets.filter(w => w.user_id === currentUser.id);

  const handleStartAdd = () => {
    setIsAdding(true);
  };

  const handleSelectSegment = (type: WalletType) => {
    setWalletSegment(type);
    setSelectedProvider(type === 'Business' ? BUSINESS_PROVIDERS[0] : PERSONAL_PROVIDERS[0]);
  };

  const handleConfirmSubmit = () => {
    if (!accountNumber.trim()) {
      showToast('Please enter your UPI ID or Account details.');
      return;
    }
    if (!holderName.trim()) {
      showToast('Please enter Account Holder / Business Name.');
      return;
    }
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = (pin: string) => {
    const res = bindWallet(
      {
        type: walletSegment,
        provider_name: selectedProvider.name,
        account_number: accountNumber.trim(),
        holder_name: holderName.trim(),
        has_binding_bonus: selectedProvider.hasBonus,
      },
      pin
    );

    if (res.success) {
      setIsAdding(false);
      setAccountNumber('');
      setHolderName('');
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="fintech-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold border border-amber-300">
            <Wallet className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Settlement Accounts & Tools</h2>
            <p className="text-[11px] text-slate-700 font-medium">Bind verified personal & business UPI gateways</p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={handleStartAdd}
            className="fintech-btn-emerald px-3.5 py-1.5 text-xs font-extrabold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Link Tool</span>
          </button>
        )}
      </div>

      {/* Add Tool View vs Saved List View */}
      {isAdding ? (
        <div className="fintech-card p-5 space-y-4 animate-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-sm">Link Payout & Settlement Handle</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-700 hover:text-slate-950 font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Segmented Toggle: Personal vs Business */}
          <div className="p-1 bg-slate-100 rounded-xl grid grid-cols-2 gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => handleSelectSegment('Personal')}
              className={`py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                walletSegment === 'Personal'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Personal UPI</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSegment('Business')}
              className={`py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                walletSegment === 'Business'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Business Merchant</span>
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] rounded font-extrabold shadow-xs">
                +₹50 Bonus
              </span>
            </button>
          </div>

          {/* Provider List */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">
              Select {walletSegment} Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(walletSegment === 'Business' ? BUSINESS_PROVIDERS : PERSONAL_PROVIDERS).map(prov => {
                const isSelected = selectedProvider.name === prov.name;
                return (
                  <button
                    key={prov.name}
                    type="button"
                    onClick={() => setSelectedProvider(prov)}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {prov.hasBonus && (
                      <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 bg-amber-600 text-white text-[8px] font-extrabold rounded shadow-xs">
                        +₹50 Bonus
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${prov.color} text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs`}>
                        {prov.iconText}
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 leading-tight">
                        {prov.name}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-700 font-medium space-y-0.5">
                      <div>Payin Limit: <strong className="text-slate-900 font-bold">{prov.payinLimit}</strong></div>
                      <div>Payout Limit: <strong className="text-slate-900 font-bold">{prov.payoutLimit}</strong></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                UPI Virtual Payment Address (VPA) / Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="e.g., 9876543210@paytm or business@upi"
                className="w-full fintech-inset px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Beneficiary / Account Holder Full Legal Name
              </label>
              <input
                type="text"
                value={holderName}
                onChange={e => setHolderName(e.target.value)}
                placeholder="e.g., Arjun Dev (must match bank records)"
                className="w-full fintech-inset px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bonus Notice */}
          {selectedProvider.hasBonus && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2.5 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong className="font-bold">Instant Incentive:</strong> ₹{stats.binding_bonus_amount} will be instantly credited to your Available Balance upon successful binding!
              </span>
            </div>
          )}

          {/* CTA Button */}
          <button
            id="bind-tool-confirm-btn"
            type="button"
            onClick={handleConfirmSubmit}
            className="w-full py-3 fintech-btn-emerald text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            <span>Confirm & Bind Payout Account</span>
          </button>

        </div>
      ) : (
        /* Saved Wallets List or Empty State */
        <div className="space-y-3">
          {userSavedWallets.length === 0 ? (
            <div className="fintech-card p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
                <Wallet className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">No Payout Accounts Bound Yet</h3>
                <p className="text-xs text-slate-700 font-medium mt-1 max-w-xs mx-auto">
                  Bind your PhonePe, Paytm, or GooglePay Business account to start receiving automated order payouts directly.
                </p>
              </div>
              <button
                onClick={handleStartAdd}
                className="fintech-btn-emerald px-5 py-2.5 text-xs font-extrabold rounded-lg inline-flex items-center gap-1.5 cursor-pointer mt-2 shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Bind First Account (+₹50 Bonus)</span>
              </button>
            </div>
          ) : (
            userSavedWallets.map(w => (
              <div
                key={w.id}
                className="fintech-card p-4 hover:border-slate-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shadow-xs border border-slate-900">
                      {w.provider_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-slate-900">{w.provider_name}</h4>
                        {w.has_binding_bonus && (
                          <span className="px-1.5 py-0.2 bg-amber-500 text-white font-extrabold text-[8px] rounded">
                            Bonus Active
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-800 font-bold text-[8px] rounded border border-slate-200">
                          {w.type}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-900 mt-0.5 font-extrabold">
                        {w.account_number}
                      </p>
                      <span className="text-[10px] text-slate-700 font-medium">
                        Holder: {w.holder_name} • Verified on {w.created_at}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>{w.bound_status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Security PIN Modal */}
      <SecurityPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen5(false)} // Note: closing handler
        onSuccess={handlePinSuccess}
        title="Authorize Tool Binding"
        description="Please confirm this payout account authorization using your 6-digit Security PIN."
      />

    </div>
  );
};
