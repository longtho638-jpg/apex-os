// Binance WebSocket Price Feed Integration

interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: number;
}

export class BinancePriceFeed {
    private ws: WebSocket | null = null;
    private callbacks: ((update: PriceUpdate) => void)[] = [];
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor(private symbol: string) { }

    connect() {
        // Convert symbol format: BTC/USDT -> btcusdt
        const binanceSymbol = this.symbol.replace('/', '').toLowerCase();
        const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log(`[BinanceFeed] Connected to ${this.symbol}`);
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const update: PriceUpdate = {
                    symbol: this.symbol,
                    price: parseFloat(data.p), // Price
                    timestamp: data.T, // Trade time
                };

                this.callbacks.forEach(cb => cb(update));
            };

            this.ws.onerror = (error) => {
                console.error(`[BinanceFeed] Error:`, error);
            };

            this.ws.onclose = () => {
                console.log(`[BinanceFeed] Disconnected from ${this.symbol}`);
                // Auto-reconnect after 5s
                this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
            };
        } catch (error) {
            console.error(`[BinanceFeed] Failed to connect:`, error);
        }
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    onPriceUpdate(callback: (update: PriceUpdate) => void) {
        this.callbacks.push(callback);
    }

    removeCallback(callback: (update: PriceUpdate) => void) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }
}

// Fetch historical OHLCV data from Binance
export async function fetchBinanceOHLCV(symbol: string, interval: string = '1m', limit: number = 100) {
    const binanceSymbol = symbol.replace('/', '');
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data.map((candle: any[]) => ({
            time: Math.floor(candle[0] / 1000), // Convert ms to seconds
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
        }));
    } catch (error) {
        console.error(`[Binance] Failed to fetch OHLCV:`, error);
        return [];
    }
}
