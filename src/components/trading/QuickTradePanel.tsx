'use client';

import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePriceStream } from '@/hooks/usePriceStream';

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];

interface QuickTradePanelProps {
  userId: string;
  onOrderPlaced?: () => void;
}

export function QuickTradePanel({ userId, onOrderPlaced }: QuickTradePanelProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [quantity, setQuantity] = useState('0.001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { connected, getPrice } = usePriceStream({ symbols: SYMBOLS });

  const currentPrice = getPrice(selectedSymbol);
  const estimatedCost = currentPrice ? parseFloat(quantity) * currentPrice.price : 0;

  const placeOrder = async (side: 'BUY' | 'SELL') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/v1/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          symbol: selectedSymbol,
          side,
          quantity: parseFloat(quantity),
          type: 'MARKET',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(`${side} order placed successfully!`);
        setQuantity('0.001'); // Reset
        onOrderPlaced?.();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Trade</CardTitle>
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
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{symbol.split('/')[0]}</p>
                  {priceData && (
                    <p className="text-xs text-muted-foreground font-mono">${priceData.price.toFixed(2)}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Price Display */}
        {currentPrice && (
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Current Market Price</p>
            <p className="text-2xl font-bold font-mono">${currentPrice.price.toFixed(2)}</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-muted-foreground">
                Bid: <span className="font-mono">${currentPrice.bid.toFixed(2)}</span>
              </span>
              <span className="text-muted-foreground">
                Ask: <span className="font-mono">${currentPrice.ask.toFixed(2)}</span>
              </span>
            </div>
          </div>
        )}

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
            <p className="text-xs text-muted-foreground mt-1">Estimated cost: ${estimatedCost.toFixed(2)} USDT</p>
          )}
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            onClick={() => placeOrder('BUY')}
            disabled={loading || !connected || parseFloat(quantity) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Buy {selectedSymbol.split('/')[0]}
          </Button>
          <Button
            size="lg"
            onClick={() => placeOrder('SELL')}
            disabled={loading || !connected || parseFloat(quantity) <= 0}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Sell {selectedSymbol.split('/')[0]}
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            ✅ {success}
          </div>
        )}

        {/* Risk Warning */}
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs">
          <p className="font-semibold mb-1">⚠️ Paper Trading Mode</p>
          <p>All trades are simulated. No real money will be used.</p>
        </div>
      </CardContent>
    </Card>
  );
}
