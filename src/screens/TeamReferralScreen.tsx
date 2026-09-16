import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Award, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  QrCode, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  Search,
  Filter,
  User,
  Calendar,
  DollarSign,
  ArrowDownLeft,
  X,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Transaction, User as UserType } from '../types';

export const TeamReferralScreen: React.FC = () => {
  const { currentUser, allUsers, transactions, stats, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Filter & Search states for Commission History Table
  const [selectedTierFilter, setSelectedTierFilter] = useState<'All' | 'Level A' | 'Level B'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const referralCode = currentUser.referral_code || 'JUS7789';
  const referralLink = `https://juspay.io/register?ref=${referralCode}`;

  // Find Level A Direct Members (referred directly by current user's referral_code)
  const directMembers = allUsers.filter(u => u.referred_by === referralCode);

  // Find Level B Indirect Members (referred by any member of Level A)
  const levelACodes = directMembers.map(u => u.referral_code);
  const indirectMembers = allUsers.filter(u => u.referred_by && levelACodes.includes(u.referred_by));

  const totalTeamMembers = directMembers.length + indirectMembers.length;

  // Helper to identify the team member who generated a given commission transaction
  const getGeneratingMember = (tx: Transaction): UserType | null => {
    if (tx.from_user_id) {
      const found = allUsers.find(u => u.id === tx.from_user_id);
      if (found) return found;
    }
    // Search in transaction notes if from_user_id wasn't explicitly saved
    if (tx.notes) {
      const lowerNote = tx.notes.toLowerCase();
      for (const u of allUsers) {
        if (lowerNote.includes(u.username.toLowerCase()) || (u.referral_code && lowerNote.includes(u.referral_code.toLowerCase()))) {
          return u;
        }
      }
    }
    return null;
  };

  // Extract all referral commission transactions for current user
  const userCommissionTxs = useMemo(() => {
    return transactions.filter(
      t => t.user_id === currentUser.id && (
        t.type === 'Referral Commission' || 
        t.type.toLowerCase().includes('commission') ||
        Boolean(t.tier_info?.includes('Level'))
      )
    );
  }, [transactions, currentUser.id]);

  let levelACommissions = userCommissionTxs
    .filter(t => t.tier_info?.includes('Level A') || t.notes?.includes('5%') || t.notes?.includes('Level A'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  let levelBCommissions = userCommissionTxs
    .filter(t => t.tier_info?.includes('Level B') || t.notes?.includes('2.5%') || t.notes?.includes('Level B'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  let totalTeamCommissions = levelACommissions + levelBCommissions;

  // Ensure total commissions is aligned with user's verified commission balance
  if (currentUser.commission_balance > 0) {
    if (totalTeamCommissions === 0) {
      totalTeamCommissions = currentUser.commission_balance;
      levelACommissions = Number((totalTeamCommissions * (directMembers.length > 0 ? 0.65 : 1)).toFixed(2));
      levelBCommissions = Number((totalTeamCommissions - levelACommissions).toFixed(2));
    } else {
      totalTeamCommissions = Math.max(totalTeamCommissions, currentUser.commission_balance);
    }
  }

  // Total Team Deposit (aggregate of direct + indirect members)
  const teamMemberIds = [...directMembers, ...indirectMembers].map(u => u.id);
  const totalTeamDeposit = allUsers
    .filter(u => teamMemberIds.includes(u.id))
    .reduce((acc, curr) => acc + curr.deposit_balance, 0);

  // Filtered Commission Records for Table
  const filteredCommissions = useMemo(() => {
    return userCommissionTxs.filter(tx => {
      const generatingUser = getGeneratingMember(tx);
      const isLevelA = tx.tier_info?.includes('Level A') || tx.notes?.includes('5%') || tx.notes?.includes('Level A') || (generatingUser && directMembers.some(d => d.id === generatingUser.id));
      const isLevelB = tx.tier_info?.includes('Level B') || tx.notes?.includes('2.5%') || tx.notes?.includes('Level B') || (generatingUser && indirectMembers.some(ind => ind.id === generatingUser.id));

      // 1. Tier Filter
      if (selectedTierFilter === 'Level A' && !isLevelA) return false;
      if (selectedTierFilter === 'Level B' && !isLevelB) return false;

      // 2. Specific Member Filter
      if (selectedMemberId) {
        if (!generatingUser || generatingUser.id !== selectedMemberId) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const memberName = generatingUser?.username?.toLowerCase() || '';
        const memberEmail = generatingUser?.email?.toLowerCase() || '';
        const memberCode = generatingUser?.referral_code?.toLowerCase() || '';
        const notes = (tx.notes || '').toLowerCase();
        const txId = tx.id.toLowerCase();

        return (
          memberName.includes(query) ||
          memberEmail.includes(query) ||
          memberCode.includes(query) ||
          notes.includes(query) ||
          txId.includes(query)
        );
      }

      return true;
    });
  }, [userCommissionTxs, selectedTierFilter, selectedMemberId, searchQuery, directMembers, indirectMembers, allUsers]);

  const selectedMemberObj = selectedMemberId ? allUsers.find(u => u.id === selectedMemberId) : null;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    showToast(`Referral code ${referralCode} copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(
      `Join juspay to earn dynamic 4% cashback on orders and multi-tier affiliate rewards! Use my code: ${referralCode} at ${referralLink}`
    );
    let url = '';
    if (platform === 'telegram') url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${text}`;
    if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;

    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-3.5 pb-24 animate-in fade-in duration-150">
      
      {/* 1. Overview Banner (Executive Navy Theme) */}
      <div className="fintech-card-navy p-5 space-y-4 relative overflow-hidden">
        {/* Ambient grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Total Referral Commissions
              </span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-700/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>2-Tier Active (5% + 2.5%)</span>
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-400">₹</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums">
              {totalTeamCommissions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>

          {/* 4 Stat Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-3.5 mt-3.5 border-t border-slate-700/60 text-center">
            <div>
              <span className="text-[10px] block text-slate-400 font-medium">Level A (5%)</span>
              <strong className="text-xs font-bold font-mono text-emerald-400">
                ₹{levelACommissions.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </strong>
            </div>
            <div>
              <span className="text-[10px] block text-slate-400 font-medium">Level B (2.5%)</span>
              <strong className="text-xs font-bold font-mono text-purple-300">
                ₹{levelBCommissions.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </strong>
            </div>
            <div>
              <span className="text-[10px] block text-slate-400 font-medium">Team Size</span>
              <strong className="text-xs font-bold font-mono text-white">
                {totalTeamMembers} Members
              </strong>
            </div>
            <div>
              <span className="text-[10px] block text-slate-400 font-medium">Team Deposit</span>
              <strong className="text-xs font-bold font-mono text-white truncate block">
                ₹{totalTeamDeposit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Invitation Card: Referral Code & Link */}
      <div className="fintech-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Your Referral Invitation</h3>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQR ? 'Hide QR' : 'View QR'}</span>
          </button>
        </div>

        {showQR && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center animate-in zoom-in-95 duration-150">
            <QRCodeDisplay value={referralLink} size={150} />
            <p className="text-[11px] text-slate-600 mt-2 font-medium">Scan to join under Sponsor: <strong className="font-mono text-slate-900">{referralCode}</strong></p>
          </div>
        )}

        {/* Code & Link Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          <div className="p-3 fintech-inset flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Referral Code</span>
              <span className="text-base font-extrabold font-mono text-emerald-700 tracking-wider">
                {referralCode}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="p-2 bg-white rounded-lg shadow-xs border border-slate-200 hover:bg-slate-50 text-slate-800 active:scale-90 transition-all cursor-pointer"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 fintech-inset flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Invite Link</span>
              <span className="text-xs font-mono text-slate-700 truncate block font-medium">
                {referralLink}
              </span>
            </div>
            <button
              onClick={copyLink}
              className="fintech-btn-emerald p-2 rounded-lg text-white shadow-xs active:scale-90 transition-all flex-shrink-0 cursor-pointer"
              title="Copy Link"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Quick Social Sharing Buttons */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">
            Share To Social Channels
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleShare('telegram')}
              className="py-2 px-1 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-lg text-xs font-bold flex flex-col items-center gap-1 border border-[#229ED9]/30 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Telegram</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="py-2 px-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg text-xs font-bold flex flex-col items-center gap-1 border border-[#25D366]/30 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="py-2 px-1 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-lg text-xs font-bold flex flex-col items-center gap-1 border border-[#1877F2]/30 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Facebook</span>
            </button>
            <button
              onClick={copyLink}
              className="py-2 px-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold flex flex-col items-center gap-1 border border-slate-200 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Copy Link</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. 2-Tier Breakdown: Level A (5%) & Level B (2.5%) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>Multi-Tier Network Structure</span>
          <span className="text-[10px] font-normal text-slate-500">Auto Distributed</span>
        </h3>

        {/* Level A Card */}
        <div className="fintech-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200">
                A
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Level A (Direct Referrals)</h4>
                <p className="text-[10px] text-slate-500">Rate: 5.0% on deposits & order claims</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-extrabold font-mono text-emerald-700 block">
                ₹{levelACommissions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{directMembers.length} Members</span>
            </div>
          </div>

          {/* Direct Members List Preview with Quick Filter Action */}
          {directMembers.length > 0 ? (
            <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Direct Team (Click to filter commission history)
              </span>
              {directMembers.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => {
                    setSelectedMemberId(selectedMemberId === m.id ? null : m.id);
                    showToast(selectedMemberId === m.id ? 'Filter cleared' : `Filtered commissions by ${m.username}`);
                  }}
                  className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedMemberId === m.id 
                      ? 'bg-emerald-100/70 border-emerald-300 ring-1 ring-emerald-400' 
                      : 'bg-slate-50 hover:bg-emerald-50/50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      {m.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate block">{m.username}</span>
                      <span className="text-[9px] font-mono text-slate-400">Code: {m.referral_code}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="font-mono text-slate-700 text-xs font-bold block">₹{m.deposit_balance.toLocaleString()}</span>
                      <span className="text-[9px] text-emerald-700 font-semibold">Deposit</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${selectedMemberId === m.id ? 'rotate-90 text-emerald-600' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">No direct referrals yet. Share your code to earn 5% commissions.</p>
          )}
        </div>

        {/* Level B Card */}
        <div className="fintech-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 font-extrabold text-xs flex items-center justify-center border border-purple-200">
                B
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Level B (Indirect Referrals)</h4>
                <p className="text-[10px] text-slate-500">Rate: 2.5% on indirect team turnover</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-extrabold font-mono text-purple-800 block">
                ₹{levelBCommissions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{indirectMembers.length} Members</span>
            </div>
          </div>

          {/* Indirect Members Preview with Quick Filter */}
          {indirectMembers.length > 0 ? (
            <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Indirect Team (Click to filter commission history)
              </span>
              {indirectMembers.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => {
                    setSelectedMemberId(selectedMemberId === m.id ? null : m.id);
                    showToast(selectedMemberId === m.id ? 'Filter cleared' : `Filtered commissions by ${m.username}`);
                  }}
                  className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedMemberId === m.id 
                      ? 'bg-purple-100/70 border-purple-300 ring-1 ring-purple-400' 
                      : 'bg-slate-50 hover:bg-purple-50/50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      {m.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate block">{m.username}</span>
                      <span className="text-[9px] font-mono text-slate-400">Code: {m.referral_code}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="font-mono text-slate-700 text-xs font-bold block">₹{m.deposit_balance.toLocaleString()}</span>
                      <span className="text-[9px] text-purple-700 font-semibold">Deposit</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${selectedMemberId === m.id ? 'rotate-90 text-purple-600' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">No indirect referrals yet. They appear when Level A members invite friends.</p>
          )}
        </div>

      </div>

      {/* 4. Detailed Commission Transaction History Table & Ledger */}
      <div id="referral-commission-history" className="fintech-card p-4 space-y-4">
        
        {/* Header with Title and Real-time Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Individual Commission History</h3>
              <p className="text-[10px] text-slate-500">Track exact rewards generated by each team member</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Live Settlement
          </span>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-2.5">
          
          {/* Tier Tabs (All / Level A / Level B) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['All', 'Level A', 'Level B'] as const).map(tier => {
              const count = tier === 'All' 
                ? userCommissionTxs.length
                : tier === 'Level A'
                  ? userCommissionTxs.filter(t => t.tier_info?.includes('Level A') || t.notes?.includes('5%') || t.notes?.includes('Level A')).length
                  : userCommissionTxs.filter(t => t.tier_info?.includes('Level B') || t.notes?.includes('2.5%') || t.notes?.includes('Level B')).length;

              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTierFilter(tier)}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    selectedTierFilter === tier
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tier === 'All' ? 'All Rewards' : tier === 'Level A' ? 'Level A (5%)' : 'Level B (2.5%)'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedTierFilter === tier ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/60 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search member name, referral code, or notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Member Filter Chip */}
          {selectedMemberObj && (
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>Showing rewards generated exclusively by: <strong>{selectedMemberObj.username}</strong> ({selectedMemberObj.referral_code})</span>
              </div>
              <button 
                onClick={() => setSelectedMemberId(null)}
                className="p-1 hover:bg-emerald-100 rounded-md text-emerald-800 transition-colors"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* Detailed Commission Items / Table */}
        <div className="space-y-2.5 pt-1">
          {filteredCommissions.length === 0 ? (
            <div className="py-8 text-center space-y-2 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
              <Users className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No referral commission records found</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                {searchQuery || selectedMemberId || selectedTierFilter !== 'All' 
                  ? 'Try changing your filter or search query.' 
                  : 'Commissions will automatically appear here whenever your direct or indirect team members deposit or trade.'}
              </p>
              {(searchQuery || selectedMemberId || selectedTierFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMemberId(null);
                    setSelectedTierFilter('All');
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            filteredCommissions.map(tx => {
              const member = getGeneratingMember(tx);
              const isDirect = tx.tier_info?.includes('Level A') || tx.notes?.includes('5%') || tx.notes?.includes('Level A') || (member && directMembers.some(d => d.id === member.id));

              return (
                <div 
                  key={tx.id} 
                  className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200 shadow-2xs space-y-2 transition-colors"
                >
                  {/* Top Line: Generating Member Identity + Tier Badge + Commission Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Member Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        isDirect 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {member?.username ? member.username.slice(0, 1).toUpperCase() : '👤'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {member?.username || 'Team Member'}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                            isDirect 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {isDirect ? 'Level A (5% Direct)' : 'Level B (2.5% Indirect)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {member?.email || (member?.referral_code ? `Ref: ${member.referral_code}` : 'Affiliate Partner')}
                        </span>
                      </div>
                    </div>

                    {/* Commission Credited */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black font-mono text-emerald-700 block">
                        +₹{tx.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block">
                        Settled
                      </span>
                    </div>
                  </div>

                  {/* Bottom Line: Source Event & Timestamp */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 gap-2">
                    <span className="truncate text-slate-600 font-medium">
                      {tx.notes || `${isDirect ? '5% Direct' : '2.5% Indirect'} commission reward`}
                    </span>
                    <span className="shrink-0 font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tx.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Aggregate Summary Footer */}
        {filteredCommissions.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Showing {filteredCommissions.length} commission {filteredCommissions.length === 1 ? 'entry' : 'entries'}</span>
            <div className="flex items-center gap-1">
              <span>Total Reward:</span>
              <strong className="font-mono text-emerald-700 font-bold">
                ₹{filteredCommissions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)} INR
              </strong>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
