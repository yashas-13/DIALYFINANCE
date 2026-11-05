import React, { useState, useEffect } from 'react';
import { CollectionStorage } from './services/storage';
import {
  Borrower,
  Loan,
  Payment,
  Expense,
  NotificationItem,
  AuditLogItem,
  BusinessSettings,
  AdminUser,
} from './types';

// Components
import { TopNav } from './components/TopNav';
import { BottomTabBar, ActiveTab } from './components/BottomTabBar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { BorrowersView } from './components/BorrowersView';
import { AddEditBorrowerModal } from './components/AddEditBorrowerModal';
import { BorrowerDetailModal } from './components/BorrowerDetailModal';
import { LoansView } from './components/LoansView';
import { CreateLoanModal } from './components/CreateLoanModal';
import { LoanDetailModal } from './components/LoanDetailModal';
import { DailyCollectionView } from './components/DailyCollectionView';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { PendingOverdueView } from './components/PendingOverdueView';
import { ReportsView } from './components/ReportsView';
import { ExpensesView } from './components/ExpensesView';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminSettingsView } from './components/AdminSettingsView';
import { AuditLogView } from './components/AuditLogView';
import { IOSPushBanner } from './components/IOSPushBanner';
import { IOSPushNotificationModal } from './components/IOSPushNotificationModal';
import { PushService } from './services/pushService';
import { FeatureInstructionsModal, InstructionTopicId } from './components/FeatureInstructionsModal';

