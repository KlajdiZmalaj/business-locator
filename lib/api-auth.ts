import { NextResponse } from 'next/server';
import { getSupabaseServer } from './supabase-server';

export async function requireAuth() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user, response: null };
}
