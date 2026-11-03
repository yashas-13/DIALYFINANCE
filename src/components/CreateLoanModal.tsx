import React, { useState, useMemo, useEffect } from 'react';
import { X, Calculator, Calendar, Check, AlertCircle, IndianRupee } from 'lucide-react';
import { Borrower, RepaymentFrequency, InterestType } from '../types';
import { calculateLoan, formatINR, rupeesToPaise } from '../utils/finance';

interface CreateLoanModalProps {
  borrowers: Borrower[];
  initialBorrowerId?: string;
  onClose: () => void;
  onSave: (loanData: any) => void;
  nextLoanId?: string;
}

export const CreateLoanModal: React.FC<CreateLoanModalProps> = ({
  borrowers,
  initialBorrowerId,
  onClose,
  onSave,
  nextLoanId = 'LN-2026-007',
}) => {
  const [selectedBorrowerId, setSelectedBorrowerId] = useState(
    initialBorrowerId || borrowers[0]?.id || ''
  );
  const [principalRupees, setPrincipalRupees] = useState('20000');
  const [interestType, setInterestType] = useState<InterestType>('flat');
  const [interestRatePercent, setInterestRatePercent] = useState('12');
  const [frequency, setFrequency] = useState<RepaymentFrequency>('daily');
  const [durationValue, setDurationValue] = useState('50'); // 50 installments
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [collectionDay, setCollectionDay] = useState('Everyday');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Live real-time calculation before saving
  const calculationResult = useMemo(() => {
    const pPaise = rupeesToPaise(principalRupees);
    const rate = parseFloat(interestRatePercent) || 0;
    const duration = parseInt(durationValue, 10) || 0;

    if (pPaise <= 0 || duration <= 0) {
      return null;
    }

    return calculateLoan({
      principalPaise: pPaise,
      interestType,
      annualInterestRatePercent: rate,
      durationValue: duration,
      frequency,
      startDate,
    });
  }, [principalRupees, interestType, interestRatePercent, frequency, durationValue, startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBorrowerId) {
      setError('Please select a valid borrower.');
      return;
    }
    const pPaise = rupeesToPaise(principalRupees);
    if (pPaise < 100000) {
      // Min ₹1,000
      setError('Principal amount must be at least ₹1,000.');
      return;
    }
    const duration = parseInt(durationValue, 10);
    if (!duration || duration < 1) {
      setError('Duration / number of installments must be at least 1.');
      return;
    }

    onSave({
      borrowerId: selectedBorrowerId,
      principalPaise: pPaise,
      interestType,
      interestRatePercent: parseFloat(interestRatePercent) || 12,
      frequency,
      durationValue: duration,
      startDate,
      collectionDay,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Disburse New Loan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contract ID: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{nextLoanId}</span>
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Borrower Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="loan-borrower">
              Select Borrower <span className="text-rose-500">*</span>
            </label>
            <select
              id="loan-borrower"
              value={selectedBorrowerId}
              onChange={(e) => setSelectedBorrowerId(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {borrowers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.fullName} ({b.borrowerId}) · Bal: {formatINR(b.currentOutstandingPaise)}
                </option>
              ))}
            </select>
          </div>

          {/* Principal & Interest Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="principal-amount">
                Principal Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                <input
                  id="principal-amount"
                  type="number"
                  value={principalRupees}
                  onChange={(e) => setPrincipalRupees(e.target.value)}
                  placeholder="20000"
                  required
                  min="1000"
                  step="500"
                  className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interest Calculation Type
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInterestType('flat')}
                  className={`h-9 rounded-lg text-xs font-semibold transition-colors ${
                    interestType === 'flat'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Flat Rate
                </button>
                <button
                  type="button"
                  onClick={() => setInterestType('reducing')}
                  className={`h-9 rounded-lg text-xs font-semibold transition-colors ${
                    interestType === 'reducing'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Reducing (EMI)
                </button>
              </div>
            </div>
          </div>

          {/* Rate & Repayment Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="interest-rate">
                Annual Interest Rate (%)
              </label>
              <input
                id="interest-rate"
                type="number"
                value={interestRatePercent}
                onChange={(e) => setInterestRatePercent(e.target.value)}
                placeholder="12"
                step="0.5"
                min="0"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Repayment Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RepaymentFrequency)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 capitalize"
              >
                <option value="daily">Daily Repayment</option>
                <option value="weekly">Weekly Repayment</option>
                <option value="monthly">Monthly Repayment</option>
              </select>
            </div>
          </div>

          {/* Duration & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="duration-installments">
                Number of Installments ({frequency === 'daily' ? 'days' : frequency === 'weekly' ? 'weeks' : 'months'})
              </label>
              <input
                id="duration-installments"
                type="number"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="50"
                min="1"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1" htmlFor="disbursement-date">
                Start / Disbursement Date
              </label>
              <input
                id="disbursement-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Live Financial Summary Box */}
          {calculationResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>Real-Time Repayment Summary</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Principal</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">
                    {formatINR(calculationResult.principalPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Total Interest</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-sm tabular-nums">
                    {formatINR(calculationResult.totalInterestPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Total Payable</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">
                    {formatINR(calculationResult.totalPayablePaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Installment EMI</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base tabular-nums">
                    {formatINR(calculationResult.installmentAmountPaise)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ {frequency}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Maturity Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {calculationResult.maturityDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Total Payments</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {calculationResult.totalInstallments} collections
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Loan Purpose / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Working capital for grocery inventory stocking"
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Disburse Loan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
