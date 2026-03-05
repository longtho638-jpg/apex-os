import { OrderManager } from '@backend/services/order-manager';
import { NextResponse } from 'next/server';

const orderManager = new OrderManager();
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await orderManager.initialize();
    initialized = true;
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { userId, symbol, side, price, quantity, timeInForce = 'GTC', expiresAt } = body;

    // Validation
    if (!userId || !symbol || !side || !price || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, symbol, side, price, quantity' },
        { status: 400 },
      );
    }

    if (side !== 'BUY' && side !== 'SELL') {
      return NextResponse.json({ error: 'Side must be BUY or SELL' }, { status: 400 });
    }

    if (price <= 0 || quantity <= 0) {
      return NextResponse.json({ error: 'Price and quantity must be greater than 0' }, { status: 400 });
    }

    // Place limit order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const placedOrderId = await orderManager.placeLimitOrder({
      id: orderId,
      userId,
      symbol,
      side: side as 'BUY' | 'SELL',
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      timeInForce: timeInForce as 'GTC' | 'IOC' | 'FOK',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      orderId: placedOrderId,
      message: `Limit order placed: ${side} ${quantity} ${symbol} @ $${price}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to place limit order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || undefined;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const orders = await orderManager.getUserOrders(userId, status);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { userId, orderId } = body;

    if (!userId || !orderId) {
      return NextResponse.json({ error: 'Missing required fields: userId, orderId' }, { status: 400 });
    }

    await orderManager.cancelLimitOrder(orderId, userId);

    return NextResponse.json({
      success: true,
      message: 'Limit order cancelled',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to cancel limit order' }, { status: 500 });
  }
}
