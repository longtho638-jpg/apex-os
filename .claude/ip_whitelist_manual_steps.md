# IP Whitelisting Manual Steps - Quick Guide

## 🎯 STEP 1: Apply DB Migrations (5 min)

### 1.1 Migration 1: IP Whitelist Columns

**Open Supabase SQL Editor** → Create New Query → **Copy/Paste:**

```sql
-- ==============================================================================
-- MIGRATION: Add IP Whitelisting to Admin Users
-- ==============================================================================

-- Add IP whitelist columns to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS allowed_ips INET[],
ADD COLUMN IF NOT EXISTS ip_whitelist_enabled BOOLEAN DEFAULT FALSE;

-- Add GIN index for fast IP array lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_allowed_ips 
ON admin_users USING GIN (allowed_ips);

-- Add comments for documentation
COMMENT ON COLUMN admin_users.allowed_ips IS 'Array of whitelisted IP addresses (supports CIDR notation like 192.168.1.0/24)';
COMMENT ON COLUMN admin_users.ip_whitelist_enabled IS 'Whether IP whitelisting is active for this admin (optional per-admin)';

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'IP whitelist columns added successfully to admin_users table';
END $$;
```

**Run** (Cmd/Ctrl + Enter)

#### ✅ Verify Migration 1:
```sql
SELECT 
    column_name, 
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
AND column_name IN ('allowed_ips', 'ip_whitelist_enabled')
ORDER BY column_name;

-- ✅ Expected Result:
-- column_name             | data_type | column_default
-- ------------------------|-----------|----------------
-- allowed_ips             | ARRAY     | NULL
-- ip_whitelist_enabled    | boolean   | false
```

---

### 1.2 Migration 2: Security Events Table

**Create New Query** → **Copy/Paste:**

```sql
-- ==============================================================================
-- MIGRATION: Create Security Events Table
-- ==============================================================================

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'IP_BLOCKED',
        'NEW_IP_DETECTED', 
        'IP_WHITELIST_CHANGED',
        'UNAUTHORIZED_ACCESS',
        'MFA_FAILED'
    )),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_security_events_admin 
ON security_events(admin_id);

CREATE INDEX IF NOT EXISTS idx_security_events_timestamp 
ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_type 
ON security_events(event_type);

CREATE INDEX IF NOT EXISTS idx_security_events_ip 
ON security_events(ip_address);

-- Add comments
COMMENT ON TABLE security_events IS 'Logs all security-related events for audit trail';
COMMENT ON COLUMN security_events.event_type IS 'Type of security event';
COMMENT ON COLUMN security_events.metadata IS 'Additional event data in JSON format';

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'security_events table created successfully';
END $$;
```

**Run** (Cmd/Ctrl + Enter)

#### ✅ Verify Migration 2:
```sql
-- Check table exists
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'security_events'
ORDER BY ordinal_position;

-- ✅ Expected: 7 columns (id, event_type, admin_id, ip_address, user_agent, metadata, created_at)

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'security_events';

-- ✅ Expected: 4-5 indexes
```

---

## 🎯 STEP 2: Test IP Whitelist UI (10 min)

### 2.1 Navigate to IP Whitelist Page

```
URL: http://localhost:3000/admin/security/ip-whitelist
```

**⚠️ Note:** Must be logged in as admin first!

---

### 2.2 View Current IP

#### Expected UI:
- **Header:** "IP Whitelisting" with shield icon
- **Toggle Button:** Shows "Disabled" (gray)
- **Current IP Box:** Displays your current IP address
  - Example: `203.0.113.42`
  - "Add this IP" link on the right

#### Verification:
- [ ] Current IP displays correctly
- [ ] Toggle shows "Disabled"
- [ ] No IPs in whitelist yet

---

### 2.3 Add Current IP to Whitelist

#### Actions:
1. Click **"Add this IP"** link (quick add)
   - OR -
2. Type IP in input field and click **"Add"**

#### Expected Result:
- ✅ Success message: "IP added successfully"
- ✅ IP appears in "Whitelisted IPs" section
- ✅ Shows "(current)" label next to your IP

#### Database Check:
```sql
SELECT 
    email,
    allowed_ips,
    ip_whitelist_enabled
FROM admin_users
WHERE id = 'YOUR_ADMIN_ID';  -- Replace with your admin ID

-- ✅ Expected:
-- email          | allowed_ips            | ip_whitelist_enabled
-- ---------------|------------------------|---------------------
-- admin@apex.com | {203.0.113.42}         | false
```

---

### 2.4 Test CIDR Notation (Optional)

#### Actions:
1. In IP input, type: `192.168.1.0/24`
2. Click **"Add"**

