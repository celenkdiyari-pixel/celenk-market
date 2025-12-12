import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc 
} from 'firebase/firestore';

// Blog yazısı oluşturma
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new blog post...');
    
    const blogData = await request.json();
    
    // Gerekli alanları kontrol et
    if (!blogData.title || !blogData.content) {
      return NextResponse.json({
        error: 'Title and content are required'
      }, { status: 400 });
    }
    
    // Slug oluştur
    const slug = blogData.slug || blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Blog yazısı verilerini hazırla
    const blogPost = {
      ...blogData,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: blogData.status === 'published' ? new Date().toISOString() : null,
      status: blogData.status || 'draft',
      views: 0,
      likes: 0,
      comments: 0,
      featured: false,
      tags: blogData.tags || [],
      category: blogData.category || 'Genel',
      author: blogData.author || 'Admin',
      excerpt: blogData.excerpt || blogData.content.substring(0, 200) + '...',
      seoTitle: blogData.seoTitle || blogData.title,
      seoDescription: blogData.seoDescription || blogData.excerpt,
      readingTime: Math.ceil(blogData.content.split(' ').length / 200), // dakika cinsinden
      wordCount: blogData.content.split(' ').length
    };
    
    // Firestore'a kaydet
    const docRef = await addDoc(collection(db, 'blog'), blogPost);
    
    console.log('✅ Blog post created successfully:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      blogPost: { id: docRef.id, ...blogPost },
      message: 'Blog yazısı başarıyla oluşturuldu'
    });
    
  } catch (error) {
    console.error('❌ Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Blog yazısı oluşturulamadı' },
      { status: 500 }
    );
  }
}

// Blog yazıları listesi
export async function GET(request: NextRequest) {
  try {
    console.log('📚 Fetching blog posts...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category') || 'all';
    const limitCount = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || 'all';
    
    // Firestore query - Composite index sorununu önlemek için önce tüm yazıları al, sonra filtrele
    // Bu yaklaşım daha güvenilir ve composite index gerektirmez
    let q;
    try {
      // Önce tüm blog yazılarını al (limit artırıldı çünkü client-side filtreleme yapacağız)
      q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      let blogPosts: any[] = snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any> | undefined;
        return {
          id: doc.id,
          ...(data || {})
        };
      });
      
      // Status filtresi - client-side
      if (status !== 'all') {
        blogPosts = blogPosts.filter((post: any) => post.status === status);
      }
      
      // Limit uygula
      blogPosts = blogPosts.slice(0, limitCount);
      
      // Sıralama zaten orderBy ile yapıldı, ama emin olmak için tekrar sırala
      blogPosts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      // Kategori filtresi
      if (category !== 'all') {
        blogPosts = blogPosts.filter((post: any) => post.category === category);
      }
      
      // Öne çıkan filtresi
      if (featured === 'true') {
        blogPosts = blogPosts.filter((post: any) => post.featured === true);
      }
      
      // Arama filtresi
      if (search) {
        blogPosts = blogPosts.filter((post: any) => 
          post.title?.toLowerCase().includes(search.toLowerCase()) ||
          post.content?.toLowerCase().includes(search.toLowerCase()) ||
          post.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      // İstatistikleri hesapla (tüm yazılar üzerinden)
      const allPosts = snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any> | undefined;
        return { id: doc.id, ...(data || {}) };
      });
      
      const stats = {
        total: allPosts.length,
        published: allPosts.filter((p: any) => p.status === 'published').length,
        draft: allPosts.filter((p: any) => p.status === 'draft').length,
        featured: allPosts.filter((p: any) => p.featured).length,
        totalViews: allPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0),
        totalLikes: allPosts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0),
        categories: [...new Set(allPosts.map((p: any) => p.category).filter(Boolean))],
        tags: [...new Set(allPosts.flatMap((p: any) => p.tags || []))]
      };
      
      console.log(`✅ Found ${blogPosts.length} blog posts (filtered from ${allPosts.length} total)`);
      
      return NextResponse.json({
        success: true,
        blogPosts,
        stats,
        count: blogPosts.length
      });
      
    } catch (error) {
      console.error('❌ Error in Firestore query:', error);
      
      // Fallback: orderBy olmadan dene
      try {
        console.log('🔄 Trying fallback query without orderBy...');
        q = query(collection(db, 'blog'), limit(100));
        const snapshot = await getDocs(q);
        let blogPosts: any[] = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any> | undefined;
          return {
            id: doc.id,
            ...(data || {})
          };
        });
        
        // Status filtresi
        if (status !== 'all') {
          blogPosts = blogPosts.filter((post: any) => post.status === status);
        }
        
        // Client-side sıralama
        blogPosts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        // Limit
        blogPosts = blogPosts.slice(0, limitCount);
        
        // Diğer filtreler
        if (category !== 'all') {
          blogPosts = blogPosts.filter((post: any) => post.category === category);
        }
        if (featured === 'true') {
          blogPosts = blogPosts.filter((post: any) => post.featured === true);
        }
        if (search) {
          blogPosts = blogPosts.filter((post: any) => 
            post.title?.toLowerCase().includes(search.toLowerCase()) ||
            post.content?.toLowerCase().includes(search.toLowerCase()) ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
          );
        }
        
        console.log(`✅ Found ${blogPosts.length} blog posts (fallback method)`);
        
        return NextResponse.json({
          success: true,
          blogPosts,
          stats: {
            total: blogPosts.length,
            published: blogPosts.filter((p: any) => p.status === 'published').length,
            draft: blogPosts.filter((p: any) => p.status === 'draft').length,
            featured: blogPosts.filter((p: any) => p.featured).length,
            totalViews: blogPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0),
            totalLikes: blogPosts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0),
            categories: [...new Set(blogPosts.map((p: any) => p.category).filter(Boolean))],
            tags: [...new Set(blogPosts.flatMap((p: any) => p.tags || []))]
          },
          count: blogPosts.length
        });
      } catch (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError);
        return NextResponse.json(
          { 
            success: false,
            error: 'Blog yazıları alınamadı',
            details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
            blogPosts: [],
            stats: {
              total: 0,
              published: 0,
              draft: 0,
              featured: 0,
              totalViews: 0,
              totalLikes: 0,
              categories: [],
              tags: []
            },
            count: 0
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Blog yazıları alınamadı',
        details: error instanceof Error ? error.message : 'Unknown error',
        blogPosts: [],
        stats: {
          total: 0,
          published: 0,
          draft: 0,
          featured: 0,
          totalViews: 0,
          totalLikes: 0,
          categories: [],
          tags: []
        },
        count: 0
      },
      { status: 500 }
    );
  }
}

// Blog yazısı güncelleme
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating blog post...');
    
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        error: 'Blog post ID is required'
      }, { status: 400 });
    }
    
    const blogRef = doc(db, 'blog', id);
    const updateFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Eğer status published olarak değiştiriliyorsa publishedAt ekle
    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateFields.publishedAt = new Date().toISOString();
    }
    
    await updateDoc(blogRef, updateFields);
    
    console.log('✅ Blog post updated successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('❌ Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Blog yazısı güncellenemedi' },
      { status: 500 }
    );
  }
}

// Blog yazısı silme
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting blog post...');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'Blog post ID is required'
      }, { status: 400 });
    }
    
    const blogRef = doc(db, 'blog', id);
    await deleteDoc(blogRef);
    
    console.log('✅ Blog post deleted successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('❌ Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Blog yazısı silinemedi' },
      { status: 500 }
    );
  }
}