'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh(); // Refresh middleware/server state
            } else {
                const data = await res.json();
                setError(data.error || 'Giriş başarısız');
            }
        } catch (err) {
            setError('Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Admin Girişi</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Devam etmek için lütfen şifrenizi girin
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            type="password"
                            required
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
