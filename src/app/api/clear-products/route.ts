import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export async function DELETE() {
  try {
    console.log('🗑️ Clearing all products from Firebase...');
    
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 Found ${snapshot.docs.length} products to delete`);
    
    // Delete all products
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'products', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log('✅ All products cleared from Firebase');
    
    return NextResponse.json({
      success: true,
      message: 'All products cleared successfully',
      deletedCount: snapshot.docs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    
    return NextResponse.json({
      error: 'Failed to clear products',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
