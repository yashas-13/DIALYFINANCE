import {
  Borrower,
  Loan,
  InstallmentItem,
  Payment,
  Expense,
  NotificationItem,
  AuditLogItem,
  BusinessSettings,
  AdminUser,
} from '../types';
import { calculateLoan } from '../utils/finance';

const STORAGE_KEYS = {
  BORROWERS: 'dca_borrowers_v1',
  LOANS: 'dca_loans_v1',
  PAYMENTS: 'dca_payments_v1',
  EXPENSES: 'dca_expenses_v1',
  NOTIFICATIONS: 'dca_notifications_v1',
  AUDIT_LOGS: 'dca_audit_logs_v1',
  SETTINGS: 'dca_settings_v1',
  ADMIN: 'dca_admin_v1',
  INITIALIZED: 'dca_initialized_v1',
};

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Apex MicroCredit Collections',
  address: 'Shop 14, Commercial Complex, MG Road, Bengaluru, Karnataka 560001',
  contactNumber: '+91 98450 12345',
  defaultInterestRate: 14,
  defaultFrequency: 'daily',
  receiptPrefix: 'RCP-26',
  currencySymbol: '₹',
  financialYear: '2026-2027',
  sessionTimeoutMinutes: 30,
  lockAttemptsLimit: 5,
};

const DEFAULT_ADMIN: AdminUser = {
  id: 'adm_01',
  name: 'Rajesh Sharma',
  email: 'admin@apexcollection.in',
  username: 'admin',
  role: 'super_admin',
  status: 'active',
  lastLogin: new Date().toISOString(),
};

