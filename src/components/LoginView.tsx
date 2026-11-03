import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (admin: AdminUser) => void;
  adminUser: AdminUser;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, adminUser }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'invalid' | 'disabled' | 'session' | 'locked' | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorType(null);

    if (isLocked) {
      setErrorMessage('Account temporarily locked due to too many failed attempts. Please wait 60 seconds.');
      setErrorType('locked');
      return;
    }

    if (adminUser.status === 'disabled') {
      setErrorMessage('Account has been disabled by security policy. Contact administrator.');
      setErrorType('disabled');
      return;
    }

    // Validation logic
    if (username.trim() === 'admin' && password === 'admin123') {
      setAttemptCount(0);
      onLoginSuccess(adminUser);
    } else {
      const nextCount = attemptCount + 1;
      setAttemptCount(nextCount);
      if (nextCount >= 5) {
        setIsLocked(true);
        setErrorMessage('Too many failed login attempts. Account locked for security.');
        setErrorType('locked');
      } else {
        setErrorMessage(`Invalid username or password. (${5 - nextCount} attempts remaining)`);
        setErrorType('invalid');
      }
    }
  };

  const handleSimulateScenario = (scenario: 'disabled' | 'session' | 'locked') => {
    if (scenario === 'disabled') {
      setErrorType('disabled');
      setErrorMessage('Account disabled: Contact Head Office to reactivate loan officer credentials.');
    } else if (scenario === 'session') {
      setErrorType('session');
      setErrorMessage('Your session has expired due to 30 minutes of inactivity. Please re-authenticate.');
    } else if (scenario === 'locked') {
      setIsLocked(true);
      setErrorType('locked');
      setErrorMessage('Too many failed login attempts (5/5). Account temporarily locked.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 text-white relative">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Header Logo */}
      <div className="pt-8 text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/20 mb-3 border border-emerald-400/30">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Daily Collection
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
          Admin & Loan Officer Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm mx-auto my-auto z-10 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">Admin Login</h2>
          <p className="text-xs text-slate-400 mt-0.5">Enter your verified operator credentials</p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 flex items-start gap-2.5 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block capitalize">{errorType ? `${errorType} Error` : 'Notice'}</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-username">
              Username / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center transition-all active:scale-[0.99]"
          >
            Login to Admin Panel
          </button>
        </form>

        {/* Demo Quick Login Helper */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Demo Credentials: admin / admin123</p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
                setIsLocked(false);
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-700/80 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors"
            >
              Fill Credentials
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScenario('session')}
              className="px-2.5 py-1 rounded-md bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-400 transition-colors"
            >
              Test Expired
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScenario('disabled')}
              className="px-2.5 py-1 rounded-md bg-slate-700/50 hover:bg-slate-700 text-[11px] text-slate-400 transition-colors"
            >
              Test Disabled
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-4 text-xs text-slate-500 z-10">
        <p>Daily Collection Admin • Version 2.4.0 (Enterprise)</p>
        <p className="text-[10px] mt-0.5 text-slate-600">Encrypted 256-bit connection • Zero floating-point ledger</p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter registered admin email to receive secure recovery instructions.
            </p>
            {resetSent ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-start gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Password reset token has been dispatched to {forgotEmail || 'your email'}. Check your inbox.</span>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@apexcollection.in"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSent(false);
                }}
                className="flex-1 h-10 rounded-xl bg-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
              {!resetSent && (
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
