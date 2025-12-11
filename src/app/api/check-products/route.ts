import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🔍 Checking products in Firebase...');
    
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📦 Found ${products.length} products in Firebase`);
    
    return NextResponse.json({
      success: true,
      count: products.length,
      products: products,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
    
    return NextResponse.json({
      error: 'Failed to check products',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
