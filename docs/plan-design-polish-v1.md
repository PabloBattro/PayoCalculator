# Design Polish v1 — Confirmed Review Fixes

**Overall Progress:** `100%`

## TLDR
Implement 6 confirmed UI/UX improvements from the design review. Focus: fix the most visible trust/conversion gaps without changing brand or layout. All changes are in existing components — no new files needed.

## Critical Decisions
- **Amount formatting**: Format the *non-active* input on API response, not while the user types (avoids cursor-jump issues)
- **CTA tone**: Soft conversion ("Get started — it's free") not hard-sell ("Send now!") — matches indicative positioning
- **Badge pulse removed, color kept**: Coral is the brand accent in our system, not an error color — removing pulse is enough to reduce alert connotation
- **Tooltip uses wrapper tap area**: Visible circle grows slightly (20px), invisible tap zone meets 44px mobile target
- **ETA format**: Show both day name + date ("Tuesday, Feb 18") — friendly + unambiguous

## Tasks

- [x] 🟩 **Step 1: Format all displayed amounts with thousand separators**
  - [x] 🟩 In `QuoteWidget.tsx`, when API response arrives, format *both* inputs via `fmt()` (not just the calculated one)
  - [x] 🟩 Strip commas before `parseFloat` in amount computation (prevents `parseFloat("1,000")` → `1`)
  - [x] 🟩 Verify: type `109809` in Recipient gets → send field shows formatted → swap → both formatted

- [x] 🟩 **Step 2: Add soft CTA button below ETA**
  - [x] 🟩 In `QuoteWidget.tsx`, added primary CTA between the ETA row and disclaimers
  - [x] 🟩 Text: "Get started — it's free" → links to `https://www.payoneer.com/signup/`
  - [x] 🟩 Style: full-width, brand-coral bg, rounded-xl, inside AnimatePresence block
  - [x] 🟩 Only visible when a quote is displayed

- [x] 🟩 **Step 3: Fix math operator contrast**
  - [x] 🟩 Changed all 4 operator spans from `text-gray-300` → `text-gray-400` (FxBreakdown + LocalBreakdown)
  - [x] 🟩 Now meets WCAG 3:1 non-text contrast requirement

- [x] 🟩 **Step 4: Grow exchange rate tooltip target**
  - [x] 🟩 Increased visible `?` circle from `h-3.5 w-3.5` → `h-5 w-5`, font from `text-[9px]` → `text-[11px]`
  - [x] 🟩 Wrapped in invisible tap area (`p-2 -m-2`) to reach ~44px touch target

- [x] 🟩 **Step 5: Remove pulse from "Indicative estimates" badge**
  - [x] 🟩 In `page.tsx`, removed `animate-pulse` class from the dot in the badge
  - [x] 🟩 Kept coral color and coral/10 background (brand-consistent)

- [x] 🟩 **Step 6: Append date to ETA label**
  - [x] 🟩 In `quoteEngine.ts` `formatEta()`, changed "Should arrive by Tuesday" → "Should arrive by Tuesday, Feb 18"
  - [x] 🟩 Used short month format (e.g. "Feb 18", "Mar 3")
  - [x] 🟩 "Should arrive instantly" and "Should arrive by tomorrow" unchanged (no date needed)
