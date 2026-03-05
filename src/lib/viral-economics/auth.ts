import { createClient } from '@supabase/supabase-js';

export async function authenticateRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  return error || !user ? null : user.id;
}
