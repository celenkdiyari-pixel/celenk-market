import { NextRequest, NextResponse } from 'next/server';

/**
 * Email gönderim API'si.
 * role parametresi ile admin ya da customer şablonu seçilir.
 * role belirtilmezse varsayılan olarak "customer" şablonu kullanılır.
 */
interface EmailData {
  to: string;                     // alıcı e‑posta adresi
  subject: string;                // e‑posta başlığı
  role?: 'admin' | 'customer';    // hangi şablon kullanılacak (default: customer)
  templateParams: Record<string, string | number | boolean>;
}

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      subject,
      role = 'customer',
      templateParams,
    }: EmailData = await request.json();

    // -----------------------------------------------------------------
    // EmailJS konfigürasyonu (Vercel env değişkenlerinden alınır)
    // -----------------------------------------------------------------
    const serviceId =
      process.env.EMAILJS_SERVICE_ID ||
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const publicKey =
      process.env.EMAILJS_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
      process.env.EMAILJS_USER_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !publicKey) {
      console.error('❌ EmailJS configuration missing');
      return NextResponse.json(
        {
          error: 'Email service not configured',
          debug: { hasServiceId: !!serviceId, hasPublicKey: !!publicKey },
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------------------
    // Şablon seçimi (admin vs. customer)
    // -----------------------------------------------------------------
    const adminTemplateId = process.env.EMAILJS_TEMPLATE_ADMIN; // e.g. template_t6bsxpr
    const customerTemplateId = process.env.EMAILJS_TEMPLATE_CUSTOMER; // e.g. template_zel5ngx

    const selectedTemplateId =
      role === 'admin' ? adminTemplateId : customerTemplateId;

    if (!selectedTemplateId) {
      console.error('❌ Template ID missing for role:', role);
      return NextResponse.json(
        { error: 'Template ID is required for the selected role' },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------
    // Payload oluşturulması
    // -----------------------------------------------------------------
    const emailPayload: Record<string, unknown> = {
      service_id: serviceId,
      template_id: selectedTemplateId,
      user_id: publicKey,
      template_params: {
        ...templateParams,
        to_email: to,
        subject,
        reply_to: to,
      },
    };

    if (privateKey) {
      emailPayload.accessToken = privateKey;
    }

    // -----------------------------------------------------------------
    // EmailJS API çağrısı
    // -----------------------------------------------------------------
    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;

    console.log('📧 Sending email via EmailJS', {
      to,
      subject,
      role,
      templateId: selectedTemplateId,
    });

    const emailResponse = await fetch(emailjsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    const responseText = await emailResponse.text();

    if (!emailResponse.ok) {
      console.error('❌ EmailJS API error:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: responseText,
          status: emailResponse.status,
        },
        { status: emailResponse.status }
      );
    }

    console.log('✅ Email sent successfully');
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      role,
    });
  } catch (error) {
    console.error('❌ Unexpected error in /api/email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
