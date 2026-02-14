# Architecture — Payo Calculator

## Overview

```
┌─────────────────────────────────────────────────────┐
│                   PUBLIC WEBSITE                     │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │            Quote Widget (React)                │  │
│  │                                               │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │ You Send│  │ Fee      │  │ Recipient   │  │  │
│  │  │ Input   │→ │ Breakdown│→ │ Gets Output │  │  │
│  │  └─────────┘  └──────────┘  └─────────────┘  │  │
│  │       ↕ debounced                              │  │
│  └───────┼───────────────────────────────────────┘  │
│          │ POST /api/quote                          │
│  ┌───────┼───────────────────────────────────────┐  │
│  │       ↓        Quote API                      │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │          Pricing Engine                   │ │  │
│  │  │  ┌──────┐  ┌────────┐  ┌──────────────┐ │ │  │
│  │  │  │ Fee  │  │Live FX │  │    ETA       │ │ │  │
│  │  │  │ Rules│  │ + Cache │  │   Rules      │ │ │  │
│  │  │  └──────┘  └────────┘  └──────────────┘ │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │       ↕                        ↕              │  │
│  │  ┌──────────────┐  ┌────────────────────────┐ │  │
│  │  │ Pricing      │  │ Open Exchange Rates    │ │  │
│  │  │ Config (TS)  │  │ (live FX, 10-min TTL)  │ │  │
│  │  └──────────────┘  └────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Layers

### 1. Quote Widget (Frontend)
- **Framework**: Next.js 16 App Router
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Responsibilities**:
  - Render amount inputs (formatted with thousand separators), currency selectors, fee breakdown, ETA, disclaimers
  - Debounce user input → call `/api/quote`
  - Display loading skeletons + "Calculating your quote…" message during API call
  - Support "You send" / "Recipient gets" toggle
  - Hide FX breakdown section for same-currency (local) transfers
  - Show animated volume discount banner when applicable
  - Show stale-rate indicator when FX cache is outdated
  - Show "Rate updated X min ago" timestamp near exchange rate
  - Render CTA button ("Get started — it's free") after quote result
  - No pricing logic — only presentation
- **Design tokens**:
  - Violet gradient for CTA buttons (`--brand-violet-from: #7C6AFF` → `--brand-violet-to: #5B47E0`)
  - Coral for decorative accents (badge, loading bar, active tab)
  - Card radius 20px, currency selectors as pill shape with circular flag images
  - Flags via flagcdn.com (`https://flagcdn.com/w80/{countryCode}.png`) — no emoji

### 2. Quote API (Backend)
- **Route**: `POST /api/quote`
- **Request**:
  ```json
  {
    "sendCurrency": "USD",
    "receiveCurrency": "BRL",
    "amount": 1000,
    "direction": "send | receive",
    "method": "bank_transfer"
  }
  ```
  Note: `sendCurrency === receiveCurrency` is allowed (local transfer).
- **Response** (non-local example):
  ```json
  {
    "sendAmount": 1000,
    "sendCurrency": "USD",
    "receiveAmount": 5089.29,
    "receiveCurrency": "BRL",
    "fee": 20,
    "feeCurrency": "USD",
    "feeLabel": "Bank transfer fees",
    "amountToConvert": 980,
    "exchangeRate": 5.193154,
    "midMarketRate": 5.21925,
    "eta": "2026-02-17",
    "etaLabel": "Should arrive by Tuesday",
    "method": "bank_transfer",
    "isLocalTransfer": false,
    "disclaimers": ["..."],
    "volumeHint": { "message": "...", "thresholdFormatted": "$10,000" },
    "rateStale": false,
    "rateDisclaimer": null
  }
  ```
- **Response** (local / same-currency example):
  ```json
  {
    "sendAmount": 500,
    "receiveAmount": 498.50,
    "fee": 1.50,
    "feeLabel": "Transfer fee",
    "exchangeRate": 0,
    "midMarketRate": 0,
    "isLocalTransfer": true
  }
  ```
