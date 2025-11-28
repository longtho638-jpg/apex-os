# MFA + IP Whitelisting - Quick Testing Guide
*Estimated: 1.5 hours*

---

## 🎯 Prerequisites

Before starting, ensure:
- [x] MFA DB migration applied
- [x] IP Whitelisting DB migrations applied (2 files) ✅
- [ ] Admin account exists
- [ ] Dev server running (`npm run dev`)
- [ ] Google Authenticator/Authy on phone

---

## 📱 TEST SUITE 1: MFA End-to-End (30 min)

### Step 1: Navigate to MFA Setup
```
URL: http://localhost:3000/admin/security/mfa/setup
```

**If redirected to login:**
1. Login at `/admin/login` first
2. Then go to MFA setup page

---

### Step 2: Generate QR Code

**Actions:**
1. Enter admin email in form
2. Click **"Generate QR Code"** button

**✅ Verify:**
- [ ] QR code image appears
- [ ] Secret string visible (e.g., `JBSWY3DPEHPK3PXP`)
- [ ] Copy button present
- [ ] NO console errors (F12)

**⚠️ If fails:** Check browser console for errors

---

### Step 3: Scan with Authenticator App

**Actions:**
1. Open Google Authenticator / Authy on phone
2. Tap "+ Add account"
3. Scan QR code from screen

**✅ Verify:**
- [ ] App shows "ApexOS (your-email@...)"
- [ ] 6-digit code appears
- [ ] Code refreshes every 30 seconds

---

### Step 4: Verify TOTP Code

**Actions:**
1. Type 6-digit code from app into browser
2. Click **"Verify & Continue"**

**✅ Verify:**
- [ ] Success message appears
- [ ] Redirected to recovery codes screen
- [ ] 10 recovery codes displayed
- [ ] Format: `XXXX-XXXX`

---

### Step 5: Download Recovery Codes

**Actions:**
1. Click **"Download Codes & Complete Setup"**

**✅ Verify:**
- [ ] TXT file downloaded
- [ ] Filename: `mfa-recovery-codes-{email}.txt`
- [ ] File contains 10 codes
- [ ] Codes match screen

**Database Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT 
    email,
    mfa_enabled,
    mfa_secret IS NOT NULL as has_secret,
    array_length(mfa_recovery_codes, 1) as code_count
FROM admin_users
WHERE email = 'YOUR_ADMIN_EMAIL';  -- Replace with your email

-- ✅ Expected:
-- mfa_enabled = true
-- has_secret = true
-- code_count = 10
```

---

### Step 6: Test MFA Login

**Prepare:**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
```

**Actions:**
1. Navigate to `/admin/login`
2. Enter admin email + password
3. Click "Login"

**✅ Verify:**
- [ ] Redirected to `/admin/login/mfa`
- [ ] MFA verification page loads
- [ ] 6-digit input field visible

**Session Check:**
```javascript
// In console:
console.log('Temp token:', sessionStorage.getItem('mfaTempToken'));
console.log('Email:', sessionStorage.getItem('mfaEmail'));
console.log('Auth token:', localStorage.getItem('apex_token'));

// ✅ Expected:
// Temp token: exists (JWT string)
// Email: your-email@...
// Auth token: null (not set yet)
```

---

### Step 7: Complete MFA Verification

**Actions:**
1. Open authenticator app
2. Copy current 6-digit code
3. Paste into browser
4. Click **"Verify & Login"**

**✅ Verify:**
- [ ] Redirected to `/admin` dashboard
- [ ] No MFA page visible
- [ ] Normal admin access

**Final Check:**
```javascript
// Console:
console.log('Auth token:', localStorage.getItem('apex_token'));
console.log('Temp token:', sessionStorage.getItem('mfaTempToken'));

// ✅ Expected:
// Auth token: JWT string (exists now)
// Temp token: null (cleared)
```

---

### Step 8: Test Recovery Code

**Prepare:**
```javascript
localStorage.clear();
sessionStorage.clear();
```

**Actions:**
1. Login with email/password
2. On MFA page, click **"Recovery Code"** tab
3. Enter ONE recovery code from file
4. Click "Verify & Login"

**✅ Verify:**
- [ ] Login successful
- [ ] Redirected to dashboard

**Database Check (CRITICAL):**
```sql
-- Recovery code should be REMOVED after use
SELECT 
    email,
    array_length(mfa_recovery_codes, 1) as remaining_codes
FROM admin_users
WHERE email = 'YOUR_EMAIL';

-- ✅ Expected: remaining_codes = 9 (was 10, used 1)
```

**Test Reuse:**
1. Logout and login again
2. Try same recovery code
3. ✅ Should FAIL with "Invalid token"

---

## 🌐 TEST SUITE 2: IP Whitelisting (30 min)

### Step 1: Navigate to IP Whitelist Page
```
URL: http://localhost:3000/admin/security/ip-whitelist
```

**✅ Verify:**
- [ ] Page loads successfully
- [ ] Header: "IP Whitelisting"
- [ ] Toggle button shows "Disabled" (gray)
- [ ] Current IP box visible

---

### Step 2: Check Current IP Display

**✅ Verify:**
- [ ] IP address shown (e.g., `203.0.113.42` or `::1` for localhost)
- [ ] "Add this IP" link present
- [ ] Empty whitelist message: "No IPs whitelisted yet"

**Note:** If IP shows "unknown" - this is OK for local dev

---

### Step 3: Add Current IP

**Actions:**
1. Click **"Add this IP"** quick button

