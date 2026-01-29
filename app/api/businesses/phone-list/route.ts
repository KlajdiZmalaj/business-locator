import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'not_sent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = (page - 1) * limit;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('businesses')
      .select('id, name, phone, website, emails, category_name, sms_sent, sms_sent_at', { count: 'exact' })
      .not('phone', 'is', null)
      .neq('phone', '');

    if (filter === 'sent') {
      query = query.eq('sms_sent', true);
    } else if (filter === 'not_sent') {
      query = query.or('sms_sent.eq.false,sms_sent.is.null');
    }

    const noWebsite = searchParams.get('noWebsite');
    if (noWebsite === 'true') {
      query = query.or('website.is.null,website.eq.');
    }

    query = query.order('name', { ascending: true }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[PhoneList] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ data: data || [], total, page, totalPages });
  } catch (error) {
    console.error('[PhoneList] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
