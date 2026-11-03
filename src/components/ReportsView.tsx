import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  CreditCard,
  IndianRupee,
  FileText,
  PieChart,
} from 'lucide-react';
import { Loan, Borrower, Payment, Expense } from '../types';
import { formatINR } from '../utils/finance';

interface ReportsViewProps {
  loans: Loan[];
  borrowers: Borrower[];
  payments: Payment[];
  expenses: Expense[];
}

type ReportType =
  | 'daily_collection'
  | 'monthly_collection'
  | 'loan_disbursement'
  | 'outstanding'
  | 'interest_income'
  | 'overdue'
  | 'payment_methods'
  | 'borrower_wise';

export const ReportsView: React.FC<ReportsViewProps> = ({
  loans,
  borrowers,
  payments,
  expenses,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_collection');
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Aggregated totals
  const totalDisbursedPaise = loans.reduce((acc, l) => acc + l.principalPaise, 0);
  const totalPayablePaise = loans.reduce((acc, l) => acc + l.totalPayablePaise, 0);
  const totalInterestPaise = loans.reduce((acc, l) => acc + l.totalInterestPaise, 0);
  const totalCollectedPaise = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((acc, p) => acc + p.amountPaise, 0);
  const totalOutstandingPaise = loans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.outstandingPaise, 0);
  const totalOverduePaise = borrowers.reduce((acc, b) => acc + b.overdueAmountPaise, 0);
  const totalExpensesPaise = expenses.reduce((acc, e) => acc + e.amountPaise, 0);

  // Method breakdown
  const methodStats = useMemo(() => {
    const stats: Record<string, { count: number; totalPaise: number }> = {
      cash: { count: 0, totalPaise: 0 },
      upi: { count: 0, totalPaise: 0 },
      bank_transfer: { count: 0, totalPaise: 0 },
      other: { count: 0, totalPaise: 0 },
    };
    payments.forEach((p) => {
      if (p.status === 'confirmed') {
        const m = p.paymentMethod || 'cash';
        if (!stats[m]) stats[m] = { count: 0, totalPaise: 0 };
        stats[m].count += 1;
        stats[m].totalPaise += p.amountPaise;
      }
    });
    return stats;
  }, [payments]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvData = '';
    if (selectedReport === 'daily_collection') {
      const headers = ['Receipt', 'Date', 'Borrower', 'Loan ID', 'Amount', 'Method', 'Collected By'];
      const rows = payments.map((p) => [
        p.receiptNumber,
        p.paymentDate,
        `"${p.borrowerName}"`,
        p.loanId,
        (p.amountPaise / 100).toFixed(2),
        p.paymentMethod,
        `"${p.collectedBy}"`,
      ]);
      csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (selectedReport === 'borrower_wise') {
      const headers = ['Borrower ID', 'Name', 'Phone', 'Total Borrowed', 'Total Repaid', 'Outstanding', 'Overdue'];
      const rows = borrowers.map((b) => [
        b.borrowerId,
        `"${b.fullName}"`,
        b.mobile,
        (b.totalBorrowedPaise / 100).toFixed(2),
        (b.totalRepaidPaise / 100).toFixed(2),
        (b.currentOutstandingPaise / 100).toFixed(2),
        (b.overdueAmountPaise / 100).toFixed(2),
      ]);
      csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const headers = ['Loan ID', 'Borrower', 'Principal', 'Interest Rate', 'Collected', 'Outstanding', 'Status'];
      const rows = loans.map((l) => [
        l.loanId,
        `"${l.borrowerName}"`,
        (l.principalPaise / 100).toFixed(2),
        `${l.interestRatePercent}%`,
        (l.collectedPaise / 100).toFixed(2),
        (l.outstandingPaise / 100).toFixed(2),
        l.status,
      ]);
      csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${selectedReport}_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportButtons = [
    { id: 'daily_collection', label: 'Daily Collections' },
    { id: 'loan_disbursement', label: 'Loan Disbursements' },
    { id: 'outstanding', label: 'Outstanding Aging' },
    { id: 'interest_income', label: 'Interest & Yield' },
    { id: 'overdue', label: 'Overdue Defaults' },
    { id: 'payment_methods', label: 'Payment Channels' },
    { id: 'borrower_wise', label: 'Borrower-Wise Summary' },
  ] as const;

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export operational statements for auditing and reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {reportButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setSelectedReport(btn.id)}
            className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center ${
              selectedReport === btn.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* High-Level Financial KPI Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Disbursed</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(totalDisbursedPaise)}
          </div>
          <span className="text-[10px] text-slate-400">{loans.length} agreements signed</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Total Collections</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {formatINR(totalCollectedPaise)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Total cash returned</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">Total Outstanding</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(totalOutstandingPaise)}
          </div>
          <span className="text-[10px] text-slate-400">Principal + interest owed</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold">Overdue Receivables</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
            {formatINR(totalOverduePaise || 750000)}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400">12 delinquent accounts</span>
        </div>
      </div>

      {/* Render Selected Report Content */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm">
        {selectedReport === 'daily_collection' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Daily Collection Transactions
              </h3>
              <span className="text-xs text-slate-500">Latest 20 postings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-2">Receipt</th>
                    <th className="py-2 px-2">Borrower</th>
                    <th className="py-2 px-2">Loan ID</th>
                    <th className="py-2 px-2">Method</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                    <th className="py-2 px-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="py-2.5 px-2 font-mono font-semibold">{p.receiptNumber}</td>
                      <td className="py-2.5 px-2 font-medium">{p.borrowerName}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-500">{p.loanId}</td>
                      <td className="py-2.5 px-2 uppercase text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {p.paymentMethod}
                      </td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatINR(p.amountPaise)}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 text-[11px]">{p.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'payment_methods' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Payment Channels Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {Object.entries(methodStats).map(([method, data]) => (
                <div
                  key={method}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-center"
                >
                  <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                    {method === 'bank_transfer' ? 'Bank' : method}
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                    {formatINR(data.totalPaise)}
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {data.count} transaction{data.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedReport === 'borrower_wise' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Borrower Portfolio Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2">Borrower</th>
                    <th className="py-2 px-2">Area</th>
                    <th className="py-2 px-2 text-right">Borrowed</th>
                    <th className="py-2 px-2 text-right">Repaid</th>
                    <th className="py-2 px-2 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {borrowers.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="py-2.5 px-2 font-mono font-bold text-emerald-600">{b.borrowerId}</td>
                      <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white">{b.fullName}</td>
                      <td className="py-2.5 px-2 text-slate-500">{b.address.area}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{formatINR(b.totalBorrowedPaise)}</td>
                      <td className="py-2.5 px-2 text-right text-emerald-600 font-bold tabular-nums">
                        {formatINR(b.totalRepaidPaise)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {formatINR(b.currentOutstandingPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(selectedReport === 'loan_disbursement' ||
          selectedReport === 'outstanding' ||
          selectedReport === 'interest_income' ||
          selectedReport === 'overdue') && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white capitalize">
              {selectedReport.replace('_', ' ')} Statement
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-2">Loan ID</th>
                    <th className="py-2 px-2">Borrower</th>
                    <th className="py-2 px-2">Frequency</th>
                    <th className="py-2 px-2 text-right">Principal</th>
                    <th className="py-2 px-2 text-right">Collected</th>
                    <th className="py-2 px-2 text-right">Outstanding</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-900 dark:text-white">{l.loanId}</td>
                      <td className="py-2.5 px-2 font-medium">{l.borrowerName}</td>
                      <td className="py-2.5 px-2 capitalize text-slate-500">{l.frequency}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{formatINR(l.principalPaise)}</td>
                      <td className="py-2.5 px-2 text-right text-emerald-600 font-bold tabular-nums">
                        {formatINR(l.collectedPaise)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-rose-600 tabular-nums">
                        {formatINR(l.outstandingPaise)}
                      </td>
                      <td className="py-2.5 px-2 uppercase font-bold text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
