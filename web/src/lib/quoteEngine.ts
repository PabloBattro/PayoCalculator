import type { QuoteRequest, QuoteResponse, FeeRule, VolumeHint } from '@/types/quote';
import {
  getPricingRule,
  getLocalPricingRule,
  isLocalCorridor,
  VOLUME_THRESHOLD_USD,
  midMarketRates,
} from '@/config/pricing';
import { getLiveMidMarketRate } from '@/lib/fxRateService';
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
  const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Format: "Feb 18", "Mar 3" — short month + day (no leading zero)
  const dateSuffix = `${SHORT_MONTHS[arrival.getMonth()]} ${arrival.getDate()}`;

  let etaLabel: string;
  if (etaDays.max === 0) {
    etaLabel = 'Should arrive instantly';
  } else if (etaDays.max === 1) {
    etaLabel = 'Should arrive by tomorrow';
  } else if (etaDays.max <= 5) {
    // e.g. "Should arrive by Tuesday, Feb 18"
    etaLabel = `Should arrive by ${DAYS[arrival.getDay()]}, ${dateSuffix}`;
  } else {
    // e.g. "Should arrive by Feb 28"
    etaLabel = `Should arrive by ${dateSuffix}`;
  }

  return { eta, etaLabel };
}

/**
 * Convert an amount in a given currency to its approximate USD equivalent.
 * Uses static seed rates (good enough for threshold comparison).
 */
function toUsdEquivalent(amount: number, currency: string): number {
  const rate = midMarketRates[currency];
  if (!rate) return amount; // fallback: treat as USD
  return amount / rate;     // e.g., 58,000 BRL / 5.8 = 10,000 USD
}

/**
 * Build volume discount hint if send amount exceeds threshold.
 */
function checkVolumeHint(sendAmount: number, sendCurrency: string): VolumeHint | undefined {
  const usdEquiv = toUsdEquivalent(sendAmount, sendCurrency);
  if (usdEquiv < VOLUME_THRESHOLD_USD) return undefined;

  const symbol = getCurrency(sendCurrency)?.symbol ?? '';
  const thresholdInLocal = round(VOLUME_THRESHOLD_USD * (midMarketRates[sendCurrency] ?? 1), 0);

  return {
    message: 'Sending large amounts regularly? You may qualify for lower fees.',
    thresholdFormatted: `${symbol}${thresholdInLocal.toLocaleString('en-US')}`,
  };
}

// ---------------------------------------------------------------------------
// Main — now async to support live FX rate fetching
// ---------------------------------------------------------------------------

export async function calculateQuote(req: QuoteRequest): Promise<QuoteResponse | null> {
  const { sendCurrency, receiveCurrency, amount, direction, method } = req;
  const isLocal = isLocalCorridor(sendCurrency, receiveCurrency);

  // ─── LOCAL TRANSFER (same currency, flat fee, no FX) ─────────────────
  if (isLocal) {
    return calculateLocalQuote(sendCurrency, amount, direction, method);
  }

  // ─── NON-LOCAL TRANSFER (cross-currency, % fee + FX markup) ──────────
  return calculateNonLocalQuote(sendCurrency, receiveCurrency, amount, direction, method);
}

// ---------------------------------------------------------------------------
// Local quote: same-currency, flat fee, no FX conversion
// ---------------------------------------------------------------------------

function calculateLocalQuote(
  currency: string,
  amount: number,
  direction: 'send' | 'receive',
  method: QuoteRequest['method'],
): QuoteResponse {
  const rule = getLocalPricingRule(currency);
  const decimals = getCurrency(currency)?.decimals ?? 2;

  let sendAmount: number;
  let receiveAmount: number;
  const fee = rule.fee.value; // flat fee

  if (direction === 'send') {
    sendAmount = amount;
    receiveAmount = round(sendAmount - fee, decimals);
  } else {
    receiveAmount = amount;
    sendAmount = round(receiveAmount + fee, decimals);
  }

  const { eta, etaLabel } = formatEta(rule.etaDays);

  return {
    sendAmount,
    sendCurrency: currency,
    receiveAmount,
    receiveCurrency: currency,
    fee,
    feeCurrency: currency,
    feeLabel: fee > 0 ? 'Transfer fee' : 'No transfer fee',
    amountToConvert: round(sendAmount - fee, decimals),
    exchangeRate: 0,    // no FX for local
    midMarketRate: 0,   // no FX for local
    eta,
    etaLabel,
    method,
    isLocalTransfer: true,
    volumeHint: checkVolumeHint(sendAmount, currency),
    disclaimers: [
      'Indicative quote. Final fees may differ at execution.',
      'Rates and fees vary by route and payment details.',
    ],
  };
}

// ---------------------------------------------------------------------------
// Non-local quote: cross-currency with FX
// ---------------------------------------------------------------------------

async function calculateNonLocalQuote(
  sendCurrency: string,
  receiveCurrency: string,
  amount: number,
  direction: 'send' | 'receive',
  method: QuoteRequest['method'],
): Promise<QuoteResponse | null> {
  const rule = getPricingRule(sendCurrency, receiveCurrency);

  // Fetch live mid-market rate (falls back to cached/static automatically)
  const rateResult = await getLiveMidMarketRate(sendCurrency, receiveCurrency);
  if (!rateResult) return null; // unknown currency pair

  const { rate: midRate, stale: rateStale, fetchedAt } = rateResult;

  // Apply FX markup: customer rate is worse than mid by the markup %
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

    // Clamp fee to min/max
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
    isLocalTransfer: false,
    volumeHint: checkVolumeHint(sendAmount, sendCurrency),
    // Rate freshness metadata — used by UI to show "Last updated" timestamp
    ...(fetchedAt > 0 && { rateUpdatedAt: new Date(fetchedAt).toISOString() }),
    ...(rateStale && {
      rateStale: true,
      rateDisclaimer: 'Exchange rates may be delayed. Shown rates are approximate.',
    }),
    disclaimers: [
      'Indicative quote. Final fees and rate may differ at execution.',
      'Intermediary banks may charge additional fees to the recipient.',
      'Rates and fees vary by route and payment details.',
    ],
  };
}
