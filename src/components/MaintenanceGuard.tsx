'use client';

import { usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

interface MaintenanceGuardProps {
    settings: any;
    children: React.ReactNode;
}

export default function MaintenanceGuard({ settings, children }: MaintenanceGuardProps) {
    const pathname = usePathname();

    // Admin paneline her zaman erişim izni ver
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
        return <>{children}</>;
    }

    const maintenance = settings?.maintenance;

    if (!maintenance) {
        return <>{children}</>;
    }

    // Tarih kontrolü (Türkiye saati)
    const today = new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Europe/Istanbul'
    }).split('.').reverse().join('-'); // YYYY-MM-DD

    const isSpecialDay = maintenance.specialDays?.includes(today);
    const isMaintenanceActive = maintenance.isActive;

    if (isMaintenanceActive || isSpecialDay) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {isSpecialDay ? 'Özel Gün Nedeniyle Kapalıyız' : 'Bakım Çalışması'}
                    </h1>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        {maintenance.message || 'Sitemiz şu anda hizmet verememektedir. Anlayışınız için teşekkür ederiz.'}
                    </p>
                    <div className="text-sm text-gray-400">
                        Çelenk Diyarı
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
