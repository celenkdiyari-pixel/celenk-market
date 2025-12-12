import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Updating product:', id);
    
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
    
    // Check if product exists
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      console.log('❌ Product not found');
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Prepare product data for Firebase
    const firebaseProductData = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: parseFloat(productData.price),
      category: categoryValue, // Normalized category (array)
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      images: Array.isArray(productData.images) ? productData.images.filter((img: string) => img && img.trim() !== '') : [],
      features: productData.features || '',
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
    
    // Update product in Firebase
    await updateDoc(productRef, firebaseProductData);
    
    console.log('✅ Product updated in Firebase');
    
    return NextResponse.json({ 
      success: true, 
      id: id,
      product: { id: id, ...productData },
      message: 'Product updated successfully in Firebase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating product:', error);
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
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // ID validation
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.log('❌ Invalid product ID');
      return NextResponse.json({ 
        error: 'Invalid product ID' 
      }, { status: 400 });
    }
    
    // Decode ID (Next.js params automatically decodes, but be safe)
    const decodedId = decodeURIComponent(id);
    console.log('📦 Fetching product:', decodedId);
    
    const productRef = doc(db, 'products', decodedId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      console.log('❌ Product not found:', decodedId);
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    const productData = productSnap.data();
    
    // Validate product data
    if (!productData) {
      console.log('❌ Product data is empty');
      return NextResponse.json({ 
        error: 'Product data is empty' 
      }, { status: 500 });
    }
    
    // Convert Firestore Timestamps to ISO strings for JSON serialization
    const product = {
      id: productSnap.id,
      ...productData,
      createdAt: productData.createdAt?.toDate?.()?.toISOString() || productData.createdAt || new Date().toISOString(),
      updatedAt: productData.updatedAt?.toDate?.()?.toISOString() || productData.updatedAt || new Date().toISOString()
    };
    
    console.log('✅ Product fetched:', product.id);
    
    const response = NextResponse.json(product);
    
    // Cache headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.headers.set('CDN-Cache-Control', 'max-age=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'max-age=300');
    
    return response;
    
  } catch (error) {
    console.error('❌ Error fetching product:', error);
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
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting product:', id);
    
    // Check if product exists
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      console.log('❌ Product not found');
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Delete product from Firebase
    await deleteDoc(productRef);
    
    console.log('✅ Product deleted from Firebase');
    
    return NextResponse.json({ 
      success: true, 
      id: id,
      message: 'Product deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
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
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}