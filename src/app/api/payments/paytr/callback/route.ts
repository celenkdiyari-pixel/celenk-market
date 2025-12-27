import { NextRequest } from 'next/server';
import { getPayTRConfig, verifyPayTRCallback, PayTRCallbackData, PAYTR_STATUS } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc, addDoc, doc as firestoreDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';

// Helper to determine which DB to use
async function getDbStrategy() {
  try {
    const adminDb = getAdminDb();
    return { type: 'admin' as const, db: adminDb };
  } catch (e) {
    return { type: 'client' as const, db };
  }
}

// PayTR callback endpoint - ödeme sonucu bildirimi
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 PayTR callback received...');

    const formData = await request.formData();
    const callbackData: PayTRCallbackData = {
      merchant_oid: formData.get('merchant_oid') as string,
      status: formData.get('status') as string,
      total_amount: formData.get('total_amount') as string,
      hash: formData.get('hash') as string,
      failed_reason_code: formData.get('failed_reason_code') as string || undefined,
      failed_reason_msg: formData.get('failed_reason_msg') as string || undefined,
      test_mode: formData.get('test_mode') as string,
      payment_type: formData.get('payment_type') as string,
      currency: formData.get('currency') as string,
      payment_amount: formData.get('payment_amount') as string
    };

    console.log('📝 PayTR callback data:', callbackData);

    const config = getPayTRConfig();

    // Verify callback authenticity
    if (!verifyPayTRCallback(config, callbackData)) {
      console.log('❌ PayTR callback verification failed');
      return new Response('FAIL', { status: 400 });
    }

    console.log('✅ PayTR callback verified');

    const strategy = await getDbStrategy();
    let orderDocId: string | null = null;
    let orderData: Record<string, unknown> | null = null;
    let createdRefId: string | null = null;

    if (strategy.type === 'admin') {
      // Admin SDK Logic
      const draftRef = strategy.db.collection('paytr_sessions').doc(callbackData.merchant_oid);
      const draftSnap = await draftRef.get();

      if (draftSnap.exists) {
        if (callbackData.status === PAYTR_STATUS.SUCCESS) {
          const draft = draftSnap.data();
          const newOrder = {
            ...draft,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentDetails: {
              paytrTransactionId: callbackData.merchant_oid,
              paymentType: callbackData.payment_type,
              paymentAmount: callbackData.payment_amount,
              currency: callbackData.currency,
              testMode: callbackData.test_mode === '1',
              processedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
          const created = await strategy.db.collection('orders').add(newOrder);
          createdRefId = created.id;
          orderDocId = created.id;
          orderData = newOrder;
        }
        await draftRef.delete();
      } else {
        // Fallback: search by orderNumber
        const ordersRef = strategy.db.collection('orders');
        const snapshot = await ordersRef.where('orderNumber', '==', callbackData.merchant_oid).get();
        if (snapshot.empty) {
          console.error('❌ Order not found and no draft:', callbackData.merchant_oid);
          return new Response('OK', { status: 200 });
        }
        const orderDoc = snapshot.docs[0];
        orderDocId = orderDoc.id;
        orderData = orderDoc.data();
      }
    } else {
      // Client SDK Logic
      const draftRef = firestoreDoc(db, 'paytr_sessions', callbackData.merchant_oid);
      const draftSnap = await getDoc(draftRef);

      if (draftSnap.exists()) {
        if (callbackData.status === PAYTR_STATUS.SUCCESS) {
          const draft = draftSnap.data();
          const ordersRef = collection(db, 'orders');
          const newOrder = {
            ...draft,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentDetails: {
              paytrTransactionId: callbackData.merchant_oid,
              paymentType: callbackData.payment_type,
              paymentAmount: callbackData.payment_amount,
              currency: callbackData.currency,
              testMode: callbackData.test_mode === '1',
              processedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
          const created = await addDoc(ordersRef, newOrder);
          createdRefId = created.id;
          orderDocId = created.id;
          orderData = newOrder;
        }
        await deleteDoc(draftRef);
      } else {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('orderNumber', '==', callbackData.merchant_oid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return new Response('OK', { status: 200 });
        }
        const orderDoc = querySnapshot.docs[0];
        orderDocId = orderDoc.id;
        orderData = orderDoc.data() as Record<string, unknown>;
      }
    }

    if (!orderDocId || !orderData) {
      console.error('❌ No order created or found for callback:', callbackData.merchant_oid);
      return new Response('OK', { status: 200 });
    }

    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    if (callbackData.status === PAYTR_STATUS.SUCCESS) {
      orderStatus = 'confirmed';
      paymentStatus = 'paid';
      console.log('✅ Payment successful for order:', callbackData.merchant_oid);
    } else {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
      console.log('❌ Payment failed for order:', callbackData.merchant_oid);
    }

    // Update order status
    const updatePayload = {
      status: orderStatus,
      paymentStatus: paymentStatus,
      paymentDetails: {
        paytrTransactionId: callbackData.merchant_oid,
        paymentType: callbackData.payment_type,
        paymentAmount: callbackData.payment_amount,
        currency: callbackData.currency,
        testMode: callbackData.test_mode === '1',
        failedReasonCode: callbackData.failed_reason_code,
        failedReasonMsg: callbackData.failed_reason_msg,
        processedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    if (strategy.type === 'admin') {
      await strategy.db.collection('orders').doc(orderDocId).update(updatePayload);
    } else {
      const orderRef = firestoreDoc(db, 'orders', orderDocId);
      await updateDoc(orderRef, updatePayload);
    }

    console.log('✅ Order updated in database:', callbackData.merchant_oid);

    // Send email logic (Client SDK fetch should work as it is external API call)
    // BUT we should verify env vars are passed to email API as well.
    // The email API call is internal (fetch to localhost).
    // ... Copy email logic ...

    // Send email notification if payment was successful
    const customerData = (orderData as Record<string, any>)?.customer || {};
    const itemsArr: Array<{ productName?: string; name?: string; quantity?: number; price?: number }> =
      Array.isArray((orderData as any)?.items) ? (orderData as any).items : [];

    if (callbackData.status === PAYTR_STATUS.SUCCESS && customerData) {
      // ... (Keep existing email logic) ...
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'celenkdiyari@gmail.com';
        const customerEmail = customerData.email || '';
        const customerName = customerData.firstName && customerData.lastName
          ? `${customerData.firstName} ${customerData.lastName}`
          : customerData.name || 'Müşteri';
        const totalAmount = (orderData as any).total || ((orderData as any).subtotal || 0) + ((orderData as any).shippingCost || 0);
        const deliveryTime = (orderData as any).delivery_time || '';

        // Send confirmation email to customer
        if (customerEmail) {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: customerEmail,
              subject: `Ödemeniz Onaylandı - ${callbackData.merchant_oid}`,
              role: 'customer',
              templateParams: {
                // Standard & Snake Case fields for Customer Template
                order_number: callbackData.merchant_oid,
                order_date: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
                order_status: 'Onaylandı',
                customer_name: customerName.trim(),
                customer_email: customerEmail || '',
                customer_phone: customerData.phone || '',

                // Items
                items_list: itemsArr.map((item) => {
                  const productName = item.productName || item.name || 'Ürün';
                  const price = item.price || 0;
                  const qty = item.quantity || 1;
                  return `${productName} x${qty} - ${price.toFixed(2)} ₺`;
                }).join('\n'),

                // Totals
                subtotal: `${((orderData as any).subtotal || 0).toFixed(2)} ₺`,
                shipping_cost: `${((orderData as any).shippingCost || 0).toFixed(2)} ₺`,
                tax_amount: `${((orderData as any).taxAmount || 0).toFixed(2)} ₺`,
                total_amount: `${totalAmount.toFixed(2)} ₺`,

                // Payment
                payment_method: 'Kredi Kartı / Banka Kartı',
                payment_status: 'Ödendi (Başarılı)',

                // Sender & Recipient
                sender_name: (orderData as any).sender?.name || customerName.trim(),
                sender_phone: (orderData as any).sender?.phone || customerData.phone || '',
                recipient_name: (orderData as any).recipient?.name || '',
                recipient_phone: (orderData as any).recipient?.phone || '',

                // Delivery
                delivery_address: customerData?.address ?
                  (typeof customerData.address === 'string'
                    ? customerData.address
                    : `${customerData.address.street || ''}, ${customerData.address.district || ''}, ${customerData.address.city || ''}`)
                  : ((orderData as any).recipient?.address || ''),
                delivery_time: deliveryTime,
                delivery_date: (orderData as any).delivery_date || '',

                // Additional
                wreath_text: (orderData as any).wreath_text || '',
                additional_info: (orderData as any).additional_info || (orderData as any).notes || '',

                // Company
                company_email: 'celenkdiyari@gmail.com',
                company_phone: '0532 137 81 60',
                company_website: 'www.celenkdiyari.com',

                // Backward compatibility
                orderNumber: callbackData.merchant_oid,
                customerName: customerName.trim(),
                total: totalAmount.toFixed(2)
              }
            })
          }).catch(err => console.error('Failed to send payment confirmation email to customer:', err));
        }

        // Send notification email to admin about payment confirmation
        const adminPanelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin`;
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: adminEmail,
            subject: `Ödeme Onaylandı - ${callbackData.merchant_oid}`,
            role: 'admin',
            templateParams: {
              // Standard & Snake Case fields for Admin Template
              order_number: callbackData.merchant_oid,
              order_date: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }),
              order_status: 'Ödendi',
              customer_name: customerName.trim(),
              customer_email: customerEmail || '',
              customer_phone: customerData.phone || '',

              // Items
              items_list: itemsArr.map((item) => {
                const productName = item.productName || item.name || 'Ürün';
                const price = item.price || 0;
                const qty = item.quantity || 1;
                return `${productName} x${qty} - ${price.toFixed(2)} ₺`;
              }).join('\n'),

              // Totals
              subtotal: `${((orderData as any).subtotal || 0).toFixed(2)} ₺`,
              shipping_cost: `${((orderData as any).shippingCost || 0).toFixed(2)} ₺`,
              tax_amount: `${((orderData as any).taxAmount || 0).toFixed(2)} ₺`,
              total_amount: `${totalAmount.toFixed(2)} ₺`,

              // Payment
              payment_method: 'Kredi Kartı / Banka Kartı',
              payment_status: 'Başarılı',

              // Sender & Recipient & Delivery
              sender_name: (orderData as any).sender?.name || customerName.trim(),
              sender_phone: (orderData as any).sender?.phone || customerData.phone || '',
              sender_email: (orderData as any).sender?.email || customerEmail || '',
              recipient_name: (orderData as any).recipient?.name || '',
              recipient_phone: (orderData as any).recipient?.phone || '',
              delivery_address: customerData?.address ?
                (typeof customerData.address === 'string'
                  ? customerData.address
                  : `${customerData.address.street || ''}, ${customerData.address.district || ''}, ${customerData.address.city || ''}`)
                : ((orderData as any).recipient?.address || ''),
              delivery_time: deliveryTime,
              delivery_date: (orderData as any).delivery_date || '',

              // Content
              wreath_text: (orderData as any).wreath_text || '',
              additional_info: (orderData as any).additional_info || (orderData as any).notes || '',
              order_note: (orderData as any).notes || '',

              // Admin Specific
              admin_panel_url: adminPanelUrl,
              company_website: 'www.celenkdiyari.com',

              // Backward compatibility
              orderNumber: callbackData.merchant_oid,
              customerName: customerName.trim(),
              total: totalAmount.toFixed(2)
            }
          })
        }).catch(err => console.error('Failed to send payment confirmation email to admin:', err));
      } catch (emailError) {
        console.error('Email sending error (non-blocking):', emailError);
      }
    }

    // Return success response to PayTR
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('❌ Error processing PayTR callback:', error);
    // Still return OK to PayTR to prevent retries
    return new Response('OK', { status: 200 });
  }
}
