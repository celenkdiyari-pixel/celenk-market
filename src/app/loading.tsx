import React from 'react';
import Logo from '@/components/logo';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="relative animate-pulse">
                <div className="w-24 h-24 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Logo size="sm" showText={false} />
                </div>
            </div>
            <div className="mt-8 text-center">
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-bounce">
                    Yükleniyor...
                </h2>
                <p className="text-gray-500 text-sm mt-2">En taze çelenkleri hazırlıyoruz</p>
            </div>
        </div>
    );
}
