import React, { useState } from 'react';
import { 
  Percent, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Zap 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PaymentScreen: React.FC = () => {
  const { 
    currentUser, 
    claimableOrders, 
    claimOrder, 
    stats,
    transactions 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Top Picks' | '100-300' | '301-500' | '501-2000'>('Top Picks');

  const filteredOrders = claimableOrders.filter(
    order => order.category_range === activeTab
  );

  // Calculate user total rewards earned
  const totalRewards = transactions
    .filter(t => t.user_id === currentUser.id && (t.type === 'Claim' || t.type === 'Reward' || t.type === 'Binding Bonus'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingWithdrawal = transactions
    .filter(t => t.user_id === currentUser.id && t.type === 'Withdrawal' && t.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-3.5 pb-24 animate-in fade-in duration-150">
      
      {/* 1. Hero Card: Cashback %, Balance, Total Rewards, Pending */}
      <div className="fintech-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
              <Percent className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Dynamic Order Cashback</span>
              <span className="block text-[10px] text-emerald-800 font-bold">Active Auto-Settlement</span>
            </div>
          </div>

          <div className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-lg flex items-center gap-1 shadow-xs border border-emerald-700">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{stats.commission_rate.toFixed(2)}% Cashback</span>
          </div>
        </div>

        {/* 3 Metric Summary Blocks */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-center">
            <span className="text-[10px] text-slate-700 font-bold block truncate uppercase">Balance</span>
            <strong className="text-xs font-extrabold font-mono text-slate-900 block mt-0.5">
              ₹{currentUser.available_balance.toFixed(0)}
            </strong>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-center">
            <span className="text-[10px] text-emerald-900 font-bold block truncate uppercase">Total Rewards</span>
            <strong className="text-xs font-extrabold font-mono text-emerald-950 block mt-0.5">
              ₹{totalRewards.toFixed(0)}
            </strong>
          </div>

          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-center">
            <span className="text-[10px] text-amber-900 font-bold block truncate uppercase">Pending</span>
            <strong className="text-xs font-extrabold font-mono text-amber-950 block mt-0.5">
              ₹{pendingWithdrawal.toFixed(0)}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Alert Banner: Reward hours & Payment method notices */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-300">
          <AlertCircle className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="text-[11px] text-amber-950 leading-tight space-y-0.5">
          <span className="font-extrabold block text-amber-950">Active Reward Hours (10:00 - 23:00 IST)</span>
          <p className="text-amber-900 font-medium text-[10px]">
            Orders are matched automatically to your bound Paytm, PhonePe & GooglePay tools. 5% direct commission is distributed automatically upon claim.
          </p>
        </div>
      </div>

      {/* 3. Horizontal Pill Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
        {(['Top Picks', '100-300', '301-500', '501-2000'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-xs border border-slate-900'
                : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Claim Feed Cards */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="fintech-card p-10 text-center text-slate-600">
            <Sparkles className="w-8 h-8 mx-auto text-emerald-600 mb-2 animate-bounce" />
            <p className="text-xs font-extrabold text-slate-900">All orders claimed in this category!</p>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Check back soon for new order batches.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className={`fintech-card p-3.5 transition-all duration-150 ${
                order.is_claimed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between">
                
                {/* Code & Range Badge */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-900 font-mono font-bold text-xs rounded border border-slate-300">
                      {order.code}
                    </span>
                    <span className="text-[10px] text-emerald-900 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      {stats.commission_rate}% Cashback
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      ₹{order.amount_inr}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      Income: <strong className="font-mono text-sm text-emerald-900">+₹{order.income_inr.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {/* Claim CTA Button */}
                <div>
                  {order.is_claimed ? (
                    <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300">
                      <CheckCircle className="w-4 h-4" />
                      <span>Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => claimOrder(order.id)}
                      className="fintech-btn-emerald px-4 py-2 text-xs font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Order bottom details */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-700 font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>Settlement to Available Balance</span>
                </span>
                <span className="font-extrabold text-purple-800">
                  +5% Affiliate auto-credited
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
