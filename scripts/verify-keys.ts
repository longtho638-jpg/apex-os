
import { createClient } from '@supabase/supabase-js';

const url = 'https://ryvpqbuftmlsynmajecx.supabase.co';
const key = 'sb_publishable_2Rh1fMxR1EU5X-DWuf-wuw_yhqneyvj';

console.log('Testing connection with key:', key);

const supabase = createClient(url, key);

async function test() {
    try {
        // Try a public table or just a health check (Supabase doesn't have a public health endpoint on the client easily without a key, but let's try a select)
        // We'll try to select from a non-existent table or just check if it throws a specific auth error immediately.
        // Actually, let's try to sign in anonymously if enabled, or just query.
        const { data, error } = await supabase.from('non_existent_table').select('*').limit(1);

        if (error) {
            console.log('Error code:', error.code);
            console.log('Error message:', error.message);
            // If error is related to invalid JWT (PGRST301 or similar), then key is wrong.
            // If error is "relation does not exist", then auth worked!
        } else {
            console.log('Success (unexpected for non-existent table)');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
