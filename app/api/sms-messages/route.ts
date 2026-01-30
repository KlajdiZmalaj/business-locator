import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!process.env.SMSTO_API_KEY) {
    return NextResponse.json(
      { error: 'SMSTO_API_KEY environment variable is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '25';
  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status') || '';

  const params = new URLSearchParams({
    limit,
    page,
    order_direction: 'desc',
    order_by: 'created_at',
  });
  if (status) params.set('status', status);

  try {
    const response = await fetch(`https://api.sms.to/v2/messages?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SMSTO_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: `SMS.to API error (${response.status}): ${errorBody}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SmsMessages] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
