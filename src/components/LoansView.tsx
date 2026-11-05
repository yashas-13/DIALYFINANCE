import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileText,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Clock,
  Calendar,
} from 'lucide-react';
import { Loan, Borrower, LoanStatus } from '../types';
import { formatINR } from '../utils/finance';

interface LoansViewProps {
  loans: Loan[];
  borrowers: Borrower[];
  onSelectLoan: (loan: Loan) => void;
  onCreateLoanClick: () => void;
  onRecordPaymentClick: (loanId: string, borrowerId: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  borrowers,
  onSelectLoan,
  onCreateLoanClick,
  onRecordPaymentClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LoanStatus>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesId = l.loanId.toLowerCase().includes(q);
        const matchesName = l.borrowerName.toLowerCase().includes(q);
        const matchesPhone = l.borrowerPhone.includes(q);
        if (!matchesId && !matchesName && !matchesPhone) return false;
      }

      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (frequencyFilter !== 'all' && l.frequency !== frequencyFilter) return false;

      return true;
    });
  }, [loans, searchQuery, statusFilter, frequencyFilter]);

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Loan Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loans.length} total loan agreements · {loans.filter((l) => l.status === 'active').length} active
          </p>
        </div>

        <button
          onClick={onCreateLoanClick}
          className="h-11 px-3.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Loan</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by loan ID (e.g. LN-2026-001), borrower, or phone..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
          {(['all', 'active', 'completed', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Frequency filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs">
          {(['all', 'daily', 'weekly', 'monthly'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFrequencyFilter(f)}
              className={`px-2.5 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                frequencyFilter === f
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Cards */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">No loan contracts found</h3>
            <p className="text-xs text-slate-500 mt-1">Try modifying your search or filter settings.</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const recoveryPercent = Math.min(
              100,
              Math.round((loan.collectedPaise / (loan.totalPayablePaise || 1)) * 100)
            );

            return (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer min-h-[72px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {loan.loanId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          loan.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : loan.status === 'completed'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {loan.status}
                      </span>
                      {loan.interestType === 'upfront_deduction' ? (
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 px-2 py-0.5 rounded">
                          Upfront Cut
                        </span>
                      ) : null}
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded capitalize">
                        {loan.frequency} EMI
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                      {loan.borrowerName} <span className="text-slate-400 font-normal">({loan.borrowerPhone})</span>
                      {loan.interestType === 'upfront_deduction' && loan.netDisbursedPaise && (
                        <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          · Disbursed {formatINR(loan.netDisbursedPaise)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Outstanding</div>
                      <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tabular-nums">
                        {formatINR(loan.outstandingPaise)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total {formatINR(loan.totalPayablePaise)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>
                      Collected: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(loan.collectedPaise)}</strong>
                    </span>
                    <span className="font-semibold">{recoveryPercent}% recovered</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${recoveryPercent}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Quick Row Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Installment: </span>
                    <strong className="text-slate-800 dark:text-white">{formatINR(loan.installmentAmountPaise)}</strong>
                    <span className="text-slate-400"> / {loan.frequency}</span>
                  </div>

                  {loan.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordPaymentClick(loan.id, loan.borrowerId);
                      }}
                      className="min-h-[44px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect Payment</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
