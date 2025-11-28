# Payment Integration - Quick Reference

## 🎯 Workflow Overview

```
┌─────────────────────────────────────────────┐
│  1. Gemini CLI Executes Implementation     │
│     (7-8 hours estimated)                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  2. Claude Reviews & Debugs                 │
│     (Using debug checklist)                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  3. Manual Testing                          │
│     (Staging environment)                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  4. Production Deployment                   │
└─────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Guide

### Step 1: Assign Task to Gemini CLI

**Open new Gemini CLI session**:
```bash
cd /Users/macbookprom1/apex-os
gemini
```

**Paste this prompt**:
```
Read .gemini/PAYMENT_INTEGRATION_TASK.md and execute the full payment integration plan. This is a P0 critical task for implementing Polar.sh + Binance Pay dual gateway system. Confirm you have read the implementation plan artifact and all required agents before starting.
```

**What Gemini will do**:
- Read implementation plan (artifact)
- Consult 4 agents (code-reviewer, database-admin, tester, ui-ux)
- Execute 5 phases (Setup → Config → Backend → Frontend → Testing)
- Create 20+ files
- Run tests
- Commit with conventional format

**Estimated time**: 7-8 hours

---

### Step 2: Real-Time Monitoring (Optional)

While Gemini works, you can monitor:

```bash
# Watch file creation
watch -n 5 'find src/lib/payments src/app/api/webhooks -type f 2>/dev/null | wc -l'

# Monitor commits
watch -n 10 'git log --oneline -5'

# Check tests
watch -n 30 'npm test -- --passWithNoTests 2>&1 | tail -5'
```

---

### Step 3: Claude Review & Debug

**After Gemini completes**, Claude will use the debug checklist:

**Command for Claude**:
```
Review the payment integration implementation using .gemini/PAYMENT_DEBUG_CHECKLIST.md. Run all checks in Phase 1 (Code Review), Phase 2 (Functional Testing), Phase 3 (Common Issues), and provide a comprehensive report with any bugs found.
```

**Claude will check**:
1. ✅ Security (secrets, signatures, RLS)
2. ✅ Code quality (TypeScript, tests, coverage)
3. ✅ Database schema
4. ✅ API endpoints
5. ✅ Webhooks
6. ✅ Frontend components

**Output**: Bug report with fixes

---

### Step 4: Manual Verification

**After Claude approval**, test manually:

#### Test Polar Integration
1. Get Polar test API key from https://polar.sh/settings/api
2. Add to `.env.local`:
   ```bash
   POLAR_ACCESS_TOKEN=polar_sk_test_xxxxx
   ...
   ```
3. Create test product on Polar dashboard
4. Run checkout flow
5. Complete test payment
6. Verify webhook received

#### Test Binance Pay Integration
1. Register Binance Pay merchant (testnet)
2. Add credentials to `.env.local`
3. Create test order
4. Complete crypto payment
5. Verify webhook received

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: "Module not found"
```bash
npm install
npm run build
```

### Issue 2: "TypeScript error"
```bash
npx tsc --noEmit
# Fix errors, then
npm run build
```

### Issue 3: "Test failed"
```bash
npm test -- --verbose
# Check specific test file
npm test src/lib/payments/__tests__/polar-client.test.ts
```

### Issue 4: "Webhook 401 Unauthorized"
- Check signature implementation
- Verify webhook secret in `.env.local`
- Test with debug logging

### Issue 5: "Database RLS error"
- Use `SUPABASE_SERVICE_ROLE_KEY` for webhooks
- Check RLS policies enabled
- Verify user exists

---

## 📊 Files Created (Expected)

After Gemini completes, you should have:

```
apex-os/
├── .env.example (updated)
├── src/
│   ├── config/
│   │   └── payment-tiers.ts
│   ├── lib/
│   │   └── payments/
│   │       ├── polar-client.ts
│   │       ├── binance-pay-client.ts
│   │       └── __tests__/
│   │           ├── polar-client.test.ts
│   │           └── binance-pay-client.test.ts
│   ├── app/
│   │   └── api/
│   │       ├── checkout/
│   │       │   └── route.ts
│   │       └── webhooks/
│   │           ├── polar/
│   │           │   ├── route.ts
│   │           │   └── __tests__/
│   │           │       └── route.test.ts
│   │           └── binance-pay/
│   │               ├── route.ts
│   │               └── __tests__/
│   │                   └── route.test.ts
│   └── components/
│       └── payments/
│           ├── PaymentMethodSelector.tsx
│           └── CheckoutModal.tsx
├── supabase/
│   └── migrations/
│       └── 20251126_payment_system.sql
└── package.json (updated)
```

**Total**: 20+ files

---

## ✅ Success Checklist

### Gemini Execution Complete
- [ ] All files created
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Commits follow conventional format

### Claude Review Complete
- [ ] No security issues
- [ ] Code quality approved
- [ ] Database schema verified
- [ ] All tests green

### Manual Testing Complete
- [ ] Polar checkout works
- [ ] Binance Pay checkout works
- [ ] Webhooks process correctly
- [ ] Database records created
- [ ] Frontend UI functional

### Ready for Production
- [ ] Staging environment tested
- [ ] Real API keys configured
- [ ] Monitoring setup
- [ ] Documentation updated

---

## 📞 Next Steps After Implementation

1. **Deploy to Staging**:
   ```bash
   git push origin main
   # Wait for Vercel deployment
   ```

2. **Test with Real APIs**:
   - Polar test mode
   - Binance Pay testnet

3. **Setup Monitoring**:
   - Sentry for errors
   - Datadog for metrics
   - Segment for analytics

4. **Go Live**:
   - Switch to production API keys
   - Announce to users
   - Monitor closely for 24h

---

## 🆘 Emergency Contacts

If critical issues occur:

**Polar Support**: support@polar.sh  
**Binance Pay Support**: https://www.binance.com/en/support  
**Supabase Support**: https://supabase.com/support

**Rollback Command**:
```bash
git revert HEAD
git push origin main
```

---

## 📚 Documentation Links

- [Polar API Docs](https://docs.polar.sh/)
- [Binance Pay API](https://developers.binance.com/docs/binance-pay/introduction)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