- **Responsibilities**:
  - Validate inputs (amount range, supported currencies, min amount for local)
  - Branch local vs non-local pricing path
  - Look up fee rules for the corridor
  - Fetch live FX rates (async, via `fxRateService`)
  - Apply FX markup to mid-market rate
  - Attach volume discount hint if amount > $10K USD equivalent
  - Return normalized quote + disclaimers

### 3. Pricing Engine (Config-Driven)
- **Config**: `src/config/pricing.ts` (corridor overrides + defaults)
- **Fee model**:
  - **Local** (same-currency): Flat fee per currency ($1.50 major, free exotic)
  - **Non-local** (cross-currency): Percentage fee (1–4%) with min/max clamps
- **FX markup**: 0.1–0.2% major pairs, 0.4–0.5% mid-tier, 0.7–0.9% exotic
- **Volume hint**: If send amount > $10,000 USD equivalent → attach banner data

### 4. FX Rate Service (`lib/fxRateService.ts`)
- **Provider**: Open Exchange Rates (free tier, 1,000 req/month, USD base)
- **Cache**: In-memory, 10-min TTL, lazy refresh (only fetches on demand)
- **Fallback chain**: Live API → cached rates → static seed (`midMarketRates` in pricing.ts)
- **Failure backoff**: 60s cooldown after a failed fetch to prevent retry storms
- **Stale indicator**: When serving cached/fallback data, response includes `rateStale: true`

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Next.js 16 App Router | SSR for SEO, API routes co-located, Vercel deploy |
| Pricing in backend | API route, not client | Security, consistency, legal compliance |
| Config-driven fees | TS config file | Fast iteration, no DB needed yet |
| Animation lib | Framer Motion | Best React animation lib for polish |
| FX source | Open Exchange Rates (live) | Free tier, USD base, hourly updates, triple fallback |
| FX caching | In-memory, 10-min TTL | Low traffic (~100 req/month), lazy refresh, no DB needed |
| Local transfers | Flat fee, no FX section | Same-currency = no conversion, simplified UI |
| Volume hints | $10K USD threshold | Wise-style nudge, encourages higher-value transfers |
| Positioning | Indicative (±5%) | Avoids legal risk if pricing varies by contract |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPEN_EXCHANGE_RATES_APP_ID` | No | API key for live FX rates. Without it, static seed rates are used. |
| `NODE_TLS_REJECT_UNAUTHORIZED` | No | Set to `0` in dev only to bypass corporate proxy TLS issues. |

## File Structure
```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page with widget
│   │   ├── layout.tsx            # Root layout (fonts, metadata)
│   │   ├── globals.css           # Tailwind + custom tokens
│   │   ├── embed/
│   │   │   ├── page.tsx          # Embeddable widget (iframe)
│   │   │   └── layout.tsx        # Minimal layout for embed
│   │   └── api/
│   │       └── quote/
│   │           └── route.ts      # POST /api/quote handler
│   ├── components/
│   │   ├── QuoteWidget.tsx       # Main widget (inputs, breakdown, ETA, CTA, disclaimers)
│   │   ├── CurrencyDropdown.tsx  # Searchable dropdown with flagcdn.com flag images
│   │   └── MethodSelector.tsx    # Transfer method tabs
│   ├── config/
│   │   ├── currencies.ts         # Currency list + metadata + countryCode for flags (10 currencies)
│   │   └── pricing.ts            # Fee rules, FX markups, ETAs, local fees, thresholds
│   ├── lib/
│   │   ├── quoteEngine.ts        # Core pricing calculation (local + non-local paths)
│   │   └── fxRateService.ts      # Live FX rate fetcher + cache + fallback
│   └── types/
│       └── quote.ts              # Shared types (request, response, config)
├── public/
│   └── payoneer-logo.svg         # Payoneer logo
├── .env.example                  # Environment variable template
├── package.json
└── tsconfig.json
```
