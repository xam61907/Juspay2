import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Wallet, 
  ArrowLeft, 
  Mail, 
  Coins, 
  DollarSign, 
  Lock, 
  Check, 
  AlertTriangle, 
  Eye, 
  TrendingUp, 
  Percent,
  Search,
  UserCheck,
  UserX,
  ExternalLink,
  CheckSquare,
  Plus,
  Trash2,
  Sparkles,
  Tag,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskCategory, TaskActionType } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    transactions, 
    tasks,
    userWallets, 
    stats, 
    emailLogs,
    adminApproveDeposit, 
    adminRejectDeposit, 
    adminApproveWithdrawal, 
    adminRejectWithdrawal, 
    adminUpdateUserBalance, 
    adminToggleUserStatus, 
    adminUpdateStats,
    adminApproveWallet,
    adminDeleteWallet,
    adminAddTask,
    adminDeleteTask,
    setActiveScreen,
    switchUser,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'rates' | 'tasks' | 'wallets' | 'emails'>('approvals');
  const [exchangeRateInput, setExchangeRateInput] = useState(stats.realtime_exchange_rate.toString());
  const [cashbackRateInput, setCashbackRateInput] = useState(stats.commission_rate.toString());
  const [directReferralInput, setDirectReferralInput] = useState(stats.direct_referral_rate.toString());
  const [indirectReferralInput, setIndirectReferralInput] = useState(stats.indirect_referral_rate.toString());
  const [bindingBonusInput, setBindingBonusInput] = useState(stats.binding_bonus_amount.toString());
  const [searchUser, setSearchUser] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // New Task Creator State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'All' | TaskCategory>('All');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Daily');
  const [newTaskActionType, setNewTaskActionType] = useState<TaskActionType>('claim');
  const [newTaskPoints, setNewTaskPoints] = useState('100');
  const [newTaskTarget, setNewTaskTarget] = useState('1');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Guard against non-admin
  if (currentUser.role !== 'admin') {
    return (
      <div className="clay-card p-8 text-center space-y-4 max-w-sm mx-auto my-8">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#2D241E]">Restricted Route: /admin</h2>
          <p className="text-xs text-[#7A6B5D] mt-1">
            This dashboard requires role: 'admin'. You are currently logged in as {currentUser.username} ({currentUser.role}).
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => {
              window.location.hash = '';
              setActiveScreen('home');
            }}
            className="clay-btn-dark w-full py-2.5 text-xs font-bold rounded-full cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pending Deposit Queue
  const pendingDeposits = transactions.filter(
    t => t.type === 'Deposit' && t.status === 'Pending'
  );

  // Pending Withdrawal Queue
  const pendingWithdrawals = transactions.filter(
    t => t.type === 'Withdrawal' && t.status === 'Pending'
  );

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.referral_code.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateStats({
      realtime_exchange_rate: parseFloat(exchangeRateInput) || 111,
      commission_rate: parseFloat(cashbackRateInput) || 4.0,
      direct_referral_rate: parseFloat(directReferralInput) || 5.0,
      indirect_referral_rate: parseFloat(indirectReferralInput) || 2.5,
      binding_bonus_amount: parseFloat(bindingBonusInput) || 50,
    });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* Admin Header */}
      <div className="clay-card-gold p-4 flex items-center justify-between text-amber-950">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.location.hash = '';
              switchUser('user');
              setActiveScreen('home');
            }}
            className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/60 flex items-center justify-center text-amber-950 cursor-pointer shadow-xs"
            title="Return to User View"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-900 stroke-[2.5]" />
              <h2 className="text-base font-extrabold tracking-tight">Admin Operations Panel</h2>
            </div>
            <p className="text-[11px] text-amber-950/80 font-medium">Logged in as {currentUser.username} (Super Admin)</p>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.hash = '';
            switchUser('user');
            setActiveScreen('home');
          }}
          className="px-3 py-1 bg-white/60 hover:bg-white text-amber-950 font-extrabold text-xs rounded-full border border-amber-300 shadow-xs cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="clay-inset p-1 grid grid-cols-3 sm:grid-cols-6 gap-1 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-2 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-white text-[#2D241E] shadow-xs font-extrabold'
              : 'text-[#7A6B5D] hover:text-[#2D241E]'
          }`}
        >
          <span>Approvals</span>
          {(pendingDeposits.length + pendingWithdrawals.length) > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-extrabold">
              {pendingDeposits.length + pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-white text-[#2D241E] shadow-xs font-extrabold'
              : 'text-[#7A6B5D] hover:text-[#2D241E]'
          }`}
        >
          Users
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'rates'
              ? 'bg-white text-[#2D241E] shadow-xs font-extrabold'
              : 'text-[#7A6B5D] hover:text-[#2D241E]'
          }`}
        >
          Rates
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-white text-[#2D241E] shadow-xs font-extrabold'
              : 'text-[#7A6B5D] hover:text-[#2D241E]'
          }`}
        >
          <span>Tasks</span>
          <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full font-extrabold border border-amber-200">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wallets')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'wallets'
              ? 'bg-white text-[#2D241E] shadow-xs font-extrabold'
              : 'text-[#7A6B5D] hover:text-[#2D241E]'
          }`}
        >
          Wallets
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'emails'
              ? 'bg-white text-[#2D241E] shadow-xs font-extrabold'
              : 'text-[#7A6B5D] hover:text-[#2D241E]'
          }`}
        >
          Emails
        </button>
      </div>

      {/* TAB 1: Approvals Queue (Deposits & Withdrawals) */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          
          {/* Deposits Approval Queue */}
          <div className="clay-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DF]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
                  Pending Crypto Deposits ({pendingDeposits.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#7A6B5D] font-bold">1-Click Approval</span>
            </div>

            {pendingDeposits.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#8C7A6B] font-medium">
                No pending deposits in review queue.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingDeposits.map(tx => {
                  const targetUser = allUsers.find(u => u.id === tx.user_id);
                  const usdtVal = (tx.amount / stats.realtime_exchange_rate).toFixed(2);

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl clay-card-soft space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#2D241E]">
                              {targetUser?.username || tx.user_email}
                            </span>
                            <span className="text-[9px] clay-badge bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.5 border border-emerald-300">
                              {tx.network || 'TRC20'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A6B5D] font-mono mt-0.5">{tx.user_email}</p>
                          <span className="text-[10px] text-[#8C7A6B] block mt-0.5">{tx.timestamp}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold font-mono text-emerald-800 block">
                            ₹{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-[#4A3E35] block font-mono">
                            ≈ {usdtVal} USDT
                          </span>
                        </div>
                      </div>

                      {/* TxID and Proof Preview */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5] text-xs">
                        <span className="font-mono text-[10px] text-[#7A6B5D] truncate max-w-[180px]">
                          TxID: {tx.tx_hash || 'N/A'}
                        </span>
                        {tx.proof_screenshot && (
                          <button
                            onClick={() => setSelectedProofUrl(tx.proof_screenshot!)}
                            className="text-[10px] font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Receipt</span>
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => adminApproveDeposit(tx.id)}
                          className="clay-btn-emerald flex-1 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Credit Balance</span>
                        </button>
                        <button
                          onClick={() => adminRejectDeposit(tx.id)}
                          className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-full text-xs font-bold transition-all border border-[#E8E0D5] cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Withdrawals Approval Queue */}
          <div className="clay-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DF]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
                  Pending Withdrawal Requests ({pendingWithdrawals.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#7A6B5D] font-bold">Banking Payout Queue</span>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#8C7A6B] font-medium">
                No pending withdrawals in queue.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map(tx => {
                  const targetUser = allUsers.find(u => u.id === tx.user_id);

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl clay-card-soft space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#2D241E] block">
                            {targetUser?.username || tx.user_email}
                          </span>
                          <span className="text-[11px] text-[#7A6B5D] block font-mono mt-0.5">
                            Channel: {tx.wallet_provider || 'UPI Account'}
                          </span>
                          <span className="text-[10px] text-[#8C7A6B] block mt-0.5">{tx.timestamp}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold font-mono text-[#2D241E] block">
                            ₹{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-amber-700 font-bold block">
                            Pending Clearance
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#E8E0D5]">
                        <button
                          onClick={() => adminApproveWithdrawal(tx.id)}
                          className="clay-btn-emerald flex-1 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Paid & Notify</span>
                        </button>
                        <button
                          onClick={() => adminRejectWithdrawal(tx.id)}
                          className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 rounded-full text-xs font-bold transition-all border border-[#E8E0D5] cursor-pointer"
                        >
                          Reject / Refund
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: User Management */}
      {activeTab === 'users' && (
        <div className="clay-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DF]">
            <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
              User Accounts & Balance Overrides ({allUsers.length})
            </h3>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              placeholder="Search by username, email, referral code..."
              className="w-full clay-inset pl-9 pr-3 py-2 text-xs text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-3 pt-1 max-h-[600px] overflow-y-auto">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="p-3 rounded-2xl clay-card-soft space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={user.username}
                      className="w-7 h-7 rounded-full object-cover border border-[#E8E0D5]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#2D241E]">{user.username}</span>
                        <span className="text-[10px] font-mono text-[#7A6B5D]">({user.referral_code})</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold clay-badge ${
                          user.status === 'Active' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C7A6B] font-mono">{user.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => adminToggleUserStatus(user.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                      user.status === 'Active'
                        ? 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                        : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {user.status === 'Active' ? 'Ban User' : 'Unban User'}
                  </button>
                </div>

                {/* Balances & Balance Adjusters */}
                <div className="pt-2 border-t border-[#E8E0D5] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">Available Balance</span>
                    <strong className="font-mono text-[#2D241E]">₹{user.available_balance.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">Commission</span>
                    <strong className="font-mono text-purple-800">₹{user.commission_balance.toFixed(2)}</strong>
                  </div>

                  {/* Adjust Balance Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => adminUpdateUserBalance(user.id, 'available_balance', 500)}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-lg border border-emerald-300 cursor-pointer"
                      title="Add ₹500"
                    >
                      +₹500
                    </button>
                    <button
                      onClick={() => adminUpdateUserBalance(user.id, 'available_balance', -500)}
                      className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[10px] rounded-lg border border-rose-300 cursor-pointer"
                      title="Deduct ₹500"
                    >
                      -₹500
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Rate & Rules Controller */}
      {activeTab === 'rates' && (
        <form onSubmit={handleSaveRates} className="clay-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EFE8DF]">
            <Settings className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
              System Rates & Multi-Tier Rules
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                USDT to INR Real-Time Exchange Rate (1 USDT = ? INR)
              </label>
              <input
                type="number"
                step="0.1"
                value={exchangeRateInput}
                onChange={e => setExchangeRateInput(e.target.value)}
                className="w-full clay-inset px-3.5 py-2 text-xs font-mono font-bold text-[#2D241E] focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                Global Order Cashback Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={cashbackRateInput}
                onChange={e => setCashbackRateInput(e.target.value)}
                className="w-full clay-inset px-3.5 py-2 text-xs font-mono font-bold text-[#2D241E] focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Level A Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={directReferralInput}
                  onChange={e => setDirectReferralInput(e.target.value)}
                  className="w-full clay-inset px-3.5 py-2 text-xs font-mono font-bold text-[#2D241E] focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Level B Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={indirectReferralInput}
                  onChange={e => setIndirectReferralInput(e.target.value)}
                  className="w-full clay-inset px-3.5 py-2 text-xs font-mono font-bold text-[#2D241E] focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                Business Tool Binding Bonus Amount (₹ INR)
              </label>
              <input
                type="number"
                step="1"
                value={bindingBonusInput}
                onChange={e => setBindingBonusInput(e.target.value)}
                className="w-full clay-inset px-3.5 py-2 text-xs font-mono font-bold text-[#2D241E] focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="clay-btn-emerald w-full py-3 text-xs font-bold rounded-full shadow-xs cursor-pointer"
          >
            Update System Rates & Rules
          </button>
        </form>
      )}

      {/* TAB: Tasks Rewards Management (Add/Remove Tasks) */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="clay-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EFE8DF]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-700" />
                <div>
                  <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
                    Task Rewards Configuration ({tasks.length})
                  </h3>
                  <p className="text-[11px] text-[#7A6B5D]">
                    Manage tasks shown in the Task Rewards Center. 1 PTS = ₹1.00 INR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="clay-btn-emerald px-3.5 py-1.5 text-xs font-extrabold rounded-full flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingTask ? 'Close Form' : 'Add New Task'}</span>
              </button>
            </div>

            {/* Task Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['All', 'Daily', 'Team Growth', 'Newbie'] as const).map(cat => {
                const count = cat === 'All' ? tasks.length : tasks.filter(t => t.category === cat).length;
                const isSelected = taskCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setTaskCategoryFilter(cat)}
                    className={`px-3 py-1 text-[11px] font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D241E] text-white shadow-xs'
                        : 'clay-card-soft text-[#7A6B5D] hover:text-[#2D241E]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EFE8DF] text-[#7A6B5D]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add Task Creator Form */}
            {isAddingTask && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newTaskTitle.trim()) {
                    showToast('Please enter a task title');
                    return;
                  }
                  const pts = parseInt(newTaskPoints, 10);
                  const target = parseFloat(newTaskTarget);
                  if (isNaN(pts) || pts <= 0) {
                    showToast('Please enter a valid reward points value');
                    return;
                  }
                  if (isNaN(target) || target <= 0) {
                    showToast('Please enter a valid target metric');
                    return;
                  }

                  adminAddTask({
                    title: newTaskTitle.trim(),
                    category: newTaskCategory,
                    action_type: newTaskActionType,
                    reward_points: pts,
                    target_amount: target,
                    description: newTaskDesc.trim() || `Complete ${newTaskTitle.trim()} to earn ${pts} PTS.`,
                  });

                  // Reset form
                  setNewTaskTitle('');
                  setNewTaskDesc('');
                  setNewTaskPoints('100');
                  setNewTaskTarget('1');
                  setIsAddingTask(false);
                }}
                className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/30 rounded-2xl border border-amber-200/80 space-y-3"
              >
                <div className="flex items-center justify-between pb-1 border-b border-amber-200/50">
                  <span className="text-xs font-bold text-[#2D241E] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Create New Task
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold font-mono">1 PTS = ₹1.00 INR</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Execute 5 Cashback Orders"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      required
                      className="w-full clay-inset px-3 py-2 text-xs font-semibold text-[#2D241E] bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                      Task Category *
                    </label>
                    <select
                      value={newTaskCategory}
                      onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
                      className="w-full clay-inset px-3 py-2 text-xs font-semibold text-[#2D241E] bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Daily">Daily (Recurring 24h)</option>
                      <option value="Team Growth">Team Growth (Referrals)</option>
                      <option value="Newbie">Newbie (Onboarding)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                      Action Type
                    </label>
                    <select
                      value={newTaskActionType}
                      onChange={e => setNewTaskActionType(e.target.value as TaskActionType)}
                      className="w-full clay-inset px-3 py-2 text-xs font-semibold text-[#2D241E] bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="claim">claim (Claim Order)</option>
                      <option value="deposit">deposit (Crypto Deposit)</option>
                      <option value="invite">invite (Invite Friends)</option>
                      <option value="trade">trade (Trading Turnover)</option>
                      <option value="bind">bind (Payment Binding)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                      Reward Points (PTS) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="100"
                        value={newTaskPoints}
                        onChange={e => setNewTaskPoints(e.target.value)}
                        required
                        className="w-full clay-inset px-3 py-2 text-xs font-mono font-bold text-[#2D241E] bg-white focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-[#7A6B5D] font-bold">
                        = ₹{newTaskPoints || 0}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                      Target Metric Amount *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      value={newTaskTarget}
                      onChange={e => setNewTaskTarget(e.target.value)}
                      required
                      className="w-full clay-inset px-3 py-2 text-xs font-mono font-bold text-[#2D241E] bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                    Task Description / Requirement Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide simple instructions for user to complete the task..."
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="w-full clay-inset px-3 py-2 text-xs font-medium text-[#2D241E] bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1.5 text-xs font-bold text-[#7A6B5D] hover:text-[#2D241E] rounded-full border border-[#E8E0D5] bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="clay-btn-emerald px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save & Publish Task</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            {tasks.filter(t => taskCategoryFilter === 'All' || t.category === taskCategoryFilter).length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-[#A89A8C] mx-auto" />
                <p className="text-xs text-[#8C7A6B] font-medium">No tasks found in this category.</p>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  Click here to create a new task
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {tasks
                  .filter(t => taskCategoryFilter === 'All' || t.category === taskCategoryFilter)
                  .map(task => {
                    const categoryColors: Record<TaskCategory, string> = {
                      Daily: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                      'Team Growth': 'bg-purple-100 text-purple-900 border-purple-300',
                      Newbie: 'bg-amber-100 text-amber-900 border-amber-300',
                    };

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-2xl clay-card-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-amber-200"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${categoryColors[task.category]}`}>
                              {task.category}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#EFE8DF] text-[#4A3E35] rounded">
                              action: {task.action_type}
                            </span>
                            <span className="font-bold text-xs text-[#2D241E] truncate">
                              {task.title}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#7A6B5D] line-clamp-2">
                            {task.description}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-[#8C7A6B] font-mono pt-0.5">
                            <span>Target: {task.target_amount.toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">
                              Reward: +{task.reward_points} PTS (₹{task.reward_points} INR)
                            </span>
                            <span>•</span>
                            <span>ID: {task.id}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:self-center self-end flex-shrink-0">
                          <span className="clay-badge px-2.5 py-1 text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                            +{task.reward_points} PTS
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove task "${task.title}"?`)) {
                                adminDeleteTask(task.id);
                              }
                            }}
                            className="p-2 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-all border border-rose-200 bg-white cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Payment Wallet Binding Management */}
      {activeTab === 'wallets' && (
        <div className="clay-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DF]">
            <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
              Bound User Wallets ({userWallets.length})
            </h3>
          </div>

          <div className="space-y-3">
            {userWallets.map(w => {
              const owner = allUsers.find(u => u.id === w.user_id);

              return (
                <div
                  key={w.id}
                  className="p-3.5 rounded-2xl clay-card-soft flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#2D241E]">{w.provider_name}</span>
                      <span className="px-1.5 py-0.5 bg-white text-[#4A3E35] text-[9px] font-bold rounded border border-[#E8E0D5]">
                        {w.type}
                      </span>
                      {w.has_binding_bonus && (
                        <span className="px-1.5 py-0.5 clay-badge bg-amber-400 text-amber-950 text-[9px] font-extrabold">
                          Bonus
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-[#4A3E35] mt-0.5">{w.account_number}</p>
                    <span className="text-[10px] text-[#8C7A6B] block">
                      Owner: {owner?.username || w.user_id} ({w.holder_name})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {w.bound_status === 'Pending' && (
                      <button
                        onClick={() => adminApproveWallet(w.id)}
                        className="px-2.5 py-1 clay-btn-emerald text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => adminDeleteWallet(w.id)}
                      className="px-2.5 py-1 bg-white text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 hover:bg-rose-50 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Automated Email Logs Viewer */}
      {activeTab === 'emails' && (
        <div className="clay-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DF]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-[#2D241E] text-xs uppercase tracking-wider">
                Automated Dispatched Email Logs ({emailLogs.length})
              </h3>
            </div>
            <span className="text-[10px] text-emerald-900 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Live Audit Log
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {emailLogs.map(eml => (
              <div
                key={eml.id}
                className="p-3.5 rounded-2xl clay-card-soft space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 font-extrabold text-[9px] rounded uppercase border border-blue-200">
                      {eml.type}
                    </span>
                    <h4 className="font-bold text-xs text-[#2D241E] mt-1">{eml.subject}</h4>
                    <span className="text-[10px] text-[#7A6B5D] font-mono">To: {eml.recipient_email}</span>
                  </div>
                  <span className="text-[10px] text-[#8C7A6B] flex-shrink-0">{eml.sent_at}</span>
                </div>

                <p className="text-xs text-[#4A3E35] bg-white p-2.5 rounded-xl border border-[#E8E0D5] whitespace-pre-line font-sans leading-relaxed">
                  {eml.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Preview Lightbox */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="clay-card p-4 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#2D241E] text-xs">Transaction Receipt</h4>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-xs font-bold text-[#7A6B5D] hover:text-[#2D241E] cursor-pointer"
              >
                Close
              </button>
            </div>
            <img
              src={selectedProofUrl}
              alt="Receipt Preview"
              className="w-full rounded-2xl max-h-80 object-contain border border-[#E8E0D5]"
            />
          </div>
        </div>
      )}

    </div>
  );
};