#### Expected Result:
- ✅ CIDR range added successfully
- ✅ Both exact IP and range visible in list

#### What This Means:
- `192.168.1.0/24` = 256 IPs (192.168.1.0 - 192.168.1.255)
- Useful for whitelisting entire office network

---

### 2.5 Enable IP Whitelisting

#### Actions:
1. Click **"Disabled"** toggle button
2. Button should turn green and say **"Enabled"**

#### Expected Result:
- ✅ Toggle button green
- ✅ Text changes to "Enabled"
- ✅ Success message appears

#### ⚠️ Warning Check:
If you enabled whitelisting with NO IPs added:
- Yellow warning box should appear
- Message: "No IPs whitelisted. Add your current IP to avoid being locked out."

#### Database Check:
```sql
SELECT 
    email,
    ip_whitelist_enabled,
    array_length(allowed_ips, 1) as ip_count
FROM admin_users
WHERE id = 'YOUR_ADMIN_ID';

-- ✅ Expected:
-- email          | ip_whitelist_enabled | ip_count
-- ---------------|----------------------|----------
-- admin@apex.com | true                 | 1 (or more)
```

---

### 2.6 Test Access Control (Advanced)

#### Test 1: Verify Current IP Works
1. Refresh page
2. Navigate around admin panel
3. ✅ Should have normal access (your IP is whitelisted)

#### Test 2: Remove IP and Test Block
**⚠️ CAREFUL:** Only do this if testing!

1. Click trash icon next to your current IP
2. Confirm removal
3. Refresh page

**Expected:**
- If middleware integrated: Redirect to IP blocked page
- If not yet integrated: Normal access (middleware not active)

**To restore access:**
```sql
-- Disable IP whitelisting via DB
UPDATE admin_users
SET ip_whitelist_enabled = false
WHERE email = 'YOUR_EMAIL';
```

---

### 2.7 Security Events Check

```sql
-- Check if events are being logged
SELECT 
    event_type,
    ip_address,
    metadata,
    created_at
FROM security_events
ORDER BY created_at DESC
LIMIT 10;

-- ✅ Expected events:
-- - IP_WHITELIST_CHANGED (when adding/removing IPs)
-- - IP_WHITELIST_CHANGED (when toggling)
```

---

## ✅ Success Checklist

### DB Migrations
- [ ] `allowed_ips` column exists in `admin_users`
- [ ] `ip_whitelist_enabled` column exists
- [ ] `security_events` table created
- [ ] 4+ indexes on `security_events`
- [ ] No SQL errors

### UI Functionality
- [ ] Page loads at `/admin/security/ip-whitelist`
- [ ] Current IP displays correctly
- [ ] Can add IP via "Add this IP" button
- [ ] Can add IP via input field
- [ ] Can add CIDR ranges
- [ ] Can remove IPs
- [ ] Toggle enables/disables whitelisting
- [ ] Success/error messages appear
- [ ] Warning shows when enabled with no IPs

### Database State
- [ ] IPs saved to `allowed_ips` array
- [ ] Toggle state saved to `ip_whitelist_enabled`
- [ ] Security events logged

---

## 🔧 Troubleshooting

### Issue: Page redirects to login
**Fix:** Login as admin first, then navigate to IP whitelist page

### Issue: Current IP shows "unknown"
**Cause:** No proxy headers detected (local dev)
**Fix:** Add IP manually - it's expected in local development

### Issue: Can't remove last IP
**Fix:** Disable IP whitelisting first, then remove IPs

### Issue: CIDR range not working
**Check format:** Must be `192.168.1.0/24` (IP + slash + bits)

### Issue: Locked out after removing current IP
**Emergency fix:**
```sql
UPDATE admin_users
SET ip_whitelist_enabled = false
WHERE email = 'YOUR_EMAIL';
```

---

## 📊 Time Tracking

| Step | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Migration 1 | 2 min | __ min | ⬜ |
| Migration 2 | 2 min | __ min | ⬜ |
| Verify Migrations | 1 min | __ min | ⬜ |
| Test UI - Add IP | 3 min | __ min | ⬜ |
| Test UI - Enable | 2 min | __ min | ⬜ |
| Test UI - CIDR | 2 min | __ min | ⬜ |
| Verify DB | 2 min | __ min | ⬜ |
| Security Events | 1 min | __ min | ⬜ |
| **Total** | **15 min** | **__ min** | ⬜ |

---

## 🚀 Next Steps

After IP Whitelisting is tested:
1. Continue to next Institutional-Grade task
2. Or test MFA + IP Whitelisting together
3. Or proceed to Audit Logging (Task 1.3)

---

**IP Whitelisting Manual Steps Complete!** 🎉
