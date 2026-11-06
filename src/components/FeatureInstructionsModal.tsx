import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  Shield,
  Users,
  CreditCard,
  FileText,
  Clock,
  BarChart3,
  Radio,
  Receipt,
  Database,
  Info,
  Sparkles,
  ChevronRight,
  IndianRupee,
  Phone,
  MessageSquare,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from './BottomTabBar';

export type InstructionTopicId =
  | 'overview'
  | 'borrowers'
  | 'upfront_loans'
  | 'collections'
  | 'receipts'
  | 'overdue'
  | 'reports'
  | 'ios_push'
  | 'backup_security';

interface FeatureInstructionsModalProps {
  initialTopic?: InstructionTopicId;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCreateLoan?: () => void;
  onOpenAddBorrower?: () => void;
  onOpenRecordPayment?: () => void;
  onOpenIOSPush?: () => void;
}

interface TopicGuide {
  id: InstructionTopicId;
  title: string;
  badge: string;
  icon: React.ElementType;
  targetTab?: ActiveTab;
  actionText?: string;
  actionType?: 'tab' | 'create_loan' | 'add_borrower' | 'record_payment' | 'ios_push';
  summary: string;
  keySteps: { title: string; desc: string }[];
  highlightBox?: {
    title: string;
    content: string;
    formula?: string;
  };
  tips: string[];
}

