#!/usr/bin/env ts-node

import { SignalGenerator } from '../backend/ml/signal-generator';

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];

async function testSignalGeneration() {
    console.log('🧪 Testing ML Signal Generation...\n');

    const generator = new SignalGenerator();

    for (const symbol of SYMBOLS) {
        console.log(`\n📊 Generating signal for ${symbol}...`);
        const signal = await generator.generateSignal(symbol);

        console.log(`   Type: ${signal.type}`);
        console.log(`   Confidence: ${(signal.confidence * 100).toFixed(0)}%`);
        console.log(`   Reason: ${signal.reason}`);
        if (signal.indicators.rsi) {
            console.log(`   RSI: ${signal.indicators.rsi.toFixed(1)}`);
        }
        if (signal.indicators.macd) {
            console.log(`   MACD: ${signal.indicators.macd.macd.toFixed(4)}`);
            console.log(`   Signal: ${signal.indicators.macd.signal.toFixed(4)}`);
            console.log(`   Histogram: ${signal.indicators.macd.histogram.toFixed(4)}`);
        }
    }

    console.log('\n✅ Signal generation test complete!');
}

testSignalGeneration().catch(console.error);
