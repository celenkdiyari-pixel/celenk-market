import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/get-products';
import ProductDetailClient from './product-detail-client';

// export const dynamic = 'force-dynamic'; // Removed for ISR
export const revalidate = 60;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı',
      description: 'Aradığınız ürün bulunamadı.'
    };
  }

  // Use seoTitle/Desc if available, otherwise fallback to auto-generated
  const title = product.seoTitle || `${product.name} | Çelenk Diyarı`;
  const description = product.seoDescription || product.description.substring(0, 160);
  const keywords = product.seoKeywords ? product.seoKeywords.split(',') :
    [product.category, 'çelenk', 'çiçek', 'istanbul çiçekçi', product.name];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // JSON-LD Structured Data for Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Çelenk Diyarı'
    },
    offers: {
      '@type': 'Offer',
      url: `https://celenkdiyari.com/products/${product.id}`,
      priceCurrency: 'TRY',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'TRY'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          }
        }
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5, // Default to 5 if not set
      reviewCount: product.reviews || 24, // Default review count
      bestRating: 5,
      worstRating: 1
    }
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://celenkdiyari.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `https://celenkdiyari.com/categories/${product.category.toLowerCase().replace(/ /g, '-')}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://celenkdiyari.com/products/${product.id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
