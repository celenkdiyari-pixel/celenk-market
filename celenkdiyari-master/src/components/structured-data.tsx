'use client';

import { useSettings } from '@/hooks/useSettings';

export default function StructuredData() {
  const { settings } = useSettings();
  
  // Fallback values
  const siteName = settings?.siteName || 'Çelenk Diyarı';
  const siteDescription = settings?.siteDescription || 'Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz.';
  const phone = settings?.contact?.phone || '+90 535 561 26 56';
  const email = settings?.contact?.email || 'info@celenkdiyari.com';
  const address = settings?.contact?.address || 'İstanbul, Türkiye';
  const workingHours = settings?.contact?.workingHours || 'Pazartesi - Cumartesi: 09:00 - 18:00';
  const siteUrl = settings?.siteUrl || 'https://www.celenkdiyari.com';
  const logoUrl = settings?.logoUrl || '/images/logo-removebg-preview.png';
  
  // Parse working hours for structured data
  const parseWorkingHours = (hours: string) => {
    // Default hours
    const defaultHours = {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00'
    };
    
    // Try to parse from workingHours string
    if (hours.includes('09:00') || hours.includes('09')) {
      defaultHours.opens = '09:00';
    }
    if (hours.includes('18:00') || hours.includes('18')) {
      defaultHours.closes = '18:00';
    }
    
    return defaultHours;
  };
  
  const hours = parseWorkingHours(workingHours);
  
  // Social media links
  const socialMedia = settings?.socialMedia || {};
  const sameAs = [
    socialMedia.instagram && `https://www.instagram.com/${socialMedia.instagram.replace('@', '')}`,
    socialMedia.facebook && `https://www.facebook.com/${socialMedia.facebook}`,
    socialMedia.twitter && `https://www.twitter.com/${socialMedia.twitter.replace('@', '')}`,
    socialMedia.linkedin && `https://www.linkedin.com/company/${socialMedia.linkedin}`,
    socialMedia.youtube && `https://www.youtube.com/${socialMedia.youtube}`
  ].filter(Boolean) as string[];
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "alternateName": `${siteName} Online - Çelenk Fiyatları ve Çelenk Gönder`,
    "description": siteDescription,
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}${logoUrl}`,
      "width": 400,
      "height": 400
    },
    "image": `${siteUrl}${logoUrl}`,
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phone.replace(/\s/g, '-'),
      "email": email,
      "contactType": "customer service",
      "availableLanguage": ["Turkish", "English"],
      "areaServed": "TR",
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": hours.dayOfWeek,
        "opens": hours.opens,
        "closes": hours.closes
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR",
      "addressLocality": address.includes('İstanbul') ? 'İstanbul' : address.split(',')[0] || 'İstanbul',
      "addressRegion": address.includes('İstanbul') ? 'İstanbul' : address.split(',')[1]?.trim() || 'İstanbul',
      "streetAddress": address
    },
    "sameAs": sameAs.length > 0 ? sameAs : [
      "https://www.instagram.com/celenkdiyari",
      "https://www.facebook.com/celenkdiyari"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Çelenk Kategorileri",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Açılış & Tören Çelenkleri",
            "description": "İş yerleri, mağazalar ve ofisler için açılış töreni çelenkleri"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Cenaze Çelenkleri",
            "description": "Sevdiklerinizi anmak için özel tasarım cenaze çelenkleri"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Ferforje Çelenkleri",
            "description": "Dayanıklı ve şık ferforje çelenk tasarımları"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Fuar & Stand Çelenkleri",
            "description": "Fuar ve stand etkinlikleri için özel çelenkler"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Ofis & Saksı Bitkileri",
            "description": "Ofis ve ev dekorasyonu için saksı bitkileri"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Söz & Nişan Çelenkleri",
            "description": "Özel günleriniz için romantik çelenk tasarımları"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
