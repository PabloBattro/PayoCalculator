# Brand Design Tokens — Payoneer

## Source Files
- Logo assets: `brand-assets/` (Halo, Master lockup, Stacked lockup — SVG/PNG/PDF)
- Brand guidelines: `Payo-Brand-Guidelines---Update-v1.0.pdf`
- Color palette: `color-palette.pdf`

## Logo
- **Halo**: Rainbow gradient circle (cyan → blue → purple → magenta → red → orange → yellow → green)
- **Master lockup**: Halo + "Payoneer" wordmark (horizontal)
- **Stacked lockup**: Halo above "Payoneer" wordmark (vertical)
- Preferred format: **SVG** (in `brand-assets/*/SVG/`)

## Colors (extracted from SVGs + known Payoneer brand)

### Primary
| Token              | Hex       | Usage                        |
|--------------------|-----------|------------------------------|
| `brand-dark`       | `#252526` | Text on white / primary text |
| `brand-white`      | `#FFFFFF` | Text on dark backgrounds     |

### Halo Gradient (approximate stops)
| Token              | Hex       | Position |
|--------------------|-----------|----------|
| `halo-cyan`        | `#00D4FF` | 0°       |
| `halo-blue`        | `#0070FF` | 45°      |
| `halo-purple`      | `#7B2FBE` | 90°      |
| `halo-magenta`     | `#E91E8C` | 135°     |
| `halo-red`         | `#FF3D3D` | 180°     |
| `halo-orange`      | `#FF8C00` | 225°     |
| `halo-yellow`      | `#FFD600` | 270°     |
| `halo-green`       | `#00C853` | 315°     |

### Extended Palette (to confirm from `color-palette.pdf`)
| Token              | Hex       | Usage                        |
|--------------------|-----------|------------------------------|
| `coral`            | `#FF6B4A` | CTA buttons, accents         |
| `ocean`            | `#0070FF` | Links, interactive elements  |
| `success`          | `#00C853` | Positive indicators, ETA     |
| `warning`          | `#FFD600` | Warnings                     |
| `error`            | `#FF3D3D` | Errors                       |
| `gray-50`          | `#F9FAFB` | Widget background            |
| `gray-100`         | `#F3F4F6` | Input backgrounds            |
| `gray-200`         | `#E5E7EB` | Borders                      |
| `gray-400`         | `#9CA3AF` | Placeholder text             |
| `gray-600`         | `#4B5563` | Secondary text               |
| `gray-900`         | `#111827` | Primary text (alternative)   |

> ⚠️ Extended palette colors are **approximate** pending extraction from `color-palette.pdf`. Verify before production.

## Typography
- Primary font: **Likely a custom/brand font** — check `Payo-Brand-Guidelines---Update-v1.0.pdf`
- Fallback: `Inter` or `DM Sans` (modern, clean geometric sans-serif)
- For MVP: use `Inter` (available via Google Fonts / next/font)

## Design Principles (from Revolut/Wise reference screenshots)
- Clean white card on subtle background
- Large, bold amounts (recipient gets)
- Expandable fee breakdown with mathematical notation (−, =, ×)
- Currency selector with flag + search
- Info tooltips on hover (exchange rate explanation)
- ETA with icon (⚡ or 🕐)
- Intermediary bank disclaimer at bottom
- CTA button at bottom ("Get started" / "Send money")
- Smooth animations on expand/collapse, currency change, amount recalculation

