import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

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
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, price, category',
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
    
    // Update product in Firebase
    const updateData: any = {
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    // Update inStock based on quantity if quantity is provided
    if (productData.quantity !== undefined) {
      updateData.quantity = productData.quantity;
      updateData.inStock = productData.quantity > 0;
    }
    
    await updateDoc(productRef, updateData);
    
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
    console.log('📦 Fetching product:', id);
    
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      console.log('❌ Product not found');
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    const product = {
      id: productSnap.id,
      ...productSnap.data()
    };
    
    console.log('✅ Product fetched:', product);
    
    return NextResponse.json(product);
    
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}