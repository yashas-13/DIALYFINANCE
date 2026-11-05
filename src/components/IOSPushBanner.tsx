import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Volume2, Shield } from 'lucide-react';

interface IOSBannerData {
  id: string;
  title: string;
  body: string;
  targetTab?: string;
  timestamp?: string;
}

interface IOSPushBannerProps {
  onNavigateTab: (tab: string) => void;
}

export const IOSPushBanner: React.FC<IOSPushBannerProps> = ({ onNavigateTab }) => {
  const [activeBanner, setActiveBanner] = useState<IOSBannerData | null>(null);

  useEffect(() => {
    const handlePushReceived = (event: Event) => {
      const customEvent = event as CustomEvent<IOSBannerData>;
      if (customEvent.detail) {
        setActiveBanner(customEvent.detail);

        // Auto dismiss after 7 seconds like iOS
        const timer = setTimeout(() => {
          setActiveBanner((current) => (current?.id === customEvent.detail.id ? null : current));
        }, 7000);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('daily_collect_push_received', handlePushReceived);
    return () => {
      window.removeEventListener('daily_collect_push_received', handlePushReceived);
    };
  }, []);

  if (!activeBanner) return null;

  return (
    <div className="fixed top-2.5 sm:top-4 inset-x-0 z-[100] px-3 sm:px-4 pointer-events-none flex justify-center animate-in slide-in-from-top-6 duration-300">
      <div
        className="pointer-events-auto w-full max-w-md bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-2xl rounded-3xl p-3.5 shadow-2xl border border-white/15 dark:border-white/10 ring-1 ring-black/40 flex flex-col gap-2 transition-all active:scale-[0.99]"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)'
        }}
      >
        {/* iOS Push Header */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-bold text-[11px] tracking-wide text-slate-200 uppercase">
              Daily Collect
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/40">
              iOS Push
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">
              {activeBanner.timestamp || 'now'}
            </span>
            <button
              onClick={() => setActiveBanner(null)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          onClick={() => {
            if (activeBanner.targetTab) {
              onNavigateTab(activeBanner.targetTab);
            }
            setActiveBanner(null);
          }}
          className="cursor-pointer"
        >
          <h4 className="font-extrabold text-sm text-white tracking-tight leading-snug">
            {activeBanner.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
            {activeBanner.body}
          </p>
        </div>

        {/* Actions Strip */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Volume2 className="w-3 h-3" />
            <span className="text-[10px]">Apple Tri-tone Chime</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBanner(null)}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-[11px] font-medium transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                if (activeBanner.targetTab) {
                  onNavigateTab(activeBanner.targetTab);
                }
                setActiveBanner(null);
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 text-[11px] transition-colors"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
