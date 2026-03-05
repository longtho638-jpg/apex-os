'use client';

import { Activity, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface Signal {
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  reason: string;
  confidence: number;
  indicators: {
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
  };
  timestamp: number;
}

export function SignalsDashboard() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSignals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/trading/signals?action=generate&symbols=BTC/USDT,ETH/USDT,SOL/USDT,BNB/USDT');
      const data = await res.json();
      if (data.success) {
        setSignals(data.signals || []);
      }
    } catch (error) {
      logger.error('Failed to generate signals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateSignals();
  }, [generateSignals]);

  const _getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'text-green-500';
      case 'SELL':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Signal Matrix</h2>
          <p className="text-sm text-muted-foreground">AI-generated signals based on RSI and MACD indicators</p>
        </div>
        <Button onClick={generateSignals} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {signals.map((signal) => (
          <Card key={signal.symbol} className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                  <Badge
                    variant={signal.type === 'BUY' ? 'default' : signal.type === 'SELL' ? 'destructive' : 'outline'}
                    className="mt-2"
                  >
                    {signal.type === 'BUY' && <TrendingUp className="w-3 h-3 mr-1" />}
                    {signal.type === 'SELL' && <TrendingDown className="w-3 h-3 mr-1" />}
                    {signal.type === 'HOLD' && <Activity className="w-3 h-3 mr-1" />}
                    {signal.type}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className={`text-xl font-bold ${getConfidenceColor(signal.confidence)}`}>
                    {(signal.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{signal.reason}</p>

              {/* Indicators */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {signal.indicators.rsi !== undefined && (
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">RSI</p>
                    <p
                      className={`font-semibold ${
                        signal.indicators.rsi < 30
                          ? 'text-green-500'
                          : signal.indicators.rsi > 70
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {signal.indicators.rsi.toFixed(1)}
                    </p>
                  </div>
                )}
                {signal.indicators.macd && (
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">MACD</p>
                    <p
                      className={`font-semibold ${
                        signal.indicators.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {signal.indicators.macd.macd > signal.indicators.macd.signal ? '↑' : '↓'}{' '}
                      {signal.indicators.macd.histogram.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Generated {new Date(signal.timestamp).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {signals.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Click "Refresh" to generate trading signals
          </CardContent>
        </Card>
      )}

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            ⚠️ <strong>Disclaimer:</strong> These signals are for informational purposes only. Always do your own
            research and trade responsibly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
