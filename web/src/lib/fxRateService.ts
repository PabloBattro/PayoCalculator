/**
 * FX Rate Service — fetches live mid-market rates from Open Exchange Rates.
 *
 * Strategy:
 *   1. Lazy refresh: only fetch when a quote is requested AND cache is stale (>TTL).
 *   2. In-memory cache (fine for single Vercel instance).
 *   3. Fallback chain: live API → cached rates → static seed from pricing.ts.
 *
 * Provider: Open Exchange Rates (free tier, 1,000 req/month, USD base, hourly updates).
 */

import { midMarketRates as staticSeed } from '@/config/pricing';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const API_BASE = 'https://openexchangerates.org/api/latest.json';
const FETCH_TIMEOUT_MS = 5_000; // 5 second timeout for API calls

// ---------------------------------------------------------------------------
// Cache state (module-level singleton — persists across requests in same instance)
// ---------------------------------------------------------------------------

interface RateCache {
  /** Rates keyed by currency code — units per 1 USD */
  rates: Record<string, number>;
  /** Timestamp of last successful fetch */
  fetchedAt: number;
  /** Whether the cached data came from a live API call (vs static seed) */
  isLive: boolean;
}

let cache: RateCache = {
  rates: { ...staticSeed },
  fetchedAt: 0,
  isLive: false,
};

/** Tracks whether a fetch is already in-flight to avoid duplicate calls */
let fetchInProgress: Promise<void> | null = null;

/** Timestamp of last failed fetch — used for backoff cooldown */
let lastFailedAt = 0;
const FAILURE_COOLDOWN_MS = 60_000; // 60 seconds before retrying after a failure

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FxRateResult {
  /** Rates: units of currency per 1 USD */
  rates: Record<string, number>;
  /** True if serving stale/fallback data (API was unreachable) */
  stale: boolean;
}

/**
 * Get the latest FX rates (units per 1 USD).
 * Transparently handles caching, refresh, and fallback.
 */
export async function getLatestRates(): Promise<FxRateResult> {
  const now = Date.now();
  const cacheAge = now - cache.fetchedAt;

  // Cache is fresh — return immediately
  if (cacheAge < CACHE_TTL_MS && cache.isLive) {
    return { rates: cache.rates, stale: false };
  }

  // Cache is stale — attempt refresh (deduplicated, with failure backoff)
  const inCooldown = now - lastFailedAt < FAILURE_COOLDOWN_MS;

  if (!fetchInProgress && !inCooldown) {
    fetchInProgress = refreshRates().finally(() => {
      fetchInProgress = null;
    });
  }

  if (fetchInProgress) {
    await fetchInProgress;
  }

  return {
    rates: cache.rates,
    stale: !cache.isLive || Date.now() - cache.fetchedAt > CACHE_TTL_MS,
  };
}

/**
 * Get the mid-market exchange rate from → to (units of `to` per 1 unit of `from`).
 * Uses USD triangulation since all rates are expressed per 1 USD.
 * Returns null if either currency is missing from the rate table.
 */
export async function getLiveMidMarketRate(
  from: string,
  to: string,
): Promise<{ rate: number; stale: boolean } | null> {
  const { rates, stale } = await getLatestRates();

  const f = rates[from];
  const t = rates[to];
  if (!f || !t) return null;

  return { rate: t / f, stale };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function refreshRates(): Promise<void> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;

  if (!appId) {
    // No API key configured — stay on static seed, mark as not-live
    console.warn('[fxRateService] OPEN_EXCHANGE_RATES_APP_ID not set — using static rates');
    return;
  }

  try {
    const url = `${API_BASE}?app_id=${appId}`;

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Open Exchange Rates API returned ${res.status}: ${await res.text()}`);
    }

    const data: { rates: Record<string, number> } = await res.json();

    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid response structure from Open Exchange Rates');
    }

    // Update cache with live data
    cache = {
      rates: { ...staticSeed, ...data.rates },  // merge: live overwrites seed, seed fills gaps
      fetchedAt: Date.now(),
      isLive: true,
    };

    console.log(`[fxRateService] Refreshed ${Object.keys(data.rates).length} rates`);
  } catch (err) {
    // API failed — keep serving whatever we have in cache
    const msg = err instanceof Error ? `${err.message}${err.cause ? ` | cause: ${err.cause}` : ''}` : String(err);
    console.error('[fxRateService] Failed to refresh rates:', msg);
    // Record failure time — prevents retry storms during outages
    lastFailedAt = Date.now();
  }
}

