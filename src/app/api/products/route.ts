import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('📦 Fetching products from Firebase...');
    
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Products fetched from Firebase:', products.length);
    console.log('📦 Products data:', products);
    
    return NextResponse.json(products);
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
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, price, category',
        received: productData
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed');
    
    // Try Firebase
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Product created in Firebase with ID:', docRef.id);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      product: { id: docRef.id, ...productData },
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