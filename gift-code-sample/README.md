# HNTR — Gift Codes Backoffice

Single self-contained page. No build step, no dependencies.
Open `index.html` in a browser, or drop it into any static host / template.

## Files
- `index.html` — markup, CSS and JS in one file.

## External resources
- Google Fonts: Inter, Space Grotesk, Space Mono (`<link>` in `<head>`).
  Self-host if the deploy target must be offline.

## Theme
Dark by default (`<body class="dark">`), matching the current site.
Light theme is the same page without the `dark` class. The floating
bottom-right button toggles it — remove `.gc-theme` for production if
theme is controlled globally.

## Data
All state lives in the `GF` object at the top of the inline `<script>`:

```js
var GF = {
  balance: 4820,          // available balance, USD
  used:    2150,          // already issued as gift credit
  tiers:   [ {n:'Bronze',v:50}, ... ],   // membership tiers = allowed code values
  filter:  'all',
  codes:   [ { code, amt, note, created, exp, status, by, used } ]
}
```

Code record fields:
| field | meaning |
|---|---|
| `code` | `HNTR-XXXX-XXXX`, generated client-side (see `gfNewCode()`) |
| `amt` | value in USD, must equal a tier value |
| `note` | username of the intended redeemer |
| `created` | ISO date of issue |
| `exp` | ISO date, always created + 7 days (fixed, not user-editable) |
| `status` | `active` / `redeemed` / `expired` |
| `by` | username that actually redeemed |
| `used` | ISO date of redemption |

## Backend hookup
Replace the mock in these three functions:
- `gfRender()` — read from API instead of `GF`; keep the DOM writes.
- `gfGenerate()` — POST { amount, redeemerUsername }; server issues the code,
  enforces the 7-day expiry, tier whitelist and balance check. Client-side
  validation here is UX only, not authoritative.
- `gfExport()` — currently builds the CSV in-browser; swap for a server export
  if the full history exceeds what is loaded.

Redemption happens on the membership page in the main site (`mrRedeem()`), not here.

## Rules implemented
- Code values restricted to membership tiers: 50 / 250 / 750 / 1,500 / 2,500 USD.
- Redeemer username required at issue time; code is single-use and bound to it.
- Expiry fixed at 7 days from issue, not configurable in the UI.
- Generating a code moves the amount from available balance to balance used.