export default function App() {
  // Authentication state - Starts on Login screen requiring username 'akash' and password 'saanvi'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser>(CollectionStorage.getAdmin());
  const [showIOSPushModal, setShowIOSPushModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [instructionTopic, setInstructionTopic] = useState<InstructionTopicId>('overview');

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Main Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Database State
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(CollectionStorage.getSettings());

  // Modals & Drawers
  const [showAddBorrowerModal, setShowAddBorrowerModal] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  const [selectedBorrowerDetail, setSelectedBorrowerDetail] = useState<Borrower | null>(null);

  const [showCreateLoanModal, setShowCreateLoanModal] = useState(false);
  const [loanTargetBorrowerId, setLoanTargetBorrowerId] = useState<string | undefined>();
  const [selectedLoanDetail, setSelectedLoanDetail] = useState<Loan | null>(null);

  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [paymentTargetLoanId, setPaymentTargetLoanId] = useState<string | undefined>();
  const [paymentTargetBorrowerId, setPaymentTargetBorrowerId] = useState<string | undefined>();

  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Load from Storage
  const refreshData = () => {
    CollectionStorage.initialize();
    setBorrowers(CollectionStorage.getBorrowers());
    setLoans(CollectionStorage.getLoans());
    setPayments(CollectionStorage.getPayments());
    setExpenses(CollectionStorage.getExpenses());
    setNotifications(CollectionStorage.getNotifications());
    setAuditLogs(CollectionStorage.getAuditLogs());
    setSettings(CollectionStorage.getSettings());
    setAdminUser(CollectionStorage.getAdmin());
  };

  useEffect(() => {
    refreshData();
    // Register Service Worker for iOS PWA Web Push
    PushService.registerServiceWorker().catch(() => {});

    // Listen for custom event triggered by clicking in-app or system notification
    const handlePushNav = (e: any) => {
      const targetTab = e.detail?.tab;
      if (targetTab) {
        setActiveTab(targetTab as ActiveTab);
      }
    };
    window.addEventListener('daily_collect_notification_nav', handlePushNav);
    return () => {
      window.removeEventListener('daily_collect_notification_nav', handlePushNav);
    };
  }, []);

  // Sync details if underlying records update
  useEffect(() => {
    if (selectedBorrowerDetail) {
      const refreshed = borrowers.find((b) => b.id === selectedBorrowerDetail.id);
      if (refreshed) setSelectedBorrowerDetail(refreshed);
    }
    if (selectedLoanDetail) {
      const refreshed = loans.find((l) => l.id === selectedLoanDetail.id);
      if (refreshed) setSelectedLoanDetail(refreshed);
    }
  }, [borrowers, loans]);

  // Handlers
  const handleLoginSuccess = (admin: AdminUser) => {
    setAdminUser(admin);
    setIsAuthenticated(true);
    refreshData();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Add / Edit Borrower
  const handleSaveBorrower = (data: any) => {
    if (editingBorrower) {
      CollectionStorage.updateBorrower(editingBorrower.id, data, adminUser.name);
      setEditingBorrower(null);
    } else {
      CollectionStorage.addBorrower(data, adminUser.name);
      setShowAddBorrowerModal(false);
    }
    refreshData();
  };

  // Create Loan
  const handleSaveLoan = (loanData: any) => {
    const newLoan = CollectionStorage.createLoan(loanData, adminUser.name);
    setShowCreateLoanModal(false);
    setLoanTargetBorrowerId(undefined);
    refreshData();
    if (newLoan) {
      setSelectedLoanDetail(newLoan);
    }
  };

  // Edit Loan
  const handleEditLoan = (loanId: string, updates: any, reason: string) => {
    CollectionStorage.editLoan(loanId, updates, reason, adminUser.name);
    refreshData();
  };

  // Close Loan
  const handleCloseLoan = (loanId: string, reason: string) => {
    CollectionStorage.closeLoan(loanId, reason, adminUser.name);
    refreshData();
    setSelectedLoanDetail(null);
  };

  // Record Payment
  const handleSavePayment = (paymentData: any) => {
    const res = CollectionStorage.recordPayment(paymentData, adminUser.name);
    if ('error' in res) {
      alert(res.error);
      return;
    }
    setShowRecordPaymentModal(false);
    setPaymentTargetLoanId(undefined);
    setPaymentTargetBorrowerId(undefined);
    refreshData();
    setActiveReceipt(res.payment);
  };

  // Reverse Payment
  const handleReversePayment = (paymentId: string, reason: string) => {
    const success = CollectionStorage.reversePayment(paymentId, reason, adminUser.name);
    if (success) {
      refreshData();
    }
  };

  // Add Expense
  const handleAddExpense = (expenseData: any) => {
    CollectionStorage.addExpense(expenseData, adminUser.name);
    refreshData();
  };

  // Settings
  const handleUpdateSettings = (updates: Partial<BusinessSettings>) => {
    CollectionStorage.updateSettings(updates, adminUser.name);
    refreshData();
  };

  // Reset Demo
  const handleResetDemo = () => {
    CollectionStorage.resetToDemo();
    refreshData();
  };

  // Reset to Clean Slate (Clear all demo data)
  const handleResetToClean = () => {
    CollectionStorage.resetToClean();
    refreshData();
  };

  // Open Feature Guide
  const handleOpenInstructions = (topic: InstructionTopicId = 'overview') => {
    setInstructionTopic(topic);
    setShowInstructionsModal(true);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = CollectionStorage.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DailyCollection_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (jsonStr: string) => {
    const success = CollectionStorage.importDatabaseJSON(jsonStr);
    if (success) refreshData();
    return success;
  };

  // Unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;
  const overdueCount = borrowers.filter((b) => b.overdueAmountPaise > 0).length;

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} adminUser={adminUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sticky Mobile/Desktop Top App Bar */}
      <TopNav
        admin={adminUser}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenIOSPush={() => setShowIOSPushModal(true)}
        onOpenInstructions={() => handleOpenInstructions('overview')}
        title={
          activeTab === 'dashboard'
            ? 'Daily Collection'
            : activeTab === 'borrowers'
            ? 'Borrowers Directory'
            : activeTab === 'collections'
            ? 'Daily Collection'
            : activeTab === 'loans'
            ? 'Loan Management'
            : activeTab === 'reports'
            ? 'Financial Reports'
            : activeTab === 'pending'
            ? 'Pending Collections'
            : activeTab === 'expenses'
            ? 'Operational Expenses'
            : activeTab === 'audit'
            ? 'Security Audit Log'
            : 'Settings'
        }
      />

      {/* Main Content Area */}
      <main className="w-full">
        {activeTab === 'dashboard' && (
          <DashboardView
            admin={adminUser}
            borrowers={borrowers}
            loans={loans}
            payments={payments}
            onRecordPaymentClick={() => {
              setPaymentTargetLoanId(undefined);
              setPaymentTargetBorrowerId(undefined);
              setShowRecordPaymentModal(true);
            }}
            onAddBorrowerClick={() => setShowAddBorrowerModal(true)}
            onCreateLoanClick={() => {
              setLoanTargetBorrowerId(undefined);
              setShowCreateLoanModal(true);
            }}
            onViewReportsClick={() => setActiveTab('reports')}
            onViewOverdueClick={() => setActiveTab('pending')}
            onViewReceiptClick={(payment) => setActiveReceipt(payment)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenIOSPush={() => setShowIOSPushModal(true)}
            onOpenInstructions={(topic) => handleOpenInstructions(topic || 'overview')}
          />
        )}

        {activeTab === 'borrowers' && (
          <BorrowersView
            borrowers={borrowers}
            loans={loans}
            onSelectBorrower={(b) => setSelectedBorrowerDetail(b)}
            onAddBorrowerClick={() => setShowAddBorrowerModal(true)}
            onRecordPaymentClick={(borrowerId) => {
              setPaymentTargetBorrowerId(borrowerId);
              setShowRecordPaymentModal(true);
            }}
            onCreateLoanClick={(borrowerId) => {
              setLoanTargetBorrowerId(borrowerId);
              setShowCreateLoanModal(true);
            }}
          />
        )}

        {activeTab === 'collections' && (
          <DailyCollectionView
            borrowers={borrowers}
            loans={loans}
            payments={payments}
            onRecordPayment={(loanId, borrowerId) => {
              setPaymentTargetLoanId(loanId);
              setPaymentTargetBorrowerId(borrowerId);
              setShowRecordPaymentModal(true);
            }}
            onViewReceipt={(p) => setActiveReceipt(p)}
            onSelectBorrower={(b) => setSelectedBorrowerDetail(b)}
          />
        )}

        {activeTab === 'loans' && (
          <LoansView
            loans={loans}
            borrowers={borrowers}
            onSelectLoan={(loan) => setSelectedLoanDetail(loan)}
            onCreateLoanClick={() => {
              setLoanTargetBorrowerId(undefined);
              setShowCreateLoanModal(true);
            }}
            onRecordPaymentClick={(loanId, borrowerId) => {
              setPaymentTargetLoanId(loanId);
              setPaymentTargetBorrowerId(borrowerId);
              setShowRecordPaymentModal(true);
            }}
          />
        )}

        {activeTab === 'pending' && (
          <PendingOverdueView
            borrowers={borrowers}
            loans={loans}
            payments={payments}
            onRecordPayment={(loanId, borrowerId) => {
              setPaymentTargetLoanId(loanId);
              setPaymentTargetBorrowerId(borrowerId);
              setShowRecordPaymentModal(true);
            }}
            onSelectBorrower={(b) => setSelectedBorrowerDetail(b)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            loans={loans}
            borrowers={borrowers}
            payments={payments}
            expenses={expenses}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onAddExpense={handleAddExpense}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsView
            settings={settings}
            admin={adminUser}
            onUpdateSettings={handleUpdateSettings}
            onResetDemoData={handleResetDemo}
            onResetToClean={handleResetToClean}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenIOSPush={() => setShowIOSPushModal(true)}
            onOpenInstructions={() => handleOpenInstructions('backup_security')}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView logs={auditLogs} />
        )}
      </main>

      {/* Fixed Bottom Tab Bar (Navigation Anchor) */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        overdueCount={overdueCount}
      />

      {/* MODALS */}
      {/* Add / Edit Borrower Modal */}
      {(showAddBorrowerModal || editingBorrower) && (
        <AddEditBorrowerModal
          borrower={editingBorrower}
          onClose={() => {
            setShowAddBorrowerModal(false);
            setEditingBorrower(null);
          }}
          onSave={handleSaveBorrower}
          nextId={`BR-${borrowers.length + 1001}`}
        />
      )}

      {/* Borrower Detail Modal */}
      {selectedBorrowerDetail && (
        <BorrowerDetailModal
          borrower={selectedBorrowerDetail}
          loans={loans}
          payments={payments}
          auditLogs={auditLogs}
          onClose={() => setSelectedBorrowerDetail(null)}
          onEditBorrower={(b) => {
            setEditingBorrower(b);
          }}
          onRecordPayment={(borrowerId, loanId) => {
            setPaymentTargetBorrowerId(borrowerId);
            setPaymentTargetLoanId(loanId);
            setShowRecordPaymentModal(true);
          }}
          onCreateLoan={(borrowerId) => {
            setLoanTargetBorrowerId(borrowerId);
            setShowCreateLoanModal(true);
          }}
          onViewReceipt={(payment) => setActiveReceipt(payment)}
          onViewLoanDetail={(loan) => setSelectedLoanDetail(loan)}
        />
      )}

      {/* Create Loan Modal */}
      {showCreateLoanModal && (
        <CreateLoanModal
          borrowers={borrowers.filter((b) => b.status === 'active')}
          initialBorrowerId={loanTargetBorrowerId}
          onClose={() => {
            setShowCreateLoanModal(false);
            setLoanTargetBorrowerId(undefined);
          }}
          onSave={handleSaveLoan}
          nextLoanId={`LN-${new Date().getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`}
        />
      )}

      {/* Loan Detail Modal */}
      {selectedLoanDetail && (
        <LoanDetailModal
          loan={selectedLoanDetail}
          borrower={borrowers.find((b) => b.id === selectedLoanDetail.borrowerId)}
          payments={payments}
          onClose={() => setSelectedLoanDetail(null)}
          onRecordPayment={(loanId, borrowerId) => {
            setPaymentTargetLoanId(loanId);
            setPaymentTargetBorrowerId(borrowerId);
            setShowRecordPaymentModal(true);
          }}
          onEditLoan={handleEditLoan}
          onCloseLoan={handleCloseLoan}
          onViewReceipt={(p) => setActiveReceipt(p)}
        />
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && (
        <RecordPaymentModal
          borrowers={borrowers}
          loans={loans}
          initialLoanId={paymentTargetLoanId}
          initialBorrowerId={paymentTargetBorrowerId}
          admin={adminUser}
          onClose={() => {
            setShowRecordPaymentModal(false);
            setPaymentTargetLoanId(undefined);
            setPaymentTargetBorrowerId(undefined);
          }}
          onSavePayment={handleSavePayment}
          nextReceiptNumber={`${settings.receiptPrefix || 'RCP-26'}-${String(
            payments.length + 101
          ).padStart(4, '0')}`}
        />
      )}

      {/* Payment Receipt Voucher Modal */}
      {activeReceipt && (
        <PaymentReceiptModal
          payment={activeReceipt}
          settings={settings}
          onClose={() => setActiveReceipt(null)}
          onViewLoan={(loanId) => {
            const l = loans.find((item) => item.id === loanId);
            if (l) setSelectedLoanDetail(l);
          }}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onMarkRead={(id) => {
            CollectionStorage.markNotificationRead(id);
            refreshData();
          }}
          onMarkAllRead={() => {
            CollectionStorage.markAllNotificationsRead();
            refreshData();
          }}
          onNavigateItem={(tab, id) => {
            setActiveTab(tab as any);
            if (id && tab === 'borrowers') {
              const b = borrowers.find((item) => item.id === id);
              if (b) setSelectedBorrowerDetail(b);
            }
          }}
        />
      )}

      {/* iOS Apple Push Banner Simulator (for instant desktop/browser audio & visual verification) */}
      <IOSPushBanner onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)} />

      {/* iOS Push Notification Control Center & Trigger Modal */}
      {showIOSPushModal && (
        <IOSPushNotificationModal
          onClose={() => setShowIOSPushModal(false)}
          onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
        />
      )}

      {/* Feature Instructions & User Guide Modal */}
      {showInstructionsModal && (
        <FeatureInstructionsModal
          initialTopic={instructionTopic}
          onClose={() => setShowInstructionsModal(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenCreateLoan={() => {
            setLoanTargetBorrowerId(undefined);
            setShowCreateLoanModal(true);
          }}
          onOpenAddBorrower={() => setShowAddBorrowerModal(true)}
          onOpenRecordPayment={() => {
            setPaymentTargetLoanId(undefined);
            setPaymentTargetBorrowerId(undefined);
            setShowRecordPaymentModal(true);
          }}
          onOpenIOSPush={() => setShowIOSPushModal(true)}
        />
      )}
    </div>
  );
}
