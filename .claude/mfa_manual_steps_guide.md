# MFA Manual Steps - Quick Start Guide

## Step 1: Apply DB Migration (5 min) 🗄️

### Instructions:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Navigate to: SQL Editor (left sidebar)

2. **Create New Query**
   - Click: "New query" button

3. **Copy Migration SQL**
   ```bash
   # Copy file contents
   cat src/database/migrations/add_mfa_to_admin.sql
   ```

4. **Paste & Run**
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for "Success" message (~1 second)

5. **Verify Migration**
   - Run this verification query:
   ```sql
   -- Verification Query
   SELECT 
       column_name, 
       data_type,
       column_default,
       is_nullable
   FROM information_schema.columns
   WHERE table_name = 'admin_users'
   AND column_name IN ('mfa_enabled', 'mfa_secret', 'mfa_recovery_codes')
   ORDER BY column_name;
   ```

   **Expected Result:**
   ```
   column_name         | data_type | column_default | is_nullable
   --------------------|-----------|----------------|------------
   mfa_enabled         | boolean   | false          | YES
   mfa_recovery_codes  | ARRAY     | NULL           | YES
   mfa_secret          | text      | NULL           | YES
   ```

6. **Check Index**
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'admin_users'
   AND indexname LIKE '%mfa%';
   ```

   **Expected:** `idx_admin_users_mfa_enabled`

✅ **Success Criteria:**
- 3 columns exist
- Default value for `mfa_enabled` is `false`
- Index created
- No errors in query output

---

## Step 2: Test MFA Setup (15 min) 📱

### Prerequisites:
- [ ] DB migration completed
- [ ] Google Authenticator or Authy installed on phone
- [ ] Dev server running (`npm run dev`)
- [ ] Admin record exists in `admin_users` table

### Test Flow:

#### 2.1 Navigate to Setup Page
```
URL: http://localhost:3000/admin/security/mfa/setup
```

#### 2.2 Check for Admin Email
First, verify you have an admin email in DB:
```sql
SELECT id, email, mfa_enabled 
FROM admin_users 
LIMIT 5;
```

If no admin exists, create one:
```sql
INSERT INTO admin_users (id, email, role, created_at)
VALUES (
    gen_random_uuid(),
    'admin@apex.com',
    'super_admin',
    NOW()
);
```

#### 2.3 Setup Process

1. **Enter admin email** in form
2. **Click "Generate QR Code"**
   - ✅ Check: QR code displays
   - ✅ Check: Secret string shows (base32)
   - ✅ Check: Console has no errors

3. **Open Authenticator App**
   - Tap "+" or "Add account"
   - Scan QR code
   - Account labeled "ApexOS (admin@apex.com)"

4. **Enter 6-digit code**
   - Type code from app
   - Click "Verify & Continue"
   - ✅ Check: Progresses to recovery codes

5. **Download Recovery Codes**
   - ✅ Check: 10 codes displayed
   - ✅ Check: Format is `XXXX-XXXX`
   - Click "Download Codes & Complete Setup"
   - ✅ Check: TXT file downloaded

6. **Verify in Database**
   ```sql
   SELECT 
       email,
       mfa_enabled,
       mfa_secret IS NOT NULL as has_secret,
       array_length(mfa_recovery_codes, 1) as recovery_code_count
   FROM admin_users
   WHERE email = 'admin@apex.com';
   ```

   **Expected:**
   ```
   email          | mfa_enabled | has_secret | recovery_code_count
   ---------------|-------------|------------|--------------------
   admin@apex.com | true        | true       | 10
   ```

#### 2.4 Test Error Cases

**Test: Already Enabled**
```
Action: Try to access setup page again
Expected: Error "MFA is already enabled"
```

**Test: Invalid Code**
```bash
curl -X POST http://localhost:3000/api/v1/admin/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apex.com",
    "token": "000000",
    "useRecoveryCode": false
  }'

