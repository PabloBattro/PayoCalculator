# Pricing Engine v2 — Live FX + Realistic Fees

**Overall Progress:** `100%`

## TLDR
Upgrade the pricing engine from static/placeholder values to live FX rates (Open Exchange Rates) and realistic Payoneer fee structures. Adds local vs non-local fee logic, same-currency transfer support (no FX section), volume discount hints, and cached FX with fallback.

## Critical Decisions
- **FX provider**: Open Exchange Rates free tier (1,000 req/month, USD base, hourly updates)
- **Cache strategy**: Lazy refresh — only call API when quote requested AND cache >10 min old. In-memory cache (fine for single Vercel instance)
- **Fallback**: Serve last cached rate + attach "rates may be delayed" disclaimer
- **Local vs non-local**: `sendCurrency === receiveCurrency` → local (flat fee, no FX). Otherwise → non-local (% fee + FX markup)
- **Local flat fees**: $1.50 / €1.50 / £1.50 for major currencies. Zero for exotic (CNY, TRY, BRL, MXN, ARS, COP)
- **FX markup**: 0.1–0.2% major pairs, 0.4–0.5% mid-tier, 0.7–0.9% exotic (closer to real Payoneer)
- **Non-local fees**: ~1% major, ~2% mid-tier, ~3–4% exotic
- **Volume hint**: If send amount > $10,000 USD equivalent → show animated banner ("You may qualify for lower fees")
- **Same-currency UI**: Hide exchange rate / FX breakdown section entirely

## Tasks

- [x] 🟩 **Step 1: Update Types & Data Model**
  - [x] 🟩 Add `VolumeHint` type to `types/quote.ts`
  - [x] 🟩 Add `volumeHint?` field to `QuoteResponse`
  - [x] 🟩 Add `isLocalTransfer` boolean to `QuoteResponse` (frontend uses to hide FX section)
  - [x] 🟩 Add `rateStale?` boolean + `rateDisclaimer?` string to `QuoteResponse` (for fallback scenario)

- [x] 🟩 **Step 2: Live FX Rate Service**
  - [x] 🟩 Create `lib/fxRateService.ts` — fetches from Open Exchange Rates API
  - [x] 🟩 In-memory cache with 10-min TTL (lazy refresh on demand)
  - [x] 🟩 Fallback: if API fails or times out, return last cached rates + `stale: true` flag
  - [x] 🟩 Env var `OPEN_EXCHANGE_RATES_APP_ID` (add to `.env.local` + `.env.example`)
  - [x] 🟩 Keep static `midMarketRates` in `pricing.ts` as ultimate fallback seed

- [x] 🟩 **Step 3: Refactor Pricing Config**
  - [x] 🟩 Add `localFees` table to `pricing.ts` (flat fee per currency: USD→1.50, EUR→1.50, GBP→1.50, rest→0)
  - [x] 🟩 Update non-local corridor overrides with realistic fees (1–4% range)
  - [x] 🟩 Update FX markup values (0.1–0.9% range, per corridor)
  - [x] 🟩 Add `volumeThresholdUSD` constant (10,000)
  - [x] 🟩 Add helper `getLocalFee(currency)` and `isLocalCorridor(from, to)` → `from === to`

- [x] 🟩 **Step 4: Update Quote Engine**
  - [x] 🟩 Refactor `calculateQuote()` to branch on local vs non-local
  - [x] 🟩 Local path: flat fee, no FX conversion, `receiveAmount = sendAmount - fee`
  - [x] 🟩 Non-local path: existing logic with updated values
  - [x] 🟩 Swap `getMidMarketRate()` to use `fxRateService` (with fallback to static)
  - [x] 🟩 Add volume hint logic: if `sendAmount > thresholdInSendCurrency` → attach `volumeHint`
  - [x] 🟩 Populate `isLocalTransfer`, `rateStale`, `rateDisclaimer` in response

- [x] 🟩 **Step 5: Update API Route**
  - [x] 🟩 Allow `sendCurrency === receiveCurrency` (removed existing validation that blocks it)
  - [x] 🟩 `calculateQuote` is now `async` — updated to `await`
  - [x] 🟩 Pass through new response fields (`volumeHint`, `isLocalTransfer`, `rateStale`)

- [x] 🟩 **Step 6: Frontend — Same-Currency & Volume Hint**
  - [x] 🟩 Hide FX breakdown section when `isLocalTransfer === true` (new `LocalBreakdown` component)
  - [x] 🟩 Show animated volume discount banner when `volumeHint` is present (Framer Motion slide-in)
  - [x] 🟩 Show "rates may be delayed" subtle indicator when `rateStale === true`
  - [x] 🟩 Adjust fee breakdown labels for local transfers (show flat fee, hide "Amount you'll convert")
  - [x] 🟩 Remove `exclude` prop from `CurrencyDropdown` to allow same-currency selection

- [x] 🟩 **Step 7: Smoke Test & Verify**
  - [x] 🟩 `next build` passes with zero errors
  - [x] 🟩 Non-local USD→BRL: 2.0% fee, live rate 5.219, 0.5% markup ✅
  - [x] 🟩 Local USD→USD: $1.50 flat fee, no FX section, `isLocalTransfer: true` ✅
  - [x] 🟩 Volume hint $15K USD→BRL: banner fires with "$10,000" threshold ✅
  - [x] 🟩 FX fallback (corp proxy blocked TLS): static seed used + stale disclaimer ✅
  - [x] 🟩 Exotic USD→ARS: 3.5% fee, 0.90% FX markup ✅
  - [x] 🟩 Free local BRL→BRL: $0 fee, "No transfer fee", full amount received ✅
