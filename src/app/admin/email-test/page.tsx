'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmailTestPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null);

    const testEmail = async (role: 'admin' | 'customer') => {
        setStatus('loading');
        setResult(null);
        try {
            const response = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: `Test Email (${role}) - ${new Date().toLocaleTimeString()}`,
                    role,
                    templateParams: {
                        customer_name: 'Test Test',
                        order_number: 'TEST-12345',
                        total_amount: '150.00'
                    }
                })
            });

            const data = await response.json();
            setResult(data);

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error: any) {
            setResult({ error: error.message });
            setStatus('error');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Email Sistem Testi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Test Mail Adresi</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@mail.com"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => testEmail('admin')}
                            disabled={!email || status === 'loading'}
                        >
                            Admin Şablonunu Test Et
                        </Button>
                        <Button
                            onClick={() => testEmail('customer')}
                            disabled={!email || status === 'loading'}
                            variant="outline"
                        >
                            Müşteri Şablonunu Test Et
                        </Button>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono whitespace-pre-wrap ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <strong>Sonuç:</strong>
                            {JSON.stringify(result, null, 2)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
