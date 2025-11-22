"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, LineStyle } from 'lightweight-charts';

export default function TradingChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 1. Initialize Chart
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

        // 2. Create Candlestick Series
        const candlestickSeries = (chart as any).addCandlestickSeries({
            upColor: '#00FF94',
            downColor: '#EF4444',
            borderVisible: false,
            wickUpColor: '#00FF94',
            wickDownColor: '#EF4444',
        });

        // 3. Generate Initial Data (Mock History)
        const initialData = generateInitialData(100);
        candlestickSeries.setData(initialData);

        // Set refs
        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // 4. Handle Resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // 5. Simulate Real-time Updates (The "Smooth" Part)
    useEffect(() => {
        if (!seriesRef.current) return;

        let lastClose = 45000; // Starting price
        let lastTime = Math.floor(Date.now() / 1000);

        // Get last candle from initial data if possible, otherwise use defaults
        // (Simplified for this demo)

        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const isNewCandle = now - lastTime >= 60; // 1 minute candles

            const volatility = 20; // Price movement range
            const change = (Math.random() - 0.5) * volatility;
            const newPrice = lastClose + change;

            // Update current price state for UI if needed
            setCurrentPrice(newPrice);

            if (isNewCandle) {
                // Finalize previous candle (optional logic) and start new one
                lastTime = now;
                // In a real app, we'd push a new candle object
            }

            // Update the *current* candle
            // For smooth animation, we update the 'close', 'high', 'low' of the latest candle
            // We need to maintain the 'open' of the current candle.

            // NOTE: In a real implementation, we'd track the current candle object state.
            // Here we'll just simulate "ticking" by updating the last data point.

            // This is a simplified mock. In production, you'd receive { time, open, high, low, close } from WS.

            const currentCandle = {
                time: lastTime as any,
                open: lastClose,
                high: Math.max(lastClose, newPrice),
                low: Math.min(lastClose, newPrice),
                close: newPrice,
            };

            seriesRef.current?.update(currentCandle);
            lastClose = newPrice; // Carry over for next tick

        }, 100); // Update every 100ms for smoothness

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative">
            <div ref={chartContainerRef} className="w-full h-full" />

            {/* Watermark / Overlay Info */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white font-mono">
                        {currentPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">USD</span>
                </div>
            </div>
        </div>
    );
}

// Helper: Generate Mock Data
function generateInitialData(count: number) {
    const data = [];
    let time = Math.floor(Date.now() / 1000) - (count * 60);
    let price = 45000;

    for (let i = 0; i < count; i++) {
        const open = price;
        const close = price + (Math.random() - 0.5) * 100;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;

        data.push({
            time: time as any,
            open,
            high,
            low,
            close,
        });

        time += 60;
        price = close;
    }
    return data;
}
