# 🔧 NOWPAYMENTS SANDBOX SETUP - STEP BY STEP

**Goal**: Get API credentials for testing auto-payout system  
**Time**: ~10 minutes  
**Cost**: FREE (sandbox)

---

## 📋 STEP-BY-STEP GUIDE

### **Step 1: Sign Up for NOWPayments Account**

1. Open browser: https://nowpayments.io
2. Click **[Sign Up]** (top right)
3. Fill in registration form:
   - **Email**: Use anh's email (e.g., anh@apexrebate.com)
   - **Password**: Strong password (save this!)
   - **Confirm Password**: Same as above
4. Click **[Create Account]**
5. Check email inbox → Click verification link
6. Account created ✅

---

### **Step 2: Enable Sandbox Mode**

1. Login to NOWPayments dashboard
2. Top right corner → Click profile icon
3. Select **Settings** or **Account Settings**
4. Find section: **API Settings** or **Developer Settings**
5. Toggle **Sandbox Mode** to ON ✅
6. You should see banner: "You are in SANDBOX mode"

**Important**: Sandbox = test mode, no real money involved!

---

### **Step 3: Get API Key**

1. In dashboard, go to **Settings** → **API Keys**
2. Click **[Generate API Key]** or **[Create New Key]**
3. Key type: **Standard API Key** (for receiving payments)
4. Copy the key → Save somewhere safe
5. Format: `NPxxx...` (starts with NP)

**Example**: `NP_API_KEY_1234567890abcdef`

---

### **Step 4: Setup Payout Authentication** (Critical!)

NOWPayments requires **separate authentication** for payouts (withdrawals).

1. In dashboard, go to **Payouts** section
2. Click **[Enable Payouts]**
3. You'll need to authenticate with **Email + Password**
4. This is the SAME email + password from Step 1

**Important**: Store these credentials in env vars:
- `NOWPAYMENTS_EMAIL=<your-email>`
- `NOWPAYMENTS_PASSWORD=<your-password>`

---

### **Step 5: Get Payout API Token** (Optional if using email/password)

If NOWPayments requires a separate payout token:

1. Go to **Payouts** → **API Settings**
2. Click **[Generate Payout Token]**
3. Copy token → Save

**Note**: Our code uses email/password auth flow, so this might be optional.

---

### **Step 6: Test Sandbox Wallet**

NOWPayments sandbox gives you **fake funds** for testing.

1. Go to **Wallet** or **Balance** in dashboard
2. You should see test balance (e.g., 10,000 USDT)
3. If not, click **[Add Test Funds]** or **[Top Up Sandbox]**
4. Select: USDT (TRC20)
5. Amount: 10,000 USDT
6. Click **[Add]**

**Result**: You now have 10,000 fake USDT to test payouts! ✅

---

## 🔑 CREDENTIALS TO PROVIDE

After completing steps above, anh sẽ có:

```bash
# From Step 3
NOWPAYMENTS_API_KEY=NP_xxxxxxxxxxxxx

# From Step 4
NOWPAYMENTS_EMAIL=anh@apexrebate.com
NOWPAYMENTS_PASSWORD=your-strong-password

# Sandbox flag
NOWPAYMENTS_SANDBOX=true
```

---

## 📸 SCREENSHOT GUIDE (If Needed)

**Dashboard Location**:
```
Login → Dashboard → Settings → API
                  ↓
              API Keys (tab)
                  ↓
          [Generate API Key]
```

**Payout Setup**:
```
Dashboard → Payouts → Enable
              ↓
    Enter Email + Password
              ↓
      Payout Access Enabled ✅
```

---

## ✅ VERIFICATION STEPS

**Test API Key**:
```bash
# Test API connectivity
curl https://api-sandbox.nowpayments.io/v1/status \
  -H "x-api-key: YOUR_API_KEY"

# Should return: {"message":"OK"}
```

**Test Payout Auth**:
```bash
# Get auth token
curl -X POST https://api-sandbox.nowpayments.io/v1/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Should return: {"token":"eyJxxx..."}
```

---

## 🚀 WHAT HAPPENS NEXT

**Once anh provides credentials**:

1. Em sẽ add vào Vercel env vars
2. Em sẽ create test script để verify
3. Em sẽ giao cho Gemini CLI deploy + test:
   ```
   - Deploy database migration
   - Run integration test
   - Execute test withdrawal in sandbox
   - Verify tx_hash returned
   ```

---

## ⚠️ IMPORTANT NOTES

### **Sandbox Limitations**:
- ✅ No real money (all fake USDT)
- ✅ Instant transactions (no blockchain wait)
- ✅ Can test unlimited times
- ❌ Tx hashes are fake (not on real blockchain)
- ❌ Can't use real crypto addresses

### **Production Migration**:
When ready for production:
1. Toggle **Sandbox Mode OFF** in settings
2. Verify real wallet balance
3. Set `NOWPAYMENTS_SANDBOX=false` in Vercel
4. Test with small amount first ($10-20)

---

## 🎯 CHECKLIST

Sau khi sign up, anh kiểm tra:
- [ ] Account verified (email confirmed)
- [ ] Sandbox mode enabled (banner visible)
- [ ] API key generated and copied
- [ ] Payout access enabled (email + password set)
- [ ] Test USDT balance visible (≥1,000 USDT)
- [ ] API test successful (`curl` command returns OK)

**Khi xong hết checklist** → Anh cung cấp credentials cho em!

---

## 📞 IF STUCK

**Common Issues**:

**Issue**: "Payout access denied"  
**Fix**: Make sure email is verified, try re-login

**Issue**: "API key invalid"  
**Fix**: Regenerate API key, make sure copying full key

**Issue**: "No sandbox balance"  
**Fix**: Click "Add Test Funds" in Wallet section

**Issue**: "Can't find Sandbox toggle"  
**Fix**: Check Account Settings → Developer/API section

---

**Ready anh!** Khi anh có credentials, paste vào đây:
```
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_EMAIL=...
NOWPAYMENTS_PASSWORD=...
```

Em sẽ deploy và test ngay! 🚀💎⚔️
