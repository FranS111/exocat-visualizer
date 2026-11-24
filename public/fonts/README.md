# Resist Mono web fonts

Resist Mono (Groteskly Yours) is a commercial typeface and is **not** included in this repo.
Buy a web licence (MyFonts / Fontspring) or use the foundry's trial files, convert to WOFF2 if
needed, and place them here with exactly these names:

| File | Weight | Used for |
| --- | --- | --- |
| `ResistMono-Thin.woff2` | 100 | Large numerals (KPIs, donut, profile stats), hero line, ghost wordmark |
| `ResistMono-Light.woff2` | 300 | Lede / long body text |
| `ResistMono-Regular.woff2` | 400 | UI text, table cells, labels |
| `ResistMono-Medium.woff2` | 500 | Buttons, active toggles, small emphasis |

`src/styles/fonts.css` declares them. Until the files exist the app falls back to
JetBrains Mono, so nothing breaks — the browser just logs a 404 per missing file.
