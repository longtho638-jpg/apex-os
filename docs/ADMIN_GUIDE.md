# Admin User Guide - Apex OS

## 🎯 Overview

Welcome to the Apex OS Admin Guide. This document covers all administrative features including security, monitoring, and user management.

---

## 🔐 Security Features

### Multi-Factor Authentication (MFA)

#### Setup MFA
1. Navigate to `/admin/security/mfa/setup`
2. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
3. Enter 6-digit code to verify
4. **Important:** Save your 10 recovery codes in a secure location
5. MFA is now enabled

#### Recovery Codes
- 10 single-use codes generated during setup
- Format: `XXXX-XXXX`
- Use if you lose access to authenticator app
- Each code can only be used once
- Request new codes if running low

#### Login with MFA
1. Enter email and password
2. You'll be redirected to MFA verification
3. Enter 6-digit code from authenticator app
4. Or click "Use recovery code" and enter one

### IP Whitelisting

#### View Your IP
Navigate to `/admin/security/ip-whitelist` to see your current IP address.

#### Whitelist an IP
1. Click "Whitelist This IP" for current IP, or
2. Manually enter IP address (format: `192.168.1.1`)
3. Click "Add IP"

#### Remove IP
1. Find IP in whitelist
2. Click trash icon
3. Confirm removal

#### Important Notes
- Empty whitelist = allow all IPs (default)
- Once you add an IP, only those IPs are allowed
- Always whitelist your current IP before adding others
- Supports IPv4 format only

### Audit Logging

#### View Audit Logs
Navigate to `/admin/audit-logs` to see all administrative actions.

#### Filter Logs
- **All Logs:** See everything
- **Security Only:** MFA, IP, and security events
- **Search:** Filter by action name

#### Export Logs
1. Click "Export CSV" button
2. Downloads last 30 days of logs
3. File format: `audit-logs-YYYY-MM-DD.csv`

#### Log Retention
- Logs retained for 90 days
- Older logs automatically archived
- Contact support for longer retention

---

## 📊 Trading Oversight

### Admin Trading Monitor

Navigate to `/admin/trading` for real-time oversight.

**Features:**
- All open positions across users
- Real-time PnL updates
- Filter by user or symbol
- Export to CSV

**Actions:**
- Monitor high-risk positions
- View user trading activity
- Emergency position closure (if needed)

---

## 🤖 Agent System

### Agent Status Dashboard

Navigate to `/admin/agents` to monitor all agents.

**Agents:**
- **Guardian Agent:** Risk monitoring (4 instances)
- **Auditor Agent:** Rebate optimization
- **Order Manager:** Limit order matching
- **Automation Engine:** Stop loss/take profit
- **Copy Trading:** Trade replication

**Indicators:**
- 🟢 Green: Healthy (heartbeat < 60s ago)
- 🟡 Yellow: Warning (60-120s)
- 🔴 Red: Dead (> 120s)

**Actions:**
- Click "Refresh" to update status
- Restart agents if needed (via server)

---

## 👥 User Management

### View Users
Navigate to `/admin/users` (if available).

**Features:**
- Search by email or name
- Filter by tier (Free, Founders, Admin)
- User risk scores
- Account status

### User Actions
- **Freeze Account:** Temporarily disable trading
- **Unfreeze Account:** Re-enable trading
- **View Details:** Full user profile and history
- **Reset Password:** Send reset email

---

## 🚨 Emergency Procedures

### Kill Switch
If you need to halt all trading immediately:

1. Navigate to `/admin/emergency`
2. Click "KILL SWITCH"
3. Confirm action
4. All trading paused instantly

**Recovery:**
1. Investigate issue
2. Fix root cause
3. Click "Resume Trading"

### Suspicious Activity
If you detect fraud or abuse:

1. Check audit logs for evidence
2. Freeze user account
3. Review user's trades in trading monitor
4. Contact user via support system
5. Document findings

---

## 📈 Metrics & Analytics

### Dashboard Metrics
Available at `/admin/dashboard`:

- **Active Users:** Current logged-in users
- **24h Volume:** Trading volume last 24 hours
- **Pending Payouts:** Rebates awaiting approval
- **System Health:** Service status
- **Revenue Chart:** 7-day revenue trend

**Refresh:** Auto-refreshes every 10 seconds

---

## 🔧 Troubleshooting

### MFA Issues

**"Invalid code" error:**
- Check time sync on phone
- Try next code (codes change every 30s)
- Use recovery code if persistent

**Lost authenticator app:**
- Use recovery code to login
- Re-setup MFA
- Generate new recovery codes

### IP Whitelist Issues

**Locked out:**
- Contact another admin to whitelist your IP
- Or disable IP whitelist via database

**Dynamic IP:**
- Not recommended for IP whitelist
- Use VPN with static IP
- Or don't enable IP restriction

### Audit Log Issues

**Missing logs:**
- Check date range
- Verify feature has audit logging
- Check database connection

**Export fails:**
- Reduce date range
- Check browser download settings

---

## 🔑 Best Practices

### Security
✅ Enable MFA for all admin accounts  
✅ Whitelist office/VPN IPs only  
✅ Review audit logs weekly  
✅ Rotate recovery codes quarterly  
✅ Use strong, unique passwords  
✅ Never share credentials  

### Monitoring
✅ Check agent status daily  
✅ Monitor high-risk positions  
✅ Review security alerts  
✅ Track system metrics  
✅ Export logs monthly for records  

### User Management
✅ Verify user identity before support  
✅ Document all actions (auto-logged)  
✅ Freeze first, investigate second  
✅ Communicate with users  
✅ Follow escalation procedures  

---

## 🆘 Support

### Internal Issues
- Check documentation first
- Review audit logs for clues
- Restart agents if needed
- Contact dev team if persistent

### User Support
- Verify user identity via email
- Check audit logs for their activity
- Use support agent for common questions
- Escalate complex issues to human support

---

## 📱 Quick Reference

### URLs
- Dashboard: `/admin/dashboard`
- MFA Setup: `/admin/security/mfa/setup`
- IP Whitelist: `/admin/security/ip-whitelist`
- Audit Logs: `/admin/audit-logs`
- Trading Monitor: `/admin/trading`
- Agent Status: `/admin/agents`
- Users: `/admin/users`

### Keyboard Shortcuts
- `Ctrl/Cmd + R`: Refresh page
- `Ctrl/Cmd + F`: Search on page
- `Esc`: Close modals

### Export Formats
- Audit Logs: CSV
- Trading Data: CSV
- User List: CSV

---

**Last Updated:** 2025-11-24  
**Version:** 1.0.0  
**For:** Apex OS Administrators
