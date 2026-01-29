import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || '',
  apiSecret: process.env.VONAGE_API_SECRET || '',
});

const SMS_FROM = 'iProPixel';

function getSmsText(businessName: string): string {
  return `Pershendetje ${businessName},

Jemi iProPixel Solutions, agjenci e zhvillimit te faqeve web. Po ofrojme 80% zbritje per biznese lokale.

Vizitoni: ipropixel.com
WhatsApp: +355 68 227 7167

Faleminderit!`;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const DELAY_MS = 5000;

export async function POST(request: NextRequest) {
  try {
    const { businessIds } = await request.json();

    if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json(
        { error: 'businessIds array is required' },
        { status: 400 }
      );
    }

    if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
      return NextResponse.json(
        { error: 'VONAGE_API_KEY and VONAGE_API_SECRET environment variables are not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch businesses that have phone numbers and haven't been messaged
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, phone, sms_sent')
      .in('id', businessIds)
      .not('phone', 'is', null)
      .neq('phone', '')
      .or('sms_sent.eq.false,sms_sent.is.null');

    if (fetchError) {
      console.error('[SendSMS] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        sent: 0,
        failed: 0,
        errors: ['No eligible businesses found (they may have already been messaged or lack phone numbers)'],
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < businesses.length; i++) {
      const biz = businesses[i];
      let phone = biz.phone;

      if (!phone) {
        failed++;
        errors.push(`${biz.name}: No phone number`);
        continue;
      }

      // Normalize phone: remove spaces, dashes, and leading + sign
      phone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

      try {
        const text = getSmsText(biz.name);

        await vonage.sms.send({
          to: phone,
          from: SMS_FROM,
          text,
        });

        // Mark as sent in DB
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            sms_sent: true,
            sms_sent_at: new Date().toISOString(),
          })
          .eq('id', biz.id);

        if (updateError) {
          console.error(`[SendSMS] DB update error for ${biz.name}:`, updateError);
        }

        sent++;
        console.log(`[SendSMS] Sent ${sent}/${businesses.length}: ${biz.name} (${phone})`);
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${biz.name} (${phone}): ${msg}`);
        console.error(`[SendSMS] Failed for ${biz.name}:`, err);
      }

      // Throttle: wait between sends (skip after last)
      if (i < businesses.length - 1) {
        await sleep(DELAY_MS);
      }
    }

    return NextResponse.json({ sent, failed, errors });
  } catch (error) {
    console.error('[SendSMS] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
