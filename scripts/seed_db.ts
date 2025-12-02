
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('🌱 Starting database seed...');

    // 0. Create Dummy User for FK constraints
    console.log('Creating dummy user...');
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: 'system_seeder@apexos.com',
        password: 'Password123!',
        email_confirm: true
    });

    let userId = user?.user?.id;

    if (userError) {
        console.log('User creation failed (likely exists), fetching existing...');
        // Try to find existing user or fallback to a known ID if we can't search auth.users easily
        // Since we can't search auth.users with simple client, we'll assume the error means it exists
        // and we might need to just use a random UUID if we can't get it.
        // Actually, if createUser fails, we don't get the ID back.
        // Let's try to sign in to get the ID?
        const { data: loginData } = await supabase.auth.signInWithPassword({
            email: 'system_seeder@apexos.com',
            password: 'Password123!'
        });
        userId = loginData.user?.id;
    }

    if (!userId) {
        console.error('❌ Could not get a valid User ID. Aborting.');
        return;
    }

    console.log(`Using User ID: ${userId}`);

    // 1. Seed DAO Proposals
    console.log('Seeding DAO Proposals...');
    const proposals = [
        {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            title: 'AIP-12: Increase Referral Commission to 40%',
            description: 'Proposal to boost Level 1 referral rewards to drive viral growth during Q1 2026.',
            status: 'active',
            votes_for: 1250000,
            votes_against: 45000,
            ends_at: new Date(Date.now() + 86400000 * 3).toISOString(),
            author_id: userId
        },
        {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            title: 'AIP-11: Add Solana (SOL) to Copy Trading',
            description: 'Integrate Solana DEX liquidity pools for high-frequency copy trading strategies.',
            status: 'passed',
            votes_for: 3500000,
            votes_against: 120000,
            ends_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            author_id: userId
        },
        {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            title: 'AIP-10: Reduce Withdrawal Fees for Whales',
            description: 'Lower withdrawal fees by 50% for users holding >10,000 APEX tokens.',
            status: 'rejected',
            votes_for: 800000,
            votes_against: 2100000,
            ends_at: new Date(Date.now() - 86400000 * 10).toISOString(),
            author_id: userId
        }
    ];

    const { error: proposalError } = await supabase.from('dao_proposals').upsert(proposals, { onConflict: 'id' });
    if (proposalError) console.error('Error seeding proposals:', proposalError);
    else console.log('✅ DAO Proposals seeded.');

    // 2. Seed Copy Leaders
    console.log('Seeding Copy Leaders...');
    const leaders = [
        {
            user_id: userId, // Use the real user ID
            display_name: 'Whale Hunter Alpha',
            description: 'Tracking institutional wallet movements. High leverage, high reward.',
            total_pnl: 145230.50,
            win_rate: 78.3,
            total_trades: 152,
            active_followers: 1847
        },
        // Add more if needed, but they need unique user_ids. 
        // For now, let's just seed ONE valid leader linked to this user to prove it works.
        // If we want 12, we need 12 users.
    ];

    const { error: leaderError } = await supabase.from('copy_leaders').upsert(leaders, { onConflict: 'user_id' });
    if (leaderError) console.error('Error seeding leaders:', leaderError);
    else console.log('✅ Copy Leaders seeded.');

    console.log('🌱 Seed completed.');
}

seed();
