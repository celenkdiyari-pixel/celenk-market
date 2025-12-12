import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

export function generateMetadata({
  title = 'Çelenk Diyarı - Doğanın En Güzel Hali',
  description = 'Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenkler. Profesyonel tasarım ve kaliteli hizmet garantisi.',
  keywords = ['çelenk', 'çelenk siparişi', 'cenaze çelenkleri', 'açılış çelenkleri'],
  image = '/images/logo.png',
  url = 'https://www.celenkdiyari.com',
  type = 'website'
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url,
      type: type === 'product' ? 'website' : type, // OpenGraph doesn't support 'product', use 'website'
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Çelenk Diyarı',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateStructuredData(type: 'product' | 'organization' | 'website', data?: any) {
  const baseUrl = 'https://www.celenkdiyari.com';
  
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Çelenk Diyarı',
        url: baseUrl,
        logo: `${baseUrl}/images/logo.png`,
        description: 'Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'TR',
          addressLocality: 'İstanbul'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+90-535-561-26-56',
          contactType: 'customer service',
          availableLanguage: 'Turkish'
        }
      };
    
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data?.name || 'Çelenk',
        description: data?.description || '',
        image: data?.images || [],
        brand: {
          '@type': 'Brand',
          name: 'Çelenk Diyarı'
        },
        offers: {
          '@type': 'Offer',
          price: data?.price || 0,
          priceCurrency: 'TRY',
          availability: data?.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };
    
    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Çelenk Diyarı',
        url: baseUrl,
        description: 'Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/products?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
    
    default:
      return null;
  }
}
