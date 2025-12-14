import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc, updateDoc, where, deleteDoc } from 'firebase/firestore';

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

    // Update product stock quantities
    try {
      for (const item of orderData.items) {
        if (item.productId) {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await getDoc(productRef);

          /* Stock update logic disabled by user request - Project now runs without stock management
                    if (productSnap.exists()) {
                      const productData = productSnap.data();
                      const currentQuantity = productData.quantity || 0;
                      const orderedQuantity = item.quantity || 1;
                      const newQuantity = Math.max(0, currentQuantity - orderedQuantity);
                      
                      await updateDoc(productRef, {
                        quantity: newQuantity,
                        inStock: newQuantity > 0,
                        updatedAt: new Date().toISOString()
                      });
                      
                      console.log(`✅ Stock updated for product ${item.productId}: ${currentQuantity} -> ${newQuantity}`);
                    }
          */
        }
      }
    } catch (stockError) {
      console.error('⚠️ Error updating stock (non-blocking):', stockError);
      // Don't fail the order if stock update fails
    }

    // Send email notifications (async, don't wait for it)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'celenkdiyari@gmail.com';
      const customerEmail = orderData.customer?.email || orderData.customer?.email;
      const customerName = orderData.customer?.firstName && orderData.customer?.lastName
        ? `${orderData.customer.firstName} ${orderData.customer.lastName}`
        : orderData.customer?.name || 'Müşteri';
      const totalAmount = orderData.total || (orderData.subtotal || 0) + (orderData.shippingCost || 0);

      // Send email to customer
      if (customerEmail) {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            subject: `Siparişiniz Alındı - ${orderNumber}`,
            templateId: process.env.EMAILJS_TEMPLATE_CUSTOMER || 'template_customer',
            templateParams: {
              orderNumber,
              customerName: customerName.trim(),
              total: totalAmount.toFixed(2),
              items: orderData.items.map((item: { productName?: string; name?: string; quantity: number }) => {
                const productName = item.productName || item.name || 'Ürün';
                return `${productName} x${item.quantity}`;
              }).join(', '),
              orderDate: new Date().toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              // New field: delivery_time (optional)
              delivery_time: orderData.delivery_time || '',
            }
          })
        }).catch(err => console.error('Failed to send customer email:', err));
      }

      // Send email to admin
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `Yeni Sipariş - ${orderNumber}`,
          templateId: process.env.EMAILJS_TEMPLATE_ADMIN || 'template_admin',
          templateParams: {
            orderNumber,
            customerName: customerName.trim(),
            customerEmail: customerEmail || '',
            customerPhone: orderData.customer?.phone || '',
            total: totalAmount.toFixed(2),
            items: orderData.items.map((item: { productName?: string; name?: string; quantity: number; price: number }) => {
              const productName = item.productName || item.name || 'Ürün';
              const itemPrice = item.price || 0;
              const itemTotal = itemPrice * (item.quantity || 1);
              return `${productName} x${item.quantity} - ${itemTotal.toFixed(2)} ₺`;
            }).join('\n'),
            orderDate: new Date().toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            address: orderData.customer?.address ?
              (typeof orderData.customer.address === 'string'
                ? orderData.customer.address
                : `${orderData.customer.address.street || ''}, ${orderData.customer.address.district || ''}, ${orderData.customer.address.city || ''}`)
              : '',
          }
        })
      }).catch(err => console.error('Failed to send admin email:', err));
    } catch (emailError) {
      console.error('Email sending error (non-blocking):', emailError);
    }

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

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Fetching orders...');

    // Check query parameters
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const limitParam = searchParams.get('limit');
    const orderLimit = limitParam ? parseInt(limitParam, 10) : 100;

    if (orderNumber) {
      // Search by orderNumber
      console.log('🔍 Searching order by orderNumber:', orderNumber);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('orderNumber', '==', orderNumber));
      const querySnapshot = await getDocs(q);

      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Found ${orders.length} order(s) with orderNumber: ${orderNumber}`);

      return NextResponse.json({
        success: true,
        orders,
        count: orders.length,
        timestamp: new Date().toISOString()
      });
    }

    // Get all orders with optional limit
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(orderLimit)
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
// Bulk delete handler
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'deleteBatch') {
      const ids = searchParams.get('ids')?.split(',') || [];
      if (ids.length === 0) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });

      console.log(`Processing batch delete for ${ids.length} orders...`);

      const ordersRef = collection(db, 'orders');
      let deletedCount = 0;

      // Firestore "in" query limitation is 10
      for (let i = 0; i < ids.length; i += 10) {
        const chunk = ids.slice(i, i + 10);
        // Clean whitespace
        const cleanChunk = chunk.map(id => id.trim());

        const q = query(ordersRef, where('orderNumber', 'in', cleanChunk));
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        deletedCount += deletePromises.length;
      }

      return NextResponse.json({ success: true, deletedCount, message: `Deleted ${deletedCount} orders` });
    }

    if (action === 'deleteAll') {
      console.log('⚠️ Bulk deleting all orders...');

      // Get all orders first
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);

      if (snapshot.empty) {
        return NextResponse.json({ message: 'No orders to delete' });
      }

      // Delete in parallel (be careful with rate limits if thousands, but for test data < 100 it's fine)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log(`✅ Deleted ${snapshot.size} orders`);

      return NextResponse.json({
        success: true,
        deletedCount: snapshot.size,
        message: 'All orders deleted successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error deleting orders:', error);
    return NextResponse.json({
      error: 'Failed to delete orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}