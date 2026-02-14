# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Added
- CTA button ("Get started — it's free") below the quote result, linking to Payoneer signup
- "Rate updated X min ago" timestamp below exchange rate (uses live FX cache age)
- "Calculating your quote…" friendly loading message alongside skeleton bars
- Violet gradient CSS tokens (`--brand-violet-from`, `--brand-violet-to`) for CTA buttons
- `countryCode` field on `CurrencyConfig` for flag image lookups
- `FlagIcon` component — renders real flag images from flagcdn.com (consistent cross-platform)
- Full date in ETA label (e.g. "Should arrive by Tuesday, Feb 18")

### Changed
- Quote widget (FX breakdown): removed explicit "FX markup included" line from expanded fee details and moved FX fee explanation to the exchange-rate tooltip text
- CTA buttons (header + widget) switched from flat coral to violet gradient, matching payoneer.com public site
- Currency selectors restyled to pill shape with circular flag containers (matches internal FX widget)
- Card container radius changed from 16px to 20px
- Method selector tab radius changed from `rounded-lg` to `rounded-xl`
- Dropdown panel radius changed to 20px to match card
- Emoji flags replaced with flagcdn.com images in currency dropdown (fixes Windows rendering)
- Math operators (−, =, ×) contrast bumped from `text-gray-300` to `text-gray-400` (WCAG 3:1)
- Exchange rate tooltip `?` circle enlarged from 14px to 20px with 44px invisible tap area
- "Indicative estimates" badge: removed pulse animation (coral color kept)
- All displayed amounts now formatted with thousand separators

