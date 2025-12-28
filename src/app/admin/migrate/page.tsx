'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MigratePage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runMigration = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/admin/fix-payment-amounts', {
                method: 'POST',
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Amount Migration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Bu işlem, veritabanındaki tüm siparişlerde string olarak saklanan
                            paymentAmount değerlerini number'a dönüştürür.
                        </p>

                        <Button
                            onClick={runMigration}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Migration Çalışıyor...' : 'Migration Başlat'}
                        </Button>

                        {result && (
                            <div
                                className={`p-4 rounded-lg ${result.success
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                    }`}
                            >
                                <h3
                                    className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'
                                        }`}
                                >
                                    {result.success ? '✅ Başarılı' : '❌ Hata'}
                                </h3>
                                <p
                                    className={
                                        result.success ? 'text-green-700' : 'text-red-700'
                                    }
                                >
                                    {result.message || result.error}
                                </p>

                                {result.stats && (
                                    <div className="mt-4 space-y-1 text-sm text-gray-700">
                                        <p>Toplam Sipariş: {result.stats.total}</p>
                                        <p>Güncellenen: {result.stats.updated}</p>
                                        <p>Atlanan: {result.stats.skipped}</p>
                                    </div>
                                )}

                                <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
