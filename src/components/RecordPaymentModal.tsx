import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Check,
  AlertCircle,
  IndianRupee,
  Clock,
  ShieldCheck,
  Receipt,
  User,
} from 'lucide-react';
import { Borrower, Loan, PaymentMethod, AdminUser } from '../types';
import { formatINR, rupeesToPaise, paiseToRupees } from '../utils/finance';

interface RecordPaymentModalProps {
  borrowers: Borrower[];
  loans: Loan[];
  initialLoanId?: string;
  initialBorrowerId?: string;
  admin: AdminUser;
  onClose: () => void;
  onSavePayment: (paymentData: any) => void;
  nextReceiptNumber?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  borrowers,
  loans,
  initialLoanId,
  initialBorrowerId,
  admin,
  onClose,
  onSavePayment,
  nextReceiptNumber = 'RCP-26-0095',
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState(initialLoanId || '');
  const [amountReceivedRupees, setAmountReceivedRupees] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [allowAdvance, setAllowAdvance] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active loans list
  const activeLoans = loans.filter((l) => l.status === 'active');

  // Auto-select initial loan if provided or default to first
  useEffect(() => {
    if (initialLoanId) {
      setSelectedLoanId(initialLoanId);
    } else if (initialBorrowerId) {
      const bLoan = activeLoans.find((l) => l.borrowerId === initialBorrowerId);
      if (bLoan) setSelectedLoanId(bLoan.id);
      else if (activeLoans.length > 0) setSelectedLoanId(activeLoans[0].id);
    } else if (activeLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(activeLoans[0].id);
    }
  }, [initialLoanId, initialBorrowerId, activeLoans]);

  const activeLoan = activeLoans.find((l) => l.id === selectedLoanId);
  const selectedBorrower = activeLoan
    ? borrowers.find((b) => b.id === activeLoan.borrowerId)
    : null;

  // Preset installment amount
  useEffect(() => {
    if (activeLoan && !amountReceivedRupees) {
      setAmountReceivedRupees((activeLoan.installmentAmountPaise / 100).toString());
    }
  }, [activeLoan]);

  const handleSelectPreset = (rupees: number) => {
    setAmountReceivedRupees(rupees.toString());
  };

