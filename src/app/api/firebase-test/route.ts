import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test reading from Firebase
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Firebase test successful - Products count:', products.length);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase connection successful',
      productsCount: products.length,
      products: products.slice(0, 3), // Show first 3 products
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🧪 Testing Firebase write...');
    
    // Test writing to Firebase
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      name: 'Firebase Test Product',
      description: 'This is a test product to verify Firebase write functionality',
      price: 99,
      category: 'Test',
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Firebase write test successful - ID:', docRef.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase write test successful',
      testProductId: docRef.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Firebase write test failed:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules - allow read/write to products collection',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}