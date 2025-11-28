'use client';

import React, { useEffect, useState } from 'react';
import { usePriceStream } from '@/hooks/usePriceStream';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, X, Shield, Target } from 'lucide-react';

interface Position {
    id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    entry_price: number;
    quantity: number;
    leverage: number;
    opened_at: string;
    current_price?: number;
    unrealized_pnl?: number;
}

interface AutomationRule {
    id: string;
    position_id: string;
    rule_type: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP';
    trigger_price: number;
    trailing_percent?: number;
    status: string;
}

interface LivePositionTrackerProps {
    userId: string;
}

export function LivePositionTracker({ userId }: LivePositionTrackerProps) {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [showSLTPModal, setShowSLTPModal] = useState(false);
    const [stopLossPrice, setStopLossPrice] = useState('');
    const [takeProfitPrice, setTakeProfitPrice] = useState('');
    const [automationRules, setAutomationRules] = useState<Map<string, AutomationRule[]>>(new Map());

    const symbols = positions.map(p => p.symbol);
    const { connected, prices, getPrice } = usePriceStream({
        symbols: symbols.length > 0 ? symbols : ['BTC/USDT'] // Default to prevent empty array
    });

    const fetchPositions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/v1/trading/positions?userId=${userId}&status=OPEN`);
            const data = await res.json();

            if (data.success) {
                setPositions(data.positions || []);
            }
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        } finally {
            setLoading(false);
        }
    };

    const closePosition = async (positionId: string) => {
        try {
            setClosing(positionId);
            const res = await fetch('/api/v1/trading/positions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ positionId, userId })
            });

            const data = await res.json();

            if (data.success) {
                // Refresh positions
                await fetchPositions();
            }
        } catch (error) {
            console.error('Failed to close position:', error);
        } finally {
            setClosing(null);
        }
    };

    useEffect(() => {
        fetchPositions();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchPositions, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const fetchAutomationRules = async (positionId: string) => {
        try {
            const res = await fetch(`/api/v1/trading/automation?positionId=${positionId}`);
            const data = await res.json();
            if (data.success) {
                setAutomationRules(prev => {
                    const newMap = new Map(prev);
                    newMap.set(positionId, data.rules || []);
                    return newMap;
                });
            }
        } catch (error) {
            console.error('Failed to fetch automation rules:', error);
        }
    };

    const openSLTPModal = async (position: Position) => {
        setSelectedPosition(position);
        setStopLossPrice('');
        setTakeProfitPrice('');
        setShowSLTPModal(true);
        await fetchAutomationRules(position.id);
    };

    const setSLTP = async (ruleType: 'STOP_LOSS' | 'TAKE_PROFIT') => {
        if (!selectedPosition) return;

        try {
            const price = ruleType === 'STOP_LOSS' ? stopLossPrice : takeProfitPrice;
            if (!price) return;

            const res = await fetch('/api/v1/trading/automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    positionId: selectedPosition.id,
                    userId,
                    ruleType,
                    price: parseFloat(price)
                })
            });

            const data = await res.json();
            if (data.success) {
                await fetchAutomationRules(selectedPosition.id);
                if (ruleType === 'STOP_LOSS') setStopLossPrice('');
                if (ruleType === 'TAKE_PROFIT') setTakeProfitPrice('');
            }
        } catch (error) {
            console.error('Failed to set automation rule:', error);
        }
    };

    const cancelRule = async (ruleId: string) => {
        try {
            const res = await fetch('/api/v1/trading/automation', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruleId, userId })
            });

            if (res.ok && selectedPosition) {
                await fetchAutomationRules(selectedPosition.id);
            }
        } catch (error) {
            console.error('Failed to cancel rule:', error);
        }
    };

    const calculatePnL = (pos: Position): { pnl: number; pnlPercent: number; currentPrice: number } => {
        const priceData = getPrice(pos.symbol);
        const currentPrice = priceData?.price || pos.entry_price;

        const priceDiff = pos.side === 'LONG'
            ? currentPrice - pos.entry_price
            : pos.entry_price - currentPrice;

        const pnl = priceDiff * pos.quantity * pos.leverage;
        const pnlPercent = (priceDiff / pos.entry_price) * 100 * pos.leverage;

        return { pnl, pnlPercent, currentPrice };
    };

    const totalPnL = positions.reduce((sum, pos) => sum + calculatePnL(pos).pnl, 0);

    if (loading && positions.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Open Positions</h2>
                    <p className="text-sm text-muted-foreground">
                        {connected ? (
                            <span className="text-green-500">🟢 Live Updates</span>
                        ) : (
                            <span className="text-yellow-500">🟡 Connecting...</span>
                        )}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Unrealized PnL</p>
                    <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </p>
                </div>
            </div>

            {positions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>No open positions. Place your first trade to get started!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {positions.map((pos) => {
                        const { pnl, pnlPercent, currentPrice } = calculatePnL(pos);
                        const isProfitable = pnl >= 0;

                        return (
                            <Card key={pos.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">{pos.symbol}</CardTitle>
                                            <Badge
                                                variant={pos.side === 'LONG' ? 'default' : 'destructive'}
                                                className="font-semibold"
                                            >
                                                {pos.side}
                                            </Badge>
                                            {pos.leverage > 1 && (
                                                <Badge variant="outline">{pos.leverage}x</Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openSLTPModal(pos)}
                                            >
                                                <Shield className="w-4 h-4 mr-1" />
                                                SL/TP
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => closePosition(pos.id)}
                                                disabled={closing === pos.id}
                                            >
                                                {closing === pos.id ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <X className="w-4 h-4" />
                                                )}
                                                <span className="ml-1">Close</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Entry Price</p>
                                            <p className="font-mono font-semibold">
                                                ${pos.entry_price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Current Price</p>
                                            <p className="font-mono font-semibold">
                                                ${currentPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Quantity</p>
                                            <p className="font-mono font-semibold">
                                                {pos.quantity.toFixed(4)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Unrealized PnL</p>
                                            <div className="flex items-center gap-1">
                                                {isProfitable ? (
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                                )}
                                                <div className={isProfitable ? 'text-green-500' : 'text-red-500'}>
                                                    <p className="font-mono font-bold">
                                                        {isProfitable ? '+' : ''}${pnl.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs">
                                                        ({isProfitable ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                        Opened {new Date(pos.opened_at).toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
