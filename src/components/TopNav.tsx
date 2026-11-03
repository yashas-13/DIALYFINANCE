import React from 'react';
import { Shield, Bell, Moon, Sun, LogOut, Search } from 'lucide-react';
import { AdminUser } from '../types';

interface TopNavProps {
  admin: AdminUser;
  unreadCount: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch?: () => void;
  title?: string;
  subtitle?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  admin,
  unreadCount,
  onOpenNotifications,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  title = 'Daily Collection',
  subtitle,
}) => {
  const formattedToday = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand wordmark & current context */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
            <Shield className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                {title}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/50 shrink-0">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {subtitle || formattedToday}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Quick Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenNotifications}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className="min-h-[44px] px-2.5 flex items-center gap-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            aria-label="Logout"
            title={`Logged in as ${admin.name}`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
