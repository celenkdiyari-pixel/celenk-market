import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 Updating order status:', id);
    
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json({
        error: 'Status is required'
      }, { status: 400 });
    }
    
    const orderRef = doc(db, 'orders', id);
    
    // Check if order exists
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }
    
    // Update order status
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Order status updated:', id, 'to', status);
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      orderId: id,
      newStatus: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    
    return NextResponse.json({
      error: 'Failed to update order status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📦 Fetching order:', id);
    
    const orderRef = doc(db, 'orders', id);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }
    
    const order = {
      id: orderDoc.id,
      ...orderDoc.data()
    };
    
    console.log('✅ Order fetched:', id);
    
    return NextResponse.json({
      success: true,
      order,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch order',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting order:', id);
    
    const orderRef = doc(db, 'orders', id);
    
    // Check if order exists
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }
    
    // Delete order
    await deleteDoc(orderRef);
    
    console.log('✅ Order deleted:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      orderId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    
    return NextResponse.json({
      error: 'Failed to delete order',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}