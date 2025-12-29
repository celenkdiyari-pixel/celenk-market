import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/get-products';
import { blogPosts } from '@/lib/blog-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://celenkdiyari.com';

    // Static routes
    const routes = [
        '',
        '/products',
        '/contact',
        '/about',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Category routes
    const categorySlugs = ['acilistoren', 'cenaze', 'ferforje', 'fuarstand', 'ofisbitki', 'soznisan'];
    const categoryRoutes = categorySlugs.map((slug) => ({
        url: `${baseUrl}/categories/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    // Blog routes
    const blogRoutes = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Fetch products dynamically
    let products: any[] = [];
    try {
        products = await getProducts();
    } catch (e) {
        console.warn('Sitemap: Failed to fetch products', e);
    }

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // City routes
    const { cities } = await import('@/lib/cities');
    const cityRoutes = cities.map((city) => ({
        url: `${baseUrl}/sehirler/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...categoryRoutes, ...blogRoutes, ...productRoutes, ...cityRoutes];
}
