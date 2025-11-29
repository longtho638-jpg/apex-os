import { createClient } from 'redis';
import { TradingService } from './trading';
import { RiskCalculator } from './risk-calculator';

interface TradeSignal {
    symbol: string;
    action: 'BUY' | 'SELL';
    confidence: number;
    price: number;
    timestamp: number;
    metadata: any;
}

export class AgentExecutionService {
    private redisSubscriber;
    private tradingService: TradingService;
    private riskCalculator: RiskCalculator;

    constructor() {
        this.redisSubscriber = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        this.tradingService = new TradingService();
        this.riskCalculator = new RiskCalculator();

        this.redisSubscriber.on('error', (err) => console.error('Redis Client Error', err));
    }

    async start() {
        await this.redisSubscriber.connect();
        console.log('🤖 Agent Execution Service connected to Redis');

        await this.redisSubscriber.subscribe('trade_signals', async (message) => {
            try {
                const signal: TradeSignal = JSON.parse(message);
                await this.handleSignal(signal);
            } catch (error) {
                console.error('Error processing trade signal:', error);
            }
        });
    }

    private async handleSignal(signal: TradeSignal) {
        console.log(`📩 Received Signal: ${signal.action} ${signal.symbol} (${signal.confidence * 100}%)`);

        // 1. Validate Signal
        if (signal.confidence < 0.8) {
            console.log('⚠️ Signal confidence too low, skipping.');
            return;
        }

        // 2. Risk Check (Mocked for now, would use RiskCalculator)
        // const riskCheck = await this.riskCalculator.checkRisk(signal);
        // if (!riskCheck.approved) return;

        // 3. Execute Order
        try {
             const side = signal.action === 'BUY' ? 'BUY' : 'SELL';
             // Default size calculation (e.g., 1% of equity) - simplified here
             const quantity = 0.01; // Mock size

             const order = await this.tradingService.placeOrder(
                 'agent_bot_01', // Dedicated agent user
                 signal.symbol,
                 side,
                 quantity,
                 signal.price,
                 'MARKET'
             );

             console.log(`✅ Order Executed: ${order}`);
         } catch (error) {
             console.error('❌ Execution Failed:', error);
         }
    }
}
