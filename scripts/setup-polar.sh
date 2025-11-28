#!/bin/bash

# Quick Setup Script - Polar.sh Credentials
# Usage: ./setup-polar.sh

echo "🚀 ApexOS - Polar.sh Quick Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Creating backup..."
    cp .env.local .env.local.backup
    echo "✅ Backup saved to .env.local.backup"
fi

# Organization ID (already known from screenshot)
ORG_ID="9def4b9c-46ff-49ff-9edf-7e"

echo ""
echo "📋 Step 1: API Access Token"
echo "----------------------------"
echo "1. Trong Polar dashboard hiện tại, click 'New Token'"
echo "2. Name: 'apex-production'"
echo "3. Select scopes: Chọn TẤT CẢ (Select All)"
echo "4. Click 'Create'"
echo "5. Copy token (polar_sk_...)"
echo ""
read -p "Paste API Access Token: " API_TOKEN

echo ""
echo "📋 Step 2: Webhook Secret"
echo "----------------------------"
echo "Bỏ qua bước này - sẽ setup sau khi có products"
echo "Press Enter to continue..."
read

echo ""
echo "📋 Step 3: Products (Tạo trên Polar Dashboard)"
echo "----------------------------"
echo "Mở tab mới: https://polar.sh/dashboard/apexrebate/products"
echo ""
echo "Create Product 1: Founders"
echo "  - Name: ApexOS Founders"
echo "  - Type: Subscription"
echo "  - Price: \$49/month"
echo ""
read -p "Paste Founders PRICE ID (price_xxxxx): " FOUNDERS_PRICE_ID

echo ""
echo "Create Product 2: Premium"
echo "  - Name: ApexOS Premium"  
echo "  - Type: Subscription"
echo "  - Price: \$99/month"
echo ""
read -p "Paste Premium PRICE ID (price_xxxxx): " PREMIUM_PRICE_ID

# Create .env.local
cat > .env.local << EOF
# ============================================
# POLAR.SH CONFIGURATION
# ============================================
POLAR_ACCESS_TOKEN=${API_TOKEN}
POLAR_ORGANIZATION_ID=${ORG_ID}
POLAR_WEBHOOK_SECRET=whsec_TO_BE_FILLED_LATER
POLAR_FOUNDERS_PRICE_ID=${FOUNDERS_PRICE_ID}
POLAR_PREMIUM_PRICE_ID=${PREMIUM_PRICE_ID}
POLAR_SERVER=sandbox

# ============================================
# BINANCE PAY (TO BE FILLED LATER)
# ============================================
BINANCE_PAY_API_KEY=PLACEHOLDER
BINANCE_PAY_SECRET_KEY=PLACEHOLDER
BINANCE_PAY_WEBHOOK_SECRET=PLACEHOLDER

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_SUCCESS_URL=\${NEXT_PUBLIC_APP_URL}/dashboard?payment=success
PAYMENT_CANCEL_URL=\${NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled

# ============================================
# SUPABASE (EXISTING)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF

echo ""
echo "✅ .env.local created!"
echo ""
echo "📝 What was created:"
echo "----------------------------"
echo "POLAR_ACCESS_TOKEN: ${API_TOKEN:0:20}..."
echo "POLAR_ORGANIZATION_ID: $ORG_ID"
echo "POLAR_FOUNDERS_PRICE_ID: $FOUNDERS_PRICE_ID"
echo "POLAR_PREMIUM_PRICE_ID: $PREMIUM_PRICE_ID"
echo ""
echo "⚠️  Still need to add:"
echo "  - POLAR_WEBHOOK_SECRET (after setting up webhook)"
echo "  - Supabase credentials"
echo ""
echo "🎯 Next steps:"
echo "  1. Setup webhook: https://polar.sh/dashboard/apexrebate/settings/webhooks"
echo "  2. Update .env.local with webhook secret"
echo "  3. Run: npm run dev"
echo "  4. Test checkout flow"
echo ""
echo "🚀 Ready to go!"
