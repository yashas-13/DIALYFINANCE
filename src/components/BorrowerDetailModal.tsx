import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  CreditCard,
  PlusCircle,
  Edit,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Clock,
  Receipt,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Borrower, Loan, Payment, AuditLogItem } from '../types';
import { formatINR } from '../utils/finance';

interface BorrowerDetailModalProps {
  borrower: Borrower;
  loans: Loan[];
  payments: Payment[];
  auditLogs: AuditLogItem[];
  onClose: () => void;
  onEditBorrower: (borrower: Borrower) => void;
  onRecordPayment: (borrowerId: string, loanId?: string) => void;
  onCreateLoan: (borrowerId: string) => void;
  onViewReceipt: (payment: Payment) => void;
  onViewLoanDetail: (loan: Loan) => void;
}

export const BorrowerDetailModal: React.FC<BorrowerDetailModalProps> = ({
  borrower,
  loans,
  payments,
  auditLogs,
  onClose,
  onEditBorrower,
  onRecordPayment,
  onCreateLoan,
  onViewReceipt,
  onViewLoanDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'payments' | 'activity'>('overview');

  const borrowerLoans = loans.filter((l) => l.borrowerId === borrower.id);
  const borrowerPayments = payments.filter((p) => p.borrowerId === borrower.id);
  const borrowerAuditLogs = auditLogs.filter(
    (a) => a.entityId === borrower.borrowerId || a.details.includes(borrower.fullName)
  );

  const handleCall = () => {
    window.location.href = `tel:${borrower.mobile.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = () => {
    const cleanPhone = borrower.mobile.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${borrower.fullName}, this is from Apex Collection regarding your loan account (${borrower.borrowerId}). Current outstanding balance is ${formatINR(borrower.currentOutstandingPaise)}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                {borrower.fullName}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {borrower.borrowerId}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  borrower.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}
              >
                {borrower.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{borrower.mobile}</span>
              <span>·</span>
              <span>{borrower.address.area}, {borrower.address.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEditBorrower(borrower)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Edit Borrower"
            >
              <Edit className="w-4 h-4" />
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

        {/* Financial Summary Strip */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Borrowed</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-white tabular-nums mt-0.5">
              {formatINR(borrower.totalBorrowedPaise)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Repaid</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {formatINR(borrower.totalRepaidPaise)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Outstanding</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {formatINR(borrower.currentOutstandingPaise)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-rose-500 uppercase font-semibold">Overdue Amount</div>
            <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
              {formatINR(borrower.overdueAmountPaise)}
            </div>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCall}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="min-h-[44px] px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onCreateLoan(borrower.id)}
              className="min-h-[44px] px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Loan</span>
            </button>
            {borrower.currentOutstandingPaise > 0 && (
              <button
                onClick={() => onRecordPayment(borrower.id)}
                className="min-h-[44px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Collect</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Tabs: Overview, Loans, Payments, Activity */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'loans'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Loans ({borrowerLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Payments ({borrowerPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Address card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physical Address</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {borrower.address.doorNo}, {borrower.address.street}, {borrower.address.area}, {borrower.address.city} - {borrower.address.pinCode}
                </p>
              </div>

              {/* Occupation & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Occupation</span>
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                    {borrower.occupation || 'N/A'}
                  </div>
                  {borrower.monthlyIncomePaise ? (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Income: ~{formatINR(borrower.monthlyIncomePaise)} / mo
                    </div>
                  ) : null}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Guarantor / Reference</span>
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                    {borrower.refName || 'Direct customer / None registered'}
                  </div>
                  {borrower.refMobile ? (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Phone: {borrower.refMobile}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Collection notes */}
              {borrower.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                  <span className="font-bold block mb-1">Field Collector Notes:</span>
                  <p>{borrower.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-3">
              {borrowerLoans.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No loans disbursed to this borrower yet.
                </div>
              ) : (
                borrowerLoans.map((loan) => (
                  <div
                    key={loan.id}
                    onClick={() => onViewLoanDetail(loan)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {loan.loanId}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {loan.status}
                        </span>
                        {loan.interestType === 'upfront_deduction' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                            Upfront Deduction
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums block">
                          {formatINR(loan.sanctionedAmountPaise || loan.principalPaise)}
                        </span>
                        {loan.interestType === 'upfront_deduction' && loan.netDisbursedPaise && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            Disbursed: {formatINR(loan.netDisbursedPaise)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Frequency</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{loan.frequency}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Collected</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(loan.collectedPaise)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Outstanding</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">{formatINR(loan.outstandingPaise)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-2.5">
              {borrowerPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No payment transactions recorded for this borrower.
                </div>
              ) : (
                borrowerPayments.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onViewReceipt(p)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.receiptNumber}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.paymentDate}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatINR(p.amountPaise)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Receipt voucher →
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {borrowerAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No activity log entries found for this borrower.
                </div>
              ) : (
                borrowerAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{log.event.replace('_', ' ')}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{log.details}</p>
                    <div className="text-[10px] text-slate-400">Recorded by {log.adminName}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function User(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
