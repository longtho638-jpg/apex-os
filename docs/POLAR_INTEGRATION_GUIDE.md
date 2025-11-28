# Polar.sh Integration Guide

## Overview
We use [Polar.sh](https://polar.sh) to handle SaaS subscriptions for Apex OS. It handles billing, invoicing, and taxes (Merchant of Record).

## Setup Steps

1.  **Create Account:** Go to [polar.sh](https://polar.sh) and sign up via GitHub.
2.  **Create Organization:** Create an organization for "Apex OS".
3.  **Create Products:**
    *   **Free Tier:** $0/month
    *   **Pro Tier:** $29/month
    *   **Whale Tier:** $99/month
4.  **Get API Keys:**
    *   Go to Settings -> Developers.
    *   Create a "Personal Access Token" (for backend API calls).
5.  **Setup Webhooks:**
    *   Endpoint: `https://apexrebate.com/api/webhooks/polar`
    *   Events: `subscription.created`, `subscription.updated`, `subscription.deleted`
    *   Get the **Webhook Secret**.

## Configuration

Add to `.env.local`:

```bash
POLAR_ACCESS_TOKEN=your_token_here
POLAR_WEBHOOK_SECRET=your_webhook_secret_here
POLAR_ORGANIZATION_ID=your_org_id
```

## Testing
Polar provides a sandbox environment. Use the sandbox keys during development.
