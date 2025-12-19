import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/get-products';

// This acts as a dynamic sitemap generator
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URL from environment or default to localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://celenkdiyari.com';

    // Static routes
    const routes = [
        '',
        '/products',
        '/contact',
        '/about', // Assuming exists or will exist
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Fetch products dynamically
    const products = await getProducts();

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...productRoutes];
}
