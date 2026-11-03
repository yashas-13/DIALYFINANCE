import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Clock,
  UserPlus,
  FilePlus,
  CheckCircle2,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateItem?: (tab: string, id?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onNavigateItem,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'upcoming_installment':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'new_borrower':
        return <UserPlus className="w-4 h-4 text-teal-500" />;
      case 'new_loan':
        return <FilePlus className="w-4 h-4 text-blue-500" />;
      case 'payment_recorded':
      case 'loan_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleItemClick = (notif: NotificationItem) => {
    onMarkRead(notif.id);
    if (notif.linkTab && onNavigateItem) {
      onNavigateItem(notif.linkTab, notif.linkId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Alerts & Notifications</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMarkAllRead}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No alerts or notifications. You are all caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`py-3 px-2 rounded-xl flex items-start gap-3 cursor-pointer transition-colors ${
                  !notif.read
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
