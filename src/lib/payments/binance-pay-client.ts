import crypto from 'crypto';
import { PAYMENT_TIERS, PaymentTier } from '@/config/payment-tiers';

interface BinancePayOrderParams {
  userId: string;
  userEmail: string;
  tier: PaymentTier;
}

/**
 * Creates a Binance Pay order
 * @param params - Order parameters
 * @returns Order details including checkout URL
 * @throws {Error} If tier does not support Binance Pay
 * @throws {Error} If Binance Pay API returns failure status
 * @throws {Error} If HTTP request fails
 */
export async function createBinancePayOrder({
  userId,
  userEmail,
  tier
}: BinancePayOrderParams) {
  const tierConfig = PAYMENT_TIERS[tier];
  
  if (!tierConfig.binancePay) {
    throw new Error(`Tier ${tier} does not support Binance Pay`);
  }

  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Apply crypto discount
  const discountedAmount = tierConfig.binancePay.amount * 
    (1 - tierConfig.binancePay.cryptoDiscount / 100);
  
  const merchantTradeNo = `APEX-${userId}-${timestamp}`;
  const successUrl = process.env.PAYMENT_SUCCESS_URL 
    ? `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`
    : `http://localhost:3000/dashboard?payment=success&tier=${tier}`;
  const cancelUrl = process.env.PAYMENT_CANCEL_URL || 'http://localhost:3000/pricing?payment=cancelled';

  const body = {
    env: {
      terminalType: 'WEB'
    },
    merchantTradeNo,
    orderAmount: discountedAmount.toFixed(2),
    currency: 'USDT',
    goods: {
      goodsType: '02', // Virtual goods
      goodsCategory: 'Z000', // Software/Digital content
      referenceGoodsId: tier,
      goodsName: `ApexOS ${tier} Plan`,
      goodsDetail: `Monthly subscription to ApexOS ${tier} tier`
    },
    buyer: {
      buyerEmail: userEmail
    },
    returnUrl: successUrl,
    cancelUrl: cancelUrl
  };

  const bodyString = JSON.stringify(body);
  const signature = generateBinanceSignature(
    bodyString,
    timestamp,
    nonce
  );

  // Use placeholder or real API Key
  const apiKey = process.env.BINANCE_PAY_API_KEY || 'PLACEHOLDER_KEY';

  // In development/test without real keys, we can mock the response if needed, 
  // but assuming we want the real implementation logic:
  
  try {
      const response = await fetch(
        'https://bpay.binanceapi.com/binancepay/openapi/v2/order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'BinancePay-Timestamp': timestamp.toString(),
            'BinancePay-Nonce': nonce,
            'BinancePay-Certificate-SN': apiKey,
            'BinancePay-Signature': signature
          },
          body: bodyString
        }
      );

      if (!response.ok) {
        throw new Error(`Binance Pay API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status !== 'SUCCESS') {
        throw new Error(`Binance Pay order creation failed: ${result.errorMessage || 'Unknown error'}`);
      }

      return {
        checkoutUrl: result.data.checkoutUrl,
        prepayId: result.data.prepayId,
        orderId: merchantTradeNo
      };
  } catch (error) {
      console.error('Binance Pay Create Order Error:', error);
      throw error;
  }
}

/**
 * Generates HMAC-SHA512 signature for Binance Pay
 */
function generateBinanceSignature(
  body: string,
  timestamp: number,
  nonce: string
): string {
  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  const secret = process.env.BINANCE_PAY_SECRET_KEY || 'PLACEHOLDER_SECRET';
  
  return crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex')
    .toUpperCase();
}

/**
 * Queries a Binance Pay order status
 * @param prepayId - The prepay ID of the order
 * @returns Order status details
 * @throws {Error} If HTTP request fails
 */
export async function queryBinancePayOrder(prepayId: string) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const apiKey = process.env.BINANCE_PAY_API_KEY || 'PLACEHOLDER_KEY';
  
  const body = { prepayId };
  const bodyString = JSON.stringify(body);
  const signature = generateBinanceSignature(
    bodyString,
    timestamp,
    nonce
  );

  const response = await fetch(
    'https://bpay.binanceapi.com/binancepay/openapi/v2/order/query',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': apiKey,
        'BinancePay-Signature': signature
      },
      body: bodyString
    }
  );

  return await response.json();
}
