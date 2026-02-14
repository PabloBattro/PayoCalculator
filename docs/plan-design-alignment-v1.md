# Design Alignment v1 — Match Internal FX Widget Look & Feel

**Overall Progress:** `100%`

## TLDR
Align the Payo Calculator's visual language with the internal Payoneer FX Widget (from Figma). Different products, same design family — like siblings, not twins. We keep our product structure (calculator, fee breakdown, method selector) and coral accent, but adopt their card shape, currency selector style, CTA proportions, and loading UX.

## Critical Decisions
- **Keep coral accent**: The internal widget uses purple (in-app action color). Our public-facing calculator uses coral (brand marketing color). Both are correct for their context.
- **Currency selector pill shape**: Match their rounded-full pill with circular flag container. Replace raw emoji flags with a circular wrapper that looks like their flag circles.
- **Card radius 20px**: Match their card radius exactly (confirmed from Figma Dev Mode).
- **CTA proportions**: Match their full-width, heavily-rounded CTA shape. Keep coral, not purple.
- **Loading state**: Add friendly copy text alongside skeleton (their "Hang on..." pattern), instead of just bare skeleton bars.
- **Swap icon direction**: Keep our vertical arrows (↕) — makes more sense for a vertical send/receive layout vs. their horizontal (⇄) side-by-side selectors.
- **"Last updated" timestamp**: Show near exchange rate using the live FX cache age from our pricing engine.

## Reference
- **Source**: Figma "FX Widget in the Homepage" — Happy case, Mobile simple, Loading state
- **Files touched**: `QuoteWidget.tsx`, `CurrencyDropdown.tsx`, `MethodSelector.tsx`, `fxRateService.ts`, `quoteEngine.ts`, `types/quote.ts`

## Tasks

- [x] 🟩 **Step 1: Card radius — 16px → 20px**
  - [x] 🟩 In `QuoteWidget.tsx`, changed card container from `rounded-2xl` → `rounded-[20px]`
  - [x] 🟩 In `CurrencyDropdown.tsx`, changed dropdown panel from `rounded-xl` → `rounded-[20px]` to match

- [x] 🟩 **Step 2: Restyle currency selector to pill shape**
  - [x] 🟩 Trigger button: `rounded-xl` → `rounded-full`, adjusted padding for pill shape
  - [x] 🟩 Wrapped emoji flag in circular container (`h-7 w-7 rounded-full bg-gray-100`) in trigger
  - [x] 🟩 Wrapped emoji flag in circular container (`h-8 w-8 rounded-full bg-gray-100`) in dropdown list
  - [x] 🟩 Consistent flag presentation between trigger and list

- [x] 🟩 **Step 3: CTA button — match proportions**
  - [x] 🟩 Border-radius: `rounded-xl` → `rounded-2xl`
  - [x] 🟩 Vertical padding: `py-3` → `py-3.5`
  - [x] 🟩 Font size: `text-sm` → `text-[15px]`

- [x] 🟩 **Step 4: Friendlier loading state**
  - [x] 🟩 Added "Calculating your quote..." text below skeleton bars
  - [x] 🟩 Styled: `text-xs text-gray-400 text-center`

- [x] 🟩 **Step 5: "Last updated" timestamp near exchange rate**
  - [x] 🟩 Extended `getLiveMidMarketRate()` to return `fetchedAt` timestamp
  - [x] 🟩 Added `rateUpdatedAt?: string` to `QuoteResponse` type
  - [x] 🟩 Populated `rateUpdatedAt` in `calculateNonLocalQuote()`
  - [x] 🟩 Created `RateTimestamp` component showing relative time ("just now", "3 min ago") or absolute ("12:30 PM")
  - [x] 🟩 Displayed below exchange rate in `FxBreakdown` (non-local only)

- [x] 🟩 **Step 6: Method selector tab shape refinement**
  - [x] 🟩 Border-radius: `rounded-lg` → `rounded-xl`
  - [x] 🟩 Padding: `px-3 py-2` → `px-3.5 py-2.5`
  - [x] 🟩 Layout animation background matched to `rounded-xl`
