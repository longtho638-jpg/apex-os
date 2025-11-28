# Security Incident Response Playbook

## Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0 - Critical** | System breach, data leak | Immediate (< 5 min) | Unauthorized admin access, database dump |
| **P1 - High** | Security feature bypass | < 30 min | MFA bypass, IP whitelist circumvention |
| **P2 - Medium** | Suspicious activity | < 2 hours | Volume spike, multiple failed logins |
| **P3 - Low** | Minor anomaly | < 24 hours | Single failed login, unusual IP |

---

## Phase 1: Detection

### Automated Alerts
Monitor these systems:
1. **Security Alerts Dashboard** (`/admin/security/alerts`)
   - Filterby status: "OPEN"
   - Check for CRITICAL severity
   
2. **Agent Status** (`/admin/agents`)
   - Guardian Agent status
   - Auditor Agent status

3. **Audit Logs** (`/admin/security/audit-logs`)
   - Unusual patterns
   - Failed authentication attempts

### Manual Checks
Daily checklist for admins:
- [ ] Review critical security alerts
- [ ] Check agent heartbeats
- [ ] Scan audit logs for anomalies
- [ ] Verify open security events

---

## Phase 2: Assessment

### Incident Classification
Ask these questions:
1. **What happened?** (describe the alert/event)
2. **When did it start?** (check audit log timestamps)
3. **Who is affected?** (specific users/admins)
4. **What data is at risk?** (sensitive info exposed?)
5. **Is it ongoing?** (still happening now?)

### Severity Rating
Use this decision tree:

```
Is user data exposed? 
├─ YES → P0 (Critical)
└─ NO  → Is admin access compromised?
          ├─ YES → P1 (High)
          └─ NO  → Is it a security feature bypass?
                   ├─ YES → P1 (High)
                   └─ NO  → P2/P3 (Medium/Low)
```

---

## Phase 3: Containment

### P0 - Critical Incidents

#### Immediate Actions (< 5 min)
1. **Disable affected features**
   ```sql
   -- Disable IP whitelist globally
   UPDATE admin_users SET ip_whitelist_enabled = false;
   
   -- Disable all MFA (emergency only)
   UPDATE admin_users SET mfa_enabled = false;
   ```

2. **Revoke sessions**
   ```sql
   -- Force re-authentication
   DELETE FROM admin_sessions WHERE created_at < NOW();
   ```

3. **Stop agents (if compromised)**
   ```bash
   pm2 stop guardian
   pm2 stop auditor
   ```

4. **Notify team**
   - Email security team
   - Slack #incidents channel
   - Call on-call engineer

#### Investigation (< 30 min)
1. Export audit logs:
   ```bash
   curl -X POST https://your-domain.com/api/v1/admin/audit-logs/export \
     -H "Authorization: Bearer TOKEN" \
     -d '{"format": "json"}' > incident-logs.json
   ```

2. Check security alerts:
   - Review alert details
   - Trace back to root cause
   - Identify affected accounts

3. Database snapshot:
   ```sql
   -- Create backup before any changes
   -- (Use Supabase dashboard backup feature)
   ```

### P1 - High Priority

#### Containment (< 30 min)
1. **Isolate affected users**
   ```sql
   -- Freeze user account
   UPDATE users SET status = 'frozen' WHERE id = 'USER_ID';
   ```

2. **Reset compromised credentials**
   ```sql
   -- Disable MFA for affected admin
   UPDATE admin_users 
   SET mfa_enabled = false, mfa_secret = null
   WHERE id = 'ADMIN_ID';
   ```

3. **Enable enhanced monitoring**
   - Reduce agent check interval to 1 min
   - Enable debug logging temporarily

---

## Phase 4: Eradication

### Root Cause Analysis
Document:
1. **Entry point**: How did the incident occur?
2. **Attack vector**: What vulnerability was exploited?
3. **Timeline**: When did each stage happen?
4. **Impact**: What data/systems were affected?

