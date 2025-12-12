import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Fetching products from Firebase...');
    
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to ISO strings for JSON serialization
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString()
      };
    });
    
    console.log('✅ Products fetched from Firebase:', products.length);

    // Decide caching strategy
    const url = new URL(request.url);
    const hasBypass = url.searchParams.has('t') || url.searchParams.get('noCache') === 'true';

    const response = NextResponse.json(products);
    if (hasBypass) {
      // Admin or explicit cache-bypass -> disable CDN/browser cache
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('CDN-Cache-Control', 'no-store');
      response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    } else {
      // Public caching for storefront - CDN cache, but shorter browser cache to avoid write failures
      // Vercel CDN will cache this, reducing Firebase calls
      // Shorter browser cache (5 min) to prevent ERR_CACHE_WRITE_FAILURE
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5 min browser, 10 min CDN
      response.headers.set('CDN-Cache-Control', 'max-age=600');
      response.headers.set('Vercel-CDN-Cache-Control', 'max-age=600');
    }

    return response;
  } catch (error) {
    console.error('❌ Error fetching products from Firebase:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return empty array if Firebase fails
    console.log('📦 Returning empty products array due to Firebase error');
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Creating new product...');
    
    const productData = await request.json();
    console.log('📝 Product data:', productData);
    
    // Validate required fields
    if (!productData.name || !productData.description || productData.price === undefined || productData.price === null) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, price',
        received: productData
      }, { status: 400 });
    }

    // Validate category - can be string or array
    let categoryValue = productData.category;
    if (!categoryValue) {
      console.log('❌ Validation failed - category is required');
      return NextResponse.json({ 
        error: 'Category is required',
        received: productData
      }, { status: 400 });
    }

    // Normalize category to array if it's a string
    if (typeof categoryValue === 'string') {
      categoryValue = [categoryValue];
    }

    // Validate category array
    if (Array.isArray(categoryValue) && categoryValue.length === 0) {
      console.log('❌ Validation failed - at least one category required');
      return NextResponse.json({ 
        error: 'At least one category is required',
        received: productData
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed');
    
    // Prepare product data for Firebase
    const firebaseProductData = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),
      category: categoryValue, // Normalized category (array)
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      images: Array.isArray(productData.images) ? productData.images.filter((img: string) => img && img.trim() !== '') : [],
      features: productData.features || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate images
    if (!firebaseProductData.images || firebaseProductData.images.length === 0) {
      console.log('❌ Validation failed - at least one image is required');
      return NextResponse.json({ 
        error: 'At least one image is required',
        received: productData
      }, { status: 400 });
    }
    
    // Try Firebase
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, firebaseProductData);
    
    console.log('✅ Product created in Firebase with ID:', docRef.id);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      product: { id: docRef.id, ...firebaseProductData },
      message: 'Product created successfully in Firebase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ 
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting product...');
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      console.log('❌ No product ID provided');
      return NextResponse.json({ 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    console.log('📝 Deleting product with ID:', productId);
    
    // Delete from Firebase
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    
    console.log('✅ Product deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully',
      productId: productId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}