import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Payment, BusinessSettings } from '../types';
import { formatINR } from '../utils/finance';
import { CollectionStorage } from '../services/storage';

interface PaymentReceiptModalProps {
  payment: Payment;
  settings: BusinessSettings;
  onClose: () => void;
  onViewLoan?: (loanId: string) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  settings,
  onClose,
  onViewLoan,
}) => {
  const isReversed = payment.status === 'reversed';
  const loan = CollectionStorage.getLoans().find(
    (l) => l.id === payment.loanId || l.loanId === payment.loanId
  );
  const isUpfront = loan?.interestType === 'upfront_deduction';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const loanExtra = isUpfront && loan
      ? `Loan Structure: Sanctioned ${formatINR(loan.sanctionedAmountPaise || loan.principalPaise)} | Disbursed ${formatINR(loan.netDisbursedPaise ?? (loan.principalPaise - (loan.upfrontDeductionPaise || 0)))} | Repayable ${formatINR(loan.totalPayablePaise)}\n`
      : '';

    const text = encodeURIComponent(
      `*PAYMENT CONFIRMATION RECEIPT*\n` +
      `Business: ${settings.businessName}\n` +
      `Receipt No: ${payment.receiptNumber}\n` +
      `Date: ${payment.paymentDate}\n` +
      `Borrower: ${payment.borrowerName} (${payment.borrowerId})\n` +
      `Loan ID: ${payment.loanId}\n` +
      loanExtra +
      `Amount Paid: ${formatINR(payment.amountPaise)}\n` +
      `Payment Mode: ${payment.paymentMethod.toUpperCase()}\n` +
      (payment.referenceNumber ? `Ref: ${payment.referenceNumber}\n` : '') +
      `Previous Balance: ${formatINR(payment.previousOutstandingPaise)}\n` +
      `*Remaining Balance: ${formatINR(payment.newOutstandingPaise)}*\n` +
      `Collected By: ${payment.collectedBy}\n\n` +
      `Thank you for your timely payment!`
    );
    const cleanPhone = payment.borrowerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleDownload = () => {
    const loanExtra = isUpfront && loan
      ? `Lending Model: UPFRONT DEDUCTION\n` +
        `Sanctioned Face Value: ${formatINR(loan.sanctionedAmountPaise || loan.principalPaise)}\n` +
        `Net Cash Disbursed:    ${formatINR(loan.netDisbursedPaise ?? (loan.principalPaise - (loan.upfrontDeductionPaise || 0)))}\n` +
        `Total Repayable:       ${formatINR(loan.totalPayablePaise)}\n`
      : '';

    const receiptText =
      `====================================================\n` +
      `         ${settings.businessName.toUpperCase()}\n` +
      `   ${settings.address}\n` +
      `   Contact: ${settings.contactNumber}\n` +
      `====================================================\n` +
      `OFFICIAL COLLECTION RECEIPT\n` +
      `Receipt No:     ${payment.receiptNumber}\n` +
      `Payment Date:   ${payment.paymentDate}\n` +
      `Status:         ${payment.status.toUpperCase()}\n` +
      `----------------------------------------------------\n` +
      `Borrower Name:  ${payment.borrowerName}\n` +
      `Borrower ID:    ${payment.borrowerId}\n` +
      `Borrower Phone: ${payment.borrowerPhone}\n` +
      `Loan Account:   ${payment.loanId}\n` +
      loanExtra +
      `----------------------------------------------------\n` +
      `AMOUNT RECEIVED: ${formatINR(payment.amountPaise)}\n` +
      `Payment Mode:    ${payment.paymentMethod.toUpperCase()}\n` +
      (payment.referenceNumber ? `Reference:       ${payment.referenceNumber}\n` : '') +
      `----------------------------------------------------\n` +
      `Previous Outstanding: ${formatINR(payment.previousOutstandingPaise)}\n` +
      `New Outstanding:      ${formatINR(payment.newOutstandingPaise)}\n` +
      `----------------------------------------------------\n` +
      `Collected By:   ${payment.collectedBy}\n` +
      (payment.notes ? `Notes:          ${payment.notes}\n` : '') +
      `====================================================\n` +
      `This is a computer-generated immutable financial receipt.\n`;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${payment.receiptNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Top Actions */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Payment Voucher
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Voucher Body */}
        <div className="flex-1 overflow-y-auto p-5" id="printable-receipt">
          {/* Paper Voucher Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            {isReversed && (
              <div className="absolute top-4 -right-12 bg-rose-600 text-white font-black text-[10px] uppercase py-1 px-12 rotate-45 shadow">
                REVERSED
              </div>
            )}

            {/* Header info */}
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                {settings.businessName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {settings.address}
              </p>
              <p className="text-[10px] text-slate-400">Contact: {settings.contactNumber}</p>
            </div>

            {/* Receipt Number & Date */}
            <div className="py-3 flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Receipt Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {payment.receiptNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Date & Time</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {payment.paymentDate}
                </span>
              </div>
            </div>

            {/* Borrower Details */}
            <div className="py-3 text-xs space-y-1.5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Borrower:</span>
                <span className="font-bold text-slate-900 dark:text-white">{payment.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Borrower ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{payment.borrowerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loan Account:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{payment.loanId}</span>
              </div>
            </div>

            {/* Upfront Deduction Loan Info */}
            {isUpfront && loan && (
              <div className="py-2 px-3 my-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-bold uppercase text-[9px]">
                  <span>Upfront Deduction Loan</span>
                  <span>Face Value Repayment</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Sanctioned</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs tabular-nums">
                      {formatINR(loan.sanctionedAmountPaise || loan.principalPaise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-semibold">Disbursed</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">
                      {formatINR(loan.netDisbursedPaise ?? (loan.principalPaise - (loan.upfrontDeductionPaise || 0)))}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Repayable</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs tabular-nums">
                      {formatINR(loan.totalPayablePaise)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Main Amount Box */}
            <div className="my-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                Amount Received
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                {formatINR(payment.amountPaise)}
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 uppercase mt-0.5">
                Paid via {payment.paymentMethod}
              </div>
            </div>

            {/* Balances summary */}
            <div className="py-2 text-xs space-y-1.5 border-t border-slate-200 dark:border-slate-700">
              {payment.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{payment.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Previous Outstanding:</span>
                <span className="tabular-nums text-slate-600 dark:text-slate-400">{formatINR(payment.previousOutstandingPaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>New Outstanding Balance:</span>
                <span className="tabular-nums text-rose-600 dark:text-rose-400">{formatINR(payment.newOutstandingPaise)}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-slate-500">
                <span>Collected By:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{payment.collectedBy}</span>
              </div>
            </div>

            {/* Security stamp */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable Ledger Entry · Cryptographically Recorded</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="min-h-[44px] rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownload}
            className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[44px] rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
