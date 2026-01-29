import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import nodemailer from 'nodemailer';

const DELAY_MS = 8000;

function getEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iProPixel Solutions</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">iProPixel Solutions</h1>
              <p style="margin:8px 0 0;color:#a0a0c0;font-size:13px;">Digital Agency | Tiran\u00eb, Shqip\u00ebri</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px;color:#1a1a2e;font-size:18px;">P\u00ebrsh\u00ebndetje,</h2>

              <p style="margin:0 0 16px;color:#4a4a68;font-size:15px;line-height:1.6;">
                Shpresoj t'ju gjej mir\u00eb.
              </p>

              <p style="margin:0 0 16px;color:#4a4a68;font-size:15px;line-height:1.6;">
                Jemi <strong>iProPixel Solutions</strong>, nj\u00eb agjenci e zhvillimit t\u00eb faqeve web dhe aplikacioneve, dhe po kontaktojm\u00eb biznese lokale p\u00ebr t'ju ofruar mund\u00ebsin\u00eb e krijimit ose p\u00ebrmir\u00ebsimit t\u00eb prezenc\u00ebs s\u00eb tyre online.
              </p>

              <p style="margin:0 0 16px;color:#4a4a68;font-size:15px;line-height:1.6;">
                N\u00ebse aktualisht keni nj\u00eb faqe web, ne mund ta ridizajnojm\u00eb dhe p\u00ebrmir\u00ebsojm\u00eb p\u00ebr ta b\u00ebr\u00eb m\u00eb moderne, m\u00eb t\u00eb shpejt\u00eb dhe m\u00eb efektive p\u00ebr klient\u00ebt tuaj. N\u00ebse nuk keni ende nj\u00eb faqe web, mund t'ju krijojm\u00eb nj\u00eb website profesional nga fillimi, i personalizuar sipas nevojave tuaja.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 20px;background-color:#fff3e0;border-left:4px solid #ff9800;border-radius:0 6px 6px 0;">
                    <p style="margin:0;color:#e65100;font-size:15px;font-weight:700;line-height:1.6;">
                      Aktualisht po ofrojm\u00eb nj\u00eb promocion me 80% zbritje n\u00eb sh\u00ebrbimet tona p\u00ebr nj\u00eb num\u00ebr t\u00eb kufizuar biznesesh.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#4a4a68;font-size:15px;line-height:1.6;">
                N\u00ebse jeni t\u00eb interesuar, do t\u00eb na vinte k\u00ebnaq\u00ebsi t\u00eb diskutojm\u00eb m\u00eb tej dhe t'ju prezantojm\u00eb disa shembuj pune.
              </p>

              <p style="margin:0 0 24px;color:#4a4a68;font-size:15px;line-height:1.6;">
                Faleminderit p\u00ebr koh\u00ebn tuaj,
              </p>

              <p style="margin:0 0 24px;color:#1a1a2e;font-size:15px;font-weight:700;">
                iProPixel Solutions
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:6px;background-color:#1a1a2e;">
                    <a href="https://ipropixel.com" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Vizitoni Website</a>
                  </td>
                  <td style="width:12px;"></td>
                  <td style="border-radius:6px;background-color:#25D366;">
                    <a href="https://wa.me/355682277167" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">WhatsApp</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background-color:#f0f0ff;border-radius:6px;">
                    <p style="margin:0 0 8px;color:#4a4a68;font-size:14px;"><strong>Website:</strong> <a href="https://ipropixel.com" style="color:#1a1a2e;text-decoration:underline;">ipropixel.com</a></p>
                    <p style="margin:0 0 8px;color:#4a4a68;font-size:14px;"><strong>Tel / WhatsApp:</strong> <a href="tel:+355682277167" style="color:#1a1a2e;text-decoration:underline;">+355 68 227 7167</a></p>
                    <p style="margin:0;color:#4a4a68;font-size:14px;"><strong>Email:</strong> <a href="mailto:info@ipropixel.com" style="color:#1a1a2e;text-decoration:underline;">info@ipropixel.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9fc;padding:24px 40px;border-top:1px solid #e8e8f0;">
              <p style="margin:0 0 8px;color:#8a8aa0;font-size:13px;text-align:center;">
                Digital Agency | Tiran\u00eb, Shqip\u00ebri
              </p>
              <p style="margin:0 0 8px;color:#8a8aa0;font-size:13px;text-align:center;">
                <a href="https://ipropixel.com" style="color:#8a8aa0;">ipropixel.com</a> | info@ipropixel.com | <a href="tel:+355682277167" style="color:#8a8aa0;">+355 68 227 7167</a>
              </p>
              <p style="margin:0;color:#b0b0c0;font-size:11px;text-align:center;">
                N\u00ebse nuk d\u00ebshironi t\u00eb merrni email t\u00eb tjera, ju lutem na shkruani n\u00eb info@ipropixel.com me subjektin "Unsubscribe".
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getPlainText(): string {
  return `Përshëndetje,

Shpresoj t'ju gjej mirë.

Jemi iProPixel Solutions, një agjenci e zhvillimit të faqeve web dhe aplikacioneve, dhe po kontaktojmë biznese lokale për t'ju ofruar mundësinë e krijimit ose përmirësimit të prezencës së tyre online.

Nëse aktualisht keni një faqe web, ne mund ta ridizajnojmë dhe përmirësojmë për ta bërë më moderne, më të shpejtë dhe më efektive për klientët tuaj. Nëse nuk keni ende një faqe web, mund t'ju krijojmë një website profesional nga fillimi, i personalizuar sipas nevojave tuaja.

Aktualisht po ofrojmë një promocion me 80% zbritje në shërbimet tona për një numër të kufizuar biznesesh.

Nëse jeni të interesuar, do të na vinte kënaqësi të diskutojmë më tej dhe t'ju prezantojmë disa shembuj pune.

Faleminderit për kohën tuaj,

iProPixel Solutions

Website: https://ipropixel.com
Tel / WhatsApp: +355 68 227 7167
Email: info@ipropixel.com

---
Digital Agency | Tiranë, Shqipëri
ipropixel.com | info@ipropixel.com | +355 68 227 7167
Nëse nuk dëshironi të merrni email të tjera, ju lutem na shkruani në info@ipropixel.com me subjektin "Unsubscribe".`;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const { businessIds } = await request.json();

    if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json(
        { error: 'businessIds array is required' },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'SMTP environment variables are not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch businesses that have emails and haven't been emailed
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, emails, email_sent')
      .in('id', businessIds)
      .not('emails', 'eq', '{}')
      .or('email_sent.eq.false,email_sent.is.null');

    if (fetchError) {
      console.error('[SendEmails] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        sent: 0,
        failed: 0,
        errors: ['No eligible businesses found (they may have already been emailed or lack email addresses)'],
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < businesses.length; i++) {
      const biz = businesses[i];
      const email = biz.emails?.[0];

      if (!email) {
        failed++;
        errors.push(`${biz.name}: No email address`);
        continue;
      }

      try {
        await transporter.sendMail({
          from: '"iProPixel Solutions" <info@ipropixel.com>',
          replyTo: 'info@ipropixel.com',
          to: email,
          bcc: smtpUser,
          subject: 'Ofertë promocionale për përmirësimin ose krijimin e faqes web',
          text: getPlainText(),
          html: getEmailHtml(),
        });

        // Mark as sent in DB
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          })
          .eq('id', biz.id);

        if (updateError) {
          console.error(`[SendEmails] DB update error for ${biz.name}:`, updateError);
        }

        sent++;
        console.log(`[SendEmails] Sent ${sent}/${businesses.length}: ${biz.name} (${email})`);
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${biz.name} (${email}): ${msg}`);
        console.error(`[SendEmails] Failed for ${biz.name}:`, err);
      }

      // Throttle: wait between sends (skip after last)
      if (i < businesses.length - 1) {
        await sleep(DELAY_MS);
      }
    }

    return NextResponse.json({ sent, failed, errors });
  } catch (error) {
    console.error('[SendEmails] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
