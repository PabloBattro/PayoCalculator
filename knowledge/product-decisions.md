# Product Decisions — Payo Calculator

## Problem Statement
Payoneer does not provide a public transfer cost estimator. Prospects cannot self-serve pricing answers, Sales must explain manually, and there is a transparency gap vs Wise/Revolut. This creates acquisition friction, inconsistent quoting, and reduced trust.

## Goal
A **public, self-serve "quote preview layer"** that increases trust, reduces friction, and aligns Payoneer with modern cross-border expectations.

## Core Principle
> **Frontend presents. Backend calculates.**
> Pricing rules remain centralized. The widget consumes standardized quotes.

No fee/FX rules hardcoded in the client. Prevents exposure of sensitive pricing logic, legal inconsistencies, and divergence from actual applied pricing.

## MVP Scope

### Transfer Product
- **Payoneer → Bank transfer** (first and only for MVP)
- Payoneer → Payoneer and Card purchase: designed in UI as future tabs, not functional in v1

### Corridors / Currencies (10)
`USD`, `EUR`, `GBP`, `CNY`, `CAD`, `TRY`, `BRL`, `MXN`, `ARS`, `COP`
- Based on top-10 GDP countries + LatAm priority (Brazil, Argentina, Colombia, Mexico)

### Input Modes
- **"You send"** (source amount) — default
- **"Recipient gets"** (target amount)
- Both toggleable, like Wise/Revolut

### Required Output Fields
1. **You send** (amount + source currency)
2. **Recipient gets** (amount + destination currency)
3. **Transfer method** (Bank transfer; UI supports future expansion)
4. **Fee breakdown** (expandable/collapsible):
   - Transfer fee (fixed / % as one line)
   - Amount you'll convert (= send − fees, in "You send" mode)
   - Exchange rate (with info tooltip explaining FX markup)
5. **Total cost** (what user pays)
6. **Net received** (what recipient gets)
7. **Estimated arrival time (ETA)** (route-based average; "by Tuesday" / date style)
8. **Disclaimers** (short + link):
   - "Indicative quote. Final fees/rate may differ at execution."
   - "Intermediary banks may charge additional fees."
   - "Rates/fees vary by route and payment details."

### Nice-to-Have (post-MVP)
- Promo/threshold banner ("Sending over X? Lower fees apply")
- Volume-based incentives
- Method-based upsell (compare Bank vs Payoneer-to-Payoneer vs Card)
- Demand sensing (which routes users simulate most)

### Positioning
- **Indicative** — not guaranteed
- Clear, honest disclaimers
- Goal: build trust, not overpromise

## FX Rate Source (MVP)
- Placeholder mid-rates + configurable FX markup to generate indicative rate
- Later swap to real FX provider without changing UI contract

## Fee Display
- Fees shown in **send currency only** (recommended for clarity)
- Breakdown shows "Amount you'll convert" like Revolut

## FX Tooltip Text
- "Includes an exchange markup" (transparent approach)

## Risks / Tradeoffs
- If real Payoneer pricing varies by contract/segment, the widget must stay clearly **indicative** to avoid misleading expectations
- Pricing engine is config-driven for now; DB-backed rules engine planned for scale

