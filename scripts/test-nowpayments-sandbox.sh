#!/bin/bash

# NOWPayments Sandbox Quick Test
# Run this after providing credentials to verify API access

set -e

echo "🔧 NOWPayments Sandbox Verification"
echo "===================================="
echo ""

# Check env vars
if [ -z "$NOWPAYMENTS_API_KEY" ]; then
    echo "❌ NOWPAYMENTS_API_KEY not set"
    echo "Please run: export NOWPAYMENTS_API_KEY=your-key"
    exit 1
fi

if [ -z "$NOWPAYMENTS_EMAIL" ]; then
    echo "❌ NOWPAYMENTS_EMAIL not set"
    echo "Please run: export NOWPAYMENTS_EMAIL=your-email"
    exit 1
fi

if [ -z "$NOWPAYMENTS_PASSWORD" ]; then
    echo "❌ NOWPAYMENTS_PASSWORD not set"
    echo "Please run: export NOWPAYMENTS_PASSWORD=your-password"
    exit 1
fi

echo "✅ Environment variables set"
echo ""

# Test API Key
echo "📡 Testing API Key..."
STATUS=$(curl -s https://api-sandbox.nowpayments.io/v1/status \
  -H "x-api-key: $NOWPAYMENTS_API_KEY")

if echo "$STATUS" | grep -q "OK"; then
    echo "✅ API Key valid!"
else
    echo "❌ API Key test failed"
    echo "Response: $STATUS"
    exit 1
fi

echo ""

# Test Payout Auth
echo "🔐 Testing Payout Authentication..."
AUTH_RESPONSE=$(curl -s -X POST https://api-sandbox.nowpayments.io/v1/auth \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$NOWPAYMENTS_EMAIL\",\"password\":\"$NOWPAYMENTS_PASSWORD\"}")

if echo "$AUTH_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Payout auth successful!"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "❌ Payout auth failed"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo ""
echo "===================================="
echo "✅ All NOWPayments sandbox tests passed!"
echo ""
echo "Next steps:"
echo "1. Add credentials to Vercel env vars"
echo "2. Deploy database migration (supabase db push)"
echo "3. Run Gemini integration test"
echo "===================================="
