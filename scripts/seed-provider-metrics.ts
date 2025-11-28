
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedMetrics() {
    console.log('🌱 Seeding provider metrics...');

    // Get all providers
    const { data: providers, error } = await supabase
        .from('providers')
        .select('id, provider_code');

    if (error || !providers) {
        console.error('Failed to fetch providers:', error);
        return;
    }

    console.log(`Found ${providers.length} providers.`);

    const today = new Date();
    const metrics = [];

    for (const provider of providers) {
        console.log(`Generating metrics for ${provider.provider_code}...`);

        // Generate 30 days of data
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Random data
            const volume = Math.random() * 1000000;
            const revenue = volume * 0.001; // 0.1% fee
            const activeUsers = Math.floor(Math.random() * 1000);
            const newUsers = Math.floor(Math.random() * 50);

            metrics.push({
                provider_id: provider.id,
                date: dateStr,
                total_volume: volume,
                total_revenue: revenue,
                active_users: activeUsers,
                new_users: newUsers
            });
        }
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < metrics.length; i += batchSize) {
        const batch = metrics.slice(i, i + batchSize);
        const { error: insertError } = await supabase
            .from('provider_metrics')
            .upsert(batch, { onConflict: 'provider_id, date' });

        if (insertError) {
            console.error('Insert error:', insertError);
        } else {
            console.log(`Inserted batch ${i / batchSize + 1}`);
        }
    }

    console.log('✅ Seeding complete!');
}

seedMetrics();
