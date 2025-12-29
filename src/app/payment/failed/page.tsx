'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, RefreshCw, ArrowLeft, Phone } from 'lucide-react';
import Link from 'next/link';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const merchantOid = searchParams.get('merchant_oid');
    const failedReason = searchParams.get('failed_reason_msg');

    if (merchantOid) {
      setOrderNumber(merchantOid);
    }
    if (failedReason) {
      setErrorMessage(failedReason);
    }
    // TASK-03: Clear stale session even on failure so user can start fresh
    localStorage.removeItem('paytr_active_session');
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarısız</h2>
          <p className="text-gray-600 mb-4">
            Ödemeniz işleme alınamadı. Lütfen tekrar deneyin.
          </p>

          {orderNumber && (
            <p className="text-sm text-gray-500 mb-2">
              Sipariş numaranız: <span className="font-bold text-gray-700">{orderNumber}</span>
            </p>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">
                <strong>Hata:</strong> {errorMessage}
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>Yardım için bizimle iletişime geçin</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => window.history.back()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
            <Link href="/cart">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sepete Dön
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
