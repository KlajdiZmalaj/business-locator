import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'not_sent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('businesses')
      .select('id, name, emails, category_name, email_sent, email_sent_at', { count: 'exact' })
      .not('emails', 'is', null)
      .neq('emails', '[]');

    if (filter === 'sent') {
      query = query.eq('email_sent', true);
    } else if (filter === 'not_sent') {
      query = query.or('email_sent.eq.false,email_sent.is.null');
    }

    query = query.order('name', { ascending: true }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[EmailList] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extra client-side filter: only businesses where emails array has at least one non-empty string
    const filtered = (data || []).filter(
      (b) => Array.isArray(b.emails) && b.emails.length > 0 && b.emails.some((e: string) => e && e.trim() !== '')
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ data: filtered, total, page, totalPages });
  } catch (error) {
    console.error('[EmailList] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
