'use client';

import { memo, useCallback, useMemo } from 'react';

const TradingViewChart = memo(
  ({ symbol, interval }: { symbol: string; interval: string }) => {
    const getTVInterval = useCallback((tf: string) => {
      const map: Record<string, string> = {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '30m': '30',
        '1h': '60',
        '4h': '240',
        '1d': 'D',
        '1w': 'W',
      };
      return map[tf] || '60';
    }, []);

    const getTradingViewUrl = useCallback(
      (sym: string, ivl: string) => {
        const baseUrl = 'https://s.tradingview.com/widgetembed/';
        const params = new URLSearchParams({
          frameElementId: 'tradingview_widget',
          symbol: `BINANCE:${sym}USDT`,
          interval: getTVInterval(ivl),
          hidesidetoolbar: '1',
          hidetoptoolbar: '0',
          symboledit: '0',
          saveimage: '0',
          toolbarbg: '000000',
          theme: 'dark',
          style: '1',
          timezone: 'Etc/UTC',
          locale: 'en',
          utm_source: 'apex-os.com',
          utm_medium: 'widget',
          utm_campaign: 'chart',
          utm_term: `BINANCE:${sym}USDT`,
        });

        const studies = ['MAExp@tv-basicstudies', 'RSI@tv-basicstudies', 'MACD@tv-basicstudies', 'BB@tv-basicstudies'];

        let url = `${baseUrl}?${params.toString()}`;
        studies.forEach((study) => {
          url += `&studies=${encodeURIComponent(study)}`;
        });

        const studiesOverrides = {
          'moving average exponential.length': 26,
        };

        url += `&studies_overrides=${encodeURIComponent(JSON.stringify(studiesOverrides))}`;

        return url;
      },
      [getTVInterval],
    );

    const src = useMemo(() => {
      return getTradingViewUrl(symbol, interval);
    }, [symbol, interval, getTradingViewUrl]);

    return (
      <iframe
        key={`${symbol}-${interval}`}
        src={src}
        className="w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-500"
        allow="fullscreen"
        loading="lazy"
        title={`TradingView Chart - ${symbol}`}
      />
    );
  },
  (prev, next) => prev.symbol === next.symbol && prev.interval === next.interval,
);

TradingViewChart.displayName = 'TradingViewChart';

export { TradingViewChart };
