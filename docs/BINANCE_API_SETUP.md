# Binance API Setup

## Prerequisites
1.  A verified Binance account.
2.  API Key management enabled.

## Generating Keys
1.  Log in to Binance.
2.  Go to **API Management**.
3.  Create API Key.
4.  **Permissions Needed:**
    *   Enable Reading (Required for data)
    *   Enable Spot & Margin Trading (Required for execution)
    *   **DO NOT** enable withdrawals.
5.  **IP Restriction:**
    *   Highly recommended to restrict to your server's static IP.

## Configuration
Add to `.env.local`:

```bash
BINANCE_API_KEY=your_api_key_here
BINANCE_SECRET=your_api_secret_here
```

## Testing
Run the test script (to be created) or check the health endpoint if it includes exchange connectivity checks.