**✅ Verify:**
- [ ] Green success message: "IP added successfully"
- [ ] IP appears in whitelist table
- [ ] Label shows "(current)" next to your IP

**Database Check:**
```sql
SELECT 
    email,
    allowed_ips,
    ip_whitelist_enabled
FROM admin_users
WHERE email = 'YOUR_EMAIL';

-- ✅ Expected:
-- allowed_ips = {203.0.113.42} or your IP
-- ip_whitelist_enabled = false (not enabled yet)
```

---

### Step 4: Add CIDR Range

**Actions:**
1. Type in input: `192.168.1.0/24`
2. Click **"Add"** button

**✅ Verify:**
- [ ] Success message appears
- [ ] CIDR range added to list
- [ ] Both IPs visible:
  - Your current IP
  - `192.168.1.0/24`

**What this means:**
- `/24` = 256 IPs (192.168.1.0 through 192.168.1.255)
- Useful for office networks

---

### Step 5: Remove IP

**Actions:**
1. Click trash icon next to CIDR range
2. Confirm removal in dialog

**✅ Verify:**
- [ ] Confirmation dialog appears
- [ ] CIDR range removed from list
- [ ] Only current IP remains

---

### Step 6: Enable IP Whitelisting

**Actions:**
1. Click **"Disabled"** toggle button
2. Button should turn green

**✅ Verify:**
- [ ] Button color: green (from gray)
- [ ] Button text: "Enabled"
- [ ] Success message appears

**Database Check:**
```sql
SELECT 
    email,
    ip_whitelist_enabled,
    array_length(allowed_ips, 1) as ip_count
FROM admin_users
WHERE email = 'YOUR_EMAIL';

-- ✅ Expected:
-- ip_whitelist_enabled = true
-- ip_count = 1 (or more)
```

---

### Step 7: Test Warning When Empty

**Actions:**
1. Remove all IPs (click trash on each)
2. Keep IP whitelisting enabled

**✅ Verify:**
- [ ] Yellow warning box appears
- [ ] Warning text mentions: "No IPs whitelisted. Add your current IP..."

---

## 🔐 TEST SUITE 3: Security Events (15 min)

### Verify Event Logging

**Run this query:**
```sql
SELECT 
    event_type,
    admin_id,
    ip_address,
    metadata->>'action' as action,
    metadata->>'ip' as affected_ip,
    created_at
FROM security_events
ORDER BY created_at DESC
LIMIT 20;
```

**✅ Expected Events:**
- [ ] `IP_WHITELIST_CHANGED` - action: "add" (when adding IP)
- [ ] `IP_WHITELIST_CHANGED` - action: "remove" (when removing)
- [ ] `IP_WHITELIST_CHANGED` - action: "toggle" (when enabling)
- [ ] All events have timestamps
- [ ] All events have IP addresses
- [ ] Metadata contains action details

---

## 🎭 TEST SUITE 4: Integration Test (15 min)

### Test MFA + IP Whitelisting Together

**Setup:**
1. Ensure MFA enabled for your admin
2. Ensure IP whitelisting enabled with your IP
3. Logout completely

**Actions:**
1. Navigate to `/admin/login`
2. Enter email + password
3. Complete MFA verification

**✅ Verify:**
- [ ] No conflicts between features
- [ ] Login flow smooth
- [ ] Both security layers active
- [ ] Access dashboard successfully
- [ ] No console errors

---

## ✅ FINAL VERIFICATION CHECKLIST

### MFA Feature (8/8)
- [ ] QR code generates
- [ ] Authenticator app works
- [ ] TOTP verification works
- [ ] Recovery codes download
- [ ] MFA login flow works
- [ ] Recovery code login works
- [ ] Recovery code removed after use
- [ ] Database state correct

### IP Whitelisting Feature (6/6)
- [ ] Page loads
- [ ] Add current IP works
- [ ] Add CIDR range works
- [ ] Remove IP works
- [ ] Enable/disable toggle works
- [ ] Warning shows when empty

### Integration (2/2)
- [ ] Security events logged
- [ ] MFA + IP work together

**Total: 16/16 Tests**

---

## 🎯 SUCCESS CRITERIA

All 16 tests must pass:
- ✅ No console errors
- ✅ Database state correct
- ✅ Security events logged
- ✅ Smooth user experience

---

## 🐛 IF TESTS FAIL

### Immediate Actions:
1. **Screenshot the error**
2. **Copy console errors**
3. **Note which test failed**
4. **Check database state**

### Report Format:
```
Test Failed: [Test name]
Expected: [What should happen]
Actual: [What happened]
Console Errors: [Paste errors]
DB State: [SQL query result]
```

Tôi sẽ fix bugs ngay!

---

## ⏱️ TIME TRACKING

| Test Suite | Estimate | Actual | Pass |
|------------|----------|--------|------|
| MFA Setup | 15 min | __ min | ⬜ |
| MFA Login | 15 min | __ min | ⬜ |
| IP Whitelist UI | 20 min | __ min | ⬜ |
| IP Toggle | 10 min | __ min | ⬜ |
| Security Events | 15 min | __ min | ⬜ |
| Integration | 15 min | __ min | ⬜ |
| **Total** | **90 min** | **__ min** | ⬜ |

---

## 🚀 AFTER ALL TESTS PASS

1. ✅ Mark all tests complete
2. ✅ Update task.md
3. ✅ Commit code
4. ✅ Proceed to Task 1.3: Audit Logging

**You're ready to test! Start with Test Suite 1** 🎯
