# 🐞 Bug Fix Report: Referral Stats 401 Unauthorized

## 🛠️ Fix Implemented

### Fixed `/api/v1/referral/stats` Authentication Logic
- **Issue:** The API endpoint was strictly requiring an `Authorization: Bearer <token>` header. However, the frontend client uses **HttpOnly cookies** for session management and does not expose the token to the client-side JavaScript to be added as a header.
- **Fix:** Updated `src/app/api/v1/referral/stats/route.ts` to fall back to checking authentication cookies (`apex_session`, `sb-access-token`, etc.) if the `Authorization` header is missing.
- **Result:** The endpoint now correctly authenticates requests from the dashboard using the session cookie.

## 🔍 Verification
- **Endpoint:** `GET /api/v1/referral/stats`
- **Auth Method:** Hybrid (Header OR Cookie)
- **Status:** **FIXED** ✅

The Affiliate Dashboard should now load referral statistics without error.
