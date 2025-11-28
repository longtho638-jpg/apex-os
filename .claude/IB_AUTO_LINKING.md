# Claude Commands for IB Auto-Linking Project

This file maps common development commands for the IB Auto-Linking feature.

## Database Setup

```bash
# Run SQL migration to create user_exchange_accounts table
psql $DATABASE_URL -f .claude/ib_linking_schema.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `.claude/ib_linking_schema.sql`
3. Run query

## API Testing

### Test Verify Account Endpoint
```bash
# Get JWT token first (from browser DevTools)
export JWT_TOKEN="your-jwt-token-here"

# Test verification
curl -X POST https://apexrebate.com/api/v1/user/verify-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "exchange": "binance",
    "user_uid": "12345678"
  }'
```

### Get User's Linked Accounts
```bash
curl -X GET https://apexrebate.com/api/v1/user/verify-account \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Local Development

```bash
# Start dev server
npm run dev

# Test SmartSwitchWizard
# Navigate to: http://localhost:3000/vi/landing
# Or: http://localhost:3000/vi/dashboard (if logged in)
```

## Files Modified

- `src/app/api/v1/user/verify-account/route.ts` - New API endpoint
- `src/components/dashboard/SmartSwitchWizard.tsx` - Updated to call API
- `.claude/ib_linking_schema.sql` - Database schema

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
VAULT_KEY_MASTER=your-vault-key  # For decrypting API keys
```

## TODO: Real Exchange API Integration

Currently using MOCK verification. To implement real integration:

1. **Binance Broker API**
   - Docs: https://binance-docs.github.io/apidocs/spot/en/#broker-general-endpoints
   - Decrypt Master API Key from `exchange_configs`
   - Call `GET /sapi/v1/broker/subAccountHistory`
   - Check if user_uid exists under partner_uuid

2. **Bybit Broker API**
   - Docs: https://bybit-exchange.github.io/docs/v5/broker/account-info
   - Similar flow

3. **Error Handling**
   - If API fails → Store as "pending" for manual review
   - Notify admin via email/Slack

## Monitoring

```sql
-- Check recent verifications
SELECT 
  u.email,
  uea.exchange,
  uea.user_uid,
  uea.verification_status,
  uea.verification_attempts,
  uea.last_verified_at
FROM user_exchange_accounts uea
JOIN auth.users u ON uea.user_id = u.id
ORDER BY uea.last_verified_at DESC
LIMIT 20;

-- Count by status
SELECT 
  verification_status,
  COUNT(*) as count
FROM user_exchange_accounts
GROUP BY verification_status;
```
