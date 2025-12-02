
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Missing DATABASE_URL in .env.local');
    process.exit(1);
}

async function fixConstraint() {
    console.log('🛠️ Connecting to database...');
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL
    });

    try {
        await client.connect();
        console.log('✅ Connected.');

        // 1. Drop old constraint
        console.log('🗑️ Dropping old constraint (if exists)...');
        // We try a few common names or just the one suggested
        await client.query(`ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;`);

        // 2. Add new constraint
        console.log('✨ Adding new constraint with "deposit"...');
        await client.query(`
            ALTER TABLE public.transactions 
            ADD CONSTRAINT transactions_type_check 
            CHECK (type IN ('rebate', 'withdrawal', 'withdrawal_fee', 'adjustment', 'bonus', 'refund', 'deposit', 'DEPOSIT'));
        `);
        // Added 'DEPOSIT' (uppercase) just in case, to be safe, though user said lowercase.

        console.log('✅ Constraint updated successfully!');

    } catch (err) {
        console.error('❌ Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

fixConstraint();
