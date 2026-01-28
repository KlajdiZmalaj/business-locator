import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { BusinessesResponse } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse<BusinessesResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchQuery = searchParams.get('search_query') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const nameFilter = searchParams.get('name') || '';

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
