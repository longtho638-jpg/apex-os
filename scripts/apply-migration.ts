
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
}

async function applyMigration() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const migrationFile = path.join(process.cwd(), 'backend/database/migrations/005_provider_metrics.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log('🚀 Applying migration: 005_provider_metrics.sql');
        await client.query(sql);
        console.log('✅ Migration applied successfully');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
