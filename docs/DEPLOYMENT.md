# 🚀 Apex OS - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** 2025-11-24  
**Environment:** Production

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup

#### Required Services
- ✅ Supabase (PostgreSQL database)
- ✅ Redis instance (for real-time pub/sub)
- ✅ Node.js 18+ runtime
- ✅ Vercel or similar hosting (for Next.js)

#### Environment Variables
Create `.env.production` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Redis (Upstash, Redis Cloud, etc.)
REDIS_URL=redis://default:password@host:port

# WebSocket (your server URL)
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com

# API Keys (optional for ML features)
OPENAI_API_KEY=sk-...  # For future ML enhancements

# Security
POLAR_WEBHOOK_SECRET=whsec_... # Required for webhook signature verification
```

---

## 🗄️ Database Setup

### Step 1: Run Migrations

Execute these SQL scripts in **Supabase SQL Editor** in order:

#### Phase 3: Trading Core
```sql
-- Already run in earlier phases
-- orders, positions, wallets tables
```

#### Phase 4: Advanced Trading
```sql
-- 1. Limit Orders
\i src/database/migrations/add_limit_order_support.sql

-- 2. Automation (SL/TP)
\i src/database/migrations/add_automation_rules.sql

-- 3. Copy Trading
\i src/database/migrations/add_copy_trading.sql

-- 4. ML Signals
\i src/database/migrations/add_trading_signals.sql
```

#### Phase 5: Security
```sql
-- 5. MFA Recovery
\i src/database/migrations/add_mfa_recovery_codes.sql

-- 6. IP Whitelist
\i src/database/migrations/add_ip_whitelist.sql

-- 7. Audit Logs
\i src/database/migrations/create_audit_logs.sql
```

### Step 2: Verify Tables

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- admin_users
- agent_heartbeats
- audit_logs ⭐
- automation_rules ⭐
- copy_trading_followers ⭐
- copy_trading_leaders ⭐
- order_book ⭐
- orders
- positions
- security_alerts
- trading_signals ⭐
- users
- wallets

---

## 🏗️ Backend Services Deployment

### Option A: Separate Server (Recommended)

Deploy backend services to a VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Setup Process Manager (PM2)

```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'websocket-server',
      script: 'npx',
      args: 'ts-node --project tsconfig.server.json backend/websocket/server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        WS_PORT: 8080
      }
    },
    {
      name: 'order-manager',
      script: 'npx',
      args: 'ts-node --project tsconfig.server.json backend/services/order-manager.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'automation-engine',
      script: 'npx',
      args: 'ts-node --project tsconfig.server.json backend/services/automation-engine.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'copy-trading',
      script: 'npx',
      args: 'ts-node --project tsconfig.server.json backend/services/copy-trading.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
EOF

# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 2. Nginx Reverse Proxy (for WebSocket)

```nginx
# /etc/nginx/sites-available/apex-os-ws
server {
    listen 443 ssl;
    server_name ws.apex-os.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/apex-os-ws /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Vercel Serverless (Limited)

⚠️ **Note:** Background services can't run on Vercel. Use Option A for production.

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Push code to GitHub
2. Go to Vercel dashboard
3. Import repository
4. Select `apex-os` project

### Step 2: Configure Build Settings

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

### Step 3: Environment Variables

Add all variables from `.env.production` in Vercel dashboard.

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

### Step 5: Update WebSocket URL

After deployment, update `NEXT_PUBLIC_WS_URL` to point to your WebSocket server.

---

## 🔐 Security Hardening

### 1. Admin User Setup

Create first admin user in Supabase:

```sql
INSERT INTO admin_users (email, password_hash, role, created_at)
VALUES (
  'admin@yourcompany.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  'super_admin',
  NOW()
);
```

### 2. Enable MFA for All Admins

1. Each admin navigates to `/admin/security/mfa/setup`
2. Scan QR code with authenticator app
3. Save recovery codes securely
4. Verify setup

### 3. Configure IP Whitelist (Optional)

For high-security environments:

1. Go to `/admin/security/ip-whitelist`
2. Add office/VPN IP addresses
3. Test access from whitelisted IP
4. Remove test IPs if needed

### 4. Review Audit Logs

Set up weekly review:
1. Navigate to `/admin/audit-logs`
2. Filter by security events
3. Export CSV for compliance
4. Investigate anomalies

---

## 🔄 Cron Jobs Setup

### Audit Log Cleanup (Weekly)

```bash
# Add to crontab
0 2 * * 0 /path/to/apex-os/scripts/cleanup-audit-logs.sh >> /var/log/apex-os/audit-cleanup.log 2>&1
```

### Guardian Agent Health Check (Every 5 min)

```bash
*/5 * * * * curl -f http://localhost:3000/api/health/agents || echo "Agents down!" | mail -s "Alert: Agents Down" admin@yourcompany.com
```

---

## 📊 Monitoring Setup

### 1. Application Monitoring

**Recommended:** Sentry, DataDog, or New Relic

```bash
npm install @sentry/nextjs

# Update next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // ... existing config
}, {
  silent: true,
  org: 'your-org',
  project: 'apex-os'
});
```

### 2. Database Monitoring

Monitor in Supabase dashboard:
- Connection pool usage
- Query performance
- Storage usage

### 3. Redis Monitoring

Monitor in Redis dashboard:
- Memory usage
- Commands/sec
- Latency

---

## 🧪 Post-Deployment Testing

### Smoke Tests

Run these tests after deployment:

```bash
# 1. Health check
curl https://your-domain.com/api/health

