import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8080';
const TEST_SYMBOL = 'BTC/USDT';

console.log(`🚀 Starting Latency Test connecting to ${WS_URL}...`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('✅ Connected to WebSocket Server');

    const subscribeMsg = {
        type: 'SUBSCRIBE',
        symbols: [TEST_SYMBOL]
    };

    console.log(`📤 Sending subscribe request for ${TEST_SYMBOL}...`);
    ws.send(JSON.stringify(subscribeMsg));
});

let messageCount = 0;
const MAX_MESSAGES = 5;

ws.on('message', (data: Buffer) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'PRICE_UPDATE') {
        const now = Date.now();
        const payload = message.data;
        // Note: payload.timestamp comes from the Price Feed service
        const latency = now - payload.timestamp;

        console.log(`\n📥 Received Price Update #${messageCount + 1}:`);
        console.log(`   Symbol: ${payload.symbol}`);
        console.log(`   Price: $${payload.price}`);
        console.log(`   Server Timestamp: ${payload.timestamp}`);
        console.log(`   Client Timestamp: ${now}`);
        console.log(`   ⏱️  Latency: ${latency}ms`);

        messageCount++;

        if (messageCount >= MAX_MESSAGES) {
            console.log('\n✅ Test Complete: Received 5 price updates.');
            ws.close();
            process.exit(0);
        }
    } else {
        console.log('📩 Received message:', message);
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('🔌 Disconnected');
});
