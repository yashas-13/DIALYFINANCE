import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Volume2,
  Trash2,
  Share2,
  PlusSquare,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { PushService, PushDiagnostics, PushNotificationPayload, PushHistoryItem } from '../services/pushService';

interface IOSPushNotificationModalProps {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const IOSPushNotificationModal: React.FC<IOSPushNotificationModalProps> = ({
  onClose,
  onNavigateTab,
}) => {
  const [diagnostics, setDiagnostics] = useState<PushDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [history, setHistory] = useState<PushHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'setup' | 'history'>('presets');

  // Custom Push Composer state
  const [customTitle, setCustomTitle] = useState('⚠️ Daily Collection Overdue Notice');
  const [customBody, setCustomBody] = useState(
    'Anitha Roy has missed 5 daily installments totaling ₹4,500. Field recovery visit recommended.'
  );
  const [customTargetTab, setCustomTargetTab] = useState('collections');
  const [customDelay, setCustomDelay] = useState<number>(0);
  const [playSound, setPlaySound] = useState(true);

  // Countdown timer feedback when scheduling lock screen test
  const [countdown, setCountdown] = useState<number | null>(null);

  const refreshDiagnostics = async () => {
    const diag = await PushService.getDiagnostics();
    setDiagnostics(diag);
    setHistory(PushService.getHistory());
  };

  useEffect(() => {
    refreshDiagnostics();
  }, []);

  // Request Permission & Subscribe
  const handleEnablePush = async () => {
    setIsLoading(true);
    setStatusMessage({ text: 'Requesting permission and registering service worker...', type: 'info' });

    const result = await PushService.requestPermissionAndSubscribe();
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({
        text: 'iOS Push Notifications enabled successfully! You can now trigger instant or scheduled alerts.',
        type: 'success',
      });
      PushService.playAppleChime();
    } else {
      setStatusMessage({
        text: result.error || 'Failed to enable notifications. Ensure iOS 16.4+ and Add to Home Screen.',
        type: 'error',
      });
    }

    refreshDiagnostics();
  };

