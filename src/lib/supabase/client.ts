import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export const createClient = (): SupabaseClient => {
  if (!client) {
    client = createClientComponentClient() as any;
  }
  return client as any;
};
