import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Creating new order...');
    
    const orderData = await request.json();
    console.log('📝 Order data:', orderData);
    
    // Validate required fields
    if (!orderData.customer || !orderData.items || !orderData.items.length) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: customer, items',
        received: orderData
      }, { status: 400 });
    }
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const order = {
      ...orderData,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating order:', orderNumber);
    
    const docRef = await addDoc(collection(db, 'orders'), order);
    
    console.log('✅ Order created successfully in Firebase with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      orderNumber,
      order: { id: docRef.id, ...order },
      message: 'Order created successfully in Firebase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
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
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('📦 Fetching orders...');
    
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${orders.length} orders`);
    
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}