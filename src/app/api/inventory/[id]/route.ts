import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Updating inventory item:', id);
    
    const itemData = await request.json();
    console.log('📝 Inventory item data for update:', itemData);
    
    if (!id) {
      console.log('❌ No inventory item ID provided for update');
      return NextResponse.json({
        error: 'Inventory item ID is required for update'
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed for update');
    
    const itemRef = doc(db, 'inventory', id);
    
    // Check if the document exists before updating
    const docSnap = await getDoc(itemRef);
    if (!docSnap.exists()) {
      console.log('❌ Inventory item not found for update:', id);
      return NextResponse.json({
        error: 'Inventory item not found'
      }, { status: 404 });
    }
    
    await updateDoc(itemRef, {
      ...itemData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Inventory item updated successfully in Firebase with ID:', id);
    
    return NextResponse.json({
      success: true,
      id: id,
      item: { id: id, ...itemData },
      message: 'Inventory item updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating inventory item:', error);
    
    return NextResponse.json({
      error: 'Failed to update inventory item',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

