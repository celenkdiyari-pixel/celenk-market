import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Tek blog yazısını getir (ID veya slug ile)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // ID validation
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.log('❌ Invalid blog ID/slug');
      return NextResponse.json({
        success: false,
        error: 'Invalid blog ID/slug'
      }, { status: 400 });
    }
    
    // Decode ID/slug (Next.js params automatically decodes, but be safe)
    const decodedId = decodeURIComponent(id);
    console.log('📝 Fetching blog post:', decodedId);
    
    // Önce ID ile dene
    let blogRef = doc(db, 'blog', decodedId);
    let blogSnap = await getDoc(blogRef);
    
    // Eğer ID ile bulunamazsa slug ile ara
    if (!blogSnap.exists()) {
      console.log('📝 Blog post not found by ID, searching by slug:', decodedId);
      
      // Tüm blog yazılarını al ve slug ile filtrele
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const blogCollection = collection(db, 'blog');
      const slugQuery = query(blogCollection, where('slug', '==', decodedId));
      const slugSnapshot = await getDocs(slugQuery);
      
      if (!slugSnapshot.empty) {
        const foundDoc = slugSnapshot.docs[0];
        blogSnap = foundDoc as any;
        blogRef = doc(db, 'blog', foundDoc.id);
      }
    }
    
    if (!blogSnap.exists()) {
      console.log('❌ Blog post not found:', decodedId);
      return NextResponse.json({
        success: false,
        error: 'Blog post not found'
      }, { status: 404 });
    }
    
    const postData = blogSnap.data();
    
    // Validate post data
    if (!postData) {
      console.log('❌ Blog post data is empty');
      return NextResponse.json({
        success: false,
        error: 'Blog post data is empty'
      }, { status: 500 });
    }
    
    const post = {
      id: blogSnap.id,
      ...postData
    } as Record<string, unknown>;
    
    // İlgili yazıları bul (aynı kategoriden)
    let relatedPosts: any[] = [];
    if (post.category) {
      try {
        const { collection, getDocs, query, where, limit, orderBy } = await import('firebase/firestore');
        const blogCollection = collection(db, 'blog');
        const relatedQuery = query(
          blogCollection,
          where('category', '==', post.category),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(4)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        relatedPosts = relatedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((p: any) => p.id !== post.id)
          .slice(0, 3);
      } catch (error) {
        console.error('❌ Error loading related posts:', error);
      }
    }
    
    console.log('✅ Blog post found:', post.title);
    
    return NextResponse.json({
      success: true,
      post,
      relatedPosts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching blog post:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        success: false,
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blog post',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Blog yazısını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    console.log('📝 Updating blog post:', id);
    
    const blogRef = doc(db, 'blog', id);
    
    // Update data with timestamp
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(blogRef, updatedData);
    
    console.log('✅ Blog post updated:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating blog post:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update blog post',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Blog yazısını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Deleting blog post:', id);
    
    const blogRef = doc(db, 'blog', id);
    await deleteDoc(blogRef);
    
    console.log('✅ Blog post deleted:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting blog post:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete blog post',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
