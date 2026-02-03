'use client';

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface PnLMetrics {
    totalRealizedPnL: number;
    totalUnrealizedPnL: number;
    accountBalance: number;
    totalExposure: number;
    winRate: number;
    totalTrades: number;
    profitableTrades: number;
    lossTrades: number;
}

interface PnLDashboardProps {
    userId: string;
}

export function PnLDashboard({ userId }: PnLDashboardProps) {
    const [metrics, setMetrics] = useState<PnLMetrics>({
        totalRealizedPnL: 0,
        totalUnrealizedPnL: 0,
        accountBalance: 0,
        totalExposure: 0,
        winRate: 0,
        totalTrades: 0,
        profitableTrades: 0,
        lossTrades: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPnLMetrics();
    }, [userId]);

    const fetchPnLMetrics = async () => {
        try {
            setLoading(true);

            // Fetch wallet balance
            const walletRes = await fetch(`/api/v1/wallets?userId=${userId}`);
            const walletData = await walletRes.json();
            const balance = walletData.balance || 0;

            // Fetch closed positions for realized PnL
            const closedRes = await fetch(`/api/v1/trading/positions?userId=${userId}&status=CLOSED`);
            const closedData = await closedRes.json();
            const closedPositions = closedData.positions || [];

            // Fetch open positions for unrealized PnL
            const openRes = await fetch(`/api/v1/trading/positions?userId=${userId}&status=OPEN`);
            const openData = await openRes.json();
            const openPositions = openData.positions || [];

            // Calculate realized PnL from closed positions
            const realizedPnL = closedPositions.reduce((sum: number, pos: any) => {
                // Simplified - in production, calculate actual PnL from close price
                return sum + (pos.unrealized_pnl || 0);
            }, 0);

            // Calculate unrealized PnL from open positions
            const unrealizedPnL = openPositions.reduce((sum: number, pos: any) => {
                return sum + (pos.unrealized_pnl || 0);
            }, 0);

            // Calculate exposure
            const exposure = openPositions.reduce((sum: number, pos: any) => {
                return sum + (pos.entry_price * pos.quantity * pos.leverage);
            }, 0);

            // Calculate win rate
            const profitableTrades = closedPositions.filter((pos: any) =>
                (pos.unrealized_pnl || 0) > 0
            ).length;
            const lossTrades = closedPositions.filter((pos: any) =>
                (pos.unrealized_pnl || 0) <= 0
            ).length;
            const totalTrades = closedPositions.length;
            const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

            setMetrics({
                totalRealizedPnL: realizedPnL,
                totalUnrealizedPnL: unrealizedPnL,
                accountBalance: balance,
                totalExposure: exposure,
                winRate,
                totalTrades,
                profitableTrades,
                lossTrades
            });
        } catch (error) {
            logger.error('Failed to fetch PnL metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPnL = metrics.totalRealizedPnL + metrics.totalUnrealizedPnL;
    const totalReturn = metrics.accountBalance > 0
        ? (totalPnL / metrics.accountBalance) * 100
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Activity className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">PnL Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                    Track your trading performance and profitability
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total PnL */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}% return
                        </p>
                    </CardContent>
                </Card>

                {/* Realized PnL */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Realized PnL</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.totalRealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metrics.totalRealizedPnL >= 0 ? '+' : ''}${metrics.totalRealizedPnL.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {metrics.totalTrades} closed trades
                        </p>
                    </CardContent>
                </Card>

                {/* Unrealized PnL */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Unrealized PnL</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.totalUnrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metrics.totalUnrealizedPnL >= 0 ? '+' : ''}${metrics.totalUnrealizedPnL.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From open positions
                        </p>
                    </CardContent>
                </Card>

                {/* Win Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.winRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.profitableTrades}W / {metrics.lossTrades}L
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Account Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Account Balance</span>
                            <span className="font-mono font-bold text-lg">
                                ${metrics.accountBalance.toFixed(2)} USDT
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Exposure</span>
                            <span className="font-mono font-bold">
                                ${metrics.totalExposure.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Exposure %</span>
                            <span className={`font-bold ${(metrics.totalExposure / metrics.accountBalance * 100) > 80
                                    ? 'text-red-500'
                                    : 'text-green-500'
                                }`}>
                                {metrics.accountBalance > 0
                                    ? ((metrics.totalExposure / metrics.accountBalance) * 100).toFixed(1)
                                    : 0
                                }%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Trading Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Total Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{metrics.totalTrades}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-green-500">Profitable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-500">
                            {metrics.profitableTrades}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-red-500">Loss</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-500">
                            {metrics.lossTrades}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
