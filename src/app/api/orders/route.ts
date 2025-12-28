import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc, updateDoc, where, deleteDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';

// Helper to determine which DB to use
async function getDbStrategy() {
  try {
    const adminDb = getAdminDb();
    // Test if admin DB is actually working
    if (!adminDb) {
      console.warn('⚠️ Admin DB returned null, falling back to client SDK');
      return { type: 'client' as const, db };
    }
    return { type: 'admin' as const, db: adminDb };
  } catch (e) {
    console.warn('⚠️ Admin DB initialization failed, using client SDK:', e instanceof Error ? e.message : 'Unknown error');
    return { type: 'client' as const, db };
  }
}

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

    const strategy = await getDbStrategy();
    let docId = '';

    if (strategy.type === 'admin') {
      const docRef = await strategy.db.collection('orders').add(order);
      docId = docRef.id;
    } else {
      const docRef = await addDoc(collection(strategy.db, 'orders'), order);
      docId = docRef.id;
    }

    console.log('✅ Order created successfully in Firebase with ID:', docId);

    // Send email notifications (async, don't wait for it)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'celenkdiyari@gmail.com';
      const customerEmail = orderData.customer?.email;
      const customerName = orderData.customer?.firstName && orderData.customer?.lastName
        ? `${orderData.customer.firstName} ${orderData.customer.lastName}`
        : orderData.customer?.name || 'Müşteri';
      const totalAmount = orderData.total || (orderData.subtotal || 0) + (orderData.shippingCost || 0);
      const deliveryTime = orderData.delivery_time || '';

      // Send email to customer
      if (customerEmail) {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            subject: `Siparişiniz Alındı - ${orderNumber}`,
            role: 'customer',
            templateParams: {
              // --- SIMPLIFIED TEMPLATE COMPATIBILITY ---
              // These keys match the simple templates provided by the user
              customer_name: customerName.trim(),
              customer_email: customerEmail || '',
              customer_phone: orderData.customer?.phone || '',
              order_number: orderNumber,
              order_date: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
              address: orderData.customer?.address ?
                (typeof orderData.customer.address === 'string'
                  ? orderData.customer.address
                  : `${orderData.customer.address.street || ''}, ${orderData.customer.address.district || ''}, ${orderData.customer.address.city || ''}`)
                : (orderData.recipient?.address || ''),
              notes: orderData.notes || '',
              items: orderData.items.map((item: { productName?: string; name?: string; quantity: number; price?: number }) => {
                const productName = item.productName || item.name || 'Ürün';
                return `${productName} x${item.quantity} - ${(item.price || 0).toFixed(2)} ₺`;
              }).join('\n'),
              subtotal: (orderData.subtotal || 0).toFixed(2),
              shipping_cost: (orderData.shippingCost || 0).toFixed(2),
              total: totalAmount.toFixed(2),
              payment_method: orderData.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : (orderData.paymentMethod || 'Belirtilmemiş'),

              // --- END SIMPLIFIED TEMPLATE COMPATIBILITY ---

              // Detailed fields (kept for potential future use or richer templates)
              order_status: 'Hazırlanıyor',
              tax_amount: `${(orderData.taxAmount || 0).toFixed(2)} ₺`,
              total_amount: `${totalAmount.toFixed(2)} ₺`,
              payment_status: 'Ödeme Bekleniyor',
              sender_name: orderData.sender?.name || customerName.trim(),
              sender_phone: orderData.sender?.phone || orderData.customer?.phone || '',
              recipient_name: orderData.recipient?.name || '',
              recipient_phone: orderData.recipient?.phone || '',
              // Using the mapped address from above for consistency
              delivery_address: orderData.customer?.address ?
                (typeof orderData.customer.address === 'string'
                  ? orderData.customer.address
                  : `${orderData.customer.address.street || ''}, ${orderData.customer.address.district || ''}, ${orderData.customer.address.city || ''}`)
                : (orderData.recipient?.address || ''),
              delivery_time: deliveryTime,
              delivery_date: orderData.delivery_date || '',
              delivery_location: orderData.delivery_place_type || 'Belirtilmemiş',
              wreath_text: orderData.wreath_text || '',
              additional_info: orderData.additional_info || orderData.notes || '',
              invoice: { needInvoice: orderData.billing?.type ? true : false },
              invoice_type: orderData.billing?.type === 'individual' ? 'Bireysel' : 'Kurumsal',
              invoice_company_name: orderData.billing?.companyName || '',
              invoice_tax_number: orderData.billing?.taxNumber || orderData.billing?.idNumber || '',
              invoice_tax_office: orderData.billing?.taxOffice || '',
              invoice_address: orderData.billing?.address || '',
              invoice_city: orderData.billing?.city || '',
              invoice_district: orderData.billing?.district || '',

              company_email: 'celenkdiyari@gmail.com',
              company_phone: '0532 137 81 60',
              company_website: 'www.celenkdiyari.com',
            }
          })
        }).catch(err => console.error('Failed to send customer email:', err));
      }

      // Send email to admin
      const adminPanelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin`;
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `Yeni Sipariş - ${orderNumber}`,
          role: 'admin',
          templateParams: {
            // --- SIMPLIFIED TEMPLATE COMPATIBILITY ---
            order_number: orderNumber,
            order_date: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
            customer_name: customerName.trim(),
            customer_email: customerEmail || '',
            customer_phone: orderData.customer?.phone || '',
            address: orderData.customer?.address ?
              (typeof orderData.customer.address === 'string'
                ? orderData.customer.address
                : `${orderData.customer.address.street || ''}, ${orderData.customer.address.district || ''}, ${orderData.customer.address.city || ''}`)
              : (orderData.recipient?.address || ''),
            notes: orderData.notes || '',
            items: orderData.items.map((item: { productName?: string; name?: string; quantity: number; price?: number }) => {
              const productName = item.productName || item.name || 'Ürün';
              return `${productName} x${item.quantity} - ${(item.price || 0).toFixed(2)} ₺`;
            }).join('\n'),
            subtotal: (orderData.subtotal || 0).toFixed(2),
            shipping_cost: (orderData.shippingCost || 0).toFixed(2),
            total: totalAmount.toFixed(2),
            payment_method: orderData.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : (orderData.paymentMethod || 'Belirtilmemiş'),
            // --- END SIMPLIFIED TEMPLATE COMPATIBILITY ---

            // Detailed fields
            order_status: 'Yeni Sipariş',
            shipping_cost_fmt: `${(orderData.shippingCost || 0).toFixed(2)} ₺`,
            tax_amount: `${(orderData.taxAmount || 0).toFixed(2)} ₺`,
            total_amount: `${totalAmount.toFixed(2)} ₺`,
            payment_status: 'Beklemede',
            sender_name: orderData.sender?.name || customerName.trim(),
            sender_phone: orderData.sender?.phone || orderData.customer?.phone || '',
            sender_email: orderData.sender?.email || customerEmail || '',
            recipient_name: orderData.recipient?.name || '',
            recipient_phone: orderData.recipient?.phone || '',
            delivery_address: orderData.customer?.address ?
              (typeof orderData.customer.address === 'string'
                ? orderData.customer.address
                : `${orderData.customer.address.street || ''}, ${orderData.customer.address.district || ''}, ${orderData.customer.address.city || ''}`)
              : (orderData.recipient?.address || ''),
            delivery_time: deliveryTime,
            delivery_date: orderData.delivery_date || '',
            delivery_location: orderData.delivery_place_type || 'Belirtilmemiş',
            wreath_text: orderData.wreath_text || '',
            additional_info: orderData.additional_info || orderData.notes || '',
            order_note: orderData.notes || '',

            // Invoice
            invoice: { needInvoice: orderData.billing?.type ? true : false },
            invoice_type: orderData.billing?.type === 'individual' ? 'Bireysel' : 'Kurumsal',
            invoice_company_name: orderData.billing?.companyName || '',
            invoice_tax_number: orderData.billing?.taxNumber || orderData.billing?.idNumber || '',
            invoice_tax_office: orderData.billing?.taxOffice || '',
            invoice_address: orderData.billing?.address || '',
            invoice_city: orderData.billing?.city || '',
            invoice_district: orderData.billing?.district || '',
            invoice_postal_code: '',

            admin_panel_url: adminPanelUrl,
            company_website: 'www.celenkdiyari.com',
            company_phone: '0532 137 81 60',
          }
        })
      }).catch(err => console.error('Failed to send admin email:', err));
    } catch (emailError) {
      console.error('Email sending error (non-blocking):', emailError);
    }

    return NextResponse.json({
      success: true,
      id: docId,
      orderNumber,
      order: { id: docId, ...order },
      message: 'Order created successfully in Firebase',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);

    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules or setup Admin SDK',
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

    const strategy = await getDbStrategy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orders: any[] = [];

    if (strategy.type === 'admin') {
      const collectionRef = strategy.db.collection('orders');

      if (orderNumber) {
        console.log('🔍 Searching order by orderNumber:', orderNumber);
        const snapshot = await collectionRef.where('orderNumber', '==', orderNumber).get();
        orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        const snapshot = await collectionRef.orderBy('createdAt', 'desc').limit(orderLimit).get();
        orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } else {
      const ordersRef = collection(strategy.db, 'orders');

      if (orderNumber) {
        console.log('🔍 Searching order by orderNumber:', orderNumber);
        const q = query(ordersRef, where('orderNumber', '==', orderNumber));
        const snapshot = await getDocs(q);
        orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        // Client SDK: Use limit only to avoid index requirement
        console.log('⚠️ Using client SDK without orderBy to avoid index requirement');
        const q = query(ordersRef, limit(orderLimit));
        const snapshot = await getDocs(q);
        // Sort in memory after fetching
        orders = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => {
            const aTime = new Date(a.createdAt || 0).getTime();
            const bTime = new Date(b.createdAt || 0).getTime();
            return bTime - aTime; // desc
          });
      }
    }

    console.log(`✅ Found ${orders.length} order(s)`);

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

    const strategy = await getDbStrategy();

    if (action === 'deleteBatch') {
      const ids = searchParams.get('ids')?.split(',') || [];
      if (ids.length === 0) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });

      console.log(`Processing batch delete for ${ids.length} orders...`);
      let deletedCount = 0;

      // Firestore "in" query limitation is 10
      for (let i = 0; i < ids.length; i += 10) {
        const chunk = ids.slice(i, i + 10).map(id => id.trim());

        if (strategy.type === 'admin') {
          const snapshot = await strategy.db.collection('orders').where('orderNumber', 'in', chunk).get();
          const batch = strategy.db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deletedCount += snapshot.size;
        } else {
          const ordersRef = collection(strategy.db, 'orders');
          const q = query(ordersRef, where('orderNumber', 'in', chunk));
          const snapshot = await getDocs(q);
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
          deletedCount += deletePromises.length;
        }
      }

      return NextResponse.json({ success: true, deletedCount, message: `Deleted ${deletedCount} orders` });
    }

    if (action === 'deleteAll') {
      console.log('⚠️ Bulk deleting all orders...');
      let deletedCount = 0;

      if (strategy.type === 'admin') {
        const snapshot = await strategy.db.collection('orders').get();
        if (snapshot.empty) return NextResponse.json({ message: 'No orders to delete' });

        const batch = strategy.db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        // Admin SDK commit might fail if >500 ops.
        // Simple batching for safety:
        const chunks = [];
        let currentBatch = strategy.db.batch();
        let count = 0;
        for (const doc of snapshot.docs) {
          currentBatch.delete(doc.ref);
          count++;
          if (count === 400) {
            chunks.push(currentBatch.commit());
            currentBatch = strategy.db.batch();
            count = 0;
          }
        }
        if (count > 0) chunks.push(currentBatch.commit());
        await Promise.all(chunks);

        deletedCount = snapshot.size;
      } else {
        const ordersRef = collection(strategy.db, 'orders');
        const snapshot = await getDocs(ordersRef);
        if (snapshot.empty) return NextResponse.json({ message: 'No orders to delete' });
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        deletedCount = snapshot.size;
      }

      console.log(`✅ Deleted ${deletedCount} orders`);

      return NextResponse.json({
        success: true,
        deletedCount,
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