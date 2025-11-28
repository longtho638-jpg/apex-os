import WebSocket from 'ws';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

console.log(`🔌 Connecting to WebSocket server at ${WS_URL}...`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('✅ Connected to WebSocket server');

    // Test 1: PING
    console.log('\n📤 Sending PING...');
    ws.send(JSON.stringify({ type: 'PING' }));

    // Test 2: SUBSCRIBE
    setTimeout(() => {
        console.log('\n📤 Subscribing to BTC/USDT, ETH/USDT...');
        ws.send(JSON.stringify({
            type: 'SUBSCRIBE',
            symbols: ['BTC/USDT', 'ETH/USDT']
        }));
    }, 1000);

    // Test 3: Close after 5 seconds
    setTimeout(() => {
        console.log('\n👋 Closing connection...');
        ws.close();
    }, 5000);
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('📥 Received:', message.type, message);
});

ws.on('close', () => {
    console.log('❌ Disconnected from WebSocket server');
    process.exit(0);
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
});
