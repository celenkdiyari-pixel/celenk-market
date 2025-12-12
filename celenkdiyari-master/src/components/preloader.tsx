'use client';

import { useState, useEffect } from 'react';
import { Leaf, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Minimum gösterim süresi (kullanıcı deneyimi için)
    const minDisplayTime = 1500;
    const startTime = Date.now();

    // Ürünlerin yüklenmesini kontrol et
    const checkProductsLoaded = async () => {
      try {
        // API'den ürünleri kontrol et - no-cache kullan (cache hatası önlemek için)
        const response = await fetch('/api/products', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Ürünler yüklendi, minimum süreyi bekle
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);

            setTimeout(() => {
              setIsLoading(false);
              // Fade out animasyonu
              setTimeout(() => {
                setIsVisible(false);
              }, 500);
            }, remainingTime);
            return;
          }
        }
      } catch (error) {
        // Hata durumunda da devam et - cache hatası önemli değil
        // Sadece development'ta log'la
        if (process.env.NODE_ENV === 'development') {
          console.error('Preloader: Ürün kontrolü hatası:', error);
        }
      }

      // Eğer ürünler yüklenmediyse, maksimum 3 saniye sonra kapat
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }, remainingTime);
    };

    // Sayfa yüklendiğinde kontrol et
    const handleLoad = () => {
      checkProductsLoaded();
    };

    // Sayfa zaten yüklendiyse hemen kontrol et
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Maksimum 3 saniye sonra zorla kapat (güvenlik için)
    const maxTimeout = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }, 3000);

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(maxTimeout);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <div className="relative w-32 h-32 animate-pulse">
          <Image
            src="/images/logo-removebg-preview.png"
            alt="Çelenk Diyarı"
            width={128}
            height={128}
            className="object-contain"
            priority
          />
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <Leaf className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 animate-pulse" />
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-dancing)' }}>
              Çelenk Diyarı
            </p>
            <p className="text-sm text-gray-600 animate-pulse">
              Ürünler yükleniyor...
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ animation: 'loading-progress 2s ease-in-out infinite' }}></div>
        </div>
      </div>
    </div>
  );
}

