import { crmService } from '@/lib/crm-service';
import { getSupabaseClient } from '@/lib/supabase';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testBeehiveSignal() {
    console.log('🐝 Testing Beehive Signal...');

    const supabase = getSupabaseClient();

    // 1. Get a test user (Admin)
    console.log('🔑 Service Role Key Loaded:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    let targetUser: { id: string; email?: string } | null = null;

    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (!error && users && users.length > 0) {
            const admin = users.find(u => u.email?.includes('billwill'));
            targetUser = admin || users[0];
        } else {
            console.warn('⚠️ auth.admin.listUsers() failed or empty. Trying "admin_users" table...');
            if (error) console.error('Auth Error:', error);
        }
    } catch (e) {
        console.error('⚠️ Exception calling listUsers:', e);
    }

    if (!targetUser) {
        // Fallback: Try to get from admin_users table directly
        const { data: admins, error: adminError } = await supabase
            .from('admin_users')
            .select('id, email')
            .limit(1);

        if (adminError) {
            console.error('❌ Error fetching admin_users:', adminError);
            return;
        }

        if (admins && admins.length > 0) {
            targetUser = admins[0];
            console.log('✅ Found user in admin_users table.');
        }
    }

    if (!targetUser) {
        console.error('❌ No users found in auth.users OR admin_users.');
        return;
    }

    console.log(`🎯 Target User: ${targetUser.email || 'Unknown'} (${targetUser.id})`);

    // 2. Simulate a "Whale" Signal (High Confidence)
    console.log('📡 Simulating Whale Signal...');

    await crmService.decidePush(targetUser.id, 'TRADE_EXECUTE', {
        symbol: 'BTC/USD',
        side: 'LONG',
        amount: 50000,
        confidence: 0.95,
        source: 'WHALE_WALLET_123'
    });

    // 3. Send a direct Notification (Resonance Bell)
    console.log('🔔 Sending Resonance Bell Notification...');

    await crmService.sendNotification(targetUser.id, {
        type: 'NECTAR',
        title: 'Whale Alert: BTC Long',
        message: 'Whale detected accumulating BTC. Confidence: 95%.',
        actionUrl: '/dashboard/trade?symbol=BTCUSD',
        metadata: { profit_potential: 1200 }
    });

    console.log('✅ Signal Sent! Check the "notifications" table and your Email (if configured).');
}

testBeehiveSignal().catch(console.error);
