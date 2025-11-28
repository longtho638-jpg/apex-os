# Checklist - Credentials & Configuration for Payment Integration

**Purpose**: Danh sách thông tin cần chuẩn bị từ Polar.sh và Binance Pay để Gemini CLI viết code chuẩn

**Date**: 2025-11-26

---

## 🔵 1. POLAR.SH Account Setup

### 1.1 Đăng Ký & Setup

**URL**: https://polar.sh/signup

**Steps**:
1. Tạo account với email: `billwill.mentor@gmail.com`
2. Xác thực email
3. Complete onboarding
4. Create organization (e.g., "ApexOS" hoặc "Apex Trading")

---

### 1.2 API Credentials (CRITICAL)

**Locations**: https://polar.sh/settings/api

#### ✅ Cần lấy:

**1. Access Token (Server-Side)**
```bash
# Format: polar_sk_live_xxxxx (production)
#     or: polar_sk_test_xxxxx (testing)
POLAR_ACCESS_TOKEN=polar_sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Lưu ý**:
- Có 2 loại: Test mode và Live mode
- Dùng **Test mode** để develop trước
- **NEVER commit** token này vào git

**2. Organization ID**
```bash
# Format: org_xxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxx
```

**Cách lấy**:
- Vào Settings → Organization
- Copy Organization ID

---

### 1.3 Webhook Configuration

**Location**: https://polar.sh/settings/webhooks

#### ✅ Setup Webhook Endpoint

**Development (Local)**:
1. Install ngrok: `brew install ngrok`
2. Start ngrok: `ngrok http 3000`
3. Copy HTTPS URL: `https://xxxxx.ngrok.io`
4. Add webhook endpoint: `https://xxxxx.ngrok.io/api/webhooks/polar`

**Production**:
- URL: `https://apex-os.vercel.app/api/webhooks/polar`

**Events to subscribe**:
- ✅ `checkout.created`
- ✅ `checkout.completed`
- ✅ `checkout.failed`
- ✅ `subscription.created`
- ✅ `subscription.updated`
- ✅ `subscription.cancelled`

**Webhook Secret**:
```bash
# Format: whsec_xxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cách lấy**:
- Tạo webhook endpoint
- Copy secret từ dashboard

---

### 1.4 Product Configuration

**Location**: https://polar.sh/dashboard/products

#### ✅ Tạo 3 Products (Subscription Plans)

**Product 1: Founders Plan**
- Name: `ApexOS Founders`
- Type: `Subscription`
- Price: `$49/month`
- Billing Period: `Monthly`
- Currency: `USD`

**Lưu thông tin**:
```bash
POLAR_FOUNDERS_PRODUCT_ID=prod_xxxxx
POLAR_FOUNDERS_PRICE_ID=price_xxxxx
```

**Product 2: Premium Plan**
- Name: `ApexOS Premium`
- Type: `Subscription`
- Price: `$99/month`
- Billing Period: `Monthly`
- Currency: `USD`

**Lưu thông tin**:
```bash
POLAR_PREMIUM_PRODUCT_ID=prod_yyyyy
POLAR_PREMIUM_PRICE_ID=price_yyyyy
```

**Product 3: (Optional) Annual Discount**
- Founders Annual: `$490/year` (save $98)
- Premium Annual: `$990/year` (save $198)

---

### 1.5 Payout Configuration

**Location**: https://polar.sh/settings/payouts

**Stripe Connect Setup**:
1. Link Stripe account
2. Add bank account
3. Set payout schedule (e.g., Monthly)

**Lưu thông tin**:
```bash
POLAR_STRIPE_CONNECTED=true
POLAR_PAYOUT_SCHEDULE=monthly
```

---

## 🟡 2. BINANCE PAY Account Setup

### 2.1 Merchant Registration

**URL**: https://merchant.binance.com/en

**Steps**:
1. Login với Binance account
2. Navigate to **Binance Pay** → **Merchant**
3. Complete KYC verification
4. Submit business documents:
   - Business registration
   - Tax ID
   - Business bank statement
   - Proof of website ownership

**Approval time**: 3-5 business days

---

### 2.2 API Credentials (CRITICAL)

**Location**: https://merchant.binance.com/en/dashboard/developer

#### ✅ Cần lấy:

**1. API Key**
```bash
# Format: Long alphanumeric string
BINANCE_PAY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**2. Secret Key**
```bash
# Format: Long alphanumeric string
BINANCE_PAY_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**3. Merchant ID** (Optional, for reference)
```bash
BINANCE_PAY_MERCHANT_ID=12345678
```

**Lưu ý**:
- API Key có **IP whitelist** (add ngrok IP cho dev)
- Secret key dùng để sign requests (HMAC-SHA512)
- **NEVER share** secret key

---

### 2.3 Webhook Configuration

**Location**: https://merchant.binance.com/en/dashboard/settings/webhook

#### ✅ Setup Webhook URL

**Development**:
```
https://xxxxx.ngrok.io/api/webhooks/binance-pay
```

**Production**:
```
https://apex-os.vercel.app/api/webhooks/binance-pay
```

**Webhook Secret**:
```bash
# Format: Long alphanumeric string
BINANCE_PAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Events to subscribe**:
- ✅ `PAY` - Payment success/failure
- ✅ `REFUND` - Refund notifications
- ✅ `SUBSCRIPTION` - Subscription events (if available)

