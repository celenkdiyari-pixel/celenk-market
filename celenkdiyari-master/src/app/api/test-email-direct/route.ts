import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Direct test email gönderiliyor...');
    
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ADMIN = process.env.EMAILJS_TEMPLATE_ADMIN;
    const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // Server-side için Private Key
    
    console.log('📧 Environment Variables:');
    console.log('  ADMIN_EMAIL:', ADMIN_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('  EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing');
    console.log('  EMAILJS_TEMPLATE_ADMIN:', EMAILJS_TEMPLATE_ADMIN ? '✅ Set' : '❌ Missing');
    console.log('  EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
    console.log('  EMAILJS_PRIVATE_KEY:', EMAILJS_PRIVATE_KEY ? '✅ Set (Server-side için)' : '❌ Missing (Public Key kullanılacak)');
    
    if (!ADMIN_EMAIL) {
      return NextResponse.json({
        success: false,
        message: 'ADMIN_EMAIL environment variable is not set',
        required: {
          ADMIN_EMAIL: 'celenkdiyari@gmail.com',
          EMAILJS_SERVICE_ID: 'your-service-id',
          EMAILJS_TEMPLATE_ADMIN: 'your-template-id',
          EMAILJS_PUBLIC_KEY: 'your-public-key'
        }
      }, { status: 500 });
    }
    
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ADMIN || (!EMAILJS_PRIVATE_KEY && !EMAILJS_PUBLIC_KEY)) {
      return NextResponse.json({
        success: false,
        message: 'EmailJS environment variables are not properly configured',
        missing: {
          EMAILJS_SERVICE_ID: !EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ADMIN: !EMAILJS_TEMPLATE_ADMIN,
          EMAILJS_PRIVATE_KEY: !EMAILJS_PRIVATE_KEY,
          EMAILJS_PUBLIC_KEY: !EMAILJS_PUBLIC_KEY
        },
        note: 'Server-side için EMAILJS_PRIVATE_KEY kullanılması önerilir. Public Key sadece browser için çalışır.',
        instructions: {
          step1: 'Go to https://dashboard.emailjs.com',
          step2: 'Create a service (Gmail, Outlook, etc.)',
          step3: 'Create an email template for admin notifications',
          step4: 'Get your Public Key from Account > API Keys',
          step5: 'Add these to Vercel environment variables'
        }
      }, { status: 500 });
    }
    
    // Test email data
    const templateParams = {
      to_email: ADMIN_EMAIL,
      to_name: 'Admin',
      order_id: '1234',
      order_date: new Date().toLocaleDateString('tr-TR'),
      order_status: 'Sipariş Alındı',
      customer_name: 'Test Müşteri',
      customer_email: 'test@example.com',
      customer_phone: '+90 555 123 45 67',
      total_amount: '250.00',
      delivery_address: 'Test Mahallesi, Test Sokak No:1, İstanbul',
      items_list: 'Kırmızı Gül Çelenk x1 = ₺200.00\nBeyaz Karanfil Çelenk x1 = ₺50.00',
      admin_panel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://celenkdiyari.com'}/admin/orders`,
      company_name: 'Çelenk Diyarı',
      company_email: 'info@celenkdiyari.com',
      company_phone: '+90 535 561 26 56'
    };
    
    console.log('📧 Sending email to:', ADMIN_EMAIL);
    
    // EmailJS @emailjs/nodejs paketi her zaman Public Key kullanır
    // Service ayarlarında "Allow requests from any origin" aktif olmalı
    const apiKey = EMAILJS_PUBLIC_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'EMAILJS_PUBLIC_KEY environment variable is required',
        note: 'EmailJS nodejs package requires Public Key. Make sure your EmailJS service allows requests from any origin in the dashboard.'
      }, { status: 500 });
    }
    
    console.log('📧 EmailJS Configuration:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ADMIN,
      keyType: 'publicKey',
      hasKey: !!apiKey,
      adminEmail: ADMIN_EMAIL,
      note: 'Using Public Key (EmailJS nodejs package requirement)'
    });
    console.log('📧 Template params:', templateParams);
    
    try {
      console.log('📧 Attempting to send email with EmailJS REST API...');
      console.log('📧 Using Public Key via REST API');
      
      // EmailJS REST API endpoint
      const emailjsApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
      
      const requestBody = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ADMIN,
        user_id: apiKey, // Public Key
        template_params: templateParams
      };
      
      console.log('📧 EmailJS API Request:', {
        url: emailjsApiUrl,
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ADMIN,
        hasPublicKey: !!apiKey
      });
      
      const response = await fetch(emailjsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { text: responseText, status: response.status };
      }
      
      if (!response.ok) {
        throw {
          status: response.status,
          text: result.text || responseText,
          message: result.text || `HTTP ${response.status}`
        };
      }
      
      console.log('✅ Email sent successfully:', {
        status: response.status,
        text: result.text || responseText
      });
      
      return NextResponse.json({
        success: true,
        message: 'Test emaili başarıyla gönderildi!',
        result: {
          status: response.status,
          text: result.text || responseText,
          messageId: result.text || 'Success'
        },
        sentTo: ADMIN_EMAIL,
        timestamp: new Date().toISOString(),
        note: 'EmailJS Dashboard > Email Logs\'dan email\'in gönderildiğini kontrol edin.'
      });
      
    } catch (emailError: any) {
      // EmailJS hatasını daha detaylı logla
      console.error('❌ EmailJS send error caught:', emailError);
      console.error('❌ Error type:', typeof emailError);
      console.error('❌ Error constructor:', emailError?.constructor?.name);
      console.error('❌ Error keys:', Object.keys(emailError || {}));
      
      // EmailJS'in farklı hata formatlarını kontrol et
      let errorStatus = emailError?.status;
      let errorText = emailError?.text;
      let errorMessage = emailError?.message || 'Email gönderilemedi';
      
      // EmailJS bazen response objesi içinde hata döndürür
      if (emailError?.response) {
        console.error('❌ EmailJS response error found:', emailError.response);
        errorStatus = emailError.response?.status || errorStatus;
        errorText = emailError.response?.text || errorText;
        errorMessage = emailError.response?.message || errorMessage;
      }
      
      // EmailJS bazen data objesi içinde hata döndürür
      if (emailError?.data) {
        console.error('❌ EmailJS data error found:', emailError.data);
        errorStatus = emailError.data?.status || errorStatus;
        errorText = emailError.data?.text || errorText;
        errorMessage = emailError.data?.message || errorMessage;
      }
      
      // String olarak hata mesajı varsa
      if (typeof emailError === 'string') {
        errorMessage = emailError;
      }
      
      // Hata mesajını belirle
      if (!errorMessage || errorMessage === 'Email gönderilemedi') {
        if (errorText) {
          errorMessage = errorText;
        } else if (emailError?.message) {
          errorMessage = emailError.message;
        } else if (typeof emailError === 'string') {
          errorMessage = emailError;
        } else {
          errorMessage = 'Email gönderilemedi - detaylı hata bilgisi alınamadı';
        }
      }
      
      console.error('❌ Final error details:', {
        status: errorStatus,
        text: errorText,
        message: errorMessage,
        fullError: JSON.stringify(emailError, Object.getOwnPropertyNames(emailError))
      });
      console.error('❌ EmailJS error:', emailError);
      console.error('❌ Error details:', {
        status: emailError?.status,
        text: emailError?.text,
        message: emailError?.message,
        stack: emailError?.stack,
        name: emailError?.name,
        code: emailError?.code,
        response: emailError?.response
      });
      
      // Troubleshooting adımları
      let troubleshooting: string[] = [];
      
      if (errorStatus === 400) {
        errorMessage = 'EmailJS template parametreleri hatalı';
        troubleshooting = [
          'EmailJS Dashboard > Email Templates\'e gidin',
          'Template\'deki değişken isimlerini kontrol edin',
          'Template parametrelerinin doğru olduğundan emin olun'
        ];
      } else if (errorStatus === 401) {
        errorMessage = 'EmailJS Key geçersiz';
        troubleshooting = [
          'Vercel Dashboard > Environment Variables\'a gidin',
          'EMAILJS_PRIVATE_KEY veya EMAILJS_PUBLIC_KEY değerini kontrol edin',
          'EmailJS Dashboard > Account > API Keys\'den Private Key\'i kopyalayın (server-side için)'
        ];
      } else if (errorStatus === 403) {
        errorMessage = 'EmailJS API çağrıları server-side için devre dışı';
        troubleshooting = [
          'EmailJS Dashboard > Email Services\'e gidin',
          'Service\'inizi seçin (service_deg1z9a)',
          'Service Settings\'te "Allow requests from any origin" seçeneğini aktif edin',
          'Bu ayar server-side API çağrıları için gereklidir'
        ];
      } else if (errorStatus === 404) {
        errorMessage = 'EmailJS Service veya Template bulunamadı';
        troubleshooting = [
          'EmailJS Dashboard > Email Services\'te service\'in aktif olduğundan emin olun',
          'EmailJS Dashboard > Email Templates\'te template\'in aktif olduğundan emin olun',
          'Vercel\'deki EMAILJS_SERVICE_ID ve EMAILJS_TEMPLATE_ADMIN değerlerini kontrol edin'
        ];
      } else if (errorStatus === 429) {
        errorMessage = 'EmailJS quota aşıldı';
        troubleshooting = [
          'EmailJS Dashboard > Account\'a gidin',
          'Aylık email limitinizi kontrol edin (ücretsiz: 200 email/ay)',
          'Quota aşıldıysa plan yükseltin veya bir sonraki aya bekleyin'
        ];
      } else {
        troubleshooting = [
          'EmailJS Dashboard > Email Logs\'u kontrol edin',
          'Service\'in aktif olduğundan emin olun',
          'Template\'in aktif olduğundan emin olun',
          'Public Key\'in doğru olduğundan emin olun',
          'ADMIN_EMAIL\'in doğru olduğundan emin olun'
        ];
      }
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: {
          status: errorStatus || 'N/A',
          text: errorText || 'N/A',
          message: errorMessage || 'Unknown error',
          code: emailError?.code,
          name: emailError?.name || emailError?.constructor?.name,
          fullError: JSON.stringify(emailError, Object.getOwnPropertyNames(emailError), 2),
          errorType: typeof emailError,
          errorKeys: Object.keys(emailError || {})
        },
        troubleshooting: troubleshooting,
        sentTo: ADMIN_EMAIL,
        configuration: {
          serviceId: EMAILJS_SERVICE_ID,
          templateId: EMAILJS_TEMPLATE_ADMIN,
          hasPublicKey: !!EMAILJS_PUBLIC_KEY,
          keyType: 'publicKey',
          adminEmail: ADMIN_EMAIL,
          note: 'EmailJS nodejs package requires Public Key. Service must allow requests from any origin.'
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('❌ Error full details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack',
      name: error instanceof Error ? error.name : 'Unknown',
      toString: error?.toString()
    });
    
    return NextResponse.json({
      success: false,
      message: 'Beklenmeyen hata oluştu',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        fullError: error?.toString()
      },
      troubleshooting: [
        'Vercel logs\'larını kontrol edin',
        'EmailJS Dashboard > Email Logs\'u kontrol edin',
        'Service ve Template\'in aktif olduğundan emin olun',
        'Private Key\'in doğru olduğundan emin olun'
      ]
    }, { status: 500 });
  }
}

// GET endpoint - configuration check
export async function GET() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ADMIN = process.env.EMAILJS_TEMPLATE_ADMIN;
  const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
  const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
  
  return NextResponse.json({
    message: 'Direct test email göndermek için POST isteği yapın',
    configuration: {
      ADMIN_EMAIL: ADMIN_EMAIL ? '✅ Set' : '❌ Missing',
      EMAILJS_SERVICE_ID: EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing',
      EMAILJS_TEMPLATE_ADMIN: EMAILJS_TEMPLATE_ADMIN ? '✅ Set' : '❌ Missing',
      EMAILJS_PUBLIC_KEY: EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing'
    },
    adminEmail: ADMIN_EMAIL || 'Not set',
    emailjsConfigured: !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ADMIN && EMAILJS_PUBLIC_KEY),
    // Client-side için gerekli bilgiler (Public Key zaten public, güvenlik riski yok)
    emailjsConfig: {
      serviceId: EMAILJS_SERVICE_ID || '',
      templateId: EMAILJS_TEMPLATE_ADMIN || '',
      publicKey: EMAILJS_PUBLIC_KEY || ''
    },
    note: 'Client-side email gönderimi için @emailjs/browser paketi kullanılıyor. 403 hatası olmaz.'
  });
}

