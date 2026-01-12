'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

// Google Ads Conversion ID'nizi buraya girin (Örn: AW-123456789)
const GA_ADS_ID = 'G-GZL5ZYDZJ3';

export default function GoogleAds() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            // Sayfa her değiştiğinde page_view gönderimi (isteğe bağlı, gtm ile otomatik de olabilir)
            // window.gtag('event', 'page_view', {
            //   page_path: pathname,
            // });
        }
    }, [pathname, searchParams]);

    return (
        <>
            <Script
                id="google-ads-init"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
            />
            <Script id="google-ads-config" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ADS_ID}', {
            allow_enhanced_conversions: true
          });
        `}
            </Script>
        </>
    );
}
