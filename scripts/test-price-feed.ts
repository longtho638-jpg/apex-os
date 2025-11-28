import { PriceFeedService } from '../backend/services/price-feed';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

console.log('🧪 Testing Price Feed Service...\n');

// Test 1: Subscribe to Redis price updates
console.log('📡 Subscribing to Redis price_updates channel...');
const subscriber = redis.duplicate();
let priceUpdatesReceived = 0;

subscriber.subscribe('price_updates', (err) => {
    if (err) {
        console.error('❌ Failed to subscribe:', err);
        process.exit(1);
    }
    console.log('✅ Subscribed to price_updates\n');
});

subscriber.on('message', (channel, message) => {
    if (channel === 'price_updates') {
        priceUpdatesReceived++;
        const data = JSON.parse(message);
        console.log(`📥 [${priceUpdatesReceived}] Received price update:`, {
            symbol: data.symbol,
            price: data.price,
            timestamp: new Date(data.timestamp).toLocaleTimeString()
        });

        // Stop after receiving 5 updates (should cover all 4 symbols)
        if (priceUpdatesReceived >= 5) {
            console.log('\n✅ Received sufficient price updates. Test PASSED!');
            cleanup();
        }
    }
});

// Test 2: Start Price Feed Service
console.log('🚀 Starting Price Feed Service...');
const service = new PriceFeedService();
service.start();

// Cleanup and exit after 15 seconds (safety timeout)
setTimeout(() => {
    if (priceUpdatesReceived === 0) {
        console.error('\n❌ No price updates received in 15 seconds. Test FAILED!');
        cleanup();
        process.exit(1);
    } else {
        console.log(`\n✅ Test completed. Received ${priceUpdatesReceived} updates.`);
        cleanup();
    }
}, 15000);

function cleanup() {
    console.log('\n🧹 Cleaning up...');
    service.stop();
    subscriber.unsubscribe();
    redis.quit();
    subscriber.quit();
    process.exit(0);
}

process.on('SIGINT', cleanup);
