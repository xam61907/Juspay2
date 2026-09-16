import React from 'react';
import { 
  Calendar, 
  Coins, 
  TrendingUp, 
  Wallet, 
  ArrowDownLeft, 
  Award, 
  Power
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatisticsScreen: React.FC = () => {
  const { currentUser, stats, toggleSellingState, setActiveScreen } = useApp();

  // Real-time formatted date (DD/MM/YYYY)
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  // Estimated income based on in-process amount * commission_rate
  const estimatedIncome = (stats.in_process_amount * (stats.commission_rate / 100)).toFixed(2);

  return (
    <div className="space-y-3.5 pb-24 animate-in fade-in duration-150">
      
      {/* 1. Header with real-time date */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Statistics ({formattedDate})
          </h2>
          <p className="text-xs text-slate-700 font-semibold">Real-time Trading & Commission Metrics</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-mono font-extrabold">{formattedDate}</span>
        </div>
      </div>

      {/* 2. Account Metrics Grid (4 Cards): Balance, Sell, Deposit, Commission */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Balance Card */}
        <div className="fintech-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Balance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-slate-900 font-mono block tabular-nums">
              ₹{currentUser.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-800 block mt-0.5 font-bold">Available for Payout</span>
          </div>
        </div>

        {/* Sell Card */}
        <div className="fintech-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Sell</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-slate-900 font-mono block tabular-nums">
              ₹{currentUser.sell_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-blue-800 block mt-0.5 font-bold">Cumulative Turnover</span>
          </div>
        </div>

        {/* Deposit Card */}
        <div className="fintech-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Deposit</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-200">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-slate-900 font-mono block tabular-nums">
              ₹{currentUser.deposit_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-purple-800 block mt-0.5 font-bold">USDT / INR Inflow</span>
          </div>
        </div>

        {/* Commission Card */}
        <div className="fintech-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Commission</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-slate-900 font-mono block tabular-nums">
              ₹{currentUser.commission_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-800 block mt-0.5 font-bold">Affiliate & Bonuses</span>
          </div>
        </div>

      </div>

      {/* 3. Exchange Rate Banner */}
      <div 
        onClick={() => setActiveScreen('deposit')}
        className="bg-slate-900 rounded-xl p-3.5 text-white cursor-pointer hover:bg-slate-800 transition-all border border-slate-800 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Real Time Exchange Rates</span>
              <h3 className="text-sm font-extrabold font-mono text-white tracking-wide">
                1 USDT = {stats.realtime_exchange_rate} INR
              </h3>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-lg shadow-xs">
            Deposit Now
          </span>
        </div>
      </div>

      {/* 4. Live Operations Grid (4 Cards) */}
      <div className="space-y-2">
        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block px-0.5">
          Live Market Operations
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {/* In Process Amount */}
          <div className="fintech-card p-3">
            <span className="text-[10px] text-slate-700 font-bold block">In Process Amount</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 block mt-0.5 tabular-nums">
              ₹{stats.in_process_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* In Process Orders */}
          <div className="fintech-card p-3">
            <span className="text-[10px] text-slate-700 font-bold block">In Process Orders</span>
            <span className="text-sm font-extrabold font-mono text-slate-900 block mt-0.5">
              {stats.in_process_orders} Orders
            </span>
          </div>

          {/* Commission Rate */}
          <div className="fintech-card p-3">
            <span className="text-[10px] text-slate-700 font-bold block">Commission Rate</span>
            <span className="text-sm font-extrabold font-mono text-emerald-800 block mt-0.5">
              {stats.commission_rate.toFixed(2)}%
            </span>
          </div>

          {/* Estimated Income */}
          <div className="fintech-card p-3">
            <span className="text-[10px] text-slate-700 font-bold block">Estimated Income</span>
            <span className="text-sm font-extrabold font-mono text-amber-800 block mt-0.5 tabular-nums">
              ₹{estimatedIncome}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Trading Toggle CTA */}
      <div className="pt-1">
        <button
          id="trading-toggle-btn"
          onClick={toggleSellingState}
          className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
            stats.selling_state === 'Open'
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900'
          }`}
        >
          <Power className="w-4 h-4 stroke-[2.5]" />
          <span>
            {stats.selling_state === 'Open' ? 'OPEN SELLING (Active Matching)' : 'CLOSED SELLING (Paused)'}
          </span>
        </button>
        <p className="text-[11px] text-slate-700 text-center mt-1.5 font-semibold">
          Tap above to toggle automated matching for inbound transactions.
        </p>
      </div>

    </div>
  );
};
