'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TestCustomerEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestOrder = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-customer-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Test siparişi oluşturulamadı');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Müşteri Email Testi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Test Senaryosu:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Müşteri Email: <strong>yasinnabialtun@gmail.com</strong></li>
                <li>Herhangi bir ürün seçilecek</li>
                <li>Test siparişi oluşturulacak</li>
                <li>Müşteriye email gönderilecek (client-side)</li>
              </ul>
            </div>

            <Button
              onClick={createTestOrder}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Test Siparişi Oluşturuluyor...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Test Siparişi Oluştur
                </>
              )}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-5 w-5" />
                  <strong>Hata:</strong>
                </div>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <strong>Test Siparişi Oluşturuldu!</strong>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Sipariş No:</strong> {result.orderNumber}</p>
                    <p><strong>Sipariş ID:</strong> {result.orderId}</p>
                    <p><strong>Müşteri Email:</strong> {result.customerEmail}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>⚠️ Önemli:</strong>
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Müşteri email'i client-side'da gönderilecek. Başarı sayfasına giderek email gönderimini tetikleyin:
                  </p>
                  <Link
                    href={`/payment/success?merchant_oid=${result.orderNumber}&payment_method=bank_transfer`}
                    target="_blank"
                  >
                    <Button variant="outline" className="w-full">
                      Başarı Sayfasına Git (Email Gönderimi İçin)
                    </Button>
                  </Link>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Sipariş Detayları:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Ürünler:</strong> {result.orderData?.items?.map((item: any) => item.productName).join(', ') || 'N/A'}</p>
                    <p><strong>Toplam:</strong> ₺{result.orderData?.total?.toFixed(2) || '0.00'}</p>
                    <p><strong>Ödeme Yöntemi:</strong> {result.orderData?.paymentMethod || 'N/A'}</p>
                    <p><strong>Teslimat Adresi:</strong> {result.orderData?.delivery?.deliveryAddress || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Email Yapılandırması:</p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <p><strong>Service ID:</strong> {result.emailConfig?.serviceId ? '✅ Set' : '❌ Missing'}</p>
                    <p><strong>Template ID:</strong> {result.emailConfig?.templateId || 'N/A'}</p>
                    <p><strong>Public Key:</strong> {result.emailConfig?.hasPublicKey ? '✅ Set' : '❌ Missing'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

