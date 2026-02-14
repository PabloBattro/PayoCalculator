import type { PricingRule, FeeRule } from '@/types/quote';

// ---------------------------------------------------------------------------
// Static mid-market rates: units per 1 USD
// Used as ultimate fallback seed if the live FX API is unreachable.
// ---------------------------------------------------------------------------
export const midMarketRates: Record<string, number> = {
  USD: 1,
  EUR: 0.952,
  GBP: 0.794,
  CNY: 7.25,
  CAD: 1.36,
  TRY: 36.5,
  BRL: 5.8,
  MXN: 20.5,
  ARS: 1050,
  COP: 4200,
};

// ---------------------------------------------------------------------------
// Local transfer fees (same-currency → flat fee, no FX)
// Major currencies: ~$1.50 equivalent. Exotic: 0 (free for now).
// ---------------------------------------------------------------------------
export const localFees: Record<string, number> = {
  USD: 1.50,
  EUR: 1.50,
  GBP: 1.50,
  CAD: 2.00,
  CNY: 0,
  TRY: 0,
  BRL: 0,
  MXN: 0,
  ARS: 0,
  COP: 0,
};

/** ETA for local (same-currency) transfers */
const LOCAL_ETA = { min: 0, max: 1 };

// ---------------------------------------------------------------------------
// Volume discount threshold
// If the send amount exceeds this USD-equivalent, show a discount hint.
// ---------------------------------------------------------------------------
export const VOLUME_THRESHOLD_USD = 10_000;

// ---------------------------------------------------------------------------
// Non-local (cross-currency) defaults
// Used when no corridor-specific override exists.
// ---------------------------------------------------------------------------
const DEFAULT_FEE: FeeRule = { type: 'percentage', value: 2.0, min: 5, max: 50 };
const DEFAULT_FX_MARKUP = 0.5;   // 0.5% over mid-market
const DEFAULT_ETA = { min: 1, max: 3 };

// ---------------------------------------------------------------------------
// Corridor-specific overrides (from → to)
// Only need to list routes that differ from the default.
// Values aligned with real Payoneer fee ranges (indicative, ±5%).
// ---------------------------------------------------------------------------
type Override = Partial<Pick<PricingRule, 'fee' | 'fxMarkupPercent' | 'etaDays'>>;

const overrides: Record<string, Override> = {
  // ─── Major corridors: ~1% fee, ~0.2% FX markup, fast ETA ────────────
  'USD->EUR': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.2, etaDays: { min: 0, max: 1 } },
  'USD->GBP': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.2, etaDays: { min: 0, max: 1 } },
  'EUR->USD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.2, etaDays: { min: 0, max: 1 } },
  'EUR->GBP': { fee: { type: 'percentage', value: 0.8, min: 3, max: 25 }, fxMarkupPercent: 0.15, etaDays: { min: 0, max: 1 } },
  'GBP->USD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.2, etaDays: { min: 0, max: 1 } },
  'GBP->EUR': { fee: { type: 'percentage', value: 0.8, min: 3, max: 25 }, fxMarkupPercent: 0.15, etaDays: { min: 0, max: 1 } },
  'USD->CAD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.2, etaDays: { min: 0, max: 1 } },
  'CAD->USD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.2, etaDays: { min: 0, max: 1 } },

  // ─── Mid-tier corridors: ~1.5–2% fee, ~0.4–0.5% FX markup ──────────
  'USD->CNY': { fee: { type: 'percentage', value: 1.5, min: 5, max: 40 }, fxMarkupPercent: 0.4, etaDays: { min: 1, max: 2 } },
  'USD->BRL': { fee: { type: 'percentage', value: 2.0, min: 5, max: 50 }, fxMarkupPercent: 0.5, etaDays: { min: 1, max: 3 } },
  'USD->MXN': { fee: { type: 'percentage', value: 1.8, min: 5, max: 45 }, fxMarkupPercent: 0.4, etaDays: { min: 1, max: 2 } },
  'EUR->BRL': { fee: { type: 'percentage', value: 2.0, min: 5, max: 50 }, fxMarkupPercent: 0.5, etaDays: { min: 1, max: 3 } },
  'EUR->MXN': { fee: { type: 'percentage', value: 1.8, min: 5, max: 45 }, fxMarkupPercent: 0.4, etaDays: { min: 1, max: 3 } },
  'GBP->BRL': { fee: { type: 'percentage', value: 2.0, min: 5, max: 50 }, fxMarkupPercent: 0.5, etaDays: { min: 1, max: 3 } },

  // ─── Exotic corridors: ~3–4% fee, ~0.7–0.9% FX markup ──────────────
  'USD->ARS': { fee: { type: 'percentage', value: 3.5, min: 8, max: 60 }, fxMarkupPercent: 0.9, etaDays: { min: 1, max: 3 } },
  'USD->COP': { fee: { type: 'percentage', value: 2.5, min: 6, max: 50 }, fxMarkupPercent: 0.7, etaDays: { min: 1, max: 3 } },
  'USD->TRY': { fee: { type: 'percentage', value: 2.5, min: 5, max: 50 }, fxMarkupPercent: 0.8, etaDays: { min: 1, max: 2 } },
  'EUR->TRY': { fee: { type: 'percentage', value: 2.5, min: 5, max: 50 }, fxMarkupPercent: 0.8, etaDays: { min: 1, max: 2 } },
  'EUR->ARS': { fee: { type: 'percentage', value: 3.5, min: 8, max: 60 }, fxMarkupPercent: 0.9, etaDays: { min: 1, max: 3 } },
  'EUR->COP': { fee: { type: 'percentage', value: 2.5, min: 6, max: 50 }, fxMarkupPercent: 0.7, etaDays: { min: 1, max: 3 } },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Check if a corridor is local (same-currency, no FX). */
export function isLocalCorridor(from: string, to: string): boolean {
  return from === to;
}

/** Get the flat fee for a local (same-currency) transfer. */
export function getLocalFee(currency: string): number {
  return localFees[currency] ?? 0;
}

/** Get the full pricing rule for a non-local corridor, merging defaults + overrides. */
export function getPricingRule(from: string, to: string): PricingRule {
  const o = overrides[`${from}->${to}`] ?? {};
  return {
    from,
    to,
    method: 'bank_transfer',
    fee: o.fee ?? DEFAULT_FEE,
    fxMarkupPercent: o.fxMarkupPercent ?? DEFAULT_FX_MARKUP,
    etaDays: o.etaDays ?? DEFAULT_ETA,
  };
}

/** Get the local pricing rule (flat fee, no FX). */
export function getLocalPricingRule(currency: string): PricingRule {
  const fee = getLocalFee(currency);
  return {
    from: currency,
    to: currency,
    method: 'bank_transfer',
    fee: { type: 'fixed', value: fee, min: fee, max: fee },
    fxMarkupPercent: 0,
    etaDays: LOCAL_ETA,
  };
}

/**
 * Get the mid-market exchange rate from → to (units of `to` per 1 unit of `from`).
 * Uses static seed rates. Prefer `getLiveMidMarketRate()` from fxRateService for live data.
 * Returns null if either currency is missing.
 */
export function getMidMarketRate(from: string, to: string): number | null {
  const f = midMarketRates[from];
  const t = midMarketRates[to];
  if (!f || !t) return null;
  return t / f;
}
