# Uptime Monitoring Guide

## Overview
We need to ensure Apex OS is always available. Since we cannot use UptimeRobot directly, we recommend setting up an external monitoring service.

## Recommended Services
1.  **Better Stack** (Recommended) - Great UI, reliable.
2.  **Uptime Kuma** (Self-hosted) - Free, open-source.
3.  **StatusCake** - Good free tier.

## Monitoring Endpoints

### 1. Main Application
- **URL:** `https://apexrebate.com` (or your production URL)
- **Expected Status:** 200 OK
- **Keyword Check:** "Apex"

### 2. System Health API
- **URL:** `https://apexrebate.com/api/health`
- **Expected Status:** 200 OK
- **Response Body Check:** `"status":"healthy"`

## Setup Instructions (Generic)

1.  **Create Monitor:** Select "HTTP(s)" check type.
2.  **Enter URL:** Use the Health API URL.
3.  **Frequency:** Set to **1 minute**.
4.  **Alerts:**
    *   **Email:** (Critical)
    *   **Telegram/Slack:** (Instant notification)
5.  **Timeouts:** Set to 30 seconds.
6.  **Retries:** Set to 2 retries (avoid false positives).

## Troubleshooting
If the Health API returns 503:
- Check **Supabase** status (Database connectivity).
- Check **Redis** status (Rate limiting/Cache).
- Check logs in Vercel/Render.