const TOPIC_GUIDES: TopicGuide[] = [
  {
    id: 'overview',
    title: 'Daily Operational Workflow',
    badge: 'Core Daily Routine',
    icon: BookOpen,
    targetTab: 'dashboard',
    actionText: 'Go to Dashboard',
    actionType: 'tab',
    summary:
      'The Daily Collection system coordinates loan disbursements, field collections, cash reconciliations, and overdue follow-ups in 4 structured phases each business day.',
    keySteps: [
      {
        title: 'Phase 1: Morning Route & Target Briefing',
        desc: 'Review the Dashboard daily target, overdue notifications, and today scheduled borrower installments before heading into the field.',
      },
      {
        title: 'Phase 2: Customer Visits & Real-time Receipts',
        desc: 'Visit shops and residences. Open the Daily Collection terminal, search the borrower, record cash or UPI payment, and instantly share the digital receipt via WhatsApp.',
      },
      {
        title: 'Phase 3: New Customer KYC & Loan Sanctions',
        desc: 'Register verified borrowers with door/shop addresses. Calculate repayment schedules using either the Upfront Deduction or Flat/Reducing balance lending models.',
      },
      {
        title: 'Phase 4: Evening Cash Reconciliation & Backup',
        desc: 'Record operational travel and tea expenses, check total physical cash collected against reports, and export an encrypted JSON snapshot in Settings.',
      },
    ],
    highlightBox: {
      title: 'Field Agent Golden Rule',
      content:
        'Never accept cash without immediately generating a receipt voucher. Receipts are assigned immutable numbers (e.g. RCP-26-0101) to protect you and the borrower.',
    },
    tips: [
      'Use the top-right search icon anytime to find a borrower in seconds by phone or ID.',
      'All touch targets are sized at least 44px to allow seamless one-handed operation on scooters or while holding cash clipboards.',
      'The app works offline and caches locally in browser encrypted storage.',
    ],
  },
  {
    id: 'upfront_loans',
    title: 'Upfront Deduction Loans',
    badge: 'Discounting Model',
    icon: CreditCard,
    actionText: 'Create New Loan',
    actionType: 'create_loan',
    summary:
      'The Upfront Deduction loan model allows you to deduct interest and processing charges upfront at disbursement while collecting the full sanctioned principal in regular installments.',
    keySteps: [
      {
        title: 'Step 1: Open Loan Creation & Select Upfront Deduction',
        desc: 'Tap Create Loan. In Interest Type, select "Upfront Deduction (Disburse net cash, repay face value)".',
      },
      {
        title: 'Step 2: Enter Principal & Interest Rate',
        desc: 'Enter the Sanctioned Amount (e.g. ₹10,000) and interest rate (e.g. 20%). The system automatically calculates upfront interest as ₹2,000 and Net Disbursed Cash as ₹8,000.',
      },
      {
        title: 'Step 3: Choose Frequency & Installments',
        desc: 'Select repayment frequency (e.g. Weekly for 10 weeks or Daily for 100 days). For both Daily and Weekly loans, the 1st collection due date automatically starts on the NEXT DAY (tomorrow). Weekly loans then recur every 7 days on that same weekday.',
      },
      {
        title: 'Step 4: Verify Transparent Figures Before Disbursing',
        desc: 'The summary displays Sanctioned: ₹10,000, Upfront Deducted: ₹2,000, Net Cash Handed to Borrower: ₹8,000, and Total Repayable: ₹10,000. It also shows a clear sequence preview of Installment #1 (Next Day), #2, and Maturity.',
      },
    ],
    highlightBox: {
      title: 'Real-World Example Breakdown',
      content:
        'Sanctioned Principal = ₹10,000\nUpfront 20% Deducted = ₹2,000\nNet Cash Handed Over = ₹8,000\n1st Due Date = Tomorrow (Next Day)\nBorrower Repays = 10 weekly collections of ₹1,000 (Total ₹10,000)',
      formula: 'Net Disbursed = Sanctioned - Upfront Deduction | Installment #1 = Tomorrow (Next Day)',
    },
    tips: [
      'Next-Day Collection Rule: When a loan is disbursed today (Daily or Weekly), installment #1 is automatically due tomorrow (the next day). Weekly loans repeat every 7 days on that same weekday.',
      'Receipts and borrower profiles transparently show both the net cash handed over and the sanctioned face value.',
      'Borrowers can pay via UPI or Cash. Early prepayments automatically discount pending schedule entries.',
      'Standard Flat Interest and Reducing Balance models are also available in the same loan form.',
    ],
  },
  {
    id: 'borrowers',
    title: 'Borrowers & Customer KYC',
    badge: 'Customer Directory',
    icon: Users,
    targetTab: 'borrowers',
    actionText: 'Open Borrowers Directory',
    actionType: 'tab',
    summary:
      'Manage all customer records, residential and shop door numbers, trade occupations, guarantor references, and real-time loan statuses.',
    keySteps: [
      {
        title: 'Step 1: Registering a New Customer',
        desc: 'Tap "+ Add Borrower". Fill in full legal name, active mobile number, alternate mobile, and physical shop/door address with PIN code.',
      },
      {
        title: 'Step 2: Business & Reference Verification',
        desc: 'Record customer occupation (e.g. Wholesale Vegetable Vendor, Boutique Tailor) and emergency reference name + mobile for recovery contact.',
      },
      {
        title: 'Step 3: Instant Communication Actions',
        desc: 'Inside any borrower profile, tap the Call button to dial directly, or tap WhatsApp to launch a pre-composed status or payment message.',
      },
      {
        title: 'Step 4: Comprehensive Ledger History',
        desc: 'View active contracts, total amount ever borrowed, cumulative repayments, current outstanding balance, and overdue arrears.',
      },
    ],
    highlightBox: {
      title: 'Customer Unique Identifier',
      content:
        'Every customer is automatically assigned an alphanumeric ID (e.g. BR-1001, BR-1002). You can search by name, phone number, or ID in any search bar.',
    },
    tips: [
      'Always note prominent local landmarks in the Address area to speed up field collection rounds.',
      'Borrowers with 0 outstanding balance can be deactivated or sanctioned a fresh loan with one tap.',
    ],
  },
  {
    id: 'collections',
    title: 'Daily Collection Terminal',
    badge: 'Field Operator Hub',
    icon: IndianRupee,
    targetTab: 'collections',
    actionText: 'Open Collection Terminal',
    actionType: 'tab',
    summary:
      'The high-speed daily terminal designed for field agents on the ground. View expected installments, search customers, and record payments in under 5 seconds.',
    keySteps: [
      {
        title: 'Step 1: Select Collection Date',
        desc: 'By default, today is selected. You can pick any date to inspect scheduled installments or review previous collection rounds.',
      },
      {
        title: 'Step 2: Track Expected vs Collected Bar',
        desc: 'Monitor the top real-time progress card showing Total Expected, Total Collected Today, and Pending Amount remaining on your route.',
      },
      {
        title: 'Step 3: Fast Search & Status Filters',
        desc: 'Filter by Due, Paid, Partial, or Overdue. Type any shopkeeper name or mobile number to instantly narrow down the list.',
      },
      {
        title: 'Step 4: One-Tap Collection Drawer',
        desc: 'Tap "Collect Payment" on any borrower card. The drawer pre-fills due installment, current balance, and receipt number.',
      },
    ],
    highlightBox: {
      title: 'Zero Floating-Point Ledger',
      content:
        'Every rupee and paisa is computed in integer units (Paise). This guarantees zero rounding discrepancies between your physical cash and the digital ledger.',
    },
    tips: [
      'If a borrower cannot pay the full installment, enter the partial amount received. The system automatically recalculates the remaining balance and schedule.',
      'Advances are supported: if a borrower pays extra, it applies directly against upcoming installment dues.',
    ],
  },
  {
    id: 'receipts',
    title: 'Payment Receipts & Vouchers',
    badge: 'Audit & Proof',
    icon: Receipt,
    targetTab: 'collections',
    actionText: 'View Payments & Receipts',
    actionType: 'tab',
    summary:
      'Generate verifiable payment vouchers with auto-sequenced receipt numbers, print them, download them as PDF, or share them via WhatsApp.',
    keySteps: [
      {
        title: 'Step 1: Automatic Receipt Generation',
        desc: 'Upon confirming any payment, the system creates an immutable voucher (e.g. RCP-26-0101) with date, timestamp, and collector name.',
      },
      {
        title: 'Step 2: Instant WhatsApp Share',
        desc: 'Tap "Share WhatsApp" to open WhatsApp with a clean, formatted receipt text including borrower name, amount received, and remaining loan balance.',
      },
      {
        title: 'Step 3: Printable Voucher',
        desc: 'Tap "Print / Save PDF" to generate a clean, thermal-printer friendly voucher formatted for field receipts.',
      },
      {
        title: 'Step 4: Dispute Resolution & Payment Reversal',
        desc: 'If an error was made in data entry, managers can reverse a payment with a required reason. Reversals log to the immutable audit trail.',
      },
    ],
    highlightBox: {
      title: 'Receipt Integrity',
      content:
        'Each receipt displays Previous Outstanding, Amount Received, and New Outstanding Balance so both parties have indisputable proof.',
    },
    tips: [
      'You can re-open any past receipt from the Dashboard "Recent Collections" or the Payment History tab in Reports.',
      'Receipt prefix can be customized (e.g. APX-2026) in Admin Settings.',
    ],
  },
  {
    id: 'overdue',
    title: 'Pending & Overdue Recovery',
    badge: 'Risk Control',
    icon: Clock,
    targetTab: 'pending',
    actionText: 'Open Pending & Overdue',
    actionType: 'tab',
    summary:
      'Track delinquent accounts, monitor days past due, and execute targeted WhatsApp follow-ups to keep the portfolio recovery rate above 95%.',
    keySteps: [
      {
        title: 'Step 1: Check Total Overdue Exposure',
        desc: 'The top KPI strip highlights Total Overdue Amount, Overdue Borrowers count, and Portfolio Recovery Rate percentage.',
      },
      {
        title: 'Step 2: Filter by Due Timeline',
        desc: 'Toggle between "Due Today", "Due Tomorrow", "This Week", or "All Overdue" to prioritize follow-up routes.',
      },
      {
        title: 'Step 3: Direct Customer Recovery Actions',
        desc: 'Each delinquent card provides a 1-tap WhatsApp prompt with a polite repayment reminder template, direct Call button, and Collect action.',
      },
      {
        title: 'Step 4: Borrower Overdue Badging',
        desc: 'Accounts with overdue installments display high-visibility badges across the entire app so field agents are always aware before extending new credit.',
      },
    ],
    highlightBox: {
      title: 'Portfolio Health Target',
      content:
        'Aim to keep recovery rate above 90%. Overdue balances over 7 days trigger priority notifications to the administrator.',
    },
    tips: [
      'Use the WhatsApp template for courteous reminder messages before making in-person recovery visits.',
      'Overdue accounts are automatically tracked in the iOS Push Notification system.',
    ],
  },
  {
    id: 'reports',
    title: 'Financial Reports & Cashflow',
    badge: 'Business Intelligence',
    icon: BarChart3,
    targetTab: 'reports',
    actionText: 'View Financial Reports',
    actionType: 'tab',
    summary:
      'Analyze cash inflow, principal dispatches, profit margins from upfront deductions and interest, operational expenditures, and net surplus.',
    keySteps: [
      {
        title: 'Step 1: Daily Collection Sheet',
        desc: 'Review breakdown of all collections by Cash, UPI, and Bank Transfer for any selected date range.',
      },
      {
        title: 'Step 2: Portfolio Exposure Metrics',
        desc: 'Track Total Principal Disbursed vs Total Principal Recovered and Active Outstanding Portfolio across all accounts.',
      },
      {
        title: 'Step 3: Net Cash Balance Calculation',
        desc: 'The system computes Net Cashflow = Total Inflow (Collections) minus Total Outflow (Disbursements + Operational Expenses).',
      },
      {
        title: 'Step 4: Printable Financial Summary',
        desc: 'Generate end-of-day summary reports suitable for management reporting and tax records.',
      },
    ],
    highlightBox: {
      title: 'Profit & Interest Tracking',
      content:
        'Upfront deduction fees and interest are separated from principal recoveries to give you an accurate view of operational gross profit.',
    },
    tips: [
      'Log daily field expenses (fuel, tea, stationery) in the Operational Expenses tab to maintain true net cash settlement.',
      'Export full financial data to JSON anytime for external spreadsheet analysis.',
    ],
  },
  {
    id: 'ios_push',
    title: 'Apple iOS Push Notification System',
    badge: 'APNs & Web Push',
    icon: Radio,
    actionText: 'Launch Push Console',
    actionType: 'ios_push',
    summary:
      'The application features a real-time Apple iOS Web Push (APNs) and PWA system compliant with iOS 16.4+ standalone Home Screen specifications.',
    keySteps: [
      {
        title: 'Step 1: Add to iPhone Home Screen',
        desc: 'Open Safari on iOS 16.4+, tap the Share button (square with arrow), and select "Add to Home Screen".',
      },
      {
        title: 'Step 2: Launch App from Home Screen',
        desc: 'Launch DailyCollect from the Home Screen. This activates standalone mode, enabling Apple APNs push subscriptions.',
      },
      {
        title: 'Step 3: Enable Push Notifications',
        desc: 'Tap the "iOS Push" button in the top navigation bar. Tap "Enable Notifications" and grant permissions.',
      },
      {
        title: 'Step 4: Test Real-Time Alerts with Lock Screen Timers',
        desc: 'Use the 5-second or 10-second test buttons, lock your iPhone screen, and observe the lockscreen alert banner with Apple Tri-tone sound.',
      },
    ],
    highlightBox: {
      title: 'Built-in Audio Chime & In-App Simulator',
      content:
        'When testing on desktop or preview, the app synthesizes the authentic Apple Tri-tone chime (G5 -> B5 -> D6) via Web Audio and renders a dynamic island banner.',
    },
    tips: [
      '5 operational trigger presets are available: Overdue Account, Morning Collection, Payment Received, Upfront Deduction Loan, and Portfolio Risk.',
      'Tapping an iOS notification deep-links directly into the relevant collection or loan view.',
    ],
  },
  {
    id: 'backup_security',
    title: 'Data Backup, Security & Settings',
    badge: 'Enterprise Controls',
    icon: Database,
    targetTab: 'settings',
    actionText: 'Open Admin Settings',
    actionType: 'tab',
    summary:
      'Secure your business records with encrypted local backups, automated audit logging, customizable receipt prefixes, and demo data reset options.',
    keySteps: [
      {
        title: 'Step 1: Exporting Full Database Backup',
        desc: 'Navigate to Settings -> Data Management. Tap "Export Full JSON Backup" to download a complete snapshot of all customers, loans, and receipts.',
      },
      {
        title: 'Step 2: Restoring from JSON Backup',
        desc: 'Easily transfer your database to another tablet or smartphone by tapping "Restore Backup JSON" and picking your saved file.',
      },
      {
        title: 'Step 3: Immutable Security Audit Log',
        desc: 'Every login attempt, payment recording, and loan modification is permanently recorded with timestamp, operator name, and IP record.',
      },
      {
        title: 'Step 4: Clean Slate vs Sample Data Toggle',
        desc: 'Use the "Reset to Clean Slate" button to wipe all data for live business, or "Load Sample Demo Data" for training new agents.',
      },
    ],
    highlightBox: {
      title: 'Automated Local Sync',
      content:
        'All records persist in high-speed browser storage. Export a JSON backup once a week to safeguard against device loss or damage.',
    },
    tips: [
      'Default admin credentials are username "akash" and password "saanvi".',
      'The system locks out after 5 consecutive failed login attempts to protect against brute force.',
    ],
  },
];