# Expected: { "error": "Invalid token" }
```

---

## Step 3: Test Login Flow (10 min) 🔐

### 3.1 Test MFA-Enabled Login

1. **Logout** (if logged in)
   - Clear localStorage: `localStorage.clear()`
   - Clear sessionStorage: `sessionStorage.clear()`

2. **Navigate to Login**
   ```
   URL: http://localhost:3000/admin/login
   ```

3. **Enter Credentials**
   - Email: `admin@apex.com`
   - Password: (your admin password)
   - Click "Login"

4. **Verify Redirect**
   - ✅ Check: URL changes to `/admin/login/mfa`
   - ✅ Check: sessionStorage contains `mfaTempToken`
   - ✅ Check: sessionStorage contains `mfaEmail`
   - ✅ Check: localStorage does NOT have `apex_token` yet

5. **Enter TOTP Code**
   - Get code from authenticator app
   - Enter 6-digit code
   - Click "Verify & Login"

6. **Verify Success**
   - ✅ Check: Redirect to `/admin`
   - ✅ Check: localStorage contains `apex_token`
   - ✅ Check: sessionStorage cleared (`mfaTempToken` gone)

### 3.2 Test Recovery Code

1. **Logout again**
2. **Login with email/password**
3. **On MFA page:**
   - Click "Recovery Code" tab
   - Enter one code from downloaded file
   - Click "Verify & Login"

4. **Verify Code Removed**
   ```sql
   SELECT array_length(mfa_recovery_codes, 1) as remaining
   FROM admin_users
   WHERE email = 'admin@apex.com';
   
   -- Expected: 9 (was 10, used 1)
   ```

5. **Try Same Code Again**
   - Should fail with "Invalid token"

### 3.3 Test Non-MFA Admin

1. **Create non-MFA admin**
   ```sql
   INSERT INTO admin_users (id, email, role, mfa_enabled)
   VALUES (
       gen_random_uuid(),
       'admin2@apex.com',
       'admin',
       false  -- MFA disabled
   );
   ```

2. **Login with admin2**
   - Enter email/password
   - ✅ Check: Skip MFA page
   - ✅ Check: Direct redirect to `/admin`

### 3.4 Test Rate Limiting

```bash
# Try 6 times with wrong code (should hit rate limit)
for i in {1..6}; do
  echo "Attempt $i"
  curl -X POST http://localhost:3000/api/v1/admin/mfa/verify \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@apex.com","token":"000000","useRecoveryCode":false}'
  echo ""
done

# 6th attempt should return:
# {"error":"Too many MFA attempts. Try again in 15 minutes."}
```

---

## Quick Verification Checklist ✅

### DB Migration
- [ ] 3 columns added to `admin_users`
- [ ] Index created
- [ ] No SQL errors

### MFA Setup
- [ ] QR code displays
- [ ] Authenticator app shows account
- [ ] 6-digit code verification works
- [ ] 10 recovery codes generated
- [ ] DB shows `mfa_enabled = true`

### Login Flow
- [ ] MFA-enabled admin → redirects to MFA page
- [ ] TOTP code login works
- [ ] Recovery code works once
- [ ] Recovery code removed from DB after use
- [ ] Non-MFA admin → skips MFA page
- [ ] Rate limiting triggers after 5 attempts

---

## Troubleshooting 🔧

### Issue: QR code doesn't display
**Check:**
```bash
# DevTools Console
# Look for API errors
```
**Fix:** Ensure admin email exists in `admin_users` table

### Issue: "Invalid or expired session"
**Check:**
```javascript
// In browser console
console.log(sessionStorage.getItem('mfaTempToken'));
```
**Fix:** Login again to get new temp token

### Issue: Rate limit persists
**Clear rate limit:**
```javascript
// This is in-memory, restart dev server to clear
# Ctrl+C then npm run dev
```

---

## Success Indicator 🎯

All manual steps complete when:
1. ✅ DB migration verified
2. ✅ MFA setup works end-to-end
3. ✅ Login flow with MFA works
4. ✅ Recovery codes work
5. ✅ Rate limiting tested
6. ✅ No console errors

**Time Estimate:** 30 minutes (realistic: 20-25 min)

---

## Next Steps After Completion

1. Commit changes
2. Deploy to production
3. Run migration in production Supabase
4. Enable MFA for your production admin
5. Continue to next Institutional-Grade task (IP Whitelisting)