// Seed initial realistic data matching prompt targets:
// Today's collection: ₹18,500 | Total outstanding: ₹12,40,000 | Active borrowers: 125 | Active loans: 98 | Overdue: 12
function generateSeedData() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const seedBorrowers: Borrower[] = [
    {
      id: 'br_101',
      borrowerId: 'BR-1001',
      fullName: 'Ramesh Kumar Verma',
      mobile: '+91 98234 56789',
      altMobile: '+91 98234 56780',
      email: 'ramesh.verma@example.com',
      dob: '1984-06-15',
      address: {
        doorNo: '12-A',
        street: 'Gandhi Bazaar 2nd Cross',
        area: 'Basavanagudi',
        city: 'Bengaluru',
        pinCode: '560004',
      },
      occupation: 'Vegetable Wholesaler',
      monthlyIncomePaise: 4500000, // ₹45,000
      refName: 'Suresh Verma (Brother)',
      refMobile: '+91 98234 11223',
      notes: 'Punctual daily payer. Runs shop at market gate #2.',
      status: 'active',
      createdAt: '2026-08-10',
      totalBorrowedPaise: 5000000,
      totalRepaidPaise: 4200000,
      currentOutstandingPaise: 1100000, // ₹11,000
      overdueAmountPaise: 0,
      activeLoansCount: 1,
    },
    {
      id: 'br_102',
      borrowerId: 'BR-1002',
      fullName: 'Priya Sundaram',
      mobile: '+91 97412 88990',
      email: 'priya.tailors@example.com',
      address: {
        doorNo: '45/1',
        street: 'Temple Road',
        area: 'Malleswaram',
        city: 'Bengaluru',
        pinCode: '560003',
      },
      occupation: 'Boutique & Tailoring',
      monthlyIncomePaise: 3800000,
      refName: 'Kavitha S.',
      refMobile: '+91 97412 33445',
      notes: 'Good credit track record.',
      status: 'active',
      createdAt: '2026-09-01',
      totalBorrowedPaise: 3000000,
      totalRepaidPaise: 2850000,
      currentOutstandingPaise: 350000, // ₹3,500
      overdueAmountPaise: 0,
      activeLoansCount: 1,
    },
    {
      id: 'br_103',
      borrowerId: 'BR-1003',
      fullName: 'Mohammed Salim',
      mobile: '+91 99001 23456',
      address: {
        doorNo: '8',
        street: 'Mosque Lane',
        area: 'Shivajinagar',
        city: 'Bengaluru',
        pinCode: '560051',
      },
      occupation: 'Footwear Retailer',
      monthlyIncomePaise: 5500000,
      notes: 'Missed 3 days due to seasonal inventory purchase.',
      status: 'active',
      createdAt: '2026-07-15',
      totalBorrowedPaise: 8000000,
      totalRepaidPaise: 5200000,
      currentOutstandingPaise: 3400000, // ₹34,000
      overdueAmountPaise: 300000, // ₹3,000 (Overdue)
      activeLoansCount: 1,
    },
    {
      id: 'br_104',
      borrowerId: 'BR-1004',
      fullName: 'Lakshmi Devi',
      mobile: '+91 94480 67123',
      address: {
        doorNo: '72',
        street: 'Flower Market Street',
        area: 'KR Market',
        city: 'Bengaluru',
        pinCode: '560002',
      },
      occupation: 'Flower Vendor',
      monthlyIncomePaise: 3200000,
      notes: 'Daily morning collection at stall 4.',
      status: 'active',
      createdAt: '2026-09-12',
      totalBorrowedPaise: 2000000,
      totalRepaidPaise: 1600000,
      currentOutstandingPaise: 500000, // ₹5,000
      overdueAmountPaise: 0,
      activeLoansCount: 1,
    },
    {
      id: 'br_105',
      borrowerId: 'BR-1005',
      fullName: 'Rajesh Mohan Patel',
      mobile: '+91 98440 99887',
      address: {
        doorNo: '102',
        street: 'Station Road',
        area: 'Yeshwanthpur',
        city: 'Bengaluru',
        pinCode: '560022',
      },
      occupation: 'Kirana General Store',
      monthlyIncomePaise: 6000000,
      notes: 'Prefers UPI payment after 5 PM.',
      status: 'active',
      createdAt: '2026-06-01',
      totalBorrowedPaise: 10000000,
      totalRepaidPaise: 8800000,
      currentOutstandingPaise: 1800000, // ₹18,000
      overdueAmountPaise: 0,
      activeLoansCount: 1,
    },
    {
      id: 'br_106',
      borrowerId: 'BR-1006',
      fullName: 'Anitha Roy',
      mobile: '+91 98860 45678',
      address: {
        doorNo: '3B',
        street: 'Austin Town Main',
        area: 'Neelasandra',
        city: 'Bengaluru',
        pinCode: '560047',
      },
      occupation: 'Catering Service',
      monthlyIncomePaise: 4000000,
      notes: 'Overdue by 5 days. Reminded on Monday.',
      status: 'active',
      createdAt: '2026-08-20',
      totalBorrowedPaise: 4000000,
      totalRepaidPaise: 2200000,
      currentOutstandingPaise: 2100000, // ₹21,000
      overdueAmountPaise: 450000, // ₹4,500 (Overdue)
      activeLoansCount: 1,
    },
    {
      id: 'br_107',
      borrowerId: 'BR-1007',
      fullName: 'Venkatesh Prasad',
      mobile: '+91 96112 34987',
      address: {
        doorNo: '19',
        street: 'Old Post Office Lane',
        area: 'Rajajinagar',
        city: 'Bengaluru',
        pinCode: '560010',
      },
      occupation: 'Auto Spare Parts',
      monthlyIncomePaise: 5000000,
      status: 'active',
      createdAt: '2026-08-01',
      totalBorrowedPaise: 6000000,
      totalRepaidPaise: 4500000,
      currentOutstandingPaise: 1850000,
      overdueAmountPaise: 0,
      activeLoansCount: 1,
    },
  ];

  // Loans with installment schedules
  const seedLoans: Loan[] = [
    {
      id: 'ln_201',
      loanId: 'LN-2026-001',
      borrowerId: 'br_101',
      borrowerName: 'Ramesh Kumar Verma',
      borrowerPhone: '+91 98234 56789',
      principalPaise: 5000000, // ₹50,000
      interestType: 'flat',
      interestRatePercent: 12,
      frequency: 'daily',
      durationValue: 100, // 100 days
      installmentAmountPaise: 53000, // ₹530/day
      totalInstallments: 100,
      startDate: '2026-08-10',
      dueDate: '2026-11-18',
      firstInstallmentDate: '2026-08-11',
      collectionDay: 'All days',
      totalInterestPaise: 300000,
      totalPayablePaise: 5300000,
      collectedPaise: 4200000,
      outstandingPaise: 1100000,
      status: 'active',
      notes: 'Business expansion loan.',
      createdAt: '2026-08-10',
      installments: Array.from({ length: 10 }, (_, i) => ({
        id: `inst_201_${i + 1}`,
        loanId: 'ln_201',
        installmentNumber: i + 1,
        dueDate: todayStr,
        amountDuePaise: 53000,
        amountPaidPaise: i < 7 ? 53000 : 0,
        status: i < 7 ? 'paid' : ('pending' as const),
      })),
    },
    {
      id: 'ln_202',
      loanId: 'LN-2026-002',
      borrowerId: 'br_102',
      borrowerName: 'Priya Sundaram',
      borrowerPhone: '+91 97412 88990',
      principalPaise: 3000000, // ₹30,000
      interestType: 'flat',
      interestRatePercent: 10,
      frequency: 'daily',
      durationValue: 60,
      installmentAmountPaise: 55000, // ₹550/day
      totalInstallments: 60,
      startDate: '2026-09-01',
      dueDate: '2026-11-01',
      firstInstallmentDate: '2026-09-02',
      totalInterestPaise: 200000,
      totalPayablePaise: 3200000,
      collectedPaise: 2850000,
      outstandingPaise: 350000,
      status: 'active',
      notes: 'Sewing machine purchase.',
      createdAt: '2026-09-01',
      installments: [],
    },
    {
      id: 'ln_203',
      loanId: 'LN-2026-003',
      borrowerId: 'br_103',
      borrowerName: 'Mohammed Salim',
      borrowerPhone: '+91 99001 23456',
      principalPaise: 8000000, // ₹80,000
      interestType: 'flat',
      interestRatePercent: 15,
      frequency: 'daily',
      durationValue: 90,
      installmentAmountPaise: 100000, // ₹1,000/day
      totalInstallments: 90,
      startDate: '2026-07-15',
      dueDate: '2026-10-15',
      firstInstallmentDate: '2026-07-16',
      totalInterestPaise: 600000,
      totalPayablePaise: 8600000,
      collectedPaise: 5200000,
      outstandingPaise: 3400000,
      status: 'active',
      notes: 'Festival inventory credit.',
      createdAt: '2026-07-15',
      installments: [],
    },
    {
      id: 'ln_204',
      loanId: 'LN-2026-004',
      borrowerId: 'br_104',
      borrowerName: 'Lakshmi Devi',
      borrowerPhone: '+91 94480 67123',
      principalPaise: 2000000,
      interestType: 'flat',
      interestRatePercent: 10,
      frequency: 'daily',
      durationValue: 50,
      installmentAmountPaise: 42000,
      totalInstallments: 50,
      startDate: '2026-09-12',
      dueDate: '2026-11-02',
      firstInstallmentDate: '2026-09-13',
      totalInterestPaise: 100000,
      totalPayablePaise: 2100000,
      collectedPaise: 1600000,
      outstandingPaise: 500000,
      status: 'active',
      createdAt: '2026-09-12',
      installments: [],
    },
    {
      id: 'ln_205',
      loanId: 'LN-2026-005',
      borrowerId: 'br_105',
      borrowerName: 'Rajesh Mohan Patel',
      borrowerPhone: '+91 98440 99887',
      principalPaise: 10000000,
      interestType: 'reducing',
      interestRatePercent: 14,
      frequency: 'weekly',
      durationValue: 20,
      installmentAmountPaise: 535000,
      totalInstallments: 20,
      startDate: '2026-06-01',
      dueDate: '2026-10-20',
      firstInstallmentDate: '2026-06-08',
      totalInterestPaise: 700000,
      totalPayablePaise: 10700000,
      collectedPaise: 8800000,
      outstandingPaise: 1900000,
      status: 'active',
      createdAt: '2026-06-01',
      installments: [],
    },
    {
      id: 'ln_206',
      loanId: 'LN-2026-006',
      borrowerId: 'br_106',
      borrowerName: 'Anitha Roy',
      borrowerPhone: '+91 98860 45678',
      principalPaise: 4000000,
      interestType: 'flat',
      interestRatePercent: 12,
      frequency: 'daily',
      durationValue: 60,
      installmentAmountPaise: 72000,
      totalInstallments: 60,
      startDate: '2026-08-20',
      dueDate: '2026-10-20',
      firstInstallmentDate: '2026-08-21',
      totalInterestPaise: 320000,
      totalPayablePaise: 4320000,
      collectedPaise: 2200000,
      outstandingPaise: 2120000,
      status: 'active',
      createdAt: '2026-08-20',
      installments: [],
    },
  ];

  // Seed payments including today's ₹18,500 total!
  const seedPayments: Payment[] = [
    {
      id: 'pay_301',
      receiptNumber: 'RCP-26-0091',
      loanId: 'ln_201',
      borrowerId: 'br_101',
      borrowerName: 'Ramesh Kumar Verma',
      borrowerPhone: '+91 98234 56789',
      amountPaise: 500000, // ₹5,000
      paymentMethod: 'cash',
      paymentDate: `${todayStr} 09:15`,
      collectedBy: 'Rajesh Sharma',
      previousOutstandingPaise: 1600000,
      newOutstandingPaise: 1100000,
      status: 'confirmed',
      notes: 'Morning collection at shop.',
      createdAt: `${todayStr}T09:15:00Z`,
    },
    {
      id: 'pay_302',
      receiptNumber: 'RCP-26-0092',
      loanId: 'ln_202',
      borrowerId: 'br_102',
      borrowerName: 'Priya Sundaram',
      borrowerPhone: '+91 97412 88990',
      amountPaise: 350000, // ₹3,500
      paymentMethod: 'upi',
      referenceNumber: 'UPI/984210984129',
      paymentDate: `${todayStr} 10:30`,
      collectedBy: 'Rajesh Sharma',
      previousOutstandingPaise: 700000,
      newOutstandingPaise: 350000,
      status: 'confirmed',
      notes: 'Paid via GPay QR code.',
      createdAt: `${todayStr}T10:30:00Z`,
    },
    {
      id: 'pay_303',
      receiptNumber: 'RCP-26-0093',
      loanId: 'ln_204',
      borrowerId: 'br_104',
      borrowerName: 'Lakshmi Devi',
      borrowerPhone: '+91 94480 67123',
      amountPaise: 200000, // ₹2,000
      paymentMethod: 'cash',
      paymentDate: `${todayStr} 11:10`,
      collectedBy: 'Rajesh Sharma',
      previousOutstandingPaise: 700000,
      newOutstandingPaise: 500000,
      status: 'confirmed',
      notes: 'Direct cash handover at market.',
      createdAt: `${todayStr}T11:10:00Z`,
    },
    {
      id: 'pay_304',
      receiptNumber: 'RCP-26-0094',
      loanId: 'ln_205',
      borrowerId: 'br_105',
      borrowerName: 'Rajesh Mohan Patel',
      borrowerPhone: '+91 98440 99887',
      amountPaise: 800000, // ₹8,000
      paymentMethod: 'bank_transfer',
      referenceNumber: 'IMPS4928109923',
      paymentDate: `${todayStr} 11:45`,
      collectedBy: 'Rajesh Sharma',
      previousOutstandingPaise: 2700000,
      newOutstandingPaise: 1900000,
      status: 'confirmed',
      notes: 'Bank transfer confirmed.',
      createdAt: `${todayStr}T11:45:00Z`,
    },
  ]; // Sum = 5,000 + 3,500 + 2,000 + 8,000 = ₹18,500 exactly!

  // Seed expenses
  const seedExpenses: Expense[] = [
    {
      id: 'exp_401',
      category: 'transport',
      description: 'Fuel for field collection scooter',
      amountPaise: 45000, // ₹450
      expenseDate: todayStr,
      paymentMethod: 'cash',
      notes: 'HP Petrol Pump receipt attached.',
      createdAt: `${todayStr}T08:30:00Z`,
    },
    {
      id: 'exp_402',
      category: 'office_expenses',
      description: 'Receipt books & stationery',
      amountPaise: 65000, // ₹650
      expenseDate: todayStr,
      paymentMethod: 'upi',
      referenceNumber: 'UPI/78392109',
      notes: 'Sri Rama Stores',
      createdAt: `${todayStr}T09:00:00Z`,
    },
  ];

  // Seed notifications
  const seedNotifications: NotificationItem[] = [
    {
      id: 'notif_501',
      type: 'overdue',
      title: 'Overdue Installment Alert',
      message: 'Mohammed Salim (BR-1003) is 3 days overdue for ₹3,000.',
      read: false,
      timestamp: `${todayStr} 08:00`,
      linkTab: 'pending',
      linkId: 'br_103',
    },
    {
      id: 'notif_502',
      type: 'upcoming_installment',
      title: 'Today Collection Target',
      message: '5 installments scheduled for today totaling ₹24,000.',
      read: false,
      timestamp: `${todayStr} 07:30`,
      linkTab: 'collections',
    },
    {
      id: 'notif_503',
      type: 'payment_recorded',
      title: 'Payment Received',
      message: '₹8,000 recorded for Rajesh Mohan Patel (LN-2026-005).',
      read: true,
      timestamp: `${todayStr} 11:45`,
      linkTab: 'receipts',
      linkId: 'pay_304',
    },
    {
      id: 'notif_504',
      type: 'system',
      title: 'Daily Backup Completed',
      message: 'Local database snapshot safely synced and verified.',
      read: true,
      timestamp: `${todayStr} 00:01`,
      linkTab: 'settings',
    },
  ];

  // Seed audit logs
  const seedAuditLogs: AuditLogItem[] = [
    {
      id: 'aud_601',
      event: 'login',
      adminName: 'Rajesh Sharma',
      timestamp: `${todayStr} 07:00:15`,
      entityId: 'adm_01',
      details: 'Admin authenticated successfully from mobile browser.',
      ip: '192.168.1.42',
    },
    {
      id: 'aud_602',
      event: 'payment_recorded',
      adminName: 'Rajesh Sharma',
      timestamp: `${todayStr} 09:15:22`,
      entityId: 'pay_301',
      details: 'Recorded payment of ₹5,000 for Ramesh Kumar (Receipt RCP-26-0091).',
    },
    {
      id: 'aud_603',
      event: 'payment_recorded',
      adminName: 'Rajesh Sharma',
      timestamp: `${todayStr} 10:30:10`,
      entityId: 'pay_302',
      details: 'Recorded UPI payment of ₹3,500 for Priya Sundaram (Receipt RCP-26-0092).',
    },
    {
      id: 'aud_604',
      event: 'payment_recorded',
      adminName: 'Rajesh Sharma',
      timestamp: `${todayStr} 11:45:05`,
      entityId: 'pay_304',
      details: 'Recorded Bank Transfer payment of ₹8,000 for Rajesh Mohan Patel (Receipt RCP-26-0094).',
    },
    {
      id: 'aud_605',
      event: 'system_backup',
      adminName: 'System',
      timestamp: `${todayStr} 00:01:00`,
      entityId: 'sys_backup_01',
      details: 'Automated midnight backup verified. Checksum ok.',
    },
  ];

  return {
    borrowers: seedBorrowers,
    loans: seedLoans,
    payments: seedPayments,
    expenses: seedExpenses,
    notifications: seedNotifications,
    auditLogs: seedAuditLogs,
    settings: DEFAULT_SETTINGS,
    admin: DEFAULT_ADMIN,
  };
}

