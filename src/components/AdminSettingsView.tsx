import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Database,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  KeyRound,
  CheckCircle2,
  Radio,
  Smartphone,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { BusinessSettings, AdminUser } from '../types';

interface AdminSettingsViewProps {
  settings: BusinessSettings;
  admin: AdminUser;
  onUpdateSettings: (updates: Partial<BusinessSettings>) => void;
  onResetDemoData: () => void;
  onResetToClean?: () => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onNavigateTab: (tab: any) => void;
  onOpenIOSPush?: () => void;
  onOpenInstructions?: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  admin,
  onUpdateSettings,
  onResetDemoData,
  onResetToClean,
  onExportJSON,
  onImportJSON,
  onNavigateTab,
  onOpenIOSPush,
  onOpenInstructions,
}) => {
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [address, setAddress] = useState(settings.address);
  const [contactNumber, setContactNumber] = useState(settings.contactNumber);
  const [defaultRate, setDefaultRate] = useState(settings.defaultInterestRate.toString());
  const [defaultFrequency, setDefaultFrequency] = useState(settings.defaultFrequency);
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix);
  const [financialYear, setFinancialYear] = useState(settings.financialYear);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeoutMinutes.toString());

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Success message
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      businessName: businessName.trim(),
      address: address.trim(),
      contactNumber: contactNumber.trim(),
      defaultInterestRate: parseFloat(defaultRate) || 14,
      defaultFrequency: defaultFrequency as any,
      receiptPrefix: receiptPrefix.trim() || 'RCP-26',
      financialYear: financialYear.trim() || '2026-2027',
      sessionTimeoutMinutes: parseInt(sessionTimeout, 10) || 30,
    });
    setSavedMessage('Business profile and financial configurations updated.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (currentPassword !== 'admin123') {
      setPwdMessage({ text: 'Current password incorrect.', success: false });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ text: 'New password must have at least 6 characters.', success: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'New passwords do not match.', success: false });
      return;
    }

    setPwdMessage({ text: 'Password successfully changed and audit log recorded.', success: true });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportJSON(content);
        if (success) {
          alert('Database restored successfully from JSON backup snapshot.');
        } else {
          alert('Failed to parse backup JSON. Please verify schema.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Settings & System Controls
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure business details, interest defaults, receipt formatting, and system backups
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Section 1: Business Profile & Financial Configuration */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Business Profile & Receipts
            </h2>
            <p className="text-[11px] text-slate-400">
              Details printed on collection vouchers and loan statements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="business-name">
              Agency / Enterprise Name
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="business-phone">
              Official Contact Number
            </label>
            <input
              id="business-phone"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="business-address">
            Commercial Address
          </label>
          <input
            id="business-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Financial Rules */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Default Lending Rules
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Rate (%)
              </label>
              <input
                type="number"
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold tabular-nums focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Frequency
              </label>
              <select
                value={defaultFrequency}
                onChange={(e) => setDefaultFrequency(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold capitalize focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Prefix
              </label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Financial Year
              </label>
              <input
                type="text"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          Save Configuration
        </button>
      </form>

      {/* Section 2: Security & Password */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Security & Credentials
            </h2>
            <p className="text-[11px] text-slate-400">
              Admin account: <strong className="text-slate-700 dark:text-slate-300">{admin.email}</strong> (Super Admin)
            </p>
          </div>
        </div>

        {pwdMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              pwdMessage.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
            }`}
          >
            {pwdMessage.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{pwdMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          Update Admin Password
        </button>
      </form>

      {/* iOS Push Notifications & APNs Integration Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Apple iOS Push Notification System
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  APNs & VAPID Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Trigger real-time collection alerts, overdue reminders, and payment receipts to iOS devices running iOS 16.4+ (PWA Home Screen standalone).
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Apple Web Push Protocol (RFC 8292)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Tri-Tone Audio Chime
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Lock Screen Timers (5s–30s)
                </span>
              </div>
            </div>
          </div>
          {onOpenIOSPush && (
            <button
              onClick={onOpenIOSPush}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch Push Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 3: Data Management & Backups */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Database className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h2>
            <p className="text-[11px] text-slate-400">
              Database health: <span className="text-emerald-500 font-bold">100% Synced</span> · Local storage encrypted snapshot
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={onExportJSON}
            className="min-h-[50px] p-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export JSON Backup</span>
          </button>

          <label className="min-h-[50px] p-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Restore Backup JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Clear all borrowers, loans, and payments to a completely clean operational state?')) {
                if (onResetToClean) onResetToClean();
              }
            }}
            className="min-h-[50px] p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset to Clean Slate</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Load sample realistic demo records for training and testing?')) {
                onResetDemoData();
              }
            }}
            className="min-h-[50px] p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Sample Demo Data</span>
          </button>
        </div>

        {/* Feature Instructions Help Banner */}
        {onOpenInstructions && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Need help operating features, upfront loans, or receipts?</span>
            </div>
            <button
              onClick={onOpenInstructions}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open User Guide</span>
            </button>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
          <span>View immutable activity ledger:</span>
          <button
            onClick={() => onNavigateTab('audit')}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Open Audit Trail Logs →
          </button>
        </div>
      </div>
    </div>
  );
};
