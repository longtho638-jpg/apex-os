import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log("Checking schema for 'agent_heartbeats'...");

    // Check if table exists and get columns
    // We can't query information_schema directly with the JS client easily unless we have permissions or a helper.
    // But we can try to select * from the table with limit 0 and see the error or data.

    const { data, error } = await supabase
        .from('agent_heartbeats')
        .insert({
            agent_id: 'test_agent',
            status: 'TEST',
            last_heartbeat: new Date().toISOString(),
            metadata: {},
            error_message: null
        })
        .select();

    if (error) {
        console.error("❌ Error inserting row:", error);
    } else {
        console.log("✅ Insert successful:", data);
        // Clean up
        await supabase.from('agent_heartbeats').delete().eq('agent_id', 'test_agent');
    }
}

run();