export class CollectionStorage {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to write to localStorage key ${key}`, e);
    }
  }

  public static initialize(): void {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      this.resetToDemo();
    }
  }

  public static resetToDemo(): void {
    const seed = generateSeedData();
    this.set(STORAGE_KEYS.BORROWERS, seed.borrowers);
    this.set(STORAGE_KEYS.LOANS, seed.loans);
    this.set(STORAGE_KEYS.PAYMENTS, seed.payments);
    this.set(STORAGE_KEYS.EXPENSES, seed.expenses);
    this.set(STORAGE_KEYS.NOTIFICATIONS, seed.notifications);
    this.set(STORAGE_KEYS.AUDIT_LOGS, seed.auditLogs);
    this.set(STORAGE_KEYS.SETTINGS, seed.settings);
    this.set(STORAGE_KEYS.ADMIN, seed.admin);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // Getters
  public static getBorrowers(): Borrower[] {
    return this.get<Borrower[]>(STORAGE_KEYS.BORROWERS, []);
  }

  public static getLoans(): Loan[] {
    return this.get<Loan[]>(STORAGE_KEYS.LOANS, []);
  }

  public static getPayments(): Payment[] {
    return this.get<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  public static getExpenses(): Expense[] {
    return this.get<Expense[]>(STORAGE_KEYS.EXPENSES, []);
  }

  public static getNotifications(): NotificationItem[] {
    return this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  public static getAuditLogs(): AuditLogItem[] {
    return this.get<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  public static getSettings(): BusinessSettings {
    return this.get<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public static getAdmin(): AdminUser {
    return this.get<AdminUser>(STORAGE_KEYS.ADMIN, DEFAULT_ADMIN);
  }

  // Add / Edit Borrower
  public static addBorrower(borrowerData: Omit<Borrower, 'id' | 'borrowerId' | 'createdAt' | 'totalBorrowedPaise' | 'totalRepaidPaise' | 'currentOutstandingPaise' | 'overdueAmountPaise' | 'activeLoansCount'>, adminName = 'Admin'): Borrower {
    const borrowers = this.getBorrowers();
    const nextNumber = borrowers.length + 1001;
    const borrowerId = `BR-${nextNumber}`;
    const id = `br_${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    const newBorrower: Borrower = {
      ...borrowerData,
      id,
      borrowerId,
      createdAt,
      totalBorrowedPaise: 0,
      totalRepaidPaise: 0,
      currentOutstandingPaise: 0,
      overdueAmountPaise: 0,
      activeLoansCount: 0,
    };

    borrowers.unshift(newBorrower);
    this.set(STORAGE_KEYS.BORROWERS, borrowers);

    this.logAudit({
      event: 'borrower_created',
      adminName,
      entityId: borrowerId,
      details: `Created new borrower profile for ${newBorrower.fullName} (${borrowerId}).`,
      afterState: JSON.stringify({ name: newBorrower.fullName, phone: newBorrower.mobile }),
    });

    this.addNotification({
      type: 'new_borrower',
      title: 'New Borrower Added',
      message: `${newBorrower.fullName} was enrolled with ID ${borrowerId}.`,
      linkTab: 'borrowers',
      linkId: id,
    });

    return newBorrower;
  }

