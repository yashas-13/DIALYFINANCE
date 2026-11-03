import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Borrower, Loan, Payment } from '../types';
import { formatINR, addDays } from '../utils/finance';

interface DailyCollectionViewProps {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  onRecordPayment: (loanId: string, borrowerId: string) => void;
  onViewReceipt: (payment: Payment) => void;
  onSelectBorrower: (borrower: Borrower) => void;
}

export const DailyCollectionView: React.FC<DailyCollectionViewProps> = ({
  borrowers,
  loans,
  payments,
  onRecordPayment,
  onViewReceipt,
  onSelectBorrower,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'paid' | 'overdue'>('all');

  // Compute daily expected, collected, and pending for selected date
  const activeLoans = useMemo(() => loans.filter((l) => l.status === 'active'), [loans]);

  // Aggregate collections on this date
  const datePayments = useMemo(() => {
    return payments.filter(
      (p) => p.status === 'confirmed' && p.paymentDate.startsWith(selectedDate)
    );
  }, [payments, selectedDate]);

  const totalCollectedPaise = useMemo(() => {
    return datePayments.reduce((acc, p) => acc + p.amountPaise, 0);
  }, [datePayments]);

  // Estimate total expected based on daily/weekly installment obligations
  const totalExpectedPaise = useMemo(() => {
    // For loans on daily frequency, sum their installment amount
    return activeLoans.reduce((acc, l) => acc + (l.installmentAmountPaise || 0), 0);
  }, [activeLoans]);

  const pendingPaise = Math.max(0, totalExpectedPaise - totalCollectedPaise);

  // Group borrowers with active loans and their payment status for this date
  const collectionList = useMemo(() => {
    return activeLoans
      .map((loan) => {
        const borrower = borrowers.find((b) => b.id === loan.borrowerId);
        if (!borrower) return null;

        // Check if payment made for this loan on this date
        const paymentToday = datePayments.find((p) => p.loanId === loan.id);
        const amountReceivedTodayPaise = paymentToday ? paymentToday.amountPaise : 0;
        
        let paymentStatus: 'due' | 'paid' | 'partial' | 'overdue' = 'due';
        if (amountReceivedTodayPaise >= loan.installmentAmountPaise) {
          paymentStatus = 'paid';
        } else if (amountReceivedTodayPaise > 0) {
          paymentStatus = 'partial';
        } else if (borrower.overdueAmountPaise > 0) {
          paymentStatus = 'overdue';
        }

        return {
          loan,
          borrower,
          paymentToday,
          amountReceivedTodayPaise,
          paymentStatus,
          dueAmountPaise: loan.installmentAmountPaise,
        };
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.borrower.fullName.toLowerCase().includes(q);
          const matchesPhone = item.borrower.mobile.includes(q);
          const matchesLoanId = item.loan.loanId.toLowerCase().includes(q);
          const matchesArea = item.borrower.address.area.toLowerCase().includes(q);
          if (!matchesName && !matchesPhone && !matchesLoanId && !matchesArea) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter === 'due' && item.paymentStatus !== 'due') return false;
        if (statusFilter === 'paid' && item.paymentStatus !== 'paid') return false;
        if (statusFilter === 'overdue' && item.paymentStatus !== 'overdue') return false;

        return true;
      });
  }, [activeLoans, borrowers, datePayments, searchQuery, statusFilter]);

  const handleDateShift = (deltaDays: number) => {
    setSelectedDate((prev) => addDays(prev, deltaDays));
  };

  const formattedHeaderDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(selectedDate + 'T00:00:00'));

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Date Switcher Bar (Large touch targets for one-handed operation) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={() => handleDateShift(-1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center min-w-0">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
              {formattedHeaderDate}
            </span>
            {selectedDate === todayStr ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                ● Today (Active Route)
              </span>
            ) : (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[10px] text-slate-400 hover:text-emerald-500 underline"
              >
                Jump to Today
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => handleDateShift(1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Next Day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Progress Counters */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Expected</div>
          <div className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(totalExpectedPaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{activeLoans.length} accounts</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm text-center">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Total Collected</div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {formatINR(totalCollectedPaise)}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">{datePayments.length} receipts</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Pending Amount</div>
          <div className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
            {formatINR(pendingPaise)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">To be collected</div>
        </div>
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
          placeholder="Search borrower by name, shop area, or loan ID..."
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

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
        {(['all', 'due', 'paid', 'overdue'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
              statusFilter === filter
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Collection List with Large Thumb Action Buttons */}
      <div className="space-y-3">
        {collectionList.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">No collections found</h3>
            <p className="text-xs text-slate-500 mt-1">
              All collections for this filter are clear or no loans are scheduled.
            </p>
          </div>
        ) : (
          collectionList.map(({ loan, borrower, paymentToday, amountReceivedTodayPaise, paymentStatus, dueAmountPaise }) => {
            const isPaid = paymentStatus === 'paid';
            const isOverdue = paymentStatus === 'overdue';

            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => onSelectBorrower(borrower)}
                    className="min-w-0 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {borrower.fullName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {loan.loanId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{borrower.mobile}</span>
                      <span>·</span>
                      <span className="truncate">{borrower.address.area}</span>
                    </div>
                  </div>

                  {/* Right Amount Numbers */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Installment</div>
                    <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tabular-nums">
                      {formatINR(dueAmountPaise)}
                    </div>
                    {amountReceivedTodayPaise > 0 ? (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Received: {formatINR(amountReceivedTodayPaise)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400">
                        Bal: {formatINR(loan.outstandingPaise)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Quick Thumb Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => (window.location.href = `tel:${borrower.mobile.replace(/\s+/g, '')}`)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                      aria-label="Call Borrower"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => {
                        const cleanPhone = borrower.mobile.replace(/[^0-9]/g, '');
                        const msg = encodeURIComponent(
                          `Apex Collection: Reminder for installment of ${formatINR(dueAmountPaise)} for account ${loan.loanId}.`
                        );
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                      }}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      aria-label="WhatsApp Reminder"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {paymentToday ? (
                      <button
                        onClick={() => onViewReceipt(paymentToday)}
                        className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        View Receipt
                      </button>
                    ) : null}

                    <button
                      onClick={() => onRecordPayment(loan.id, borrower.id)}
                      className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Collect Payment</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
