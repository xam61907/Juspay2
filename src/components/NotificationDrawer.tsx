import React, { useState } from 'react';
import { X, CheckCheck, Bell, ArrowDownLeft, ArrowUpRight, ShieldAlert, Award, Inbox } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, currentUser, markAllNotificationsAsRead, markNotificationAsRead } = useApp();
  const [filter, setFilter] = useState<'All' | 'Deposit' | 'Withdrawal' | 'Commission'>('All');

  if (!isOpen) return null;

  const userNotifs = notifications.filter(n => n.user_id === currentUser.id);
  const filteredNotifs = filter === 'All' ? userNotifs : userNotifs.filter(n => n.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'Withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-amber-600" />;
      case 'Commission':
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-full bg-[#FAF7F2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#E8E0D5]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E8E0D5] flex items-center justify-between bg-[#F5EFEB]">
          <div className="flex items-center gap-2">
            <div className="clay-icon-box w-8 h-8 bg-emerald-100 flex items-center justify-center text-emerald-800 border border-emerald-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#2D241E] text-sm">Notifications</h2>
              <p className="text-[11px] text-[#7A6B5D] font-medium">{userNotifs.filter(n => !n.is_read).length} unread alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#FAF7F2] flex items-center justify-center text-[#7A6B5D] transition-colors border border-[#E8E0D5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Row & Filter Tabs */}
        <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#E8E0D5] flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(['All', 'Deposit', 'Withdrawal', 'Commission'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                  filter === tab
                    ? 'clay-btn-emerald text-white shadow-xs'
                    : 'bg-white text-[#7A6B5D] hover:text-[#2D241E] border border-[#E8E0D5]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5EFEB]">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-[#8C7A6B]">
              <Inbox className="w-10 h-10 mx-auto text-[#8C7A6B] mb-2" />
              <p className="text-xs font-bold text-[#2D241E]">No notifications in this filter</p>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifs.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.is_read
                    ? 'clay-card opacity-85'
                    : 'clay-card-emerald-soft border-emerald-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-[#E8E0D5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-[#2D241E] text-xs truncate">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#4A3E35] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-[#8C7A6B] mt-1.5 block font-mono">
                      {n.created_at}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