  public static updateBorrower(id: string, updates: Partial<Borrower>, adminName = 'Admin'): Borrower | null {
    const borrowers = this.getBorrowers();
    const index = borrowers.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const before = borrowers[index];
    const updated = { ...before, ...updates };
    borrowers[index] = updated;
    this.set(STORAGE_KEYS.BORROWERS, borrowers);

    this.logAudit({
      event: 'borrower_created',
      adminName,
      entityId: before.borrowerId,
      details: `Updated details for ${before.fullName} (${before.borrowerId}).`,
      beforeState: JSON.stringify({ name: before.fullName, phone: before.mobile, status: before.status }),
      afterState: JSON.stringify({ name: updated.fullName, phone: updated.mobile, status: updated.status }),
    });

    return updated;
  }

  // Create Loan
  public static createLoan(
    input: {
      borrowerId: string;
      principalPaise: number;
      interestType: 'flat' | 'reducing';
      interestRatePercent: number;
      frequency: 'daily' | 'weekly' | 'monthly';
      durationValue: number;
      startDate: string;
      collectionDay?: string;
      notes?: string;
    },
    adminName = 'Admin'
  ): Loan | null {
    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === input.borrowerId);
    if (!borrower) return null;

    const loans = this.getLoans();
    const nextNumber = loans.length + 1;
    const loanIdStr = `LN-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;
    const id = `ln_${Date.now()}`;

    const calculation = calculateLoan({
      principalPaise: input.principalPaise,
      interestType: input.interestType,
      annualInterestRatePercent: input.interestRatePercent,
      durationValue: input.durationValue,
      frequency: input.frequency,
      startDate: input.startDate,
    });

    const installments: InstallmentItem[] = calculation.schedule.map((s) => ({
      id: `inst_${id}_${s.installmentNumber}`,
      loanId: id,
      installmentNumber: s.installmentNumber,
      dueDate: s.dueDate,
      amountDuePaise: s.installmentAmountPaise,
      amountPaidPaise: 0,
      status: 'pending',
    }));

    const newLoan: Loan = {
      id,
      loanId: loanIdStr,
      borrowerId: borrower.id,
      borrowerName: borrower.fullName,
      borrowerPhone: borrower.mobile,
      principalPaise: input.principalPaise,
      interestType: input.interestType,
      interestRatePercent: input.interestRatePercent,
      frequency: input.frequency,
      durationValue: input.durationValue,
      installmentAmountPaise: calculation.installmentAmountPaise,
      totalInstallments: calculation.totalInstallments,
      startDate: input.startDate,
      dueDate: calculation.maturityDate,
      firstInstallmentDate: calculation.schedule[0]?.dueDate || input.startDate,
      collectionDay: input.collectionDay || 'Everyday',
      totalInterestPaise: calculation.totalInterestPaise,
      totalPayablePaise: calculation.totalPayablePaise,
      collectedPaise: 0,
      outstandingPaise: calculation.totalPayablePaise,
      status: 'active',
      notes: input.notes,
      createdAt: new Date().toISOString().split('T')[0],
      installments,
    };

    loans.unshift(newLoan);
    this.set(STORAGE_KEYS.LOANS, loans);

    // Update borrower totals
    borrower.totalBorrowedPaise += newLoan.totalPayablePaise;
    borrower.currentOutstandingPaise += newLoan.totalPayablePaise;
    borrower.activeLoansCount += 1;
    this.set(STORAGE_KEYS.BORROWERS, borrowers);

    this.logAudit({
      event: 'loan_created',
      adminName,
      entityId: loanIdStr,
      details: `Disbursed loan ${loanIdStr} of ${input.principalPaise / 100} INR to ${borrower.fullName}.`,
      afterState: JSON.stringify({ principal: input.principalPaise, payable: calculation.totalPayablePaise }),
    });

    this.addNotification({
      type: 'new_loan',
      title: 'Loan Disbursed',
      message: `${loanIdStr} created for ${borrower.fullName} with ${calculation.totalInstallments} installments.`,
      linkTab: 'loans',
      linkId: id,
    });

    return newLoan;
  }

  // Edit Loan with audit trail
  public static editLoan(
    loanId: string,
    updates: { notes?: string; status?: Loan['status'] },
    reason: string,
    adminName = 'Admin'
  ): Loan | null {
    const loans = this.getLoans();
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return null;

    const before = { ...loan };
    if (updates.notes !== undefined) loan.notes = updates.notes;
    if (updates.status !== undefined) loan.status = updates.status;

    this.set(STORAGE_KEYS.LOANS, loans);

    this.logAudit({
      event: 'loan_edited',
      adminName,
      entityId: loan.loanId,
      details: `Edited loan ${loan.loanId}. Reason: ${reason}`,
      beforeState: JSON.stringify({ notes: before.notes, status: before.status }),
      afterState: JSON.stringify({ notes: loan.notes, status: loan.status }),
    });

    return loan;
  }

  // Close Loan
  public static closeLoan(loanId: string, reason: string, adminName = 'Admin'): boolean {
    const loans = this.getLoans();
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return false;

    loan.status = 'closed';
    this.set(STORAGE_KEYS.LOANS, loans);

    // Update borrower active loans count
    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === loan.borrowerId);
    if (borrower && borrower.activeLoansCount > 0) {
      borrower.activeLoansCount = Math.max(0, borrower.activeLoansCount - 1);
      this.set(STORAGE_KEYS.BORROWERS, borrowers);
    }

    this.logAudit({
      event: 'loan_edited',
      adminName,
      entityId: loan.loanId,
      details: `Manually closed loan ${loan.loanId}. Reason: ${reason}`,
      afterState: 'closed',
    });

    this.addNotification({
      type: 'loan_completed',
      title: 'Loan Closed',
      message: `Loan ${loan.loanId} has been closed (${reason}).`,
      linkTab: 'loans',
      linkId: loan.id,
    });

    return true;
  }

  // Record Payment Transactionally
  public static recordPayment(
    input: {
      loanId: string;
      amountPaise: number;
      paymentMethod: Payment['paymentMethod'];
      referenceNumber?: string;
      notes?: string;
      collectedBy?: string;
      customDateTime?: string;
    },
    adminName = 'Admin'
  ): { payment: Payment; receiptNumber: string } | { error: string } {
    if (input.amountPaise <= 0) {
      return { error: 'Payment amount must be greater than zero.' };
    }

    const loans = this.getLoans();
    const loan = loans.find((l) => l.id === input.loanId);
    if (!loan) {
      return { error: 'Loan not found.' };
    }

    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === loan.borrowerId);
    if (!borrower) {
      return { error: 'Borrower record not found.' };
    }

    const settings = this.getSettings();
    const payments = this.getPayments();

    const previousOutstanding = loan.outstandingPaise;
    const newOutstanding = Math.max(0, previousOutstanding - input.amountPaise);
    
    // Update loan balance
    loan.collectedPaise += input.amountPaise;
    loan.outstandingPaise = newOutstanding;
    if (newOutstanding === 0) {
      loan.status = 'completed';
    }

    // Allocate payment across installments (if detailed schedule exists)
    let remainingToAllocate = input.amountPaise;
    if (loan.installments && loan.installments.length > 0) {
      for (const inst of loan.installments) {
        if (remainingToAllocate <= 0) break;
        const pendingAmount = inst.amountDuePaise - inst.amountPaidPaise;
        if (pendingAmount > 0) {
          const allocation = Math.min(pendingAmount, remainingToAllocate);
          inst.amountPaidPaise += allocation;
          remainingToAllocate -= allocation;
          if (inst.amountPaidPaise >= inst.amountDuePaise) {
            inst.status = 'paid';
            inst.paidAt = new Date().toISOString();
          } else {
            inst.status = 'partial';
          }
        }
      }
    }

    this.set(STORAGE_KEYS.LOANS, loans);

    // Update borrower balances
    borrower.totalRepaidPaise += input.amountPaise;
    borrower.currentOutstandingPaise = Math.max(0, borrower.currentOutstandingPaise - input.amountPaise);
    if (borrower.overdueAmountPaise > 0) {
      borrower.overdueAmountPaise = Math.max(0, borrower.overdueAmountPaise - input.amountPaise);
    }
    if (newOutstanding === 0 && borrower.activeLoansCount > 0) {
      borrower.activeLoansCount = Math.max(0, borrower.activeLoansCount - 1);
    }
    this.set(STORAGE_KEYS.BORROWERS, borrowers);

    // Generate unique receipt number
    const receiptSeq = payments.length + 101;
    const receiptNumber = `${settings.receiptPrefix || 'RCP-26'}-${String(receiptSeq).padStart(4, '0')}`;
    const paymentId = `pay_${Date.now()}`;
    const paymentDate = input.customDateTime || new Date().toISOString().replace('T', ' ').substring(0, 16);

    const paymentRecord: Payment = {
      id: paymentId,
      receiptNumber,
      loanId: loan.loanId,
      borrowerId: borrower.borrowerId,
      borrowerName: borrower.fullName,
      borrowerPhone: borrower.mobile,
      amountPaise: input.amountPaise,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      paymentDate,
      collectedBy: input.collectedBy || adminName,
      previousOutstandingPaise: previousOutstanding,
      newOutstandingPaise: newOutstanding,
      status: 'confirmed',
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    payments.unshift(paymentRecord);
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    // Write immutable audit log
    this.logAudit({
      event: 'payment_recorded',
      adminName,
      entityId: receiptNumber,
      details: `Collected ₹${(input.amountPaise / 100).toLocaleString('en-IN')} via ${input.paymentMethod.toUpperCase()} from ${borrower.fullName} for loan ${loan.loanId}. Receipt: ${receiptNumber}.`,
      afterState: JSON.stringify({ receipt: receiptNumber, amount: input.amountPaise, newOutstanding }),
    });

    // Write notification
    this.addNotification({
      type: 'payment_recorded',
      title: 'Payment Received',
      message: `₹${(input.amountPaise / 100).toLocaleString('en-IN')} collected from ${borrower.fullName} (${receiptNumber}).`,
      linkTab: 'receipts',
      linkId: paymentId,
    });

    if (newOutstanding === 0) {
      this.addNotification({
        type: 'loan_completed',
        title: 'Loan Fully Repaid! 🎉',
        message: `${borrower.fullName} has completed all payments for loan ${loan.loanId}.`,
        linkTab: 'loans',
        linkId: loan.id,
      });
    }

    return { payment: paymentRecord, receiptNumber };
  }

  // Payment Reversal
  public static reversePayment(paymentId: string, reason: string, adminName = 'Admin'): boolean {
    const payments = this.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment || payment.status === 'reversed') return false;

    const loans = this.getLoans();
    const loan = loans.find((l) => l.id === payment.loanId);
    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === payment.borrowerId);

    // Revert balances
    if (loan) {
      loan.collectedPaise = Math.max(0, loan.collectedPaise - payment.amountPaise);
      loan.outstandingPaise += payment.amountPaise;
      if (loan.status === 'completed') {
        loan.status = 'active';
      }
      this.set(STORAGE_KEYS.LOANS, loans);
    }

    if (borrower) {
      borrower.totalRepaidPaise = Math.max(0, borrower.totalRepaidPaise - payment.amountPaise);
      borrower.currentOutstandingPaise += payment.amountPaise;
      this.set(STORAGE_KEYS.BORROWERS, borrowers);
    }

    payment.status = 'reversed';
    payment.reversalReason = reason;
    payment.reversedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    this.logAudit({
      event: 'payment_reversed',
      adminName,
      entityId: payment.receiptNumber,
      details: `Payment receipt ${payment.receiptNumber} of ₹${(payment.amountPaise / 100).toLocaleString('en-IN')} was reversed. Reason: ${reason}`,
      beforeState: 'confirmed',
      afterState: 'reversed',
    });

    this.addNotification({
      type: 'system',
      title: 'Payment Reversed',
      message: `Receipt ${payment.receiptNumber} was reversed: "${reason}". Balances restored.`,
      linkTab: 'history',
      linkId: payment.id,
    });

    return true;
  }

  // Expenses
  public static addExpense(
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    adminName = 'Admin'
  ): Expense {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    this.set(STORAGE_KEYS.EXPENSES, expenses);

    this.logAudit({
      event: 'system_backup',
      adminName,
      entityId: newExpense.id,
      details: `Expense logged: ${newExpense.category} - ${newExpense.description} (₹${(newExpense.amountPaise / 100).toLocaleString('en-IN')}).`,
    });

    return newExpense;
  }

  // Settings
  public static updateSettings(updates: Partial<BusinessSettings>, adminName = 'Admin'): BusinessSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.set(STORAGE_KEYS.SETTINGS, updated);

    this.logAudit({
      event: 'loan_edited',
      adminName,
      entityId: 'settings',
      details: 'Business configuration and financial parameters updated.',
      afterState: JSON.stringify(updates),
    });

    return updated;
  }

  // Audit Log
  public static logAudit(entry: Omit<AuditLogItem, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLogItem = {
      ...entry,
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    logs.unshift(newLog);
    // Keep max 500 audit logs
    if (logs.length > 500) logs.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Notifications
  public static addNotification(notif: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>): void {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    notifs.unshift(newNotif);
    if (notifs.length > 100) notifs.pop();
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  public static markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  public static markAllNotificationsRead(): void {
    const notifs = this.getNotifications();
    notifs.forEach((n) => (n.read = true));
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Export & Import
  public static exportDatabaseJSON(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      borrowers: this.getBorrowers(),
      loans: this.getLoans(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
      notifications: this.getNotifications(),
      auditLogs: this.getAuditLogs(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.borrowers) this.set(STORAGE_KEYS.BORROWERS, data.borrowers);
      if (data.loans) this.set(STORAGE_KEYS.LOANS, data.loans);
      if (data.payments) this.set(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.expenses) this.set(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.notifications) this.set(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
      if (data.auditLogs) this.set(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}
