export interface LoanCalculationInput {
  principalPaise: number;
  interestType: 'flat' | 'reducing' | 'upfront_deduction';
  annualInterestRatePercent: number; // e.g., 20 for 20% or flat period rate
  durationValue: number; // e.g. 100 days, 10 weeks, 12 months
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string; // YYYY-MM-DD
  firstInstallmentDate?: string; // YYYY-MM-DD (defaults to next day for daily & weekly)
  customDeductionPaise?: number; // optional manual override
}

export interface InstallmentScheduleItem {
  installmentNumber: number;
  dueDate: string;
  principalPaise: number;
  interestPaise: number;
  installmentAmountPaise: number;
  remainingBalancePaise: number;
}

export interface LoanCalculationResult {
  principalPaise: number;
  sanctionedAmountPaise: number;
  upfrontDeductionPaise: number;
  netDisbursedPaise: number;
  totalInterestPaise: number;
  totalPayablePaise: number;
  totalInstallments: number;
  installmentAmountPaise: number;
  firstInstallmentDate: string;
  maturityDate: string;
  schedule: InstallmentScheduleItem[];
}

/**
 * Format paise to formatted currency string (e.g., 1850000 -> "₹18,500")
 */
export function formatINR(paise: number, includeDecimals = false): string {
  if (isNaN(paise) || paise === null || paise === undefined) return '₹0';
  const rupees = paise / 100;
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  };
  
  return new Intl.NumberFormat('en-IN', options).format(rupees);
}

/**
 * Format compact INR for mobile cards (e.g., ₹12.4L or ₹18.5k)
 */
export function formatCompactINR(paise: number): string {
  const rupees = Math.round(paise / 100);
  if (rupees >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(2)}Cr`;
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}k`;
  }
  return `₹${rupees}`;
}

/**
 * Convert rupee string/number to integer paise
 */
export function rupeesToPaise(rupees: number | string): number {
  const val = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(val) || val < 0) return 0;
  return Math.round(val * 100);
}

/**
 * Convert integer paise to rupee number
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Add days to a YYYY-MM-DD date string
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Add weeks to a YYYY-MM-DD date string
 */
export function addWeeks(dateStr: string, weeks: number): string {
  return addDays(dateStr, weeks * 7);
}

/**
 * Add months to a YYYY-MM-DD date string
 */
export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

/**
 * Automatically determine the first installment collection due date.
 * For daily and weekly loans, it automatically takes the NEXT DAY (startDate + 1 day).
 * For monthly loans, it defaults to 1 month after start date.
 */
export function calculateFirstDueDate(
  startDate: string,
  frequency: 'daily' | 'weekly' | 'monthly'
): string {
  if (frequency === 'daily' || frequency === 'weekly') {
    return addDays(startDate, 1);
  }
  return addMonths(startDate, 1);
}

/**
 * Get weekday name (e.g., "Saturday", "Sunday") from date string
 */
export function getWeekdayName(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return 'Day';
  }
}

/**
 * Compute the natural collection day or slot description based on frequency and first due date
 */
export function getDefaultCollectionSlot(
  startDate: string,
  frequency: 'daily' | 'weekly' | 'monthly',
  firstDueDate?: string
): string {
  const first = firstDueDate || calculateFirstDueDate(startDate, frequency);
  if (frequency === 'daily') {
    return 'Everyday (Daily)';
  }
  if (frequency === 'weekly') {
    const weekday = getWeekdayName(first);
    return `Every ${weekday}`;
  }
  const dayOfMonth = new Date(first + 'T00:00:00').getDate();
  return `${dayOfMonth}th of each month`;
}

/**
 * Calculate due date for installment #installmentIndex (1-indexed).
 * If customFirstDueDate is provided, it anchors installment #1 to that date.
 * For daily: firstDueDate + (i - 1) days (installment 1 = next day, installment 2 = next day + 1 day).
 * For weekly: firstDueDate + (i - 1) * 7 days (installment 1 = next day, installment 2 = next day + 7 days on same weekday).
 * For monthly: firstDueDate + (i - 1) months.
 */
export function getNextDueDate(
  startDate: string,
  installmentIndex: number,
  frequency: 'daily' | 'weekly' | 'monthly',
  customFirstDueDate?: string
): string {
  const firstDueDate = customFirstDueDate || calculateFirstDueDate(startDate, frequency);
  const offset = installmentIndex - 1;
  if (offset <= 0) {
    return firstDueDate;
  }
  if (frequency === 'daily') {
    return addDays(firstDueDate, offset);
  }
  if (frequency === 'weekly') {
    return addDays(firstDueDate, offset * 7);
  }
  return addMonths(firstDueDate, offset);
}

