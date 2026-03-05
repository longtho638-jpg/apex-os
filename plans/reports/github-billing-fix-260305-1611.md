# GitHub Actions Billing Fix Guide

**Date:** 2026-03-05
**Issue:** CI/CD blocked — "Recent account payments have failed"

---

## ❌ Error Message

```
The job was not started because recent account payments have failed
or your spending limit needs to be increased.
```

---

## ✅ Resolution Steps

### Step 1: Open Billing Settings

```bash
open https://github.com/settings/billing
```

### Step 2: Check Payment Status

1. Navigate to **Billing & Plans** → **Payment information**
2. Check for:
   - ❌ Failed payments (red banner)
   - ⚠️ Outstanding invoices
   - 📊 Spending limit reached

### Step 3: Update Payment Method

1. Click **Update payment information**
2. Add valid credit card:
   - Card number
   - Expiration date
   - CVC
   - Billing address
3. Click **Save**

### Step 4: Pay Outstanding Invoices

1. Go to **Billing & Plans** → **Invoices**
2. Click **Pay** on any unpaid invoices
3. Wait for payment confirmation (~1-2 minutes)

### Step 5: Re-run CI/CD

```bash
# Option A: Re-run latest failed workflow
gh workflow run deploy.yml

# Option B: Re-run from GitHub UI
open https://github.com/longtho638-jpg/apex-os/actions
# Click "Re-run failed jobs" on latest run
```

---

## 📊 Current CI/CD Status

| Workflow | Status | Notes |
|----------|--------|-------|
| Security Scan | ❌ Blocked | Billing issue |
| Deploy to Production | ❌ Blocked | Billing issue |
| Test Suite | ❌ Blocked | Billing issue |

---

## ✅ Verification After Fix

```bash
# Wait 2-3 minutes after payment, then:
gh run list -L 1 --json status,conclusion -q '.[0]'

# Expected output:
# {"conclusion":"success","status":"completed"}
```

---

## 🚨 Troubleshooting

### Issue: Payment still fails

**Causes:**
- Card expired
- Insufficient funds
- Bank declined transaction
- Card not supported (GitHub accepts Visa, MC, Amex)

**Fix:**
- Try different card
- Contact bank for approval
- Use GitHub Sponsors billing (if organization)

### Issue: Jobs still blocked after payment

**Causes:**
- Payment processing delay (up to 5 minutes)
- Cache stale in GitHub Actions

**Fix:**
```bash
# Wait 5 minutes, then:
gh workflow run deploy.yml --ref main
```

### Issue: Spending limit reached

**Fix:**
1. Go to **Billing & Plans** → **Spending limit**
2. Click **Edit spending limit**
3. Increase limit or remove limit entirely
4. Save changes

---

## 💰 GitHub Actions Pricing (Reference)

| Tier | Minutes/Month | Storage | Cost |
|------|---------------|---------|------|
| Free | 2,000 min | 500 MB | $0 |
| Team | 3,000 min | 1 GB | $4/user |
| Pro | 50,000 min | 50 GB | $0.008/min |

**apex-os estimated usage:** ~50-100 min/month (well within free tier)

---

## 📋 Alternative: Use Free Tier Only

If billing issues persist:

1. **Switch to GitHub Free Plan:**
   - 2,000 minutes/month (enough for small projects)
   - No credit card required

2. **Use Vercel/Netlify for deployment:**
   - Free tier: 100 GB bandwidth/month
   - Auto-deploy on git push
   - No GitHub Actions needed

---

## ✅ Post-Fix Checklist

- [ ] Payment method updated
- [ ] Outstanding invoices paid
- [ ] CI/CD re-run successful
- [ ] All jobs GREEN (Security Scan, Deploy, Tests)
- [ ] Production URL accessible

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy
**Prerequisites:** Valid credit/debit card

---

*Guide created: 2026-03-05 16:11 UTC+7*
