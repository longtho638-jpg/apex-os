import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../src/lib/email-service';
import { emailTemplates } from '../src/lib/email-templates';

// Load env vars
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('🚀 Starting Launch Broadcast...');

    // 1. Get all users
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name');

    if (error) {
        console.error('Failed to fetch users:', error);
        process.exit(1);
    }

    console.log(`Found ${users.length} users to notify.`);

    let sentCount = 0;
    let failedCount = 0;

    // 2. Send Emails (Batch of 10 to avoid rate limits if massive, but Resend handles well)
    for (const user of users) {
        try {
            // Skip if invalid email
            if (!user.email || !user.email.includes('@')) continue;

            console.log(`Sending to ${user.email}...`);
            const template = emailTemplates.launch(user.name || 'Trader');
            
            const { success, error: sendError } = await sendEmail({
                to: user.email,
                subject: template.subject,
                html: template.html
            });

            if (success) {
                sentCount++;
                // Log to DB
                await supabase.from('email_logs').insert({
                    user_id: user.id,
                    email_type: 'launch_announcement',
                    sent_at: new Date().toISOString()
                });
            } else {
                console.error(`Failed to send to ${user.email}:`, sendError);
                failedCount++;
            }

            // Rate limit buffer
            await new Promise(r => setTimeout(r, 100)); 

        } catch (e) {
            console.error(`Error processing user ${user.id}:`, e);
            failedCount++;
        }
    }

    console.log('--- Broadcast Complete ---');
    console.log(`✅ Sent: ${sentCount}`);
    console.log(`❌ Failed: ${failedCount}`);
}

main();
