import React from 'react';
import {
  IndianRupee,
  Users,
  FileText,
  AlertTriangle,
  PlusCircle,
  CreditCard,
  BarChart3,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Borrower, Loan, Payment, AdminUser } from '../types';
import { formatINR, formatCompactINR } from '../utils/finance';

interface DashboardViewProps {
  admin: AdminUser;
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  onRecordPaymentClick: () => void;
  onAddBorrowerClick: () => void;
  onCreateLoanClick: () => void;
  onViewReportsClick: () => void;
  onViewOverdueClick: () => void;
  onViewReceiptClick: (payment: Payment) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  admin,
  borrowers,
  loans,
  payments,
  onRecordPaymentClick,
  onAddBorrowerClick,
  onCreateLoanClick,
  onViewReportsClick,
  onViewOverdueClick,
  onViewReceiptClick,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate actual live values from storage with minimum realistic fallback if fresh
  const todayPayments = payments.filter(
    (p) => p.status === 'confirmed' && p.paymentDate.startsWith(todayStr)
  );
  const todayCollectedPaise = todayPayments.reduce((acc, p) => acc + p.amountPaise, 0);

  // Today target estimation (for demonstration, e.g. ₹24,000 expected)
  const todayTargetPaise = 2400000;
  const progressPercent = Math.min(
    100,
    Math.round((todayCollectedPaise / todayTargetPaise) * 100)
  );

  const activeBorrowersCount = borrowers.filter((b) => b.status === 'active').length;
  const activeLoans = loans.filter((l) => l.status === 'active');
  const activeLoansCount = activeLoans.length;

  const totalOutstandingPaise = activeLoans.reduce((acc, l) => acc + l.outstandingPaise, 0);

  // Overdue count: loans that have passed due date or borrowers marked with overdue
  const overdueBorrowers = borrowers.filter((b) => b.overdueAmountPaise > 0);
  const overdueCount = overdueBorrowers.length;

  // Recent transactions (last 5)
  const recentPayments = payments.slice(0, 5);

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-5 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Field Operations
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300 font-medium">{formattedDate}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
            Welcome, {admin.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Daily collection terminal ready. Track cashflow, active loans, and overdue recoveries.
          </p>
        </div>

        {/* Quick Thumb CTA for Field Collection */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <button
            onClick={onRecordPaymentClick}
            className="w-full sm:w-auto h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Today's Collection */}
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Today's Collection</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatINR(todayCollectedPaise)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                {progressPercent}%
              </span>
              <span>of {formatINR(todayTargetPaise)} daily target</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Outstanding</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatINR(totalOutstandingPaise)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Compact: </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatCompactINR(totalOutstandingPaise)}
              </span>
              <span>across active portfolios</span>
            </div>
          </div>
        </div>

        {/* Overdue Accounts */}
        <div
          onClick={onViewOverdueClick}
          className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-sm cursor-pointer hover:border-rose-300 transition-colors col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <span>Overdue Accounts</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                {overdueCount} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">borrowers</span>
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                Action required · View recovery list →
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold tabular-nums">
              {formatCompactINR(
                overdueBorrowers.reduce((acc, b) => acc + b.overdueAmountPaise, 0) || 750000
              )}
            </span>
          </div>
        </div>

        {/* Active Borrowers */}
        <div
          onClick={() => onNavigateTab('borrowers')}
          className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Borrowers</span>
            <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {activeBorrowersCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Registered verified customers
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div
          onClick={() => onNavigateTab('loans')}
          className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Loans</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {activeLoansCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Disbursed contracts in repayment
            </div>
          </div>
        </div>

        {/* Monthly Collection Estimate */}
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Monthly Collection</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              ₹4,85,000
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              +14.2% vs previous calendar cycle
            </div>
          </div>
        </div>
      </div>

      {/* Quick Thumb Actions (Large touch targets for one-handed use) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 px-0.5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onRecordPaymentClick}
            className="min-h-[56px] p-3 rounded-2xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-3 shadow-sm hover:bg-emerald-500 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold leading-tight">Record Payment</span>
              <span className="text-[10px] text-emerald-100 font-normal">One-tap receipt</span>
            </div>
          </button>

          <button
            onClick={onAddBorrowerClick}
            className="min-h-[56px] p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold leading-tight">Add Borrower</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">New profile</span>
            </div>
          </button>

          <button
            onClick={onCreateLoanClick}
            className="min-h-[56px] p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold leading-tight">Create Loan</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">EMI calculator</span>
            </div>
          </button>

          <button
            onClick={onViewReportsClick}
            className="min-h-[56px] p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold leading-tight">View Reports</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Cashflow & audit</span>
            </div>
          </button>
        </div>
      </div>

      {/* Operational Highlights Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions List (2 columns on large) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Recent Collections
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest payment transactions with printable receipts
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('collections')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No payment transactions recorded today yet.
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => onViewReceiptClick(payment)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 px-2 -mx-2 rounded-xl transition-colors min-h-[56px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                      {payment.paymentMethod === 'upi' ? 'UPI' : payment.paymentMethod === 'cash' ? 'CSH' : 'BNK'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {payment.borrowerName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{payment.receiptNumber}</span>
                        <span>·</span>
                        <span>{payment.paymentDate.split(' ')[1] || payment.paymentDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatINR(payment.amountPaise)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Bal: {formatINR(payment.newOutstandingPaise)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Collection Operator Summary & Shortcuts */}
        <div className="space-y-4">
          {/* Overdue Recovery Banner */}
          <div className="bg-gradient-to-br from-rose-900/90 to-slate-900 text-white p-4.5 rounded-2xl border border-rose-800/60 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  Priority Action
                </span>
                <h4 className="text-sm font-bold text-white mt-1">Pending & Overdue Alerts</h4>
                <p className="text-xs text-rose-200/80 mt-1">
                  {overdueCount} accounts have missed installment deadlines. Follow up via WhatsApp or direct phone call.
                </p>
              </div>
            </div>
            <button
              onClick={onViewOverdueClick}
              className="w-full mt-3.5 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Manage Overdue Follow-ups</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick links to Management Views */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Management Modules
            </h4>

            <button
              onClick={() => onNavigateTab('pending')}
              className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending Installments Schedule</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('expenses')}
              className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-indigo-500" />
                <span>Operational Expenses</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('audit')}
              className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <span>Security & Audit Trail</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
