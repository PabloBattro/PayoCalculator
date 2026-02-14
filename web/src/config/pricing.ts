import type { PricingRule, FeeRule } from '@/types/quote';

// ---------------------------------------------------------------------------
// Mid-market rates: units per 1 USD (placeholder — swap to live feed later)
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
// Default pricing (used when no corridor-specific override exists)
// ---------------------------------------------------------------------------
const DEFAULT_FEE: FeeRule = { type: 'percentage', value: 1.5, min: 5, max: 50 };
const DEFAULT_FX_MARKUP = 1.0;   // 1 % over mid-market
const DEFAULT_ETA = { min: 1, max: 3 };

// ---------------------------------------------------------------------------
// Corridor-specific overrides  (from → to)
// Only need to list routes that differ from the default.
// ---------------------------------------------------------------------------
type Override = Partial<Pick<PricingRule, 'fee' | 'fxMarkupPercent' | 'etaDays'>>;

const overrides: Record<string, Override> = {
  // Major corridors — lower fees, faster ETA
  'USD->EUR': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.5, etaDays: { min: 0, max: 1 } },
  'USD->GBP': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.5, etaDays: { min: 0, max: 1 } },
  'EUR->USD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.5, etaDays: { min: 0, max: 1 } },
  'EUR->GBP': { fee: { type: 'percentage', value: 0.8, min: 3, max: 25 }, fxMarkupPercent: 0.4, etaDays: { min: 0, max: 1 } },
  'GBP->USD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.5, etaDays: { min: 0, max: 1 } },
  'GBP->EUR': { fee: { type: 'percentage', value: 0.8, min: 3, max: 25 }, fxMarkupPercent: 0.4, etaDays: { min: 0, max: 1 } },
  'USD->CAD': { fee: { type: 'percentage', value: 1.0, min: 3, max: 30 }, fxMarkupPercent: 0.5, etaDays: { min: 0, max: 1 } },
  'USD->CNY': { fee: { type: 'percentage', value: 1.2, min: 5, max: 40 }, fxMarkupPercent: 0.8, etaDays: { min: 1, max: 2 } },

  // LatAm corridors — higher spreads, longer ETA
  'USD->BRL': { fee: { type: 'percentage', value: 1.4, min: 5, max: 50 }, fxMarkupPercent: 1.2, etaDays: { min: 1, max: 3 } },
  'USD->MXN': { fee: { type: 'percentage', value: 1.3, min: 5, max: 45 }, fxMarkupPercent: 1.0, etaDays: { min: 1, max: 2 } },
  'USD->ARS': { fee: { type: 'percentage', value: 2.0, min: 8, max: 60 }, fxMarkupPercent: 2.0, etaDays: { min: 1, max: 3 } },
  'USD->COP': { fee: { type: 'percentage', value: 1.5, min: 6, max: 50 }, fxMarkupPercent: 1.5, etaDays: { min: 1, max: 3 } },

  // Emerging markets
  'USD->TRY': { fee: { type: 'percentage', value: 1.5, min: 5, max: 50 }, fxMarkupPercent: 1.5, etaDays: { min: 1, max: 2 } },
  'EUR->BRL': { fee: { type: 'percentage', value: 1.4, min: 5, max: 50 }, fxMarkupPercent: 1.2, etaDays: { min: 1, max: 3 } },
  'EUR->MXN': { fee: { type: 'percentage', value: 1.3, min: 5, max: 45 }, fxMarkupPercent: 1.0, etaDays: { min: 1, max: 3 } },
  'GBP->BRL': { fee: { type: 'percentage', value: 1.4, min: 5, max: 50 }, fxMarkupPercent: 1.2, etaDays: { min: 1, max: 3 } },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Get the full pricing rule for a corridor, merging defaults + overrides. */
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

/**
 * Get the mid-market exchange rate from → to (units of `to` per 1 unit of `from`).
 * Returns `null` instead of throwing when a currency is missing from the rate table,
 * so the API route can return a clean 400 instead of a 500.
 */
export function getMidMarketRate(from: string, to: string): number | null {
  const f = midMarketRates[from];
  const t = midMarketRates[to];
  if (!f || !t) return null;
  return t / f;
}

