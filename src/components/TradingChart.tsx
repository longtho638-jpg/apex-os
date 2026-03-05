'use client';

import { ColorType, CrosshairMode, createChart, type IChartApi, type ISeriesApi, LineStyle } from 'lightweight-charts';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IndicatorSettings } from '@/components/IndicatorPanel';
import { BinancePriceFeed, fetchBinanceOHLCV } from '@/lib/binance-feed';
import { calculateBollingerBands, calculateEMA, calculateSMA } from '@/lib/indicators';
import { logger } from '@/lib/logger';

interface TradingChartProps {
  symbol: string;
  basePrice: number;
  indicators: IndicatorSettings;
}

export default function TradingChart({ symbol, basePrice, indicators }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, any>>(new Map());
  const priceFeedRef = useRef<BinancePriceFeed | null>(null);
  const historicalDataRef = useRef<any[]>([]);
  const isInitializingRef = useRef(false);
  const [currentPrice, setCurrentPrice] = useState<number>(basePrice);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize chart with real Binance data
  const updateIndicators = useCallback((chart: IChartApi, data: any[]) => {
    // Clear existing
    indicatorSeriesRef.current.forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch (_e) {
        // Series may already be removed
      }
    });
    indicatorSeriesRef.current.clear();

    const closes = data.map((d) => d.close);

    // SMA
    if (indicators.sma.enabled) {
      const smaData = calculateSMA(closes, indicators.sma.period);
      const smaSeries = chart.addLineSeries({
        color: indicators.sma.color,
        lineWidth: 2,
        title: `SMA(${indicators.sma.period})`,
      });
      const smaPoints = data
        .map((d, i) => ({
          time: d.time,
          value: smaData[i],
        }))
        .filter((p) => !Number.isNaN(p.value));
      smaSeries.setData(smaPoints);
      indicatorSeriesRef.current.set('sma', smaSeries);
    }

    // EMA
    if (indicators.ema.enabled) {
      const emaData = calculateEMA(closes, indicators.ema.period);
      const emaSeries = chart.addLineSeries({
        color: indicators.ema.color,
        lineWidth: 2,
        title: `EMA(${indicators.ema.period})`,
      });
      const emaPoints = data
        .map((d, i) => ({
          time: d.time,
          value: emaData[i],
        }))
        .filter((p) => !Number.isNaN(p.value));
      emaSeries.setData(emaPoints);
      indicatorSeriesRef.current.set('ema', emaSeries);
    }

    // Bollinger Bands
    if (indicators.bb.enabled) {
      const bb = calculateBollingerBands(closes, indicators.bb.period, indicators.bb.stdDev);

      const upperSeries = chart.addLineSeries({
        color: 'rgba(255, 255, 255, 0.3)',
        lineWidth: 1,
      });
      upperSeries.setData(
        data
          .map((d, i) => ({
            time: d.time,
            value: bb.upper[i],
          }))
          .filter((p) => !Number.isNaN(p.value)),
      );
      indicatorSeriesRef.current.set('bb_upper', upperSeries);

      const middleSeries = chart.addLineSeries({
        color: 'rgba(255, 255, 255, 0.5)',
        lineWidth: 1,
      });
      middleSeries.setData(
        data
          .map((d, i) => ({
            time: d.time,
            value: bb.middle[i],
          }))
          .filter((p) => !Number.isNaN(p.value)),
      );
      indicatorSeriesRef.current.set('bb_middle', middleSeries);

      const lowerSeries = chart.addLineSeries({
        color: 'rgba(255, 255, 255, 0.3)',
        lineWidth: 1,
      });
      lowerSeries.setData(
        data
          .map((d, i) => ({
            time: d.time,
            value: bb.lower[i],
          }))
          .filter((p) => !Number.isNaN(p.value)),
      );
      indicatorSeriesRef.current.set('bb_lower', lowerSeries);
    }

    // Volume
    if (indicators.volume.enabled && data.some((d) => d.volume)) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeries.setData(
        data.map((d) => ({
          time: d.time,
          value: d.volume || 0,
          color: d.close >= d.open ? '#00FF94' : '#EF4444',
        })),
      );
      indicatorSeriesRef.current.set('volume', volumeSeries);
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || isInitializingRef.current) return;

    let isMounted = true;
    isInitializingRef.current = true;

    const initChart = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch historical data
        const historicalData = await fetchBinanceOHLCV(symbol, '1m', 100);

        if (!isMounted || !chartContainerRef.current) {
          setIsLoading(false);
          isInitializingRef.current = false;
          return;
        }

        if (historicalData.length === 0) {
          logger.error('[Chart] No data for', symbol);
          setIsLoading(false);
          isInitializingRef.current = false;
          return;
        }

        // 2. Initialize Chart
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#9CA3AF',
          },
          grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              width: 1,
              color: 'rgba(255, 255, 255, 0.4)',
              style: LineStyle.Dotted,
              labelBackgroundColor: '#00FF94',
            },
            horzLine: {
              width: 1,
              color: 'rgba(255, 255, 255, 0.4)',
              style: LineStyle.Dotted,
              labelBackgroundColor: '#00FF94',
            },
          },
          timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            timeVisible: true,
            secondsVisible: false,
          },
          rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        });

        if (!isMounted) {
          chart.remove();
          setIsLoading(false);
          isInitializingRef.current = false;
          return;
        }

        // 3. Create Series
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#00FF94',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#00FF94',
          wickDownColor: '#EF4444',
        });

        candlestickSeries.setData(historicalData);
        historicalDataRef.current = historicalData;

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        const lastCandle = historicalData[historicalData.length - 1];
        setCurrentPrice(lastCandle.close);

        // 4. Add Indicators
        updateIndicators(chart, historicalData);

        // 5. WebSocket Feed
        const feed = new BinancePriceFeed(symbol);
        let currentCandleTime = Math.floor(Date.now() / 1000 / 60) * 60;
        let currentCandle = {
          time: currentCandleTime as any,
          open: lastCandle.close,
          high: lastCandle.close,
          low: lastCandle.close,
          close: lastCandle.close,
        };

        feed.onPriceUpdate((update) => {
          if (!isMounted) return;

          const now = Math.floor(Date.now() / 1000 / 60) * 60;

          if (now > currentCandleTime) {
            currentCandleTime = now;
            currentCandle = {
              time: now as any,
              open: update.price,
              high: update.price,
              low: update.price,
              close: update.price,
            };
          } else {
            currentCandle.close = update.price;
            currentCandle.high = Math.max(currentCandle.high, update.price);
            currentCandle.low = Math.min(currentCandle.low, update.price);
          }

          candlestickSeries.update(currentCandle);
          setCurrentPrice(update.price);
        });

        feed.connect();
        priceFeedRef.current = feed;

        setIsLoading(false);
        isInitializingRef.current = false;
      } catch (error) {
        logger.error('[Chart] Init failed:', error);
        setIsLoading(false);
        isInitializingRef.current = false;
      }
    };

    initChart();

    return () => {
      isMounted = false;
      isInitializingRef.current = false;

      if (priceFeedRef.current) {
        priceFeedRef.current.disconnect();
        priceFeedRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
      indicatorSeriesRef.current.clear();
    };
  }, [
    symbol, // 4. Add Indicators
    updateIndicators,
  ]);

  // Update indicators when settings change
  useEffect(() => {
    if (!chartRef.current || historicalDataRef.current.length === 0) return;

    try {
      updateIndicators(chartRef.current, historicalDataRef.current);
    } catch (error) {
      logger.error('[Chart] Indicators failed:', error);
    }
  }, [updateIndicators]);

  return (
    <div className="w-full h-full relative pointer-events-auto">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
          <div className="text-sm text-gray-400">Loading {symbol}...</div>
        </div>
      )}

      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Real-time Price */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="flex items-baseline gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
          <span className="text-2xl font-bold text-white font-mono">
            {currentPrice.toFixed(symbol.includes('DOGE') || symbol.includes('ADA') || symbol.includes('XRP') ? 4 : 2)}
          </span>
          <span className="text-xs text-gray-400">USD</span>
          <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>
        </div>
      </div>
    </div>
  );
}