# 2. WebSocket connection
npm run test:websocket

# 3. Trading flow
npm run test:trading-e2e

# 4. Institutional features
npm run test:institutional-features

# 5. ML signals
npm run test:signal-generation
```

### Manual Testing Checklist

- [ ] Login with admin account
- [ ] Setup MFA and verify
- [ ] Place a market order
- [ ] Create a limit order
- [ ] Set SL/TP on position
- [ ] Follow a copy trading leader
- [ ] Generate ML signals
- [ ] Check audit logs
- [ ] Test IP whitelist
- [ ] Verify agent status dashboard

---

## 🚨 Rollback Plan

If deployment fails:

### Frontend Rollback (Vercel)

1. Go to Vercel dashboard
2. Deployments tab
3. Find last working deployment
4. Click "Promote to Production"

### Backend Rollback (PM2)

```bash
# Stop all services
pm2 stop all

# Git revert
git revert HEAD
git push

# Restart services
pm2 restart all
```

### Database Rollback

⚠️ **Backup first!**

```sql
-- Create backup before migration
pg_dump -h your-host -U postgres -d your-db > backup_pre_migration.sql

-- If rollback needed:
psql -h your-host -U postgres -d your-db < backup_pre_migration.sql
```

---

## 📈 Scaling Considerations

### When to Scale

**Frontend (Vercel):**
- Auto-scales based on traffic
- No action needed

**Backend Services:**
- Monitor CPU/memory usage
- Scale when consistently > 70%

**Database:**
- Monitor connection pool
- Upgrade tier when approaching limits
- Consider read replicas for heavy reads

**Redis:**
- Monitor memory usage
- Upgrade when > 80% capacity

### How to Scale

**Horizontal Scaling (Multiple Instances):**

```javascript
// ecosystem.config.js
{
  name: 'order-manager',
  instances: 4,  // 4 instances
  exec_mode: 'cluster'
}
```

**Database Connection Pooling:**

```typescript
// Increase pool size
const supabase = createClient(url, key, {
  db: {
    pooler: {
      connectionString: process.env.SUPABASE_URL,
      maxConnections: 10
    }
  }
});
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check agent status dashboard
- Monitor error logs

**Weekly:**
- Review audit logs
- Check system metrics
- Backup database

**Monthly:**
- Update dependencies
- Review security patches
- Performance optimization

### Log Locations

```bash
# PM2 logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/log/apex-os/app.log

# Audit log cleanup
tail -f /var/log/apex-os/audit-cleanup.log
```

### Emergency Contacts

- **Technical Lead:** [Your contact]
- **DevOps:** [Your contact]
- **Database Admin:** [Your contact]

---

## 🎉 Go Live Checklist

Final checklist before going live:

- [ ] All migrations run successfully
- [ ] Environment variables configured
- [ ] Backend services running (PM2 status)
- [ ] WebSocket server accessible
- [ ] Frontend deployed to Vercel
- [ ] Admin users created with MFA
- [ ] Cron jobs configured
- [ ] Monitoring setup (Sentry, etc.)
- [ ] Smoke tests passed
- [ ] Manual testing completed
- [ ] Backup strategy in place
- [ ] Rollback plan tested
- [ ] Documentation reviewed
- [ ] Team trained on admin features

---

**Apex OS is ready for production! 🚀**

For questions: Refer to `docs/ADMIN_GUIDE.md` or contact support team.
