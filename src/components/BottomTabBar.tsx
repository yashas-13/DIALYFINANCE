import React from 'react';
import { LayoutDashboard, Users, IndianRupee, FileText, BarChart3, Settings } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'borrowers' | 'collections' | 'loans' | 'reports' | 'settings' | 'pending' | 'expenses' | 'audit';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  overdueCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  overdueCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'collections' as const,
      label: 'Collections',
      icon: IndianRupee,
      badge: null,
    },
    {
      id: 'borrowers' as const,
      label: 'Borrowers',
      icon: Users,
    },
    {
      id: 'loans' as const,
      label: 'Loans',
      icon: FileText,
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'reports' as const,
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-colors pb-safe"
      aria-label="Main Navigation"
    >
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'collections' && activeTab === 'pending') ||
            (tab.id === 'settings' && (activeTab === 'expenses' || activeTab === 'audit'));

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${tab.badgeColor || 'bg-emerald-600'}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-full px-0.5">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
