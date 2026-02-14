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

/** POST /api/quote response body */
export interface QuoteResponse {
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  fee: number;
  feeCurrency: string;
  feeLabel: string;
  amountToConvert: number;
  exchangeRate: number;
  midMarketRate: number;
  eta: string;
  etaLabel: string;
  method: TransferMethod;
  disclaimers: string[];
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

