import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/get-products';
import ProductDetailClient from './product-detail-client';

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

  return <ProductDetailClient product={product} />;
}
