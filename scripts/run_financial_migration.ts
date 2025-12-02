import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local. Please check your env vars.');
    process.exit(1);
}

async function runFinancialMigration() {
    console.log('🚀 Starting Financial Core Migration...');
    
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Necessary for Supabase
    });

    try {
        await client.connect();
        console.log('✅ Database Connected');

        const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251130_create_financial_core.sql');
        
        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at: ${migrationPath}`);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📜 Executing SQL...');
        await client.query(sql);
        console.log('✅ Financial Core Tables Created Successfully!');

    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runFinancialMigration();
