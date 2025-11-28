import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    const sql = "ALTER TABLE security_alerts ADD COLUMN IF NOT EXISTS message TEXT; NOTIFY pgrst, 'reload schema';";

    console.log("Attempting to execute SQL via RPC 'exec_sql'...");
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error("❌ RPC failed:", error);

        console.log("Attempting to execute SQL via RPC 'exec'...");
        const { data: data2, error: error2 } = await supabase.rpc('exec', { query: sql });

        if (error2) {
            console.error("❌ RPC 'exec' failed:", error2);
            process.exit(1);
        }
    }

    console.log("✅ SQL executed successfully via RPC!");
}

run();
