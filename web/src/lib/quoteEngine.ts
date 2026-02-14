import type { QuoteRequest, QuoteResponse, FeeRule } from '@/types/quote';
import { getPricingRule, getMidMarketRate } from '@/config/pricing';
import { getCurrency } from '@/config/currencies';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

function computeFee(amount: number, rule: FeeRule): number {
  let fee = rule.type === 'percentage' ? amount * (rule.value / 100) : rule.value;
  fee = Math.max(fee, rule.min);
  fee = Math.min(fee, rule.max);
  return fee;
}

function formatEta(etaDays: { min: number; max: number }): { eta: string; etaLabel: string } {
  const arrival = new Date();
  arrival.setDate(arrival.getDate() + etaDays.max);

  const eta = arrival.toISOString().split('T')[0];

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  let etaLabel: string;
  if (etaDays.max === 0) {
    etaLabel = 'Should arrive instantly';
  } else if (etaDays.max === 1) {
    etaLabel = 'Should arrive by tomorrow';
  } else if (etaDays.max <= 5) {
    etaLabel = `Should arrive by ${DAYS[arrival.getDay()]}`;
  } else {
    etaLabel = `Should arrive by ${MONTHS[arrival.getMonth()]} ${arrival.getDate()}`;
  }

  return { eta, etaLabel };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function calculateQuote(req: QuoteRequest): QuoteResponse {
  const { sendCurrency, receiveCurrency, amount, direction, method } = req;

  const rule = getPricingRule(sendCurrency, receiveCurrency);
  const midRate = getMidMarketRate(sendCurrency, receiveCurrency);

  // Apply FX markup: the customer rate is worse than mid by the markup %
  const exchangeRate = midRate * (1 - rule.fxMarkupPercent / 100);

  const sd = getCurrency(sendCurrency)?.decimals ?? 2;
  const rd = getCurrency(receiveCurrency)?.decimals ?? 2;

  let sendAmount: number;
  let receiveAmount: number;
  let fee: number;
  let amountToConvert: number;

  if (direction === 'send') {
    // Forward: user entered send amount
    sendAmount = amount;
    fee = round(computeFee(sendAmount, rule.fee), sd);
    amountToConvert = round(sendAmount - fee, sd);
    receiveAmount = round(amountToConvert * exchangeRate, rd);
  } else {
    // Reverse: user entered receive amount
    receiveAmount = amount;
    amountToConvert = round(receiveAmount / exchangeRate, sd);

    // Back-calculate sendAmount → sendAmount = amountToConvert + fee
    if (rule.fee.type === 'percentage') {
      sendAmount = round(amountToConvert / (1 - rule.fee.value / 100), sd);
    } else {
      sendAmount = round(amountToConvert + rule.fee.value, sd);
    }

    fee = round(sendAmount - amountToConvert, sd);

    // Clamp fee
    if (fee < rule.fee.min) {
      fee = rule.fee.min;
      sendAmount = round(amountToConvert + fee, sd);
    } else if (fee > rule.fee.max) {
      fee = rule.fee.max;
      sendAmount = round(amountToConvert + fee, sd);
    }
  }

  const { eta, etaLabel } = formatEta(rule.etaDays);

  return {
    sendAmount,
    sendCurrency,
    receiveAmount,
    receiveCurrency,
    fee,
    feeCurrency: sendCurrency,
    feeLabel: 'Bank transfer fees',
    amountToConvert,
    exchangeRate: round(exchangeRate, 6),
    midMarketRate: round(midRate, 6),
    eta,
    etaLabel,
    method,
    disclaimers: [
      'Indicative quote. Final fees and rate may differ at execution.',
      'Intermediary banks may charge additional fees to the recipient.',
      'Rates and fees vary by route and payment details.',
    ],
  };
}

