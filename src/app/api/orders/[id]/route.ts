import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Updating order:', id);
    
    const orderData = await request.json();
    console.log('📝 Order data for update:', orderData);
    
    if (!id) {
      console.log('❌ No order ID provided for update');
      return NextResponse.json({
        error: 'Order ID is required for update'
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed for update');
    
    const orderRef = doc(db, 'orders', id);
    
    // Check if the document exists before updating
    const docSnap = await getDoc(orderRef);
    if (!docSnap.exists()) {
      console.log('❌ Order not found for update:', id);
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }
    
    // Get current order data to merge properly
    const currentData = docSnap.data();
    
    // Prepare update data - only update provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    // Only update fields that are provided
    if (orderData.status !== undefined) {
      updateData.status = orderData.status;
    }
    if (orderData.paymentStatus !== undefined) {
      updateData.paymentStatus = orderData.paymentStatus;
    }
    if (orderData.notes !== undefined) {
      updateData.notes = orderData.notes;
    }
    if (orderData.shippingMethod !== undefined) {
      updateData.shippingMethod = orderData.shippingMethod;
    }
    if (orderData.paymentMethod !== undefined) {
      updateData.paymentMethod = orderData.paymentMethod;
    }
    
    // Update customer info if provided
    if (orderData.customer) {
      updateData.customer = {
        ...currentData.customer,
        ...orderData.customer
      };
    }
    
    await updateDoc(orderRef, updateData);
    
    // Get updated document
    const updatedDoc = await getDoc(orderRef);
    const updatedOrder = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
    
    console.log('✅ Order updated successfully in Firebase with ID:', id);
    
    return NextResponse.json({
      success: true,
      id: id,
      order: updatedOrder,
      message: 'Order updated successfully in Firebase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating order:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    return NextResponse.json({
      error: 'Failed to update order',
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
    console.log('📦 Fetching order:', id);
    
    const orderRef = doc(db, 'orders', id);
    const docSnap = await getDoc(orderRef);
    
    if (!docSnap.exists()) {
      console.log('❌ Order not found:', id);
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }
    
    const order = {
      id: docSnap.id,
      ...docSnap.data()
    };
    
    console.log('✅ Order found:', id);
    
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
