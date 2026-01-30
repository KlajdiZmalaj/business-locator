import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { BusinessesResponse } from '@/lib/types';
import { requireAuth } from '@/lib/api-auth';

export async function PATCH(request: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const auth = await requireAuth();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const { id, sms_sent } = body;

    if (!id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('businesses')
      .update({
        sms_sent: sms_sent === true,
        sms_sent_at: sms_sent === true ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) {
      console.error('[Businesses] Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Businesses] Update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const auth = await requireAuth();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Businesses] Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Businesses] Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<BusinessesResponse | { error: string }>> {
  const authGet = await requireAuth();
  if (authGet.response) return authGet.response;

  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchQuery = searchParams.get('search_query') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const nameFilter = searchParams.get('name') || '';

    // New filter params
    const hasReviews20 = searchParams.get('has_reviews_20') === 'true';
    const hasPhone = searchParams.get('has_phone') === 'true';
    const hasWebsite = searchParams.get('has_website') === 'true';

    const offset = (page - 1) * limit;

    // Build the query
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' });

    // Apply filters
    if (searchQuery) {
      query = query.eq('search_query', searchQuery);
    }

    if (nameFilter) {
      query = query.ilike('name', `%${nameFilter}%`);
    }

    // Apply new toggle filters
    if (hasReviews20) {
      query = query.gt('review_count', 20);
    }

    if (hasPhone) {
      query = query.not('phone', 'is', null);
    }

    if (hasWebsite) {
      query = query.is('website', null);
    }

    // Apply sorting
    const validSortColumns = ['rating', 'review_count', 'name', 'created_at', 'scraped_at'];
    const column = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(column, { ascending: sortOrder === 'asc', nullsFirst: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Businesses] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: data || [],
      total,
      page,
      totalPages,
    });

  } catch (error) {
    console.error('[Businesses] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
