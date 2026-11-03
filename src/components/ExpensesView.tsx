import React, { useState, useMemo } from 'react';
import {
  Plus,
  Receipt,
  Car,
  UserCheck,
  Building,
  MoreHorizontal,
  Calendar,
  X,
  Check,
  CreditCard,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { formatINR, rupeesToPaise } from '../utils/finance';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expenseData: any) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('transport');
  const [description, setDescription] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'all') return expenses;
    return expenses.filter((e) => e.category === categoryFilter);
  }, [expenses, categoryFilter]);

  const totalExpensePaise = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amountPaise, 0);
  }, [filteredExpenses]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = rupeesToPaise(amountRupees);
    if (!description.trim() || paise <= 0) return;

    onAddExpense({
      category,
      description: description.trim(),
      amountPaise: paise,
      expenseDate,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setDescription('');
    setAmountRupees('');
    setReferenceNumber('');
    setNotes('');
  };

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'transport':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'staff_salary':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'office_expenses':
        return <Building className="w-4 h-4 text-blue-500" />;
      default:
        return <MoreHorizontal className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Expenses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track daily field fuel, transit, office stationery, and operator disbursements
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-3.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Expenses</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(totalExpensePaise)}
          </div>
          <span className="text-[10px] text-slate-400">{filteredExpenses.length} entries</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <span className="text-[10px] text-amber-500 uppercase font-semibold">Transport / Fuel</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(expenses.filter((e) => e.category === 'transport').reduce((a, b) => a + b.amountPaise, 0))}
          </div>
          <span className="text-[10px] text-slate-400">Field travel</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <span className="text-[10px] text-blue-500 uppercase font-semibold">Office Supplies</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(expenses.filter((e) => e.category === 'office_expenses').reduce((a, b) => a + b.amountPaise, 0))}
          </div>
          <span className="text-[10px] text-slate-400">Stationery & books</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <span className="text-[10px] text-emerald-500 uppercase font-semibold">Operator Salaries</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatINR(expenses.filter((e) => e.category === 'staff_salary').reduce((a, b) => a + b.amountPaise, 0))}
          </div>
          <span className="text-[10px] text-slate-400">Staff allowances</span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Expenses' },
          { id: 'transport', label: 'Transport' },
          { id: 'office_expenses', label: 'Office' },
          { id: 'staff_salary', label: 'Salaries' },
          { id: 'other', label: 'Other' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setCategoryFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              categoryFilter === f.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">No expenses recorded</h3>
            <p className="text-xs text-slate-500 mt-1">Tap Add Expense to log field operational expenses.</p>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  {getCategoryIcon(exp.category)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {exp.description}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                      {exp.category.replace('_', ' ')}
                    </span>
                    <span>·</span>
                    <span>{exp.expenseDate}</span>
                    <span>·</span>
                    <span className="uppercase text-[10px] font-mono">{exp.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-black text-sm sm:text-base text-rose-600 dark:text-rose-400 tabular-nums">
                  -{formatINR(exp.amountPaise)}
                </div>
                {exp.referenceNumber && (
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                    {exp.referenceNumber}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Log Operational Expense</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold capitalize"
                >
                  <option value="transport">Transport / Fuel</option>
                  <option value="staff_salary">Staff Salary & Allowances</option>
                  <option value="office_expenses">Office Expenses & Stationery</option>
                  <option value="other">Other Operational Costs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Scooter petrol for Basavanagudi route"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="450"
                    required
                    min="1"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold tabular-nums focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['cash', 'upi', 'bank_transfer', 'other'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`h-9 rounded-lg text-xs font-bold uppercase transition-colors ${
                        paymentMethod === m
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      {m === 'bank_transfer' ? 'Bank' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference / Bill Number
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. Bill #84902 / UPI ref"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
