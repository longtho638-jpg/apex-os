
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL (or POSTGRES_URL/SUPABASE_DB_URL) not found in .env.local');
    console.log('Available keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
    process.exit(1);
}

async function applyMigration() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const migrations = [
            'src/database/migrations/add_rate_limits.sql'
        ];

        for (const file of migrations) {
            const migrationFile = path.join(process.cwd(), file);
            if (fs.existsSync(migrationFile)) {
                const sql = fs.readFileSync(migrationFile, 'utf8');
                console.log(`🚀 Applying migration: ${file}`);
                await client.query(sql);
                console.log(`✅ Applied ${file}`);
            } else {
                console.warn(`⚠️ Migration file not found: ${file}`);
            }
        }

        console.log('✅ All rate limit migrations applied successfully');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
