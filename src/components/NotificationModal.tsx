import React from 'react';
import { useApp } from '../context/AppContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, currentUser, markAllNotificationsAsRead, markNotificationAsRead } = useApp();

  if (!isOpen) return null;

  const userNotifications = notifications.filter(n => n.user_id === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔔</span>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            userNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.is_read
                    ? 'bg-slate-900/50 border-slate-800/60 opacity-75'
                    : 'bg-slate-800/80 border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.created_at}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
