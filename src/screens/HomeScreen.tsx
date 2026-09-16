import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  Users, 
  Gift,
  Award,
  Eye, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HomeScreenProps {
  onOpenNotifications?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { 
    currentUser, 
    isAuthenticated,
    transactions, 
    tasks,
    stats, 
    setActiveScreen, 
    setIsAuthModalOpen,
    showToast 
  } = useApp();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  // Filter user transactions
  const userTxs = transactions.filter(t => t.user_id === currentUser.id);
  const recentTxs = userTxs.slice(0, 5);

  const pendingTasksCount = tasks.filter(t => !t.is_completed).length;

  const filteredModalTxs = filterType === 'all' 
    ? userTxs 
    : userTxs.filter(t => t.type.toLowerCase() === filterType.toLowerCase());

  const handleCopyTx = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTx(txId);
    showToast(`Transaction reference #${txId} copied`);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
      case 'successful':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Settled</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Processing</span>
          </span>
        );
      case 'Rejected':
      case 'Failed':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-900 border border-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const usdtEquivalent = (currentUser.available_balance / stats.realtime_exchange_rate).toFixed(2);

  return (
    <div className="space-y-3.5 pb-24 animate-in fade-in duration-150">
      
      {/* Live Notice / Announcement Bar */}
      <div className="bg-slate-900 text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-800 flex items-center gap-2.5 overflow-hidden shadow-xs">
        <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] shrink-0 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SLA NOTICE</span>
        </div>
        <div className="overflow-hidden w-full whitespace-nowrap">
          <div className="animate-marquee text-slate-200 font-semibold text-[11px]">
            {stats.global_announcement || 'Official Settlement Gateway: Guaranteed Fixed 1 USDT = 111 INR • Payouts to UPI, Paytm & PhonePe 24/7.'}
          </div>
        </div>
      </div>

      {/* Guest Mode Banner when Logged Out */}
      {!isAuthenticated && (
        <div className="fintech-card p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs border border-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900">Sign in to Access Your Vault</p>
              <p className="text-[11px] text-slate-700 font-medium truncate">Authenticate with Email OTP to trade and withdraw funds.</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="fintech-btn-emerald px-3.5 py-2 text-white text-xs font-bold rounded-lg flex-shrink-0 cursor-pointer shadow-xs"
          >
            Sign In
          </button>
        </div>
      )}

      {/* 1. Executive Midnight Slate Balance Vault Card */}
      <div className="fintech-card-navy p-5 relative overflow-hidden">
        {/* Subtle high-contrast grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Total Available Vault
              </span>
            </div>
            
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span>Statement</span>
            </button>
          </div>

          {/* Primary INR Balance */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-400">₹</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums">
              {currentUser.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>

          {/* Peg Equivalence Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono font-bold">
              ≈ {usdtEquivalent} USDT
            </span>
            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600">
              Fixed 1:111 Peg
            </span>
          </div>

          {/* Primary Deposit & Withdraw Action Bar */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              id="hero-deposit-btn"
              onClick={() => setActiveScreen('deposit')}
              className="py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer border border-emerald-400"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5] text-slate-950" />
              <span>Deposit USDT</span>
            </button>

            <button
              id="hero-withdraw-btn"
              onClick={() => setActiveScreen('withdraw')}
              className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Withdraw INR</span>
            </button>
          </div>

          {/* Card footer metrics */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-300 block font-semibold uppercase tracking-wider">Commissions</span>
              <strong className="text-sm font-bold font-mono text-emerald-400">
                ₹{currentUser.commission_balance.toFixed(2)}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block font-semibold uppercase tracking-wider">Trading Volume</span>
              <strong className="text-sm font-bold font-mono text-white">
                ₹{currentUser.sell_balance.toFixed(2)}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Summary Turnover & Deposit Stats */}
      <div className="fintech-card p-3.5 grid grid-cols-2 gap-3 divide-x divide-slate-200">
        <div className="flex items-center gap-3 pr-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-200">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wide truncate">Total Inflow</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono tabular-nums">
              ₹{currentUser.deposit_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center flex-shrink-0 border border-blue-200">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wide truncate">Paid Withdrawals</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono tabular-nums">
              ₹{currentUser.withdrawal_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Clean Actions Grid (4 High-Impact Cards: Deposit, Withdraw, Task Rewards, 2-Tier Team) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* USDT Deposit */}
        <button
          id="quick-usdt-btn"
          onClick={() => setActiveScreen('deposit')}
          className="fintech-card p-3 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-emerald-500 active:scale-98 transition-all relative"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1.5 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
            <Coins className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-900 leading-tight">Deposit USDT</span>
          <span className="text-[10px] text-emerald-800 font-bold font-mono mt-0.5">Rate: ₹111.00</span>
        </button>

        {/* Withdraw INR */}
        <button
          id="quick-withdraw-btn"
          onClick={() => setActiveScreen('withdraw')}
          className="fintech-card p-3 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-rose-400 active:scale-98 transition-all relative"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center mb-1.5 border border-rose-200 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-colors">
            <ArrowUpRight className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-900 leading-tight">Withdraw INR</span>
          <span className="text-[10px] text-rose-800 font-bold mt-0.5">UPI / IMPS</span>
        </button>

        {/* Task Rewards */}
        <button
          id="quick-task-btn"
          onClick={() => setActiveScreen('task')}
          className="fintech-card p-3 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-amber-400 active:scale-98 transition-all relative"
        >
          <span className="absolute -top-1.5 right-1.5 px-1.5 py-0.2 bg-amber-600 text-white font-extrabold text-[8px] rounded shadow-xs">
            +₹6,300
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center mb-1.5 border border-amber-200 group-hover:bg-amber-600 group-hover:text-slate-950 group-hover:border-amber-600 transition-colors">
            <Gift className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-900 leading-tight">Task Rewards</span>
          <span className="text-[10px] text-amber-800 font-bold mt-0.5">{currentUser.points} PTS</span>
        </button>

        {/* 2-Tier Team Affiliate */}
        <button
          id="quick-team-btn"
          onClick={() => setActiveScreen('team')}
          className="fintech-card p-3 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-purple-400 active:scale-98 transition-all relative"
        >
          <span className="absolute -top-1.5 right-1.5 px-1.5 py-0.2 bg-purple-700 text-white font-extrabold text-[8px] rounded shadow-xs">
            5% + 2.5%
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-1.5 border border-purple-200 group-hover:bg-purple-700 group-hover:text-white group-hover:border-purple-700 transition-colors">
            <Users className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-900 leading-tight">Affiliate Team</span>
          <span className="text-[10px] text-purple-800 font-bold mt-0.5">2-Tier System</span>
        </button>

      </div>

      {/* 4. Task Rewards Spotlight Banner */}
      <div 
        onClick={() => setActiveScreen('task')}
        className="fintech-card p-3.5 bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-white border border-amber-300 hover:border-amber-400 transition-all cursor-pointer shadow-xs group"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold flex-shrink-0 shadow-xs border border-amber-400 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 truncate">Daily Task Reward Center</span>
                <span className="px-1.5 py-0.2 bg-amber-600 text-white font-extrabold text-[8px] rounded uppercase shadow-xs shrink-0">
                  {pendingTasksCount} Available
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                Complete daily missions & trade volume to claim instant cash bonuses and points.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-950 bg-amber-200/80 group-hover:bg-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-300 flex-shrink-0 transition-colors">
            <span>Claim</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions Ledger */}
      <div className="fintech-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-700" />
            <span>Settlement Ledger</span>
          </h3>
          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Full Statement</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTxs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-600">
              <p className="font-semibold text-slate-800">No recent settlements on record</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Your confirmed deposits and withdrawals will appear here.</p>
            </div>
          ) : (
            recentTxs.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'deposit' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : tx.type === 'withdrawal'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-purple-50 text-purple-800 border border-purple-200'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'withdrawal' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 capitalize">
                        {tx.type === 'commission' ? 'Affiliate Reward' : tx.type}
                      </span>
                      <button 
                        onClick={() => handleCopyTx(tx.id)}
                        className="text-[10px] text-slate-600 hover:text-slate-900 font-mono flex items-center gap-0.5 font-bold"
                        title="Copy Reference"
                      >
                        <span>#{tx.id.slice(-6)}</span>
                        {copiedTx === tx.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium truncate">{tx.details || new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-extrabold font-mono block ${
                    tx.type === 'withdrawal' ? 'text-slate-900' : 'text-emerald-800'
                  }`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="mt-0.5 flex justify-end">
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Institutional Trust & Assurance Bar (Placed at Bottom of Home Page) */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 grid grid-cols-3 gap-1 text-center shadow-xs">
        <div className="flex flex-col items-center justify-center p-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-[11px] font-bold text-slate-900 leading-tight">100% Reserve</span>
          <span className="text-[10px] text-slate-600 font-medium">Audited Daily</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 border-x border-slate-200">
          <Lock className="w-4 h-4 text-blue-600 mb-1" />
          <span className="text-[11px] font-bold text-slate-900 leading-tight">256-Bit SSL</span>
          <span className="text-[10px] text-slate-600 font-medium">Bank-Grade Vault</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1">
          <TrendingUp className="w-4 h-4 text-amber-600 mb-1" />
          <span className="text-[11px] font-bold text-slate-900 leading-tight">Instant SLA</span>
          <span className="text-[10px] text-slate-600 font-medium">UPI / IMPS Payout</span>
        </div>
      </div>

      {/* Detail Statement Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Official Account Statement</h3>
                <p className="text-[11px] text-slate-700 font-medium">Verified cryptographic ledger of all user transactions</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs cursor-pointer border border-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {['all', 'deposit', 'withdrawal', 'commission'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold capitalize transition-all cursor-pointer ${
                    filterType === t 
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredModalTxs.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-8 font-medium">No records match the selected filter.</p>
              ) : (
                filteredModalTxs.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 capitalize">{tx.type}</span>
                        <span className="text-[10px] text-slate-600 font-mono font-bold">#{tx.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                      {tx.tx_hash && (
                        <p className="text-[9px] font-mono text-slate-500 truncate max-w-[200px]">Hash: {tx.tx_hash}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold font-mono text-slate-900 block">
                        ₹{tx.amount.toFixed(2)}
                      </span>
                      <div className="mt-0.5 flex justify-end">
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors border border-slate-900 shadow-xs"
            >
              Close Statement
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
