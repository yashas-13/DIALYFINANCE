import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  FilePlus,
  CreditCard,
  RotateCcw,
  Edit3,
  LogIn,
  Download,
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogViewProps {
  logs: AuditLogItem[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesEntity = l.entityId.toLowerCase().includes(q);
        const matchesDetails = l.details.toLowerCase().includes(q);
        const matchesAdmin = l.adminName.toLowerCase().includes(q);
        if (!matchesEntity && !matchesDetails && !matchesAdmin) return false;
      }
      if (eventFilter !== 'all' && l.event !== eventFilter) return false;
      return true;
    });
  }, [logs, searchQuery, eventFilter]);

  const getEventBadge = (event: AuditLogItem['event']) => {
    switch (event) {
      case 'payment_recorded':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Payment
          </span>
        );
      case 'payment_reversed':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            Reversal
          </span>
        );
      case 'loan_created':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Loan Disbursed
          </span>
        );
      case 'borrower_created':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Borrower
          </span>
        );
      case 'loan_edited':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            Loan Modified
          </span>
        );
      case 'login':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            Login
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            System
          </span>
        );
    }
  };

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Event', 'Admin', 'Entity ID', 'Details', 'Before State', 'After State'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.event,
      `"${l.adminName}"`,
      l.entityId,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.beforeState || '').replace(/"/g, '""')}"`,
      `"${(l.afterState || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Immutable Audit Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Permanent compliance trail of all disbursements, collections, reversals, and user sessions
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="h-11 px-3.5 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Trail</span>
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
          placeholder="Search by entity ID (e.g. BR-1001, RCP-26-0091) or detail..."
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
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'payment_recorded', label: 'Payments' },
          { id: 'payment_reversed', label: 'Reversals' },
          { id: 'loan_created', label: 'Loans Disbursed' },
          { id: 'borrower_created', label: 'Borrowers' },
          { id: 'loan_edited', label: 'Modifications' },
          { id: 'login', label: 'Logins' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setEventFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              eventFilter === f.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No audit records found matching your filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getEventBadge(log.event)}
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                    {log.entityId}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {log.adminName}
                  </span>
                  {log.ip && (
                    <span className="text-[10px] font-mono text-slate-400">({log.ip})</span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  {log.timestamp}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">
                {log.details}
              </p>

              {(log.beforeState || log.afterState) && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono space-y-1">
                  {log.beforeState && (
                    <div className="text-rose-600 dark:text-rose-400 truncate">
                      <span className="font-bold">Before:</span> {log.beforeState}
                    </div>
                  )}
                  {log.afterState && (
                    <div className="text-emerald-600 dark:text-emerald-400 truncate">
                      <span className="font-bold">After:</span> {log.afterState}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
