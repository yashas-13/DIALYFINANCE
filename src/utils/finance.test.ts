import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  formatCompactINR,
  rupeesToPaise,
  paiseToRupees,
  calculateLoan,
  validatePayment,
  addDays,
} from './finance.js';

test('rupees and paise conversions are exact integer values', () => {
  assert.equal(rupeesToPaise(100), 10000);
  assert.equal(rupeesToPaise(18.5), 1850);
  assert.equal(rupeesToPaise('1240.50'), 124050);
  assert.equal(paiseToRupees(124050), 1240.50);
  assert.equal(paiseToRupees(1850000), 18500);
});

test('currency formatting renders correct Indian Rupee signs and compact notation', () => {
  const formatted = formatINR(1850000); // 18,500
  assert.ok(formatted.includes('18,500'));
  
  assert.equal(formatCompactINR(1850000), '₹18.5k');
  assert.equal(formatCompactINR(124000000), '₹12.4L');
});

test('flat interest loan calculation generates accurate schedules and totals', () => {
  const result = calculateLoan({
    principalPaise: 1000000, // ₹10,000
    interestType: 'flat',
    annualInterestRatePercent: 12,
    durationValue: 10, // 10 days
    frequency: 'daily',
    startDate: '2026-11-01',
  });

  assert.equal(result.principalPaise, 1000000);
  assert.ok(result.totalPayablePaise >= 1000000);
  assert.equal(result.totalInstallments, 10);
  assert.equal(result.schedule.length, 10);
  
  // Verify schedule sum equals total payable
  const sum = result.schedule.reduce((acc, item) => acc + item.installmentAmountPaise, 0);
  assert.equal(sum, result.totalPayablePaise);

  // Remaining balance on last installment must reach 0
  assert.equal(result.schedule[9].remainingBalancePaise, 0);
});

test('reducing interest loan calculation computes valid installment schedules', () => {
  const result = calculateLoan({
    principalPaise: 5000000, // ₹50,000
    interestType: 'reducing',
    annualInterestRatePercent: 15,
    durationValue: 5, // 5 months
    frequency: 'monthly',
    startDate: '2026-01-01',
  });

  assert.equal(result.principalPaise, 5000000);
  assert.equal(result.totalInstallments, 5);
  assert.equal(result.schedule.length, 5);
  assert.equal(result.schedule[4].remainingBalancePaise, 0);
});

test('validatePayment strictly enforces positive amounts and prevents overpayment without advance flag', () => {
  const validPayment = validatePayment(50000, 100000, false);
  assert.equal(validPayment.valid, true);

  const zeroPayment = validatePayment(0, 100000, false);
  assert.equal(zeroPayment.valid, false);

  const overpaymentWithoutAdvance = validatePayment(150000, 100000, false);
  assert.equal(overpaymentWithoutAdvance.valid, false);

  const overpaymentWithAdvance = validatePayment(150000, 100000, true);
  assert.equal(overpaymentWithAdvance.valid, true);
  assert.equal(overpaymentWithAdvance.isAdvance, true);
});

test('date math accurately advances days', () => {
  assert.equal(addDays('2026-11-01', 5), '2026-11-06');
});

test('upfront deduction loan matches user example: ₹10k loan, deduct ₹2k, disburse ₹8k, 10 weekly ₹1k installments repaying ₹10k', () => {
  const result = calculateLoan({
    principalPaise: 1000000, // ₹10,000 sanctioned
    interestType: 'upfront_deduction',
    annualInterestRatePercent: 20,
    customDeductionPaise: 200000, // ₹2,000 upfront deduction
    durationValue: 10, // 10 weeks
    frequency: 'weekly',
    startDate: '2026-11-03',
  });

  assert.equal(result.sanctionedAmountPaise, 1000000); // ₹10,000
  assert.equal(result.upfrontDeductionPaise, 200000); // ₹2,000 deducted upfront
  assert.equal(result.netDisbursedPaise, 800000); // ₹8,000 net cash given
  assert.equal(result.totalPayablePaise, 1000000); // ₹10,000 total repayable
  assert.equal(result.totalInstallments, 10);
  assert.equal(result.installmentAmountPaise, 100000); // ₹1,000 weekly installment
  assert.equal(result.schedule.length, 10);

  // Each installment is ₹1,000
  result.schedule.forEach((inst, index) => {
    assert.equal(inst.installmentAmountPaise, 100000);
    assert.equal(inst.principalPaise, 100000);
    assert.equal(inst.interestPaise, 0); // interest was deducted upfront
  });

  // Final remaining balance reaches 0
  assert.equal(result.schedule[9].remainingBalancePaise, 0);
});
