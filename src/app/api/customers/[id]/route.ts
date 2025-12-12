import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('👥 Fetching customer:', id);
    
    const customerRef = doc(db, 'customers', id);
    const docSnap = await getDoc(customerRef);
    
    if (!docSnap.exists()) {
      console.log('❌ Customer not found:', id);
      return NextResponse.json({
        error: 'Customer not found'
      }, { status: 404 });
    }
    
    const customer = {
      id: docSnap.id,
      ...docSnap.data()
    };
    
    console.log('✅ Customer found:', id);
    
    return NextResponse.json({
      success: true,
      customer,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch customer',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Updating customer:', id);
    
    const customerData = await request.json();
    console.log('📝 Customer data for update:', customerData);
    
    if (!id) {
      console.log('❌ No customer ID provided for update');
      return NextResponse.json({
        error: 'Customer ID is required for update'
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed for update');
    
    const customerRef = doc(db, 'customers', id);
    
    // Check if the document exists before updating
    const docSnap = await getDoc(customerRef);
    if (!docSnap.exists()) {
      console.log('❌ Customer not found for update:', id);
      return NextResponse.json({
        error: 'Customer not found'
      }, { status: 404 });
    }
    
    await updateDoc(customerRef, {
      ...customerData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Customer updated successfully in Firebase with ID:', id);
    
    return NextResponse.json({
      success: true,
      id: id,
      customer: { id: id, ...customerData },
      message: 'Customer updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    
    return NextResponse.json({
      error: 'Failed to update customer',
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
    console.log('🗑️ Deleting customer:', id);
    
    const customerRef = doc(db, 'customers', id);
    
    // Check if the document exists before deleting
    const docSnap = await getDoc(customerRef);
    if (!docSnap.exists()) {
      console.log('❌ Customer not found for deletion:', id);
      return NextResponse.json({
        error: 'Customer not found'
      }, { status: 404 });
    }
    
    await deleteDoc(customerRef);
    
    console.log('✅ Customer deleted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
      customerId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    
    return NextResponse.json({
      error: 'Failed to delete customer',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

