import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function migrate() {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;

    if (!dbUrl) {
        console.error('❌ Error: No database URL found in .env.local (checked DATABASE_URL, SUPABASE_DB_URL, POSTGRES_URL)');
        process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('✅ Connected.');

        const schemaPath = path.join(process.cwd(), 'src/database/migrations/copy_trading_schema.sql');
        console.log(`📖 Reading schema from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Executing migration...');
        await client.query(schemaSql);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

migrate();
