import { NextRequest, NextResponse } from 'next/server';

interface EmailData {
  to: string;
  subject: string;
  templateId: string;
  templateParams: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailData = await request.json();
    
    const { to, subject, templateId, templateParams } = emailData;

    // EmailJS servis bilgileri - Vercel environment variables'dan alınacak
    // Vercel'de kayıtlı olan keyler: EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_TEMPLATE_ID
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID;

    if (!serviceId || !publicKey) {
      console.error('❌ EmailJS configuration missing');
      console.error('Service ID:', serviceId ? 'Found' : 'Missing');
      console.error('Public Key:', publicKey ? 'Found' : 'Missing');
      return NextResponse.json({
        error: 'Email service not configured',
        message: 'EmailJS service ID and public key are required. Please check Vercel environment variables.',
        debug: {
          hasServiceId: !!serviceId,
          hasPublicKey: !!publicKey
        }
      }, { status: 500 });
    }

    if (!templateId) {
      console.error('❌ Template ID missing');
      return NextResponse.json({
        error: 'Template ID is required'
      }, { status: 400 });
    }

    // EmailJS API endpoint
    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;

    // EmailJS API formatı
    // EmailJS'de to_email ve subject template_params içinde gönderilir
    // Template'lerde {{to_email}} ve {{subject}} kullanılabilir
    const emailPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        ...templateParams,
        to_email: to,
        subject: subject,
        // EmailJS template'lerinde kullanılabilecek ek parametreler
        reply_to: to, // Reply-to adresi
      }
    };

    console.log('📧 Sending email via EmailJS:', {
      service_id: serviceId,
      template_id: templateId,
      to_email: to,
      subject: subject
    });

    // Email gönderme isteği
    const emailResponse = await fetch(emailjsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    const responseText = await emailResponse.text();
    
    if (!emailResponse.ok) {
      console.error('❌ EmailJS API error:', responseText);
      console.error('❌ Status:', emailResponse.status);
      return NextResponse.json({
        error: 'Failed to send email',
        details: responseText,
        status: emailResponse.status
      }, { status: emailResponse.status });
    }

    console.log('✅ Email sent successfully via EmailJS');
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

