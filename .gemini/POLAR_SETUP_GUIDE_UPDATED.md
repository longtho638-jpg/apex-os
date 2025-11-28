# Polar.sh Setup Guide - UPDATED 2025-11-26

**Based on**: Latest Polar.sh dashboard UI

---

## 📋 Organization Information (From Screenshot)

Anh đã có organization setup rồi! ✅

**Organization Details**:
- **Organization Name**: Apexrebate
- **Organization Slug**: `apexrebate`
- **Organization ID**: `9def4b9c-46ff-49ff-9edf-7e` (Copy từ "Identifier")
- **Support Email**: admin@apexrebate.com
- **Website**: https://apexrebate.com/en/landing

---

## 🔑 Bước Tiếp Theo: Lấy API Credentials

### Step 1: Get API Access Token

**Navigation**: Polar Dashboard → Settings → API (hoặc Developer)

**Cần tìm**:
1. **API Keys section**
2. Click "Create API Key" hoặc "Generate Token"
3. Copy **Access Token** (format: `polar_sk_live_xxxxx` hoặc `polar_sk_test_xxxxx`)

**Lưu vào**: `.env.local`
```bash
POLAR_ACCESS_TOKEN=polar_sk_test_xxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=9def4b9c-46ff-49ff-9edf-7e
```

---

### Step 2: Create Products (Subscription Plans)

**Navigation**: Polar Dashboard → Products → Create Product

#### Product 1: Founders Plan

**Settings**:
- Product Name: `ApexOS Founders`
- Product Type: `Subscription`
- Billing Interval: `Monthly`
- Price: `$49`
- Currency: `USD`

**After creating**:
- Copy **Product ID** (format: `prod_xxxxx`)
- Copy **Price ID** (format: `price_xxxxx`)

**Lưu vào**: `.env.local`
```bash
POLAR_FOUNDERS_PRODUCT_ID=prod_xxxxx
POLAR_FOUNDERS_PRICE_ID=price_xxxxx
```

---

#### Product 2: Premium Plan

**Settings**:
- Product Name: `ApexOS Premium`
- Product Type: `Subscription`
- Billing Interval: `Monthly`
- Price: `$99`
- Currency: `USD`

**After creating**:
- Copy **Product ID** (format: `prod_yyyyy`)
- Copy **Price ID** (format: `price_yyyyy`)

**Lưu vào**: `.env.local`
```bash
POLAR_PREMIUM_PRODUCT_ID=prod_yyyyy
POLAR_PREMIUM_PRICE_ID=price_yyyyy
```

---

### Step 3: Setup Webhooks

**Navigation**: Polar Dashboard → Settings → Webhooks

#### Development (Local Testing)

1. **Install ngrok** (if not already):
   ```bash
   brew install ngrok
   ```

2. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Create Webhook Endpoint**:
   - URL: `https://xxxxx.ngrok.io/api/webhooks/polar`
   - Events to subscribe:
     - ✅ `checkout.created`
     - ✅ `checkout.completed`
     - ✅ `checkout.failed`
     - ✅ `subscription.created`
     - ✅ `subscription.updated`
     - ✅ `subscription.cancelled`

4. **Copy Webhook Secret**:
   ```bash
   POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### Production

- URL: `https://apex-os.vercel.app/api/webhooks/polar`
- Same events as above

---

## 📝 Complete .env.local Template

Sau khi có tất cả thông tin, tạo file `.env.local`:

```bash
# ============================================
# POLAR.SH CONFIGURATION
# ============================================

# Access Token (từ API Keys section)
POLAR_ACCESS_TOKEN=polar_sk_test_xxxxxxxxxxxxx

# Organization ID (từ Settings → General → Identifier)
POLAR_ORGANIZATION_ID=9def4b9c-46ff-49ff-9edf-7e

# Webhook Secret (từ Webhooks section)
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Products (từ Products section)
POLAR_FOUNDERS_PRODUCT_ID=prod_xxxxx
POLAR_FOUNDERS_PRICE_ID=price_xxxxx
POLAR_PREMIUM_PRODUCT_ID=prod_yyyyy
POLAR_PREMIUM_PRICE_ID=price_yyyyy

# Server Mode
POLAR_SERVER=sandbox

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=${NEXT_PUBLIC_APP_URL}/dashboard?payment=success
PAYMENT_CANCEL_URL=${NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled
```

---

## ✅ Verification Checklist

- [ ] Organization settings confirmed (screenshot shows ✅)
- [ ] API Access Token obtained
- [ ] Founders Product created ($49/mo)
- [ ] Premium Product created ($99/mo)
- [ ] Webhook endpoint configured
- [ ] Webhook secret copied
- [ ] `.env.local` file created with all values
- [ ] Ready to test checkout flow

---

## 🧪 Testing Checkout Flow

After setup complete:

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to pricing page
open http://localhost:3000/pricing

# 3. Click "Subscribe to Founders"
# 4. Should see checkout modal
# 5. Select payment method
# 6. Click checkout button
# 7. Should redirect to Polar checkout page
```

---

## 📞 Next Steps

1. **Get API Token** từ Polar dashboard
2. **Create 2 Products** (Founders $49, Premium $99)
3. **Setup Webhook** (dùng ngrok cho local test)
4. **Fill .env.local** với tất cả credentials
5. **Test checkout flow** để verify

**Anh đang ở step nào?** Em có thể hướng dẫn chi tiết từng bước! 🎯
