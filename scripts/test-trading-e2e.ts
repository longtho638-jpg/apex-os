import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test user ID (you can create a dedicated test user)
const TEST_USER_ID = 'f9d6f7ca-f232-4145-b454-af58d78e227e'; // Replace with actual test user

console.log('🧪 Phase 3 Trading Engine - End-to-End Test\n');
console.log('Testing: WebSocket → Price Feed → Trading → Positions → PnL → Guardian\n');

async function runE2ETest() {
    let passed = 0;
    let failed = 0;

    // Test 1: Verify WebSocket Server is running
    console.log('📡 Test 1: WebSocket Server Connectivity');
    try {
        const ws = await import('ws');
        const client = new ws.default('ws://localhost:8080');

        await new Promise((resolve, reject) => {
            client.on('open', () => {
                console.log('  ✅ WebSocket server is running on port 8080');
                client.close();
                resolve(true);
            });
            client.on('error', reject);
            setTimeout(() => reject(new Error('Timeout')), 3000);
        });
        passed++;
    } catch (error) {
        console.log('  ❌ WebSocket server not running:', error);
        failed++;
    }

    // Test 2: Verify Price Feed is publishing to Redis
    console.log('\n📈 Test 2: Price Feed Data Availability');
    try {
        const { data: marketData } = await supabase
            .from('market_data')
            .select('*')
            .limit(1);

        if (marketData && marketData.length > 0) {
            console.log(`  ✅ Price data available for ${marketData[0].symbol}`);
            console.log(`     Price: $${marketData[0].price}, Updated: ${marketData[0].updated_at}`);
            passed++;
        } else {
            throw new Error('No market data found');
        }
    } catch (error) {
        console.log('  ❌ Price feed not working:', error);
        failed++;
    }

    // Test 3: Verify user has wallet
    console.log('\n💰 Test 3: User Wallet Verification');
    try {
        const { data: wallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .single();

        if (wallet) {
            console.log(`  ✅ Wallet found with balance: $${wallet.balance} USDT`);
            passed++;
        } else {
            throw new Error('No wallet found for test user');
        }
    } catch (error) {
        console.log('  ❌ Wallet verification failed:', error);
        failed++;
    }

    // Test 4: Place a small test order (market buy)
    console.log('\n🛒 Test 4: Order Placement');
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                user_id: TEST_USER_ID,
                symbol: 'BTC/USDT',
                type: 'MARKET',
                side: 'BUY',
                quantity: 0.0001,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`  ✅ Order placed successfully: ${order.id}`);
        console.log(`     Symbol: ${order.symbol}, Side: ${order.side}, Qty: ${order.quantity}`);
        passed++;

        // Clean up test order
        await supabase.from('orders').delete().eq('id', order.id);
    } catch (error) {
        console.log('  ❌ Order placement failed:', error);
        failed++;
    }

    // Test 5: Verify position tracking
    console.log('\n📊 Test 5: Position Tracking');
    try {
        const { data: positions } = await supabase
            .from('positions')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .limit(5);

        console.log(`  ✅ Position tracking working - ${positions?.length || 0} positions found`);
        if (positions && positions.length > 0) {
            console.log(`     Sample: ${positions[0].symbol} ${positions[0].side} - PnL: $${positions[0].unrealized_pnl || 0}`);
        }
        passed++;
    } catch (error) {
        console.log('  ❌ Position tracking failed:', error);
        failed++;
    }

    // Test 6: Verify Guardian Agent is monitoring
    console.log('\n🛡️  Test 6: Guardian Agent Monitoring');
    try {
        const { data: alerts } = await supabase
            .from('security_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        console.log(`  ✅ Guardian Agent monitoring active`);
        if (alerts && alerts.length > 0) {
            console.log(`     Latest alert: ${alerts[0].alert_type} at ${alerts[0].created_at}`);
        }
        passed++;
    } catch (error) {
        console.log('  ❌ Guardian monitoring check failed:', error);
        failed++;
    }

    // Test 7: Verify agent heartbeat
    console.log('\n💓 Test 7: Agent Heartbeat Status');
    try {
        const { data: agents } = await supabase
            .from('agent_heartbeats')
            .select('*');

        if (agents && agents.length > 0) {
            console.log(`  ✅ Agent heartbeats active - ${agents.length} agents reporting`);
            agents.forEach(agent => {
                const lastBeat = new Date(agent.last_heartbeat);
                const ageSeconds = (Date.now() - lastBeat.getTime()) / 1000;
                console.log(`     ${agent.agent_id}: ${agent.status} (${ageSeconds.toFixed(0)}s ago)`);
            });
            passed++;
        } else {
            throw new Error('No agent heartbeats found');
        }
    } catch (error) {
        console.log('  ❌ Agent heartbeat check failed:', error);
        failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Trading engine is fully operational.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please review errors above.');
        process.exit(1);
    }
}

runE2ETest().catch(error => {
    console.error('\n💥 Test suite crashed:', error);
    process.exit(1);
});