  const currentEnteredPaise = rupeesToPaise(amountReceivedRupees);
  const outstandingPaise = activeLoan ? activeLoan.outstandingPaise : 0;
  const isAdvancePayment = currentEnteredPaise > outstandingPaise;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeLoan) {
      setError('Please select an active loan account.');
      return;
    }

    if (currentEnteredPaise <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (currentEnteredPaise > outstandingPaise && !allowAdvance) {
      setError(
        `Payment (${formatINR(currentEnteredPaise)}) exceeds total loan balance (${formatINR(
          outstandingPaise
        )}). Check 'Allow Advance / Overpayment' to proceed.`
      );
      return;
    }

    if (paymentMethod === 'upi' && !referenceNumber.trim()) {
      // Gentle warning or optional reference
    }

    setIsSubmitting(true);

    try {
      onSavePayment({
        loanId: activeLoan.id,
        amountPaise: currentEnteredPaise,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        collectedBy: admin.name,
      });
    } catch (err: any) {
      setError(err?.message || 'Payment submission failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Record Collection Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receipt No: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{nextReceiptNumber}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loan / Borrower Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="select-payment-loan">
              Select Loan & Borrower Account <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-payment-loan"
              value={selectedLoanId}
              onChange={(e) => {
                setSelectedLoanId(e.target.value);
                const l = activeLoans.find((al) => al.id === e.target.value);
                if (l) {
                  setAmountReceivedRupees((l.installmentAmountPaise / 100).toString());
                }
              }}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            >
              {activeLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.borrowerName} · {l.loanId} (Due: {formatINR(l.installmentAmountPaise)} | Bal: {formatINR(l.outstandingPaise)})
                </option>
              ))}
            </select>
          </div>

          {/* Account Snapshot Card */}
          {activeLoan && selectedBorrower && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Installment Due</span>
                  <span className="block font-extrabold text-sm text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {formatINR(activeLoan.installmentAmountPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Outstanding Balance</span>
                  <span className="block font-extrabold text-sm text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                    {formatINR(activeLoan.outstandingPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Frequency</span>
                  <span className="block font-bold text-xs text-slate-700 dark:text-slate-300 capitalize mt-0.5">
                    {activeLoan.frequency} EMI
                  </span>
                </div>
              </div>

              {activeLoan.interestType === 'upfront_deduction' && (
                <div className="text-[11px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium py-1 px-2.5 rounded-lg text-center flex items-center justify-between">
                  <span>Upfront Deduction Contract</span>
                  <span>Disbursed: {formatINR(activeLoan.netDisbursedPaise ?? (activeLoan.principalPaise - (activeLoan.upfrontDeductionPaise || 0)))}</span>
                </div>
              )}
            </div>
          )}

          {/* Amount Input with Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="payment-amount">
                Amount Received (₹) <span className="text-rose-500">*</span>
              </label>
              {activeLoan && (
                <span className="text-[11px] text-slate-400">
                  New Balance: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatINR(Math.max(0, outstandingPaise - currentEnteredPaise))}</strong>
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-base font-bold">₹</span>
              <input
                id="payment-amount"
                type="number"
                value={amountReceivedRupees}
                onChange={(e) => setAmountReceivedRupees(e.target.value)}
                placeholder="e.g. 500"
                required
                min="1"
                step="1"
                className="w-full h-12 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-extrabold focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            {/* Quick Touch Preset Chips for minimal data entry */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {activeLoan && (
                <button
                  type="button"
                  onClick={() => handleSelectPreset(activeLoan.installmentAmountPaise / 100)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Full Due ({formatINR(activeLoan.installmentAmountPaise)})
                </button>
              )}
              {activeLoan && (
                <button
                  type="button"
                  onClick={() => handleSelectPreset(Math.round(activeLoan.installmentAmountPaise / 200))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Half Due ({formatINR(Math.round(activeLoan.installmentAmountPaise / 2))})
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSelectPreset(500)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                ₹500
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(1000)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                ₹1,000
              </button>
              {activeLoan && activeLoan.outstandingPaise > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectPreset(activeLoan.outstandingPaise / 100)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Full Loan Balance ({formatINR(activeLoan.outstandingPaise)})
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selector (Segmented buttons with 44px hitbox) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['cash', 'upi', 'bank_transfer', 'other'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`min-h-[44px] rounded-lg text-xs font-bold uppercase tracking-tight transition-colors flex items-center justify-center ${
                    paymentMethod === method
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {method === 'bank_transfer' ? 'Bank' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Number if UPI or Bank */}
          {(paymentMethod === 'upi' || paymentMethod === 'bank_transfer' || paymentMethod === 'other') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="payment-ref">
                {paymentMethod === 'upi' ? 'UPI UTR / Reference Number' : 'Transaction / Cheque Reference'}
              </label>
              <input
                id="payment-ref"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={paymentMethod === 'upi' ? 'e.g. UPI/123456789012' : 'e.g. IMPS/REF-84920'}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Advance Toggle if payment exceeds balance */}
          {isAdvancePayment && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 dark:text-amber-200">
                  Allow Advance Overpayment?
                </span>
                <input
                  type="checkbox"
                  checked={allowAdvance}
                  onChange={(e) => setAllowAdvance(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Amount exceeds current outstanding balance by {formatINR(currentEnteredPaise - outstandingPaise)}.
              </p>
            </div>
          )}

          {/* Notes & Collector Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Receipt Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Collected at morning market gate"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Collected by: <strong className="text-slate-800 dark:text-slate-200">{admin.name}</strong></span>
            <span>Ledger: <strong className="text-emerald-600 dark:text-emerald-400">Atomic Paise</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting Ledger...' : 'Confirm Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
