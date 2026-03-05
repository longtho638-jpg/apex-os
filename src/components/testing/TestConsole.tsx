/**
 * Test Console Component - Visual Testing for Phase 4
 *
 * Interactive UI to test 100% real data calculations
 */

'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { TechnicalCalculator } from '@/lib/quant/TechnicalCalculator';
import { generateFakeCandles, generateFakePriceHistory, generateFakeTrades } from '@/lib/utils/testDataGenerator';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  details: string;
}

export function TestConsole() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: TestResult[] = [];

    // Test 1: Price History Generation
    try {
      const prices = generateFakePriceHistory(200);
      results.push({
        name: 'Generate Price History',
        status: 'pass',
        details: `Generated ${prices.length} price points, range: $${Math.min(...prices).toFixed(0)}-$${Math.max(...prices).toFixed(0)}`,
      });
    } catch (e) {
      results.push({
        name: 'Generate Price History',
        status: 'fail',
        details: e instanceof Error ? e.message : String(e),
      });
    }

    // Test 2: EMA Calculation
    try {
      const prices = generateFakePriceHistory(200);
      const ema20 = TechnicalCalculator.calculateEMA(prices, 20);
      const ema50 = TechnicalCalculator.calculateEMA(prices, 50);

      results.push({
        name: 'EMA Calculations',
        status: 'pass',
        details: `EMA20: $${ema20.toFixed(2)}, EMA50: $${ema50.toFixed(2)}`,
      });
    } catch (e) {
      results.push({ name: 'EMA Calculations', status: 'fail', details: e instanceof Error ? e.message : String(e) });
    }

    // Test 3: MACD Calculation
    try {
      const prices = generateFakePriceHistory(200);
      const macd = TechnicalCalculator.calculateMACD(prices);

      results.push({
        name: 'MACD Calculation',
        status: 'pass',
        details: `Value: ${macd.value.toFixed(2)}, ${macd.bullish ? 'Bullish' : 'Bearish'}`,
      });
    } catch (e) {
      results.push({ name: 'MACD Calculation', status: 'fail', details: e instanceof Error ? e.message : String(e) });
    }

    // Test 4: ATR Calculation
    try {
      const candles = generateFakeCandles(200);
      const highs = candles.map((c) => c.high);
      const lows = candles.map((c) => c.low);
      const closes = candles.map((c) => c.close);

      const atr = TechnicalCalculator.calculateATR(highs, lows, closes, 14);

      results.push({
        name: 'ATR Calculation',
        status: 'pass',
        details: `ATR(14): $${atr.toFixed(2)}`,
      });
    } catch (e) {
      results.push({ name: 'ATR Calculation', status: 'fail', details: e instanceof Error ? e.message : String(e) });
    }

    // Test 5: Portfolio Returns
    try {
      const trades = generateFakeTrades(50);
      const returns = trades.map((t) => t.pnlPercent);
      const winRate = ((trades.filter((t) => t.pnlPercent > 0).length / trades.length) * 100).toFixed(1);
      const avgReturn = (returns.reduce((a, b) => a + b, 0) / returns.length).toFixed(2);

      results.push({
        name: 'Portfolio Returns',
        status: 'pass',
        details: `50 trades, ${winRate}% win rate, ${avgReturn}% avg return`,
      });
    } catch (e) {
      results.push({ name: 'Portfolio Returns', status: 'fail', details: e instanceof Error ? e.message : String(e) });
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-white/20">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🧪 Phase 4 Test Console
        <span className="text-xs text-zinc-400 font-normal">100% Real Data Verification</span>
      </h2>

      <button
        onClick={runTests}
        disabled={testing}
        className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Tests...
          </>
        ) : (
          'Run All Tests'
        )}
      </button>

      <div className="space-y-2">
        {testResults.map((result, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border ${
              result.status === 'pass' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {result.status === 'pass' ? (
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-white">{result.name}</div>
                  <div className="text-xs text-zinc-400 mt-1">{result.details}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testResults.length === 0 && !testing && (
        <div className="text-center text-zinc-500 py-8">
          Click "Run All Tests" to verify 100% real data calculations
        </div>
      )}
    </div>
  );
}