/**
 * Calculate loan repayment schedule and totals
 */
export function calculateLoan(input: LoanCalculationInput): LoanCalculationResult {
  const {
    principalPaise,
    interestType,
    annualInterestRatePercent,
    durationValue,
    frequency,
    startDate,
    firstInstallmentDate,
  } = input;

  const firstDueDate = firstInstallmentDate || calculateFirstDueDate(startDate, frequency);

  if (principalPaise <= 0 || durationValue <= 0) {
    return {
      principalPaise: 0,
      sanctionedAmountPaise: 0,
      upfrontDeductionPaise: 0,
      netDisbursedPaise: 0,
      totalInterestPaise: 0,
      totalPayablePaise: 0,
      totalInstallments: 0,
      installmentAmountPaise: 0,
      firstInstallmentDate: firstDueDate,
      maturityDate: startDate,
      schedule: [],
    };
  }

  const totalInstallments = durationValue;
  let totalInterestPaise = 0;
  let installmentAmountPaise = 0;
  const schedule: InstallmentScheduleItem[] = [];

  if (interestType === 'upfront_deduction') {
    // Upfront Deduction (Discounting Loan):
    // E.g. Sanctioned = ₹10,000, Upfront Deduction = ₹2,000, Net Disbursed Cash = ₹8,000.
    // Borrower repays the full ₹10,000 face value across installments (e.g. 10 weeks of ₹1,000).
    const sanctionedAmountPaise = principalPaise;

    let upfrontDeductionPaise = 0;
    if (input.customDeductionPaise !== undefined && input.customDeductionPaise >= 0) {
      upfrontDeductionPaise = input.customDeductionPaise;
    } else {
      let timeInYears = 0;
      if (frequency === 'daily') {
        timeInYears = durationValue / 365;
      } else if (frequency === 'weekly') {
        timeInYears = durationValue / 52;
      } else {
        timeInYears = durationValue / 12;
      }
      upfrontDeductionPaise = Math.round(principalPaise * (annualInterestRatePercent / 100) * Math.max(timeInYears, 0.08));
    }

    // Ensure deduction doesn't exceed sanctioned amount
    if (upfrontDeductionPaise > sanctionedAmountPaise) {
      upfrontDeductionPaise = sanctionedAmountPaise;
    }

    const netDisbursedPaise = Math.max(0, sanctionedAmountPaise - upfrontDeductionPaise);
    const totalPayablePaise = sanctionedAmountPaise;
    totalInterestPaise = upfrontDeductionPaise;

    installmentAmountPaise = Math.round(totalPayablePaise / totalInstallments);

    let currentBalance = totalPayablePaise;
    let accumulatedPayable = 0;

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = getNextDueDate(startDate, i, frequency, firstDueDate);
      let thisInstallment = installmentAmountPaise;

      if (i === totalInstallments) {
        thisInstallment = totalPayablePaise - accumulatedPayable;
      }
      accumulatedPayable += thisInstallment;
      currentBalance = Math.max(0, currentBalance - thisInstallment);

      // In upfront deduction, profit was deducted on day 0,
      // so installments directly retire the sanctioned face value balance.
      schedule.push({
        installmentNumber: i,
        dueDate,
        principalPaise: thisInstallment,
        interestPaise: 0,
        installmentAmountPaise: thisInstallment,
        remainingBalancePaise: currentBalance,
      });
    }

    const maturityDate = schedule[schedule.length - 1]?.dueDate || firstDueDate;

    return {
      principalPaise,
      sanctionedAmountPaise,
      upfrontDeductionPaise,
      netDisbursedPaise,
      totalInterestPaise,
      totalPayablePaise,
      totalInstallments,
      installmentAmountPaise,
      firstInstallmentDate: firstDueDate,
      maturityDate,
      schedule,
    };
  } else if (interestType === 'flat') {
    // Flat rate: Total interest = Principal * (Rate / 100) * (Period in years)
    let timeInYears = 0;
    if (frequency === 'daily') {
      timeInYears = durationValue / 365;
    } else if (frequency === 'weekly') {
      timeInYears = durationValue / 52;
    } else {
      timeInYears = durationValue / 12;
    }

    // Flat interest total
    totalInterestPaise = Math.round(principalPaise * (annualInterestRatePercent / 100) * Math.max(timeInYears, 0.08));
    const totalPayablePaise = principalPaise + totalInterestPaise;
    
    // Exact installment amount
    installmentAmountPaise = Math.round(totalPayablePaise / totalInstallments);
    
    let currentBalance = totalPayablePaise;
    let accumulatedPayable = 0;

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = getNextDueDate(startDate, i, frequency, firstDueDate);
      let thisInstallment = installmentAmountPaise;

      // Adjust last installment for any integer rounding delta
      if (i === totalInstallments) {
        thisInstallment = totalPayablePaise - accumulatedPayable;
      }
      accumulatedPayable += thisInstallment;
      currentBalance = Math.max(0, currentBalance - thisInstallment);

      const interestPart = Math.round(totalInterestPaise / totalInstallments);
      const principalPart = thisInstallment - interestPart;

      schedule.push({
        installmentNumber: i,
        dueDate,
        principalPaise: principalPart,
        interestPaise: interestPart,
        installmentAmountPaise: thisInstallment,
        remainingBalancePaise: currentBalance,
      });
    }

    const maturityDate = schedule[schedule.length - 1]?.dueDate || firstDueDate;

    return {
      principalPaise,
      sanctionedAmountPaise: principalPaise,
      upfrontDeductionPaise: 0,
      netDisbursedPaise: principalPaise,
      totalInterestPaise,
      totalPayablePaise,
      totalInstallments,
      installmentAmountPaise,
      firstInstallmentDate: firstDueDate,
      maturityDate,
      schedule,
    };
  } else {
    // Reducing Balance (EMI based on period rate)
    let periodsPerYear = 12;
    if (frequency === 'daily') periodsPerYear = 365;
    if (frequency === 'weekly') periodsPerYear = 52;

    const periodicRate = (annualInterestRatePercent / 100) / periodsPerYear;
    
    // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    let emiPaise = 0;
    if (periodicRate > 0) {
      const pow = Math.pow(1 + periodicRate, totalInstallments);
      const factor = (periodicRate * pow) / (pow - 1);
      emiPaise = Math.round(principalPaise * factor);
    } else {
      emiPaise = Math.round(principalPaise / totalInstallments);
    }

    installmentAmountPaise = emiPaise;
    let balance = principalPaise;
    let accumulatedInterest = 0;

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = getNextDueDate(startDate, i, frequency, firstDueDate);
      const interestPart = Math.round(balance * periodicRate);
      let principalPart = installmentAmountPaise - interestPart;
      
      if (i === totalInstallments || principalPart > balance) {
        principalPart = balance;
        installmentAmountPaise = principalPart + interestPart;
      }

      accumulatedInterest += interestPart;
      balance = Math.max(0, balance - principalPart);

      schedule.push({
        installmentNumber: i,
        dueDate,
        principalPaise: principalPart,
        interestPaise: interestPart,
        installmentAmountPaise: principalPart + interestPart,
        remainingBalancePaise: balance,
      });
    }

    totalInterestPaise = accumulatedInterest;
    const totalPayablePaise = principalPaise + totalInterestPaise;
    const maturityDate = schedule[schedule.length - 1]?.dueDate || firstDueDate;

    return {
      principalPaise,
      sanctionedAmountPaise: principalPaise,
      upfrontDeductionPaise: 0,
      netDisbursedPaise: principalPaise,
      totalInterestPaise,
      totalPayablePaise,
      totalInstallments,
      installmentAmountPaise,
      firstInstallmentDate: firstDueDate,
      maturityDate,
      schedule,
    };
  }
}

/**
 * Validate payment input against business rules
 */
export interface PaymentValidationResult {
  valid: boolean;
  error?: string;
  appliedAmountPaise: number;
  isAdvance: boolean;
}

export function validatePayment(
  amountReceivedPaise: number,
  outstandingBalancePaise: number,
  allowAdvance = false
): PaymentValidationResult {
  if (isNaN(amountReceivedPaise) || amountReceivedPaise <= 0) {
    return {
      valid: false,
      error: 'Payment amount must be greater than zero.',
      appliedAmountPaise: 0,
      isAdvance: false,
    };
  }

  if (amountReceivedPaise > outstandingBalancePaise && !allowAdvance) {
    return {
      valid: false,
      error: `Payment (${formatINR(amountReceivedPaise)}) cannot exceed total outstanding balance (${formatINR(outstandingBalancePaise)}) without advance permission.`,
      appliedAmountPaise: amountReceivedPaise,
      isAdvance: false,
    };
  }

  return {
    valid: true,
    appliedAmountPaise: amountReceivedPaise,
    isAdvance: amountReceivedPaise > outstandingBalancePaise,
  };
}
