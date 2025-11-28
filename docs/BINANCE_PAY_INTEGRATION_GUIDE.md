# Binance Pay Integration Guide

## Overview
Binance Pay allows us to accept crypto payments for subscriptions or one-time purchases.

## Setup Steps

1.  **Merchant Account:** Apply for a Binance Pay Merchant account.
2.  **Developer Portal:** Go to the [Binance Pay Developer](https://merchant.binance.com/en/dashboard/developers) dashboard.
3.  **API Keys:**
    *   Generate `Binance Pay API Key`.
    *   Generate `Binance Pay Secret Key`.
4.  **Webhook Setup:**
    *   Endpoint: `https://apexrebate.com/api/webhooks/binance-pay`
    *   Events: `ORDER_PAYMENT_SUCCESS`, `ORDER_PAYMENT_FAILED`
    *   Get the **Webhook Key** (for signature verification).

## Configuration

Add to `.env.local`:

```bash
BINANCE_PAY_API_KEY=your_api_key
BINANCE_PAY_SECRET_KEY=your_secret_key
# Note: Webhook signature verification uses the public key from the certificate or header inspection
```

## Testing
Use the Binance Pay Sandbox environment to simulate payments without real funds.