export const FeatureInstructionsModal: React.FC<FeatureInstructionsModalProps> = ({
  initialTopic = 'overview',
  onClose,
  onNavigateTab,
  onOpenCreateLoan,
  onOpenAddBorrower,
  onOpenRecordPayment,
  onOpenIOSPush,
}) => {
  const [activeTopicId, setActiveTopicId] = useState<InstructionTopicId>(initialTopic);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter topics based on search
  const filteredTopics = TOPIC_GUIDES.filter((guide) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      guide.title.toLowerCase().includes(q) ||
      guide.summary.toLowerCase().includes(q) ||
      guide.badge.toLowerCase().includes(q) ||
      guide.keySteps.some((s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
    );
  });

  const activeGuide =
    TOPIC_GUIDES.find((g) => g.id === activeTopicId) ||
    filteredTopics[0] ||
    TOPIC_GUIDES[0];

  const handleExecuteAction = () => {
    onClose();
    if (activeGuide.actionType === 'create_loan' && onOpenCreateLoan) {
      onOpenCreateLoan();
    } else if (activeGuide.actionType === 'add_borrower' && onOpenAddBorrower) {
      onOpenAddBorrower();
    } else if (activeGuide.actionType === 'record_payment' && onOpenRecordPayment) {
      onOpenRecordPayment();
    } else if (activeGuide.actionType === 'ios_push' && onOpenIOSPush) {
      onOpenIOSPush();
    } else if (activeGuide.targetTab) {
      onNavigateTab(activeGuide.targetTab);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-modal-title"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="instructions-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  Feature Instructions & User Guide
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300/40">
                  Daily Collection v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step-by-step operational workflows, Upfront Deduction formulas, and field guides
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close user guide"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Topic Selector Bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search instructions (e.g., upfront deduction, receipts, overdue, push alerts)..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Main Content Split: Left topics list (desktop) + Right topic detail */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Navigation: Topics */}
          <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 overflow-x-auto md:overflow-y-auto p-2 sm:p-3 flex md:flex-col gap-1.5 scrollbar-thin">
            {filteredTopics.map((guide) => {
              const Icon = guide.icon;
              const isActive = guide.id === activeGuide.id;
              return (
                <button
                  key={guide.id}
                  onClick={() => setActiveTopicId(guide.id)}
                  className={`min-h-[48px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition-all shrink-0 md:shrink md:w-full ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate leading-tight">
                        {guide.title}
                      </span>
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {guide.badge}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 hidden md:block ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Topic Detail */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white dark:bg-slate-900">
            {/* Topic Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {activeGuide.badge}
                  </span>
                </div>

                {activeGuide.actionText && (
                  <button
                    onClick={handleExecuteAction}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>{activeGuide.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {activeGuide.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {activeGuide.summary}
              </p>
            </div>

            {/* Formula / Highlight Box if any */}
            {activeGuide.highlightBox && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{activeGuide.highlightBox.title}</span>
                </div>
                <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-emerald-100 bg-black/30 p-3 rounded-xl border border-emerald-500/20 leading-relaxed">
                  {activeGuide.highlightBox.content}
                </pre>
                {activeGuide.highlightBox.formula && (
                  <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-700/60">
                    <span className="text-slate-400">Formula:</span>{' '}
                    <code className="text-emerald-300 font-mono font-semibold">
                      {activeGuide.highlightBox.formula}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* Step-by-Step Walkthrough */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Step-by-Step Operator Guide
              </h4>
              <div className="space-y-3">
                {activeGuide.keySteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Field Pro Tips
              </h4>
              <ul className="space-y-2">
                {activeGuide.tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Logged in as </span>
            <strong className="text-slate-800 dark:text-slate-200">Akash (Super Admin)</strong>
            <span> · Credentials: </span>
            <code className="text-emerald-600 dark:text-emerald-400 font-mono">akash / saanvi</code>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExecuteAction}
              className="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{activeGuide.actionText || 'Try This Feature'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