### Fix Implementation
1. **Patch vulnerability**
   - Update code
   - Deploy hotfix
   - Test thoroughly

2. **Rotate secrets**
   ```bash
   # Generate new JWT secret
   openssl rand -base64 32
   
   # Update VAULT_KEY_MASTER
   # (Requires data re-encryption)
   ```

3. **Update security rules**
   - Strengthen validation
   - Add new monitors
   - Update rate limits

---

## Phase 5: Recovery

### System Restoration
1. **Verify fix deployed**
   ```bash
   # Check deployment
   curl https://your-domain.com/api/health
   ```

2. **Re-enable features**
   ```sql
   -- Re-enable MFA for admins
   UPDATE admin_users SET mfa_enabled = true WHERE role = 'super_admin';
   ```

3. **Restart agents**
   ```bash
   pm2 restart guardian
   pm2 restart auditor
   ```

4. **Notify users**
   - Email affected users
   - Explain what happened (high-level)
   - Recommend actions (change password, etc.)

### Verification Tests
- [ ] All security features working
- [ ] Agents running normally
- [ ] No new alerts triggered
- [ ] Audit logs capturing events
- [ ] User access restored

---

## Phase 6: Post-Incident Review

### Within 24 Hours
Create an incident report:
- **Summary**: 1-paragraph overview
- **Timeline**: Minute-by-minute breakdown
- **Root cause**: Technical analysis
- **Impact**: Who/what was affected
- **Response**: What we did
- **Lessons**: What we learned

### Within 1 Week
- [ ] Update this playbook with lessons learned
- [ ] Implement preventive measures
- [ ] Train team on new procedures
- [ ] Add monitoring for similar incidents
- [ ] Review and improve detection systems

---

## Incident Response Team

### Roles
- **Incident Commander**: Makes final decisions
- **Technical Lead**: Implements fixes
- **Communications Lead**: Notifies stakeholders
- **Documentation Lead**: Records timeline

### Contact Information
```
On-Call Engineer: [PHONE]
Security Team: security@company.com
CEO/CTO: [EMERGENCY CONTACT]
```

---

## Common Incident Scenarios

### Scenario 1: Financial Mismatch Alert
**Trigger**: Auditor Agent detects balance != transaction sum

**Response**:
1. Check `daily_reconciliation_logs` for details
2. Verify transactions in `transactions` table
3. If legit issue: Fix transaction data
4. If fraud: Freeze wallet, investigate transactions
5. Re-run reconciliation to confirm fix

### Scenario 2: Volume Spike Alert
**Trigger**: Guardian Agent detects unusual trading volume

**Response**:
1. Check user's recent trades
2. Verify IP addresses (location changes?)
3. Contact user to confirm legitimate activity
4. If suspicious: Freeze account, investigate
5. If legit: Whitelist user, dismiss alert

### Scenario 3: Multiple Failed MFA
**Trigger**: 5+ failed MFA attempts from same IP

**Response**:
1. Check if IP is known/whitelisted
2. Review audit logs for pattern
3. If brute force: Block IP, alert admin
4. If legit user: Help recover account
5. Consider stricter rate limiting

### Scenario 4: Agent Down
**Trigger**: Agent status shows "Dead" > 10 min

**Response**:
1. SSH to production server
2. Check logs: `tail -f backend/agents/*/logs.txt`
3. Restart agent: `pm2 restart <agent-name>`
4. If persists: Check DB connection, env vars
5. Manual reconciliation if Auditor down

---

## Emergency Contacts

| System | Contact | Escalation |
|--------|---------|------------|
| Supabase | support@supabase.com | Premium support |
| Vercel | vercel.com/support | Enterprise tier |
| Database | DBA on-call | [PHONE] |
| Legal | legal@company.com | For data breaches |

---

**Last Drill Date**: _____________  
**Next Drill Scheduled**: _____________  
**Playbook Version**: 1.0
