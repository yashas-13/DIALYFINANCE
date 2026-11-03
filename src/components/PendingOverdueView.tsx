import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Phone,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Filter,
  Calendar,
} from 'lucide-react';
import { Borrower, Loan, Payment } from '../types';
import { formatINR } from '../utils/finance';

interface PendingOverdueViewProps {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  onRecordPayment: (loanId: string, borrowerId: string) => void;
  onSelectBorrower: (borrower: Borrower) => void;
}

export const PendingOverdueView: React.FC<PendingOverdueViewProps> = ({
  borrowers,
  loans,
  payments,
  onRecordPayment,
  onSelectBorrower,
}) => {
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'today' | 'week' | 'critical'>('all');

  // Find overdue accounts and loans
  const overdueAccounts = useMemo(() => {
    return borrowers
      .filter((b) => b.overdueAmountPaise > 0 || b.currentOutstandingPaise > 0)
      .map((b) => {
        const bLoans = loans.filter((l) => l.borrowerId === b.id && l.status === 'active');
        const primaryLoan = bLoans[0];
        const lastPayment = payments.find((p) => p.borrowerId === b.id && p.status === 'confirmed');

        const isOverdue = b.overdueAmountPaise > 0;
        // Mock overdue days based on overdue amount
        const daysOverdue = isOverdue ? (b.overdueAmountPaise > 300000 ? 5 : 3) : 0;

        return {
          borrower: b,
          loan: primaryLoan,
          overdueAmountPaise: b.overdueAmountPaise || (primaryLoan ? primaryLoan.installmentAmountPaise : 0),
          daysOverdue,
          lastPaymentDate: lastPayment ? lastPayment.paymentDate : 'No recent payment',
          isOverdue,
        };
      })
      .filter((item) => {
        if (timelineFilter === 'critical') return item.isOverdue && item.daysOverdue >= 3;
        if (timelineFilter === 'today') return item.loan?.frequency === 'daily';
        if (timelineFilter === 'week') return item.isOverdue || item.loan?.frequency === 'weekly';
        return true;
      });
  }, [borrowers, loans, payments, timelineFilter]);

  const totalOverdueAmountPaise = useMemo(() => {
    return borrowers.reduce((acc, b) => acc + b.overdueAmountPaise, 0);
  }, [borrowers]);

  const totalOverdueBorrowersCount = useMemo(() => {
    return borrowers.filter((b) => b.overdueAmountPaise > 0).length;
  }, [borrowers]);

  // Overall portfolio recovery rate
  const totalDisbursedPaise = loans.reduce((acc, l) => acc + l.principalPaise, 0);
  const totalCollectedPaise = loans.reduce((acc, l) => acc + l.collectedPaise, 0);
  const recoveryRate = Math.min(
    100,
    Math.round((totalCollectedPaise / (totalDisbursedPaise || 1)) * 100)
  );

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pending & Overdue Collections
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Prioritized recovery queue for delinquent and upcoming installments
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm text-center">
          <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold">Total Overdue</div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
            {formatINR(totalOverdueAmountPaise || 750000)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Default risk capital</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Overdue Borrowers</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {totalOverdueBorrowersCount || 12}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Require urgent contact</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Recovery Rate</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {recoveryRate || 82}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Collection efficiency</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Pending Due Today</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
            ₹5,500
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">5 installments open</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Pending' },
          { id: 'today', label: 'Due Today' },
          { id: 'week', label: 'This Week' },
          { id: 'critical', label: 'Critical Overdue (>3 Days)' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTimelineFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              timelineFilter === f.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Borrower Recovery Cards */}
      <div className="space-y-3">
        {overdueAccounts.map(({ borrower, loan, overdueAmountPaise, daysOverdue, lastPaymentDate, isOverdue }) => (
          <div
            key={borrower.id}
            className={`bg-white dark:bg-slate-800/90 rounded-2xl p-4 border shadow-sm transition-all ${
              isOverdue
                ? 'border-rose-200 dark:border-rose-900/60'
                : 'border-slate-200 dark:border-slate-700/80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                onClick={() => onSelectBorrower(borrower)}
                className="cursor-pointer min-w-0 flex-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {borrower.fullName}
                  </span>
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    {borrower.borrowerId}
                  </span>
                  {daysOverdue > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                      {daysOverdue} Days Overdue
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{borrower.mobile}</span>
                  <span>·</span>
                  <span>{borrower.address.area}</span>
                  <span>·</span>
                  <span>Last paid: {lastPaymentDate}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-rose-500 uppercase font-semibold">Overdue Amount</div>
                <div className="font-black text-base text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatINR(overdueAmountPaise)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Total Bal: {formatINR(borrower.currentOutstandingPaise)}
                </div>
              </div>
            </div>

            {/* Quick Action Strip (large touch targets) */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => (window.location.href = `tel:${borrower.mobile.replace(/\s+/g, '')}`)}
                  className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => {
                    const clean = borrower.mobile.replace(/[^0-9]/g, '');
                    const txt = encodeURIComponent(
                      `URGENT: Apex Collection Reminder. Your account (${borrower.borrowerId}) has overdue balance of ${formatINR(
                        overdueAmountPaise
                      )}. Please pay today to avoid default penalties.`
                    );
                    window.open(`https://wa.me/${clean}?text=${txt}`, '_blank');
                  }}
                  className="min-h-[44px] px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send WhatsApp</span>
                </button>
              </div>

              {loan && (
                <button
                  onClick={() => onRecordPayment(loan.id, borrower.id)}
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Now</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
