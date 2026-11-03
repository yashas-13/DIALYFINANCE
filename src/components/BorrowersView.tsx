import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import { Borrower, Loan } from '../types';
import { formatINR } from '../utils/finance';

interface BorrowersViewProps {
  borrowers: Borrower[];
  loans: Loan[];
  onSelectBorrower: (borrower: Borrower) => void;
  onAddBorrowerClick: () => void;
  onRecordPaymentClick: (borrowerId?: string) => void;
  onCreateLoanClick: (borrowerId?: string) => void;
}

export const BorrowersView: React.FC<BorrowersViewProps> = ({
  borrowers,
  loans,
  onSelectBorrower,
  onAddBorrowerClick,
  onRecordPaymentClick,
  onCreateLoanClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loanStatusFilter, setLoanStatusFilter] = useState<'all' | 'with_loan' | 'overdue' | 'no_loan'>('all');

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = b.fullName.toLowerCase().includes(query);
        const matchesPhone = b.mobile.includes(query) || (b.altMobile && b.altMobile.includes(query));
        const matchesId = b.borrowerId.toLowerCase().includes(query);
        const matchesArea = b.address.area.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesId && !matchesArea) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }

      // Loan status filter
      if (loanStatusFilter === 'with_loan' && b.currentOutstandingPaise <= 0) {
        return false;
      }
      if (loanStatusFilter === 'overdue' && b.overdueAmountPaise <= 0) {
        return false;
      }
      if (loanStatusFilter === 'no_loan' && b.currentOutstandingPaise > 0) {
        return false;
      }

      return true;
    });
  }, [borrowers, searchQuery, statusFilter, loanStatusFilter]);

  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = (e: React.MouseEvent, borrower: Borrower) => {
    e.stopPropagation();
    const cleanPhone = borrower.mobile.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${borrower.fullName}, this is from Apex Collection regarding your loan account (${borrower.borrowerId}). Current outstanding balance is ${formatINR(borrower.currentOutstandingPaise)}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Borrowers Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {borrowers.length} registered customers · {borrowers.filter((b) => b.status === 'active').length} active
          </p>
        </div>

        <button
          onClick={onAddBorrowerClick}
          className="h-11 px-3.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Borrower</span>
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
          placeholder="Search by name, phone, area, or ID (e.g. BR-1001)..."
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
        {/* Active / Inactive */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Loan state filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setLoanStatusFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              loanStatusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Loans
          </button>
          <button
            onClick={() => setLoanStatusFilter('with_loan')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              loanStatusFilter === 'with_loan'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            With Active Balance
          </button>
          <button
            onClick={() => setLoanStatusFilter('overdue')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              loanStatusFilter === 'overdue'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Overdue Only
          </button>
        </div>
      </div>

      {/* Borrower Cards List */}
      <div className="space-y-2.5">
        {filteredBorrowers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <UserX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">No borrowers found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? `No matching records for "${searchQuery}". Try a different keyword.`
                : 'No borrower records match the active filters.'}
            </p>
            <button
              onClick={onAddBorrowerClick}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Add New Borrower
            </button>
          </div>
        ) : (
          filteredBorrowers.map((borrower) => {
            const hasOverdue = borrower.overdueAmountPaise > 0;
            const hasActiveBalance = borrower.currentOutstandingPaise > 0;

            return (
              <div
                key={borrower.id}
                onClick={() => onSelectBorrower(borrower)}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer min-h-[72px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {borrower.fullName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/70 px-1.5 py-0.5 rounded">
                        {borrower.borrowerId}
                      </span>
                      {hasOverdue && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-1.5 py-0.5 rounded">
                          Overdue {formatINR(borrower.overdueAmountPaise)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{borrower.mobile}</span>
                      <span>·</span>
                      <span className="truncate">{borrower.address.area}, {borrower.address.city}</span>
                      {borrower.occupation && (
                        <>
                          <span>·</span>
                          <span className="truncate hidden sm:inline">{borrower.occupation}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right balance & chevron */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-tight font-medium">
                        Outstanding
                      </div>
                      <div
                        className={`font-extrabold text-sm sm:text-base tabular-nums ${
                          hasOverdue
                            ? 'text-rose-600 dark:text-rose-400'
                            : hasActiveBalance
                            ? 'text-slate-900 dark:text-white'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatINR(borrower.currentOutstandingPaise)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {borrower.activeLoansCount > 0
                          ? `${borrower.activeLoansCount} active loan${borrower.activeLoansCount > 1 ? 's' : ''}`
                          : 'No active loans'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Bottom Quick Row Actions (Large hitboxes for one-handed operation) */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCall(e, borrower.mobile)}
                      className="min-h-[44px] px-3 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      aria-label={`Call ${borrower.fullName}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={(e) => handleWhatsApp(e, borrower)}
                      className="min-h-[44px] px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      aria-label={`WhatsApp ${borrower.fullName}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasActiveBalance ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordPaymentClick(borrower.id);
                        }}
                        className="min-h-[44px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateLoanClick(borrower.id);
                        }}
                        className="min-h-[44px] px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>New Loan</span>
                      </button>
                    )}
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
