
import { getProductsByCategory } from '@/lib/get-products';
import { CATEGORY_INFO } from '@/lib/constants';
import CategoryClient from './CategoryClient';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

// Use dynamic rendering to avoid oversized ISR pages
// Use dynamic rendering to avoid oversized ISR pages
// export const dynamic = 'force-dynamic'; // Removed for ISR (Speed)
export const revalidate = 3600; // Cache for 1 hour to save resources

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const info = CATEGORY_INFO[category];

  if (!info) {
    return {
      title: 'Kategori Bulunamadı',
    };
  }

  return {
    title: `${info.title} - Çelenk Diyarı`,
    description: info.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const currentCategory = CATEGORY_INFO[category];

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              letterSpacing: 'normal'
            }}
          >
            Kategori Bulunamadı
          </h1>
          <p
            className="text-gray-600 mb-6"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              textRendering: 'optimizeLegibility',
              letterSpacing: 'normal'
            }}
          >
            Aradığınız kategori mevcut değil.
          </p>
          <Link href="/">
            <Button
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                letterSpacing: 'normal'
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch products on the server
  // This happens during SSR, so the user sees populated data immediately in HTML
  // Fix: Use the official Category Title (e.g. "Açılış & Tören") from constants, not the slug (e.g. "acilis-toren")
  // Because products are stored in DB with full titles.
  const initialProducts = await getProductsByCategory(currentCategory.title);

  // Breadcrumb JSON-LD
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
        name: currentCategory.title,
        item: `https://celenkdiyari.com/categories/${category}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryClient
        key={category}
        initialProducts={initialProducts}
        categorySlug={category}
      />
    </>
  );
}
