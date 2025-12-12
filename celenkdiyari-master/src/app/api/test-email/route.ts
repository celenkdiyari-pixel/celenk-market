import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotificationEmail, OrderEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test email gönderiliyor...');
    
    // Test sipariş verisi
    const testOrderData: OrderEmailData = {
      orderId: '1234', // 4 haneli test sipariş numarası
      customerName: 'Test Müşteri',
      customerEmail: 'test@example.com',
      customerPhone: '+90 555 123 45 67',
      totalAmount: '250.00',
      items: [
        {
          name: 'Kırmızı Gül Çelenk',
          quantity: 1,
          price: 200.00
        },
        {
          name: 'Beyaz Karanfil Çelenk',
          quantity: 1,
          price: 50.00
        }
      ],
      deliveryAddress: 'Test Mahallesi, Test Sokak No:1, İstanbul',
      orderDate: new Date().toLocaleDateString('tr-TR'),
      status: 'Sipariş Alındı',
      invoice: null
    };
    
    console.log('📧 Test email verisi:', testOrderData);
    console.log('📧 Admin email adresi:', process.env.ADMIN_EMAIL || 'ADMIN_EMAIL environment variable not set');
    
    // Admin'e test emaili gönder
    const result = await sendAdminNotificationEmail(testOrderData);
    
    console.log('📧 Email gönderim sonucu:', result);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test emaili başarıyla gönderildi!',
        result: result,
        adminEmail: process.env.ADMIN_EMAIL || 'ADMIN_EMAIL environment variable not set',
        note: result.messageId === 'logged-fallback' 
          ? '⚠️ EmailJS yapılandırılmamış - Email console\'a log olarak yazıldı. Gerçek email gönderilmedi. EmailJS yapılandırmasını tamamlayın.'
          : '✅ EmailJS üzerinden gerçek email gönderildi.'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Test emaili gönderilemedi',
        error: result.error,
        adminEmail: process.env.ADMIN_EMAIL || 'ADMIN_EMAIL environment variable not set'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Test email hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'Test emaili gönderilirken hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error',
      adminEmail: process.env.ADMIN_EMAIL || 'ADMIN_EMAIL environment variable not set'
    }, { status: 500 });
  }
}

// GET endpoint - sadece bilgi döndür
export async function GET() {
  return NextResponse.json({
    message: 'Test email göndermek için POST isteği yapın',
    adminEmail: process.env.ADMIN_EMAIL || 'ADMIN_EMAIL environment variable not set',
    emailjsConfigured: !!(process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ADMIN)
  });
}

