export type LoanStatus = 'active' | 'completed' | 'defaulted' | 'closed';
export type PaymentStatus = 'confirmed' | 'reversed';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';
export type RepaymentFrequency = 'daily' | 'weekly' | 'monthly';
export type InterestType = 'flat' | 'reducing' | 'upfront_deduction';
export type InstallmentStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export interface Address {
  doorNo: string;
  street: string;
  area: string;
  city: string;
  pinCode: string;
}

export interface Borrower {
  id: string;
  borrowerId: string;
  fullName: string;
  mobile: string;
  altMobile?: string;
  email?: string;
  dob?: string;
  address: Address;
  occupation: string;
  monthlyIncomePaise?: number;
  refName?: string;
  refMobile?: string;
  notes?: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  totalBorrowedPaise: number;
  totalRepaidPaise: number;
  currentOutstandingPaise: number;
  overdueAmountPaise: number;
  activeLoansCount: number;
}

export interface InstallmentItem {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  amountDuePaise: number;
  amountPaidPaise: number;
  status: InstallmentStatus;
  paidAt?: string;
}

export interface Loan {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerPhone: string;
  principalPaise: number;
  sanctionedAmountPaise?: number;
  upfrontDeductionPaise?: number;
  netDisbursedPaise?: number;
  interestType: InterestType;
  interestRatePercent: number;
  frequency: RepaymentFrequency;
  durationValue: number;
  installmentAmountPaise: number;
  totalInstallments: number;
  startDate: string;
  dueDate: string;
  firstInstallmentDate: string;
  collectionDay?: string;
  totalInterestPaise: number;
  totalPayablePaise: number;
  collectedPaise: number;
  outstandingPaise: number;
  status: LoanStatus;
  notes?: string;
  createdAt: string;
  installments: InstallmentItem[];
}

export interface Payment {
  id: string;
  receiptNumber: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerPhone: string;
  amountPaise: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  collectedBy: string;
  previousOutstandingPaise: number;
  newOutstandingPaise: number;
  status: PaymentStatus;
  reversalReason?: string;
  reversedAt?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 'transport' | 'staff_salary' | 'office_expenses' | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amountPaise: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'upcoming_installment' | 'overdue' | 'new_borrower' | 'new_loan' | 'payment_recorded' | 'loan_completed' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  linkTab?: string;
  linkId?: string;
}

export interface AuditLogItem {
  id: string;
  event: 'borrower_created' | 'loan_created' | 'payment_recorded' | 'loan_edited' | 'payment_reversed' | 'login' | 'system_backup';
  adminName: string;
  timestamp: string;
  entityId: string;
  details: string;
  ip?: string;
  beforeState?: string;
  afterState?: string;
}

export interface BusinessSettings {
  businessName: string;
  logoUrl?: string;
  address: string;
  contactNumber: string;
  defaultInterestRate: number;
  defaultFrequency: RepaymentFrequency;
  receiptPrefix: string;
  currencySymbol: string;
  financialYear: string;
  sessionTimeoutMinutes: number;
  lockAttemptsLimit: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'super_admin' | 'loan_officer';
  status: 'active' | 'disabled';
  lastLogin: string;
}
