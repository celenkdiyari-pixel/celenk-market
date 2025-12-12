import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.celenkdiyari.com';
  
  // Statik sayfalar
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories/açılış-tören`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/cenaze-çelenkleri`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/ferforjeler`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/fuar-stand`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/ofis-saksı-bitkileri`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/söz-nişan`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ];

  // Ürün sayfalarını çek - Direkt Firestore'dan sadece gerekli alanları çek
  let productPages: Array<{
    url: string;
    lastModified: string;
    changeFrequency: string;
    priority: number;
  }> = [];
  
  try {
    // Sitemap için sadece id ve updatedAt gerekli, bu yüzden direkt Firestore'dan çek
    const { collection, getDocs, query, limit } = await import('firebase/firestore');
    const firebaseModule = await import('@/lib/firebase');
    
    // db'yi güvenli bir şekilde al
    let db;
    try {
      db = firebaseModule.db;
      // db'nin geçerli olup olmadığını kontrol et
      if (!db || typeof db !== 'object') {
        throw new Error('Firebase db not available');
      }
    } catch (dbError) {
      // Build zamanında Firebase olmayabilir, sessizce devam et
      console.log('Firebase not initialized during build, skipping products in sitemap');
      db = null;
    }
    
    if (db) {
      const productsRef = collection(db, 'products');
      // Sadece id ve updatedAt alanlarını çek (performans için)
      const q = query(productsRef, limit(1000)); // Maksimum 1000 ürün
      const snapshot = await getDocs(q);
      
      productPages = snapshot.docs.map((doc) => {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString();
        return {
          url: `${baseUrl}/products/${encodeURIComponent(doc.id)}`,
          lastModified: updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        };
      });
    }
  } catch (error) {
    // Sessizce devam et - sadece statik sayfalar sitemap'e eklenecek
    // Build zamanında Firebase hatası normal
  }
  
  // Blog sayfalarını çek
  let blogPages: Array<{
    url: string;
    lastModified: string;
    changeFrequency: string;
    priority: number;
  }> = [];
  
  try {
    // Blog yazıları için direkt Firestore'dan sadece gerekli alanları çek
    const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore');
    const firebaseModule = await import('@/lib/firebase');
    
    // db'yi güvenli bir şekilde al
    let db;
    try {
      db = firebaseModule.db;
      // db'nin geçerli olup olmadığını kontrol et
      if (!db || typeof db !== 'object') {
        throw new Error('Firebase db not available');
      }
    } catch (dbError) {
      // Build zamanında Firebase olmayabilir, sessizce devam et
      console.log('Firebase not initialized during build, skipping blog posts in sitemap');
      db = null;
    }
    
    if (db) {
      const blogRef = collection(db, 'blog');
      const blogQuery = query(
        blogRef,
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const blogSnapshot = await getDocs(blogQuery);
      
      blogPages = blogSnapshot.docs.map((doc) => {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt;
        const publishedAt = data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt;
        return {
          url: `${baseUrl}/blog/${encodeURIComponent(data.slug || doc.id)}`,
          lastModified: updatedAt || publishedAt || new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.6,
        };
      });
    }
  } catch (error) {
    // Sessizce devam et - build zamanında Firebase hatası normal
  }

  const allPages = [...staticPages, ...productPages, ...blogPages];

  // XML sitemap oluştur
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
