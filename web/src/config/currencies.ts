import type { CurrencyConfig } from '@/types/quote';

/**
 * Supported currencies for MVP.
 * Top-10 GDP countries + LatAm priority (BRL, MXN, ARS, COP).
 */
export const currencies: CurrencyConfig[] = [
  { code: 'USD', name: 'US Dollar',       symbol: '$',    flag: '🇺🇸', countryCode: 'us', decimals: 2 },
  { code: 'EUR', name: 'Euro',            symbol: '€',    flag: '🇪🇺', countryCode: 'eu', decimals: 2 },
  { code: 'GBP', name: 'British Pound',   symbol: '£',    flag: '🇬🇧', countryCode: 'gb', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan',    symbol: '¥',    flag: '🇨🇳', countryCode: 'cn', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$',   flag: '🇨🇦', countryCode: 'ca', decimals: 2 },
  { code: 'TRY', name: 'Turkish Lira',    symbol: '₺',    flag: '🇹🇷', countryCode: 'tr', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real',  symbol: 'R$',   flag: '🇧🇷', countryCode: 'br', decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso',    symbol: 'Mex$', flag: '🇲🇽', countryCode: 'mx', decimals: 2 },
  { code: 'ARS', name: 'Argentine Peso',  symbol: 'AR$',  flag: '🇦🇷', countryCode: 'ar', decimals: 2 },
  { code: 'COP', name: 'Colombian Peso',  symbol: 'COL$', flag: '🇨🇴', countryCode: 'co', decimals: 0 },
];

/** Look up a currency by code */
export function getCurrency(code: string): CurrencyConfig | undefined {
  return currencies.find((c) => c.code === code);
}

