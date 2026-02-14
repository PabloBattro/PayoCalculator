# Violet CTA Gradient + Real Country Flags

**Overall Progress:** `100%`

## TLDR
Two visual corrections: (1) Switch all CTA buttons from flat coral to violet gradient — matching both payoneer.com public site and the internal FX widget. (2) Replace emoji flags with real flag images from flagcdn.com — emoji flags render as "US"/"EU" text on Windows.

## Critical Decisions
- **Violet gradient for CTAs only**: Coral stays for decorative accents (badge, hero text, feature icons, method selector active state, loading bar). This matches payoneer.com's actual pattern: violet = action, coral = decoration.
- **Flag source: flagcdn.com**: Zero dependencies, renders consistently cross-platform, supports all 10 currencies incl. EU flag. URL pattern: `https://flagcdn.com/w80/{code}.png`
- **Keep `flag` emoji in config as fallback**: Added `countryCode` field for flagcdn URLs. Emoji stays as SSR/noscript fallback.
- **Plain `<img>` for flags**: No Next.js `<Image>` needed — flagcdn is a reliable external CDN, and flags are tiny.

## Color reference
- Payoneer.com "Register" button: violet gradient
- Payoneer.com "Open your account" hero CTA: violet gradient
- Internal FX widget "Convert currencies": violet gradient
- Tokens: `--brand-violet-from: #7C6AFF` → `--brand-violet-to: #5B47E0`

## Tasks

- [x] 🟩 **Step 1: Add violet gradient tokens**
  - [x] 🟩 Added `--brand-violet-from` and `--brand-violet-to` to `:root` in `globals.css`
  - [x] 🟩 Registered as `--color-brand-violet-from/to` in `@theme inline`

- [x] 🟩 **Step 2: Switch CTAs to violet gradient**
  - [x] 🟩 Widget CTA: `bg-brand-coral` → `bg-gradient-to-r from-brand-violet-from to-brand-violet-to`
  - [x] 🟩 Header "Get started": same gradient treatment
  - [x] 🟩 Hover/shadow states updated to violet tones

- [x] 🟩 **Step 3: Add countryCode to currency config**
  - [x] 🟩 Added `countryCode: string` to `CurrencyConfig` type
  - [x] 🟩 Populated: USD→us, EUR→eu, GBP→gb, CNY→cn, CAD→ca, TRY→tr, BRL→br, MXN→mx, ARS→ar, COP→co

- [x] 🟩 **Step 4: Replace emoji flags with flagcdn images**
  - [x] 🟩 Created `FlagIcon` component in `CurrencyDropdown.tsx` (renders `<img>` from flagcdn)
  - [x] 🟩 Replaced emoji in trigger pill (28px circular container)
  - [x] 🟩 Replaced emoji in dropdown list (32px circular container)
  - [x] 🟩 Uses `w80` variant for 2× retina quality
