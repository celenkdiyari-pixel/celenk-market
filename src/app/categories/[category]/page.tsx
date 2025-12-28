
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

// Enable Incremental Static Regeneration (ISR)
// Revalidate every 60 seconds (or whichever interval suits)
export const revalidate = 60;

// Generate static params for all known categories at build time
export function generateStaticParams() {
  return Object.keys(CATEGORY_INFO).map((slug) => ({
    category: slug,
  }));
}

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
  const initialProducts = await getProductsByCategory(currentCategory.categoryValue);

  return (
    <CategoryClient
      initialProducts={initialProducts}
      categorySlug={category}
    />
  );
}
