'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const merchantOid = searchParams.get('merchant_oid');
    if (merchantOid) {
      setOrderNumber(merchantOid);
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
          <p className="text-gray-600 mb-4">
            Siparişiniz başarıyla alındı ve ödemeniz onaylandı.
          </p>
          {orderNumber && (
            <p className="text-sm text-gray-500 mb-6">
              Sipariş numaranız: <span className="font-bold text-green-600">{orderNumber}</span>
            </p>
          )}
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>Sipariş detayları e-posta adresinize gönderildi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>En kısa sürede sizinle iletişime geçeceğiz</span>
            </div>
          </div>

          <div className="space-y-2">
            {orderNumber && (
              <Link href={`/orders/${orderNumber}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Siparişimi Takip Et
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="w-full">
                Ana Sayfaya Dön
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full">
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
