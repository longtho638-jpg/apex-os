'use client';

import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { usePriceStream } from '@/hooks/usePriceStream';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, X, Clock } from 'lucide-react';

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];

interface LimitOrder {
    id: string;
    order_id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    filled_quantity: number;
    remaining_quantity: number;
    status: string;
    created_at: string;
}

interface LimitOrderPanelProps {
    userId: string;
}

export function LimitOrderPanel({ userId }: LimitOrderPanelProps) {
    const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
    const [limitPrice, setLimitPrice] = useState('');
    const [quantity, setQuantity] = useState('0.001');
    const [loading, setLoading] = useState(false);
    const [pendingOrders, setPendingOrders] = useState<LimitOrder[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { connected, getPrice } = usePriceStream({ symbols: SYMBOLS });
    const currentPrice = getPrice(selectedSymbol);

    useEffect(() => {
        fetchPendingOrders();
        const interval = setInterval(fetchPendingOrders, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        // Auto-set limit price to current price when it changes
        if (currentPrice && !limitPrice) {
            setLimitPrice(currentPrice.price.toFixed(2));
        }
    }, [currentPrice]);

    const fetchPendingOrders = async () => {
        try {
            const res = await fetch(`/api/v1/trading/limit-orders?userId=${userId}&status=OPEN`);
            const data = await res.json();
            if (data.success) {
                setPendingOrders(data.orders || []);
            }
        } catch (err) {
            logger.error('Failed to fetch pending orders:', err);
        }
    };

    const placeLimitOrder = async (side: 'BUY' | 'SELL') => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const price = parseFloat(limitPrice);
            const qty = parseFloat(quantity);

            if (isNaN(price) || price <= 0) {
                throw new Error('Invalid limit price');
            }
            if (isNaN(qty) || qty <= 0) {
                throw new Error('Invalid quantity');
            }

            const res = await fetch('/api/v1/trading/limit-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    symbol: selectedSymbol,
                    side,
                    price,
                    quantity: qty,
                    timeInForce: 'GTC'
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(`Limit order placed: ${side} ${qty} ${selectedSymbol} @ $${price}`);
                setQuantity('0.001');
                await fetchPendingOrders();

                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(data.error || 'Failed to place limit order');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string) => {
        try {
            const res = await fetch('/api/v1/trading/limit-orders', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, orderId })
            });

            const data = await res.json();

            if (data.success) {
                await fetchPendingOrders();
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to cancel order');
        }
    };

    const estimatedCost = parseFloat(limitPrice || '0') * parseFloat(quantity || '0');
    const distanceFromMarket = currentPrice
        ? ((parseFloat(limitPrice || '0') - currentPrice.price) / currentPrice.price) * 100
        : 0;

    return (
        <div className="space-y-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Limit Orders</CardTitle>
                        {connected ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/20">
                                🟢 Live
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
                                🟡 Connecting
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Symbol Selector */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Symbol</label>
                        <div className="grid grid-cols-4 gap-2">
                            {SYMBOLS.map((symbol) => {
                                const priceData = getPrice(symbol);
                                const isSelected = symbol === selectedSymbol;

                                return (
                                    <button
                                        key={symbol}
                                        onClick={() => {
                                            setSelectedSymbol(symbol);
                                            setLimitPrice(''); // Reset limit price
                                        }}
                                        className={`p-3 rounded-lg border text-left transition-colors ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <p className="font-semibold text-sm">{symbol.split('/')[0]}</p>
                                        {priceData && (
                                            <p className="text-xs text-muted-foreground font-mono">
                                                ${priceData.price.toFixed(2)}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current Market Price */}
                    {currentPrice && (
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Current Market Price</p>
                            <p className="text-xl font-bold font-mono">
                                ${currentPrice.price.toFixed(2)}
                            </p>
                        </div>
                    )}

                    {/* Limit Price Input */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Limit Price (USDT)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                            placeholder={currentPrice ? currentPrice.price.toFixed(2) : "0.00"}
                        />
                        {distanceFromMarket !== 0 && (
                            <p className={`text-xs mt-1 ${Math.abs(distanceFromMarket) > 5 ? 'text-yellow-500' : 'text-muted-foreground'
                                }`}>
                                {distanceFromMarket > 0 ? '+' : ''}{distanceFromMarket.toFixed(2)}% from market
                            </p>
                        )}
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Quantity</label>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                            placeholder="0.001"
                        />
                        {estimatedCost > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Estimated cost: ${estimatedCost.toFixed(2)} USDT
                            </p>
                        )}
                    </div>

                    {/* Buy/Sell Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            size="lg"
                            onClick={() => placeLimitOrder('BUY')}
                            disabled={loading || !connected || !limitPrice || parseFloat(quantity) <= 0}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Buy Limit
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => placeLimitOrder('SELL')}
                            disabled={loading || !connected || !limitPrice || parseFloat(quantity) <= 0}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <TrendingDown className="w-4 h-4 mr-2" />
                            Sell Limit
                        </Button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            ❌ {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                            ✅ {success}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pending Orders */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Pending Limit Orders ({pendingOrders.length})</CardTitle>
                        <Button variant="ghost" size="sm" onClick={fetchPendingOrders}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No pending limit orders
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {pendingOrders.map((order) => {
                                const currentSymbolPrice = getPrice(order.symbol);
                                const distancePercent = currentSymbolPrice
                                    ? ((order.price - currentSymbolPrice.price) / currentSymbolPrice.price) * 100
                                    : 0;

                                return (
                                    <div
                                        key={order.id}
                                        className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">{order.symbol}</span>
                                                    <Badge variant={order.side === 'BUY' ? 'default' : 'destructive'}>
                                                        {order.side}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        GTC
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Limit Price</p>
                                                        <p className="font-mono font-semibold">${order.price.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Quantity</p>
                                                        <p className="font-mono">{order.remaining_quantity.toFixed(4)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Distance</p>
                                                        <p className={`font-mono text-xs ${Math.abs(distancePercent) > 5 ? 'text-yellow-500' : 'text-muted-foreground'
                                                            }`}>
                                                            {distancePercent > 0 ? '+' : ''}{distancePercent.toFixed(2)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => cancelOrder(order.order_id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
