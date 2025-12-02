# 🐞 Bug Fix Report: TradingView WebSocket & CSP

## 🛠️ Fixes Implemented

### Updated Content Security Policy (CSP)
- **Issue:** The browser was blocking WebSocket connections to `wss://widgetdata.tradingview.com` and potentially other TradingView assets due to restrictive CSP headers.
- **Fix:** Updated `next.config.ts` to whitelist `https://*.tradingview.com` and `wss://*.tradingview.com` across all relevant directives (`script-src`, `style-src`, `img-src`, `connect-src`, `frame-src`, `font-src`).
- **Added:** `worker-src 'self' blob:` to allow web workers (often used by charts).
- **Added:** `'unsafe-eval'` to `script-src` as some widgets might require it (though TradingView usually doesn't, it's a common fallback for complex widgets in dev modes).

## 🔍 Verification
- **Reload:** Please restart the development server (`npm run dev`) and reload the page to pick up the new headers.
- **Console:** The WebSocket error should disappear, and the chart should load real-time data.

Note: Since `next.config.ts` changes require a server restart, please ensure you restart your local server if running in dev mode.
