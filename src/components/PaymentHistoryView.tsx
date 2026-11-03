import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Receipt,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Payment } from '../types';
import { formatINR } from '../utils/finance';

interface PaymentHistoryViewProps {
  payments: Payment[];
  onViewReceipt: (payment: Payment) => void;
  onReversePayment: (paymentId: string, reason: string) => void;
}

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({
  payments,
  onViewReceipt,
  onReversePayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'reversed'>('all');
  const [reversalTarget, setReversalTarget] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesBorrower = p.borrowerName.toLowerCase().includes(q);
        const matchesReceipt = p.receiptNumber.toLowerCase().includes(q);
        const matchesLoan = p.loanId.toLowerCase().includes(q);
        const matchesRef = p.referenceNumber?.toLowerCase().includes(q);
        if (!matchesBorrower && !matchesReceipt && !matchesLoan && !matchesRef) {
          return false;
        }
      }

      if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      return true;
    });
  }, [payments, searchQuery, methodFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Receipt No',
      'Date',
      'Borrower Name',
      'Loan ID',
      'Amount (INR)',
      'Method',
      'Reference',
      'Collected By',
      'Status',
    ];
    const rows = filteredPayments.map((p) => [
      p.receiptNumber,
      p.paymentDate,
      `"${p.borrowerName}"`,
      p.loanId,
      (p.amountPaise / 100).toFixed(2),
      p.paymentMethod,
      p.referenceNumber || '',
      `"${p.collectedBy}"`,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Collection_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmReversal = () => {
    if (!reversalTarget || !reversalReason.trim()) return;
    onReversePayment(reversalTarget.id, reversalReason.trim());
    setReversalTarget(null);
    setReversalReason('');
  };

  const totalFilteredAmountPaise = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === 'confirmed')
      .reduce((acc, p) => acc + p.amountPaise, 0);
  }, [filteredPayments]);

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Collection Ledger & Receipts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredPayments.length} transactions · Total: <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatINR(totalFilteredAmountPaise)}</span>
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="h-11 px-3.5 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
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
          placeholder="Search by receipt number (e.g. RCP-26-0091) or borrower..."
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

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs">
          {(['all', 'confirmed', 'reversed'] as const).map((s) => (
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

        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
          {(['all', 'cash', 'upi', 'bank_transfer'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-2.5 py-1.5 rounded-lg font-medium uppercase transition-colors ${
                methodFilter === m
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {m === 'bank_transfer' ? 'Bank' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-2.5">
        {filteredPayments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">No payment records found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search terms.</p>
          </div>
        ) : (
          filteredPayments.map((p) => {
            const isReversed = p.status === 'reversed';

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {p.borrowerName}
                      </span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {p.receiptNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isReversed
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{p.paymentDate}</span>
                      <span>·</span>
                      <span className="uppercase font-semibold">{p.paymentMethod}</span>
                      {p.referenceNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono truncate">{p.referenceNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-extrabold text-sm sm:text-base tabular-nums ${
                        isReversed
                          ? 'text-slate-400 line-through'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      +{formatINR(p.amountPaise)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Balance: {formatINR(p.newOutstandingPaise)}
                    </div>
                  </div>
                </div>

                {/* Reversal notice if applicable */}
                {isReversed && p.reversalReason && (
                  <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-[11px] text-rose-700 dark:text-rose-300">
                    <strong>Reversal Reason:</strong> {p.reversalReason}
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Collected by {p.collectedBy}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewReceipt(p)}
                      className="min-h-[44px] px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Voucher</span>
                    </button>

                    {!isReversed && (
                      <button
                        onClick={() => setReversalTarget(p)}
                        className="min-h-[44px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Reverse transaction and restore loan balance"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reverse</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Reversal Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Reverse Payment Voucher</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are about to reverse receipt <strong>{reversalTarget.receiptNumber}</strong> of {formatINR(reversalTarget.amountPaise)} from {reversalTarget.borrowerName}.
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              This will restore the loan balance and record a permanent immutable reversal log in the audit trail.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Reversal Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Borrower double-paid via UPI / Entry error by loan officer"
                rows={2}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setReversalTarget(null);
                  setReversalReason('');
                }}
                className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                disabled={!reversalReason.trim()}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
