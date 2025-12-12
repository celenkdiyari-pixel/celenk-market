import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitize, contactSchema } from '@/lib/validation';
import { sendContactFormEmail } from '@/lib/email';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 submissions per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`contact:${clientIP}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for contact form from IP: ${clientIP}`);
      return NextResponse.json({
        success: false,
        error: rateLimitResult.message || 'Çok fazla mesaj denemesi yapıldı. Lütfen daha sonra tekrar deneyin.',
        rateLimit: {
          resetTime: rateLimitResult.resetTime,
          blocked: rateLimitResult.blocked
        },
        timestamp: new Date().toISOString()
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    }

    const body = await request.json();
    
    // Validate and sanitize input
    const validationResult = validateAndSanitize(contactSchema, body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Form doğrulama hatası',
        errors: 'errors' in validationResult ? validationResult.errors : []
      }, { status: 400 });
    }

    const { name, email, phone, subject, message } = validationResult.data;

    // Save contact form submission to Firestore
    try {
      const contactData = {
        name,
        email,
        phone: phone || '',
        subject,
        message,
        ip: clientIP,
        createdAt: new Date().toISOString(),
        status: 'new',
        read: false
      };

      await addDoc(collection(db, 'contacts'), contactData);
      console.log('✅ Contact form saved to Firestore');
    } catch (dbError) {
      console.error('❌ Error saving contact to Firestore:', dbError);
      // Continue even if Firestore save fails - still try to send email
    }

    // Send email notification
    try {
      const emailResult = await sendContactFormEmail({
        name,
        email,
        phone: phone || '',
        subject,
        message
      });

      console.log('✅ Contact form email sent:', emailResult);
    } catch (emailError) {
      console.error('❌ Error sending contact email:', emailError);
      // Still return success if Firestore save worked
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size geri dönüş yapacağız.',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return NextResponse.json({
      success: false,
      error: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

