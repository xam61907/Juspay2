import React, { useState } from 'react';
import { 
  CheckSquare, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  TrendingUp,
  Coins,
  DollarSign,
  Gift,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskCategory } from '../types';
import { DailyTaskProgressBar } from '../components/DailyTaskProgressBar';

export const TaskRewardsScreen: React.FC = () => {
  const { tasks, claimTaskReward, redeemPoints, setActiveScreen, currentUser, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('Newbie');
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState<string>(currentUser.points > 0 ? currentUser.points.toString() : '0');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const filteredTasks = tasks.filter(t => t.category === activeCategory);

  const handleOpenRedeem = () => {
    setRedeemAmount(currentUser.points > 0 ? currentUser.points.toString() : '0');
    setIsRedeemModalOpen(true);
  };

  const handleExecuteRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(redeemAmount, 10);
    if (isNaN(pts) || pts <= 0) {
      showToast('Please enter a valid points amount to redeem.');
      return;
    }
    if (pts > currentUser.points) {
      showToast(`You only have ${currentUser.points} PTS available.`);
      return;
    }

    setIsRedeeming(true);
    setTimeout(() => {
      const res = redeemPoints(pts);
      setIsRedeeming(false);
      if (res.success) {
        setIsRedeemModalOpen(false);
      }
    }, 400);
  };

  const setPresetPercentage = (pct: number) => {
    const val = Math.floor((currentUser.points * pct) / 100);
    setRedeemAmount(val.toString());
  };

  const parsedRedeemAmount = parseInt(redeemAmount, 10) || 0;
  const isRedeemValid = parsedRedeemAmount > 0 && parsedRedeemAmount <= currentUser.points;

  const handleActionClick = (task: (typeof tasks)[0]) => {
    if (task.completed && !task.claimed) {
      claimTaskReward(task.id);
      return;
    }

    if (task.action_type === 'bind') {
      setActiveScreen('tool');
    } else if (task.action_type === 'deposit') {
      setActiveScreen('deposit');
    } else if (task.action_type === 'invite') {
      setActiveScreen('team');
    } else if (task.action_type === 'claim' || task.action_type === 'trade') {
      setActiveScreen('payment');
    }
  };

  const getActionButton = (task: (typeof tasks)[0]) => {
    if (task.claimed) {
      return (
        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full flex items-center gap-1 border border-slate-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Claimed</span>
        </span>
      );
    }

    if (task.completed) {
      return (
        <button
          onClick={() => handleActionClick(task)}
          className="clay-btn-emerald px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-1 animate-bounce cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Claim Reward</span>
        </button>
      );
    }

    // Pending action
    let label = 'Go to Task';
    if (task.action_type === 'bind') label = 'Go to Bind';
    if (task.action_type === 'deposit') label = 'Deposit USDT';
    if (task.action_type === 'invite') label = 'Invite Friends';
    if (task.action_type === 'claim') label = 'Start Claim';

    return (
      <button
        onClick={() => handleActionClick(task)}
        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full border border-slate-300 shadow-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
      >
        <span>{label}</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* Points Banner with Enabled Redeem Button */}
      <div className="clay-card-gold p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="clay-icon-box w-11 h-11 bg-white/50 backdrop-blur-md flex items-center justify-center font-bold text-amber-950 shadow-xs">
              <Coins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-900 block uppercase tracking-wider">
                Reward Points Balance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold font-mono text-amber-950">
                  {currentUser.points.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-900">PTS</span>
                <span className="text-[11px] font-bold text-amber-800 ml-1.5">
                  (≈ ₹{currentUser.points.toLocaleString()} INR)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenRedeem}
            className="clay-btn-emerald px-4 py-2 text-xs font-extrabold rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Redeem Points</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900/90 pt-2 border-t border-amber-300/60">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-800" />
            Conversion Rate: <strong>1 Point = ₹1.00 INR</strong>
          </span>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveScreen('admin')}
              className="text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin: Manage Tasks</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Daily Task Progress Bar Component */}
      <DailyTaskProgressBar
        tasks={tasks}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Tabs: Newbie, Team Growth, Daily */}
      <div className="clay-inset p-1.5 grid grid-cols-3 gap-1.5">
        {(['Newbie', 'Team Growth', 'Daily'] as TaskCategory[]).map(cat => {
          const readyCount = tasks.filter(t => t.category === cat && t.completed && !t.claimed).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all relative flex items-center justify-center gap-1 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-emerald-900 shadow-xs border border-[#E8E0D5]'
                  : 'text-[#7A6B5D] hover:text-[#2D241E]'
              }`}
            >
              <span>{cat}</span>
              {readyCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Task Cards Feed */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="clay-card p-8 text-center space-y-2">
            <CheckSquare className="w-8 h-8 text-[#A89A8C] mx-auto" />
            <p className="text-xs text-[#8C7A6B] font-semibold">No tasks available in this category.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const progressPercent = Math.min(
              100,
              Math.round((task.current_progress / task.target_amount) * 100)
            );

            return (
              <div
                key={task.id}
                className={`clay-card p-4 transition-all ${
                  task.claimed ? 'bg-[#F5EFEB]/70 opacity-70 border-[#E8E0D5]' : 'hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="clay-badge px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold text-[9px] uppercase tracking-wider">
                        {task.category}
                      </span>
                      <span className="clay-badge px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-200">
                        +{task.reward_points} Points (₹{task.reward_points})
                      </span>
                    </div>

                    <h3 className="font-bold text-[#2D241E] text-sm mt-1">{task.title}</h3>
                    <p className="text-xs text-[#7A6B5D] leading-relaxed">{task.description}</p>
                  </div>

                  <div className="flex-shrink-0 mt-1">
                    {getActionButton(task)}
                  </div>
                </div>

                {/* Progress Counter & Bar */}
                <div className="mt-3 pt-2.5 border-t border-[#EFE8DF] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#7A6B5D]">
                    <span>Progress</span>
                    <span className="font-mono text-[#2D241E] font-bold">
                      {task.current_progress} / {task.target_amount}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EFE8DF] rounded-full overflow-hidden shadow-inner p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Redeem Points Modal */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="clay-card max-w-sm w-full p-5 space-y-4 shadow-xl border border-amber-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#2D241E]">Redeem Reward Points</h3>
                  <p className="text-[10px] text-[#7A6B5D]">1 PTS = ₹1.00 INR Cash</p>
                </div>
              </div>
              <button
                onClick={() => setIsRedeemModalOpen(false)}
                className="p-1 rounded-full text-[#7A6B5D] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Balance Details */}
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200/70 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                <span>Available Reward Points:</span>
                <span className="font-mono font-extrabold text-amber-950 text-sm">
                  {currentUser.points.toLocaleString()} PTS
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-amber-800">
                <span>Max Cash Equivalent:</span>
                <span className="font-mono font-bold">₹{currentUser.points.toLocaleString()} INR</span>
              </div>
            </div>

            {currentUser.points <= 0 ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-[#7A6B5D] font-medium">
                  You do not have any reward points to redeem yet. Complete tasks above to earn points!
                </p>
                <button
                  onClick={() => setIsRedeemModalOpen(false)}
                  className="clay-btn-emerald px-4 py-2 text-xs font-bold rounded-full cursor-pointer"
                >
                  Go to Tasks
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteRedeem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                    Points to Redeem
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={currentUser.points}
                      step="1"
                      value={redeemAmount}
                      onChange={e => setRedeemAmount(e.target.value)}
                      required
                      className="w-full clay-inset px-3.5 py-2.5 text-sm font-mono font-bold text-[#2D241E] focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#7A6B5D]">
                      PTS
                    </span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPresetPercentage(pct)}
                      className="py-1.5 text-[11px] font-bold rounded-xl bg-white hover:bg-amber-50 text-[#4A3E35] border border-[#E8E0D5] transition-all cursor-pointer"
                    >
                      {pct === 100 ? 'Max (All)' : `${pct}%`}
                    </button>
                  ))}
                </div>

                {/* Calculation Summary */}
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#4A3E35]">
                    <span>Points Redeemed:</span>
                    <span className="font-mono font-bold text-[#2D241E]">
                      -{parsedRedeemAmount.toLocaleString()} PTS
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span>Cash Credited to Balance:</span>
                    <span className="font-mono text-sm">
                      +₹{parsedRedeemAmount.toLocaleString()} INR
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#7A6B5D] pt-1 border-t border-emerald-100">
                    <span>New Available Balance:</span>
                    <span className="font-mono font-bold text-[#2D241E]">
                      ₹{(currentUser.available_balance + (isRedeemValid ? parsedRedeemAmount : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRedeemModalOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-[#7A6B5D] font-bold text-xs rounded-full border border-[#E8E0D5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isRedeemValid || isRedeeming}
                    className="flex-1 clay-btn-emerald py-2.5 text-xs font-bold rounded-full disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isRedeeming ? 'Redeeming...' : `Redeem ₹${parsedRedeemAmount}`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