  // Trigger Notification
  const handleTrigger = async (payload: PushNotificationPayload) => {
    setIsLoading(true);

    if (payload.delaySeconds && payload.delaySeconds > 0) {
      setCountdown(payload.delaySeconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const res = await PushService.triggerNotification(payload);
    setIsLoading(false);

    setStatusMessage({
      text: res.message,
      type: 'success',
    });

    refreshDiagnostics();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) {
      setStatusMessage({ text: 'Please enter both a title and message body.', type: 'error' });
      return;
    }

    handleTrigger({
      title: customTitle.trim(),
      body: customBody.trim(),
      targetTab: customTargetTab,
      delaySeconds: customDelay,
      playSound,
      category: 'custom',
    });
  };

  const handleClearHistory = () => {
    PushService.clearHistory();
    setHistory([]);
    setStatusMessage({ text: 'Push delivery history cleared.', type: 'info' });
  };

  const presets = PushService.getPresets();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  iOS Push Notification System
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  APNs & Web Push
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger real-time iOS banners, lockscreen alerts & collection reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Triggers ({presets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Custom Composer</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS Setup & Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Log ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                  : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : statusMessage.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <Radio className="w-4 h-4 shrink-0 text-blue-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Countdown Notification for Screen-Lock Testing */}
          {countdown !== null && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/40 shadow-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-lg">
                  {countdown}s
                </div>
                <div>
                  <div className="font-bold text-sm">Lock Screen / Switch App Test Active</div>
                  <div className="text-xs text-slate-300">
                    Lock your phone now! iOS push alert will deliver in {countdown} seconds.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: QUICK PRESET TRIGGERS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Collection Operational Triggers
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    One-tap production alerts that dispatch immediately or after a short delay for lockscreen testing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={PushService.playAppleChime}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-200 transition-colors"
                  title="Test Apple Tri-tone Chime"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Chime</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {preset.title}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {preset.body}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 gap-2">
                      <span className="text-[10px] text-slate-400">
                        Target: <strong className="capitalize text-slate-700 dark:text-slate-300">{preset.targetTab}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTrigger({ ...preset, delaySeconds: 5 })}
                          className="min-h-[38px] px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Trigger in 5 seconds so you can lock your iPhone screen"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Test in 5s (Lock Screen)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTrigger(preset)}
                          disabled={isLoading}
                          className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Trigger Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM PUSH COMPOSER */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="push-title">
                  Notification Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="push-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. ⚠️ Urgent Overdue Notice"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="push-body">
                  Notification Message Body <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="push-body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="e.g. Borrower Anitha Roy is overdue by 5 installments..."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Screen to Open on Tap
                  </label>
                  <select
                    value={customTargetTab}
                    onChange={(e) => setCustomTargetTab(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="collections">Daily Collections (Action Screen)</option>
                    <option value="loans">Loan Portfolio & Contracts</option>
                    <option value="borrowers">Borrowers List</option>
                    <option value="reports">Financial & Overdue Reports</option>
                    <option value="settings">Admin Settings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Timer / Test Delay
                  </label>
                  <select
                    value={customDelay}
                    onChange={(e) => setCustomDelay(parseInt(e.target.value, 10))}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="0">⚡ Send Immediately (0s)</option>
                    <option value="5">⏱️ In 5 Seconds (Lock Phone Test)</option>
                    <option value="10">⏱️ In 10 Seconds</option>
                    <option value="30">⏱️ In 30 Seconds</option>
                    <option value="60">⏱️ In 1 Minute</option>
                  </select>
                </div>
              </div>

              {/* Sound & Simulation Settings */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Apple Tri-Tone Alert Chime
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Synthesizes high-fidelity iOS alert audio on trigger
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={playSound}
                  onChange={(e) => setPlaySound(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {customDelay > 0
                      ? `Schedule iOS Push in ${customDelay} Seconds`
                      : 'Dispatch iOS Push Notification Now'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IOS SETUP & SYSTEM DIAGNOSTICS */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              {/* Apple iOS Requirements Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4" />
                  <span>How iOS Web Push Works (iOS 16.4+)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apple introduced native Web Push to iOS Safari starting in iOS 16.4. To receive background push notifications on iPhone or iPad:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">1</span>
                      <span>Add to Home Screen</span>
                    </div>
                    <span className="text-[11px] text-slate-300">Tap Safari Share <Share2 className="w-3 h-3 inline text-emerald-400" /> then &quot;Add to Home Screen&quot;.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">2</span>
                      <span>Launch PWA</span>
                    </div>
                    <span className="text-[11px] text-slate-300">Open DailyCollect from your iOS home screen as a standalone app.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                    <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">3</span>
                      <span>Allow Alerts</span>
                    </div>
                    <span className="text-[11px] text-slate-300">Tap &quot;Enable Push&quot; below to grant Apple APNs permission.</span>
                  </div>
                </div>
              </div>

              {/* Live Diagnostics Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Push Subsystem Diagnostics
                  </h4>
                  <button
                    onClick={refreshDiagnostics}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Refresh Status
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500">Device Platform:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {diagnostics?.isIOS ? 'Apple iOS / iPadOS' : 'Desktop / Android'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500">Display Mode:</span>
                    <span
                      className={`font-bold ${
                        diagnostics?.isStandalone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {diagnostics?.isStandalone ? 'PWA Standalone (OK)' : 'Browser Window'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500">Notification Permission:</span>
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        diagnostics?.permission === 'granted'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : diagnostics?.permission === 'denied'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {diagnostics?.permission || 'unknown'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500">Service Worker:</span>
                    <span
                      className={`font-bold ${
                        diagnostics?.serviceWorkerRegistered
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {diagnostics?.serviceWorkerRegistered ? 'Active (/sw.js)' : 'Not Active'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between col-span-2">
                    <span className="text-slate-500">APNs Server Subscription:</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                      {diagnostics?.isSubscribed
                        ? `Registered (${diagnostics.subscriptionEndpoint?.slice(0, 30)}...)`
                        : 'Local / Ready to subscribe'}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-emerald-500" />
                    <span>
                      {diagnostics?.permission === 'granted'
                        ? 'Re-Sync iOS Push Subscription'
                        : 'Request Permission & Enable iOS Push'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOG & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Triggered Push Alerts ({history.length})
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                  No push alerts dispatched yet. Use the Quick Triggers tab to test sending alerts!
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item.category}
                          </span>
                          {item.deliveredViaAPNs && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              APNs Dispatched
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          {item.body}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">{item.timestamp}</span>
                        {item.scheduledDelay > 0 && (
                          <span className="text-[10px] text-amber-500 block">+{item.scheduledDelay}s delay</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>APNs Web Push active · iOS 16.4+ Ready</span>
          </div>
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