---

### 2.4 Accepted Cryptocurrencies

**Location**: https://merchant.binance.com/en/dashboard/settings/currencies

#### ✅ Enable these currencies:

**Stablecoins (Recommended)**:
- ✅ USDT (Tether) - TRC20 (lowest fee)
- ✅ USDC (USD Coin) - ERC20
- ✅ BUSD (Binance USD)

**Major Cryptocurrencies**:
- ✅ BTC (Bitcoin)
- ✅ ETH (Ethereum)
- ✅ BNB (Binance Coin)

**Lưu thông tin**:
```bash
BINANCE_PAY_ACCEPTED_CURRENCIES=USDT,USDC,BTC,ETH,BNB
BINANCE_PAY_DEFAULT_CURRENCY=USDT
```

---

### 2.5 Settlement Configuration

**Location**: https://merchant.binance.com/en/dashboard/settings/settlement

**Auto-Conversion Settings**:
- Convert crypto to: `USDT` or `USD`
- Settlement schedule: `Daily` or `Weekly`
- Minimum settlement amount: `$100`

**Lưu thông tin**:
```bash
BINANCE_PAY_SETTLEMENT_CURRENCY=USDT
BINANCE_PAY_SETTLEMENT_SCHEDULE=daily
BINANCE_PAY_MIN_SETTLEMENT=100
```

---

## 📝 3. COMBINED CONFIGURATION FILE

### 3.1 Create `.env.local` (LOCAL ONLY - DO NOT COMMIT)

```bash
# =================================
# POLAR.SH CONFIGURATION
# =================================
POLAR_ACCESS_TOKEN=polar_sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Product IDs
POLAR_FOUNDERS_PRODUCT_ID=prod_xxxxx
POLAR_FOUNDERS_PRICE_ID=price_xxxxx
POLAR_PREMIUM_PRODUCT_ID=prod_yyyyy
POLAR_PREMIUM_PRICE_ID=price_yyyyy

# =================================
# BINANCE PAY CONFIGURATION
# =================================
BINANCE_PAY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BINANCE_PAY_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BINANCE_PAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BINANCE_PAY_MERCHANT_ID=12345678

# Accepted currencies (comma-separated)
BINANCE_PAY_ACCEPTED_CURRENCIES=USDT,USDC,BTC,ETH,BNB
BINANCE_PAY_DEFAULT_CURRENCY=USDT

# Settlement
BINANCE_PAY_SETTLEMENT_CURRENCY=USDT
BINANCE_PAY_SETTLEMENT_SCHEDULE=daily
BINANCE_PAY_MIN_SETTLEMENT=100

# =================================
# APP CONFIGURATION
# =================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=${NEXT_PUBLIC_APP_URL}/dashboard?payment=success
PAYMENT_CANCEL_URL=${NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled

# =================================
# SUPABASE (EXISTING)
# =================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3.2 Update `.env.example` (TEMPLATE - SAFE TO COMMIT)

```bash
# Polar.sh
POLAR_ACCESS_TOKEN=polar_sk_test_your_token_here
POLAR_ORGANIZATION_ID=org_your_org_id
POLAR_WEBHOOK_SECRET=whsec_your_webhook_secret
POLAR_FOUNDERS_PRICE_ID=price_founders_id
POLAR_PREMIUM_PRICE_ID=price_premium_id

