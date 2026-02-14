import type { CurrencyConfig } from '@/types/quote';

/**
 * Supported currencies for MVP.
 * Top-10 GDP countries + LatAm priority (BRL, MXN, ARS, COP).
 */
export const currencies: CurrencyConfig[] = [
  { code: 'USD', name: 'US Dollar',       symbol: '$',    flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', name: 'Euro',            symbol: '€',    flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', name: 'British Pound',   symbol: '£',    flag: '🇬🇧', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan',    symbol: '¥',    flag: '🇨🇳', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$',   flag: '🇨🇦', decimals: 2 },
  { code: 'TRY', name: 'Turkish Lira',    symbol: '₺',    flag: '🇹🇷', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real',  symbol: 'R$',   flag: '🇧🇷', decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso',    symbol: 'Mex$', flag: '🇲🇽', decimals: 2 },
  { code: 'ARS', name: 'Argentine Peso',  symbol: 'AR$',  flag: '🇦🇷', decimals: 2 },
  { code: 'COP', name: 'Colombian Peso',  symbol: 'COL$', flag: '🇨🇴', decimals: 0 },
];

/** Look up a currency by code */
export function getCurrency(code: string): CurrencyConfig | undefined {
  return currencies.find((c) => c.code === code);
}

