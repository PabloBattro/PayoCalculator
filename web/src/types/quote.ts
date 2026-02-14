/** Transfer method — only bank_transfer for MVP */
export type TransferMethod = 'bank_transfer';

/** Direction of the quote calculation */
export type QuoteDirection = 'send' | 'receive';

/** POST /api/quote request body */
export interface QuoteRequest {
  sendCurrency: string;
  receiveCurrency: string;
  amount: number;
  direction: QuoteDirection;
  method: TransferMethod;
}

/** Volume discount hint — shown when amount exceeds threshold */
export interface VolumeHint {
  message: string;
  thresholdFormatted: string;   // e.g. "$10,000"
}

/** POST /api/quote response body */
export interface QuoteResponse {
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  fee: number;
  feeCurrency: string;
  feeLabel: string;
  /** Amount after fees, before FX conversion. Equals sendAmount - fee. */
  amountToConvert: number;
  /** Customer exchange rate (mid-market minus markup). 0 for local transfers. */
  exchangeRate: number;
  /** Mid-market rate before markup. 0 for local transfers. */
  midMarketRate: number;
  eta: string;
  etaLabel: string;
  method: TransferMethod;
  disclaimers: string[];
  /** True when sendCurrency === receiveCurrency (flat fee, no FX) */
  isLocalTransfer: boolean;
  /** Present when FX rate cache is stale (API down, serving cached data) */
  rateStale?: boolean;
  /** Disclaimer shown when rates are stale */
  rateDisclaimer?: string;
  /** Shown when send amount exceeds volume discount threshold */
  volumeHint?: VolumeHint;
}

/** Currency metadata */
export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
}

/** Fee rule for a corridor */
export interface FeeRule {
  type: 'percentage' | 'fixed';
  value: number;
  min: number;
  max: number;
}

/** Pricing rule for a corridor + method */
export interface PricingRule {
  from: string;
  to: string;
  method: TransferMethod;
  fee: FeeRule;
  fxMarkupPercent: number;
  etaDays: { min: number; max: number };
}