# Binance Pay
BINANCE_PAY_API_KEY=your_api_key_here
BINANCE_PAY_SECRET_KEY=your_secret_key_here
BINANCE_PAY_WEBHOOK_SECRET=your_webhook_secret_here
BINANCE_PAY_MERCHANT_ID=your_merchant_id
BINANCE_PAY_ACCEPTED_CURRENCIES=USDT,USDC,BTC,ETH,BNB
BINANCE_PAY_DEFAULT_CURRENCY=USDT

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=${NEXT_PUBLIC_APP_URL}/dashboard?payment=success
PAYMENT_CANCEL_URL=${NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled
```

---

## 📋 4. TESTING CREDENTIALS CHECKLIST

### ✅ Polar Test Mode

**Test Cards** (use in Polar checkout):
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Test Email**:
```
test+polar@apexos.com
```

**Expected behavior**:
- Checkout completes successfully
- Webhook `checkout.completed` sent
- Subscription created

---

### ✅ Binance Pay Test Mode

**Test Wallet** (if testnet available):
- Use Binance Testnet account
- Fund with test USDT/BTC

**Test Flow**:
1. Create order
2. Pay with test wallet
3. Verify webhook `PAY_SUCCESS`
4. Check transaction in merchant dashboard

**Note**: Binance Pay may not have full testnet - use SMALL amounts in production

---

## 🔐 5. SECURITY CHECKLIST

Before giving credentials to Gemini:

- [ ] `.env.local` is in `.gitignore`
- [ ] Created `.env.example` with placeholders
- [ ] Used **test mode** keys for development
- [ ] Stored production keys in password manager
- [ ] Setup 2FA on both Polar and Binance accounts
- [ ] Documented where keys are stored (team password manager)

---

## 📤 6. PROVIDE TO GEMINI CLI

**Create file for Gemini**:

```bash
# Create credentials template
cat > .gemini/payment_credentials_template.txt << 'EOF'
# Paste your credentials here (DON'T COMMIT THIS FILE)

# POLAR
POLAR_ACCESS_TOKEN=
POLAR_ORGANIZATION_ID=
POLAR_WEBHOOK_SECRET=
POLAR_FOUNDERS_PRICE_ID=
POLAR_PREMIUM_PRICE_ID=

# BINANCE PAY
BINANCE_PAY_API_KEY=
BINANCE_PAY_SECRET_KEY=
BINANCE_PAY_WEBHOOK_SECRET=
BINANCE_PAY_MERCHANT_ID=

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Add to gitignore
echo ".gemini/payment_credentials_template.txt" >> .gitignore
```

**Then tell Gemini**:
```
I've placed the API credentials in .gemini/payment_credentials_template.txt. Use these values when creating the payment integration code. Make sure to use them in .env.local and NEVER commit them to git.
```

---

## 🎯 Summary - What You Need

### From Polar.sh:
1. ✅ Access Token (Test mode)
2. ✅ Organization ID
3. ✅ Webhook Secret
4. ✅ Founders Plan Price ID
5. ✅ Premium Plan Price ID

### From Binance Pay:
1. ✅ API Key
2. ✅ Secret Key
3. ✅ Webhook Secret
4. ✅ Merchant ID
5. ✅ Accepted currencies list

### From Your Setup:
1. ✅ Supabase credentials (already have)
2. ✅ App URL (localhost for dev)
3. ✅ Ngrok URL (for webhooks during dev)

---

## 📞 Next Steps

1. **Get Polar credentials** (5-10 min):
   - Signup → Create org → Get API key → Create products

2. **Get Binance Pay credentials** (3-5 days for approval):
   - Apply for merchant → Wait for approval → Get API keys

3. **Fill credentials template**:
   - Copy template to `.env.local`
   - Paste real values

4. **Give to Gemini**:
   - Place in `.gemini/payment_credentials_template.txt`
   - Tell Gemini to use it

5. **Gemini implements** using real credentials

**Estimated total time**: 
- Polar setup: 15 minutes
- Binance Pay approval: 3-5 business days (but can start with Polar only first)
