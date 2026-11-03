import React, { useState } from 'react';
import {
  X,
  CreditCard,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Edit2,
  Check,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Loan, Borrower, Payment } from '../types';
import { formatINR } from '../utils/finance';

interface LoanDetailModalProps {
  loan: Loan;
  borrower?: Borrower;
  payments: Payment[];
  onClose: () => void;
  onRecordPayment: (loanId: string, borrowerId: string) => void;
  onEditLoan: (loanId: string, updates: { notes?: string }, reason: string) => void;
  onCloseLoan: (loanId: string, reason: string) => void;
  onViewReceipt: (payment: Payment) => void;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  loan,
  borrower,
  payments,
  onClose,
  onRecordPayment,
  onEditLoan,
  onCloseLoan,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'edit'>('schedule');
  const [editNotes, setEditNotes] = useState(loan.notes || '');
  const [auditReason, setAuditReason] = useState('');
  const [showClosePrompt, setShowClosePrompt] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loanPayments = payments.filter((p) => p.loanId === loan.id);

  const paidCount = loan.installments.filter((i) => i.status === 'paid').length;
  const pendingCount = loan.installments.filter((i) => i.status === 'pending').length;
  const overdueCount = loan.installments.filter((i) => i.status === 'overdue').length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditReason.trim()) {
      alert('Audit log compliance requires a reason for modifying loan records.');
      return;
    }
    onEditLoan(loan.id, { notes: editNotes.trim() }, auditReason.trim());
    setSuccessMsg('Loan record updated with audit trail.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleConfirmClose = () => {
    if (!closeReason.trim()) {
      alert('Please specify reason for closing this loan.');
      return;
    }
    onCloseLoan(loan.id, closeReason.trim());
    setShowClosePrompt(false);
  };

  const handleDownloadStatement = () => {
    const content = `LOAN ACCOUNT STATEMENT\n` +
      `Loan ID: ${loan.loanId}\n` +
      `Borrower: ${loan.borrowerName} (${loan.borrowerPhone})\n` +
      `Principal: ${formatINR(loan.principalPaise)}\n` +
      `Total Payable: ${formatINR(loan.totalPayablePaise)}\n` +
      `Collected: ${formatINR(loan.collectedPaise)}\n` +
      `Outstanding Balance: ${formatINR(loan.outstandingPaise)}\n` +
      `Status: ${loan.status.toUpperCase()}\n` +
      `Date: ${new Date().toLocaleString('en-IN')}\n\n` +
      `PAYMENT TRANSACTIONS:\n` +
      loanPayments.map((p) => `${p.paymentDate} - ${p.receiptNumber} - ${formatINR(p.amountPaise)} (${p.paymentMethod})`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statement_${loan.loanId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {loan.loanId}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  loan.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : loan.status === 'completed'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {loan.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Borrower: <span className="font-semibold text-slate-800 dark:text-slate-200">{loan.borrowerName}</span> ({loan.borrowerPhone})
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDownloadStatement}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download Loan Statement"
              aria-label="Download Loan Statement"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial KPI Strip */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Principal</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {formatINR(loan.principalPaise)}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">{loan.interestType} {loan.interestRatePercent}%</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {formatINR(loan.totalPayablePaise)}
            </div>
            <div className="text-[10px] text-slate-500">{loan.totalInstallments} installments</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Collected</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {formatINR(loan.collectedPaise)}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {Math.round((loan.collectedPaise / (loan.totalPayablePaise || 1)) * 100)}% recovered
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-rose-500 uppercase font-semibold">Outstanding</div>
            <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
              {formatINR(loan.outstandingPaise)}
            </div>
            <div className="text-[10px] text-slate-500">Due {loan.dueDate}</div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Installment Schedule
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Ledger ({loanPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'edit'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Edit Loan
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {loan.status === 'active' && (
              <>
                <button
                  onClick={() => onRecordPayment(loan.id, loan.borrowerId)}
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Payment</span>
                </button>
                <button
                  onClick={() => setShowClosePrompt(true)}
                  className="min-h-[44px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors"
                >
                  Close Loan
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {successMsg && (
            <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-3">
              {/* Schedule Stats Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Paid ({paidCount})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Pending ({pendingCount})</span>
                  </span>
                  {overdueCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Overdue ({overdueCount})</span>
                    </span>
                  )}
                </div>
                <span className="font-semibold">{loan.frequency.toUpperCase()} cycle</span>
              </div>

              {/* Installment list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loan.installments.map((inst) => {
                  const isPaid = inst.status === 'paid';
                  const isPartial = inst.status === 'partial';
                  const isOverdue = inst.status === 'overdue';

                  return (
                    <div
                      key={inst.id}
                      className="py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {inst.installmentNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            Due: {inst.dueDate}
                          </div>
                          {inst.paidAt && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Paid on {inst.paidAt.split('T')[0]}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold tabular-nums text-slate-900 dark:text-white">
                          {formatINR(inst.amountDuePaise)}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isPartial
                              ? 'text-amber-600'
                              : isOverdue
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {loanPayments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No payments posted for this loan yet.
                </div>
              ) : (
                loanPayments.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onViewReceipt(p)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{p.receiptNumber}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.paymentDate}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatINR(p.amountPaise)}
                      </div>
                      <div className="text-[10px] text-slate-400">View voucher →</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loan Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Log Compliance Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="e.g. Added collateral remark requested by head office"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Mandatory: Every change to a loan agreement is permanently recorded in the immutable audit log.
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Save Changes with Audit Trail
              </button>
            </form>
          )}
        </div>

        {/* Close Loan Prompt Modal */}
        {showClosePrompt && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Confirm Loan Closure</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to close loan {loan.loanId}? Remaining balance is {formatINR(loan.outstandingPaise)}.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Closure Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="e.g. Settled with approved one-time rebate"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClosePrompt(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="flex-1 h-10 rounded-xl bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirm Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
