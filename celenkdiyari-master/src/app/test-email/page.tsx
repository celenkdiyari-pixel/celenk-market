'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  // Yapılandırmayı kontrol et
  useEffect(() => {
    fetch('/api/test-email-direct')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
      })
      .catch(err => {
        console.error('Config check error:', err);
      });
  }, []);

  const sendTestEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Client-side email gönderimi (403 hatası olmaz)
      const serviceId = config?.emailjsConfig?.serviceId || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = config?.emailjsConfig?.templateId || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN || 'template_t6bsxpr';
      const publicKey = config?.emailjsConfig?.publicKey || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      const adminEmail = config?.adminEmail || 'celenkdiyari@gmail.com';

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS yapılandırması eksik. Environment variables kontrol edin.');
      }

      // EmailJS'i initialize et
      emailjs.init(publicKey);

      const templateParams = {
        to_email: adminEmail,
        to_name: 'Admin',
        from_name: 'Çelenk Diyarı Sipariş Sistemi',
        subject: 'Yeni Sipariş Alındı - Test Email',
        // Sipariş Bilgileri
        order_id: '1234',
        order_number: '1234',
        order_date: new Date().toLocaleDateString('tr-TR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        order_status: 'Sipariş Alındı',
        // Müşteri Bilgileri
        customer_name: 'Test Müşteri',
        customer_email: 'test@example.com',
        customer_phone: '+90 555 123 45 67',
        // Ürünler - Detaylı Liste
        items_list: 'Kırmızı Gül Çelenk x1 = ₺200.00\nBeyaz Karanfil Çelenk x1 = ₺50.00',
        products: 'Kırmızı Gül Çelenk + Beyaz Karanfil Çelenk',
        // Fiyat Bilgileri
        total_amount: '₺250.00',
        subtotal: '₺250.00',
        shipping_cost: '₺0.00',
        tax_amount: '₺0.00',
        // Teslimat Bilgileri
        delivery_address: 'Test Mahallesi, Test Sokak No:1, İstanbul',
        delivery_city: 'İstanbul',
        delivery_district: 'Kadıköy',
        delivery_postal_code: '34000',
        // Ödeme Bilgileri
        payment_method: 'Kredi Kartı',
        payment_status: 'Ödendi',
        // Fatura Bilgileri (Test için)
        invoice_type: 'Bireysel',
        invoice_tax_number: '12345678901',
        invoice_address: 'Test Mahallesi, Test Sokak No:1, İstanbul',
        invoice_city: 'İstanbul',
        invoice_district: 'Kadıköy',
        invoice_postal_code: '34000',
        // Şirket Bilgileri
        company_name: 'Çelenk Diyarı',
        company_email: 'info@celenkdiyari.com',
        company_phone: '+90 532 137 81 60',
        // Admin Panel Linki
        admin_panel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://celenkdiyari.com'}/admin/orders`,
        // Ek Mesaj
        message: 'Bu bir test emailidir. EmailJS client-side gönderimi çalışıyor. Tüm sipariş detayları bu email\'de yer almaktadır.',
        order_note: 'Test siparişi - Detaylı bilgi testi'
      };

      const result = await emailjs.send(serviceId, templateId, templateParams);

      setResult({
        success: true,
        message: 'Test emaili başarıyla gönderildi!',
        sentTo: adminEmail,
        result: {
          status: result.status,
          text: result.text,
          messageId: result.text
        },
        note: 'EmailJS Dashboard > Email Logs\'dan email\'in gönderildiğini kontrol edin.'
      });
    } catch (error: any) {
      console.error('Email send error:', error);
      setResult({
        success: false,
        message: 'Test emaili gönderilirken hata oluştu',
        error: {
          status: error?.status || 'N/A',
          message: error?.message || error?.text || 'Unknown error',
          text: error?.text || 'N/A',
          name: error?.name || 'Error'
        },
        troubleshooting: [
          'EmailJS Dashboard > Email Services\'e gidin',
          'Service\'inizin aktif olduğundan emin olun',
          'Template\'in aktif olduğundan emin olun',
          'Public Key\'in doğru olduğundan emin olun',
          'NEXT_PUBLIC_EMAILJS_* environment variables\'ların Vercel\'de set edildiğinden emin olun'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Email Gönderimi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Yapılandırma Durumu */}
          {config && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Yapılandırma Durumu:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {config.configuration?.ADMIN_EMAIL === '✅ Set' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>ADMIN_EMAIL: {config.configuration?.ADMIN_EMAIL || '❌ Missing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.configuration?.EMAILJS_SERVICE_ID === '✅ Set' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>EMAILJS_SERVICE_ID: {config.configuration?.EMAILJS_SERVICE_ID || '❌ Missing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.configuration?.EMAILJS_TEMPLATE_ADMIN === '✅ Set' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>EMAILJS_TEMPLATE_ADMIN: {config.configuration?.EMAILJS_TEMPLATE_ADMIN || '❌ Missing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {config.configuration?.EMAILJS_PUBLIC_KEY === '✅ Set' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>EMAILJS_PUBLIC_KEY: {config.configuration?.EMAILJS_PUBLIC_KEY || '❌ Missing'}</span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <span className="font-medium">Admin Email:</span> {config.adminEmail || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">EmailJS Yapılandırılmış:</span>{' '}
                  {config.emailjsConfigured ? (
                    <span className="text-green-600">✅ Evet</span>
                  ) : (
                    <span className="text-red-600">❌ Hayır</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Email Butonu */}
          <Button
            onClick={sendTestEmail}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Email Gönderiliyor...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Test Emaili Gönder
              </>
            )}
          </Button>

          {/* Sonuç */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? '✅ Başarılı!' : '❌ Hata'}
                  </h3>
                  <p className={`mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.success && (
                    <div className="mt-3 text-sm text-green-600">
                      <p><strong>Gönderilen Adres:</strong> {result.sentTo}</p>
                      {result.result?.messageId && (
                        <p><strong>Message ID:</strong> {result.result.messageId}</p>
                      )}
                      {result.note && (
                        <p className="mt-2 italic">{result.note}</p>
                      )}
                    </div>
                  )}

                  {!result.success && result.error && (
                    <div className="mt-3 text-sm text-red-600">
                      <p><strong>Hata Detayları:</strong></p>
                      <div className="mt-1 p-2 bg-red-100 rounded text-xs overflow-auto">
                        <p><strong>Status:</strong> {result.error.status || 'N/A'}</p>
                        <p><strong>Message:</strong> {result.error.message || result.error.text || 'Unknown error'}</p>
                        <p><strong>Text:</strong> {result.error.text || 'N/A'}</p>
                        {result.error.code && <p><strong>Code:</strong> {result.error.code}</p>}
                        {result.error.name && <p><strong>Name:</strong> {result.error.name}</p>}
                        <details className="mt-2">
                          <summary className="cursor-pointer font-semibold">Tam Hata Detayları</summary>
                          <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-auto">
                            {JSON.stringify(result.error, null, 2)}
                          </pre>
                        </details>
                      </div>
                      {result.troubleshooting && (
                        <div className="mt-3">
                          <p className="font-medium mb-1">Sorun Giderme Adımları:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.troubleshooting.map((step: string, index: number) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.configuration && (
                        <div className="mt-3">
                          <p className="font-medium mb-1">Yapılandırma:</p>
                          <pre className="mt-1 p-2 bg-red-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.configuration, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Email İçeriği */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Test Email İçeriği:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Sipariş No:</strong> 1234</p>
              <p>• <strong>Müşteri:</strong> Test Müşteri</p>
              <p>• <strong>Telefon:</strong> +90 555 123 45 67</p>
              <p>• <strong>Email:</strong> test@example.com</p>
              <p>• <strong>Ürünler:</strong> Kırmızı Gül Çelenk + Beyaz Karanfil Çelenk</p>
              <p>• <strong>Toplam:</strong> ₺250.00</p>
              <p>• <strong>Adres:</strong> Test Mahallesi, Test Sokak No:1, İstanbul</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

