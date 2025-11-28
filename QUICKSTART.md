# 🚀 Quick Start Guide - Apex OS

Get your Apex OS trading platform running in 5 minutes!

---

## ⚡ Fast Setup

### 1. Install Dependencies (1 min)

```bash
npm install --legacy-peer-deps
```

### 2. Setup Environment (1 min)

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### 3. Run Migrations (1 min)

Open **Supabase SQL Editor** and paste:

```sql
-- Copy contents from each migration file:
-- src/database/migrations/*.sql
```

Or use our migration script:
```bash
npm run migrate
```

### 4. Start Services (2 min)

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: WebSocket (optional for now)
npm run ws:dev
```

Visit **http://localhost:3000** 🎉

---

## 🎯 What's Available

### Trading Features
- **Market Orders** - `/trading` - Instant execution
- **Limit Orders** - `/trading/limit-orders` - Auto-matching
- **Live Positions** - `/trading/positions` - Real-time PnL
- **Copy Trading** - `/copy-trading` - Follow top traders
- **ML Signals** - `/signals` - AI-powered insights

### Admin Features
- **MFA Setup** - `/admin/security/mfa/setup`
- **IP Whitelist** - `/admin/security/ip-whitelist`
- **Audit Logs** - `/admin/audit-logs`
- **Agent Status** - `/admin/agents`
- **Trading Monitor** - `/admin/trading`

---

## 🔑 First-Time Setup

### Create Admin User

In Supabase SQL Editor:

```sql
INSERT INTO admin_users (email, password_hash, role, created_at)
VALUES (
  'admin@yourcompany.com',
  crypt('ChangeMe123!', gen_salt('bf')),
  'super_admin',
  NOW()
);
```

### Login & Setup MFA

1. Go to `/admin/login`
2. Login with credentials above
3. Navigate to `/admin/security/mfa/setup`
4. Scan QR code with Google Authenticator
5. Save recovery codes!

---

## 🧪 Test Features

### Quick Test Flight

```bash
# Test WebSocket
npm run test:websocket

# Test Trading
npm run test:trading-e2e

# Test Institutional Features
npm run test:institutional-features

# Test ML Signals
npm run test:signal-generation
```

### Manual Testing

1. **Trading:**
   - Visit `/trading`
   - Place a market order
   - Check position at `/trading/positions`

2. **Limit Orders:**
   - Go to `/trading/limit-orders`
   - Create a limit order
   - Watch it auto-execute when price matches

3. **Copy Trading:**
   - Visit `/copy-trading`
   - Follow a leader
   - See trades replicate

4. **ML Signals:**
   - Go to `/signals`
   - Click "Generate Signals"
   - Review RSI/MACD indicators

---

## 📚 Documentation

- **Trading Guide:** `docs/TRADING_GUIDE.md`
- **Admin Manual:** `docs/ADMIN_GUIDE.md`
- **API Reference:** `docs/API_TRADING.md`
- **Deployment:** `docs/DEPLOYMENT.md`

---

## 🆘 Common Issues

### Build Error: "Module not found"

```bash
npm install --legacy-peer-deps
```

### WebSocket Not Connecting

Check if server is running:
```bash
lsof -i :8080  # Should show node process
```

Start it:
```bash
npm run ws:dev
```

### Database Connection Failed

Verify in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `SUPABASE_SERVICE_ROLE_KEY` is valid

### MFA Not Working

- Check time sync on phone
- Try recovery code instead
- Re-setup MFA if needed

---

## 🚀 Production Deployment

See full guide: `docs/DEPLOYMENT.md`

**Quick version:**

1. Deploy to Vercel (frontend)
2. Deploy backend services to VPS
3. Setup PM2 process manager
4. Configure Nginx for WebSocket
5. Run production migrations
6. Go live!

---

## 💡 What's Next?

### Explore Features
- Create your first trade
- Setup automation rules (SL/TP)
- Follow successful traders
- Generate ML insights

### Customize
- Add more trading pairs
- Tune ML parameters
- Configure risk limits
- Setup alerts

### Scale
- Add more agent instances
- Increase WebSocket capacity
- Setup load balancing
- Add monitoring

---

## 📞 Need Help?

- **Docs:** Check `/docs` directory
- **Tests:** Run test scripts
- **Logs:** Check PM2 logs
- **Support:** Refer to ADMIN_GUIDE.md

---

**Ready to trade! 🎯**

Built with ❤️ using .claude methodology  
Version: 1.0.0  
Last Updated: 2025-11-24
