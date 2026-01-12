import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h2>
            <p className="text-gray-600 mb-8">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <Link href="/">
                <Button className="bg-green-600 hover:bg-green-700">
                    Ana Sayfaya Dön
                </Button>
            </Link>
        </div>
    );
}
