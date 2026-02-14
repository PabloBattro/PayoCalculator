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
│  │  │  │ Fee  │  │  FX    │  │    ETA       │ │ │  │
│  │  │  │ Rules│  │ Markup │  │   Rules      │ │ │  │
│  │  │  └──────┘  └────────┘  └──────────────┘ │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │       ↕                                       │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │    Pricing Config (JSON / DB later)      │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Layers

### 1. Quote Widget (Frontend)
- **Framework**: Next.js 15 App Router + React Server Components where applicable
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Responsibilities**:
  - Render amount inputs, currency selectors, fee breakdown, ETA, disclaimers
  - Debounce user input → call `/api/quote`
  - Display loading skeletons during API call
  - Support "You send" / "Recipient gets" toggle
  - No pricing logic — only presentation

### 2. Quote API (Backend)
- **Route**: `POST /api/quote`
- **Request**:
  ```json
  {
    "sendCurrency": "USD",
    "receiveCurrency": "BRL",
    "amount": 1000,
    "direction": "send" | "receive",
    "method": "bank_transfer"
  }
  ```
- **Response**:
  ```json
  {
    "sendAmount": 1000,
    "sendCurrency": "USD",
    "receiveAmount": 4782.71,
    "receiveCurrency": "BRL",
    "fee": 14.11,
    "feeCurrency": "USD",
    "feeLabel": "Bank transfer fees",
    "amountToConvert": 985.89,
    "exchangeRate": 4.85102,
    "midMarketRate": 4.90000,
    "eta": "2026-02-18",
    "etaLabel": "Should arrive by Tuesday",
    "method": "bank_transfer",
    "disclaimers": [
      "Indicative quote. Final fees/rate may differ at execution.",
      "Intermediary banks may charge additional fees.",
      "Rates/fees vary by route and payment details."
    ]
  }
  ```
- **Responsibilities**:
  - Look up fee rules for the corridor
  - Apply FX markup to mid-market rate
  - Calculate amounts in both directions
  - Determine ETA from route config
  - Return normalized quote + disclaimers

### 3. Pricing Engine (Config-Driven)
- **MVP**: JSON config file (`src/config/pricing.ts`)
- **Structure per corridor**:
  ```ts
  {
    from: "USD",
    to: "BRL",
    method: "bank_transfer",
    fee: { type: "percentage", value: 1.41, min: 5.00, max: 50.00 },
    fxMarkup: 0.01,  // 1% over mid-market
    etaDays: { min: 1, max: 3 },
  }
  ```
- **FX rate source (MVP)**: Static mid-market rates in config, refreshed manually
- **FX rate source (future)**: Real-time feed from provider API
- **Responsibilities**:
  - Centralize all pricing logic
  - Never exposed to frontend
  - Easy to swap data source without changing API contract

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Next.js App Router | SSR for SEO, API routes co-located, Vercel deploy |
| Pricing in backend | API route, not client | Security, consistency, legal compliance |
| Config-driven fees | JSON file (MVP) | Fast iteration, no DB needed yet |
| Animation lib | Framer Motion | Best React animation lib for polish |
| FX source | Static mid-rates (MVP) | Unblocks UI; swap to live feed later |
| Positioning | Indicative | Avoids legal risk if pricing varies by contract |

## File Structure (MVP)
```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page with widget
│   │   ├── layout.tsx            # Root layout (fonts, metadata)
│   │   ├── globals.css           # Tailwind + custom tokens
│   │   └── api/
│   │       └── quote/
│   │           └── route.ts      # POST /api/quote handler
│   ├── components/
│   │   ├── QuoteWidget.tsx       # Main widget container
│   │   ├── AmountInput.tsx       # Send / Receive amount input
│   │   ├── CurrencySelector.tsx  # Dropdown with search + flags
│   │   ├── FeeBreakdown.tsx      # Expandable fee section
│   │   ├── ExchangeRate.tsx      # Rate display + tooltip
│   │   ├── EtaDisplay.tsx        # Arrival time display
│   │   └── Disclaimer.tsx        # Legal disclaimers
│   ├── config/
│   │   ├── currencies.ts         # Currency list + flags
│   │   └── pricing.ts            # Fee rules, FX markups, ETAs
│   ├── lib/
│   │   └── quoteEngine.ts        # Core pricing calculation logic
│   └── types/
│       └── quote.ts              # Shared types (request, response)
├── public/
│   └── flags/                    # Country flag SVGs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

