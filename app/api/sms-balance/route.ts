import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAuth();
  if (auth.response) return auth.response;

  if (!process.env.SMSTO_API_KEY) {
    return NextResponse.json(
      { error: 'SMSTO_API_KEY environment variable is not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://auth.sms.to/api/balance', {
      headers: {
        'Authorization': `Bearer ${process.env.SMSTO_API_KEY}`,
        'Content-Type': 'application/json',
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
    console.error('[SmsBalance] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
