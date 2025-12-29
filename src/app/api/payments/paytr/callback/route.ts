import { NextRequest } from 'next/server';
import { getPayTRConfig, verifyPayTRCallback, PayTRCallbackData, PAYTR_STATUS } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc, addDoc, doc as firestoreDoc, writeBatch } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';

// Helper to determine which DB to use
function getDbStrategy() {
  const adminDb = getAdminDb();
  if (adminDb) {
    return { type: 'admin' as const, db: adminDb };
  }
  return { type: 'client' as const, db };
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

    const strategy = getDbStrategy();
    let orderDocId: string | null = null;
    let orderData: Record<string, any> | null = null;

    if (strategy.type === 'admin') {
      const db = strategy.db;

      // TASK-04: Idempotency Check - Has this order already been processed?
      const existingOrderQuery = await db.collection('orders').where('paymentDetails.paytrTransactionId', '==', callbackData.merchant_oid).get();
      if (!existingOrderQuery.empty) {
        console.log('ℹ️ Order already processed (Idempotent):', callbackData.merchant_oid);
        return new Response('OK', { status: 200 });
      }

      // TASK-02: Atomic Transaction for Order Creation & Draft Deletion
      try {
        await db.runTransaction(async (transaction) => {
          const draftRef = db.collection('paytr_sessions').doc(callbackData.merchant_oid);
          const draftSnap = await transaction.get(draftRef);

          if (!draftSnap.exists) {
            throw new Error('Draft session not found');
          }

          const draft = draftSnap.data();

          if (callbackData.status === PAYTR_STATUS.SUCCESS) {
            const newOrder = {
              ...draft,
              status: 'confirmed',
              paymentStatus: 'paid',
              paymentDetails: {
                paytrTransactionId: callbackData.merchant_oid,
                paymentType: callbackData.payment_type,
                paymentAmount: parseFloat(callbackData.payment_amount || '0'),
                currency: callbackData.currency,
                testMode: callbackData.test_mode === '1',
                processedAt: new Date().toISOString()
              },
              updatedAt: new Date().toISOString()
            };

            const newOrderRef = db.collection('orders').doc(); // Auto ID
            transaction.set(newOrderRef, newOrder);
            orderDocId = newOrderRef.id;
            orderData = newOrder;
          }

          // Always delete draft on success/fail after processing
          transaction.delete(draftRef);
        });
      } catch (err) {
        console.error('❌ Transaction failed:', err);
        // If it's a critical error (not just 'draft not found'), we should probably let PayTR retry
        // Return 500 to trigger retry if session was missing but might be a delay
        return new Response('FAIL', { status: 500 });
      }
    } else {
      // Client SDK Logic (Using WriteBatch since multi-collection transactions are harder in client SDK)
      // Note: WriteBatch doesn't support 'get' inside it, so it's only pseudo-atomic.
      const draftRef = firestoreDoc(db, 'paytr_sessions', callbackData.merchant_oid);
      const draftSnap = await getDoc(draftRef);

      if (draftSnap.exists()) {
        const batch = writeBatch(db);
        const draft = draftSnap.data();

        if (callbackData.status === PAYTR_STATUS.SUCCESS) {
          const newOrderRef = firestoreDoc(collection(db, 'orders'));
          const newOrder = {
            ...draft,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentDetails: {
              paytrTransactionId: callbackData.merchant_oid,
              paymentType: callbackData.payment_type,
              paymentAmount: parseFloat(callbackData.payment_amount || '0'),
              currency: callbackData.currency,
              testMode: callbackData.test_mode === '1',
              processedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
          batch.set(newOrderRef, newOrder);
          orderDocId = newOrderRef.id;
          orderData = newOrder;
        }
        batch.delete(draftRef);
        await batch.commit();
      } else {
        // Idempotency: might have already been deleted/moved
        return new Response('OK', { status: 200 });
      }
    }

    if (callbackData.status !== PAYTR_STATUS.SUCCESS) {
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
        paymentAmount: parseFloat(callbackData.payment_amount || '0'),
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

        // TASK-09 & TASK-10: Use direct sendEmail call instead of internal fetch
        const emailPromises = [];
        // Send confirmation email to customer
        if (customerEmail) {
          emailPromises.push(
            sendEmail({
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
                delivery_address: (orderData as any).recipient?.address || customerData?.address || '',
                delivery_time: (orderData as any).delivery_time || (orderData as any).recipient?.deliveryTime || '',
                delivery_date: (orderData as any).delivery_date || (orderData as any).recipient?.deliveryDate || '',
                delivery_location: (orderData as any).delivery_place_type || (orderData as any).recipient?.deliveryPlaceType || 'Belirtilmemiş',

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
            }).then(res => {
              if (res.success) console.log('✅ Confirmation email sent to customer');
              else console.error('❌ Failed to send customer email:', res.error);
            })
          );
        }

        // Send notification email to admin about payment confirmation
        const adminPanelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin`;
        emailPromises.push(
          sendEmail({
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
              delivery_address: (orderData as any).recipient?.address || customerData?.address || '',
              delivery_time: (orderData as any).delivery_time || (orderData as any).recipient?.deliveryTime || '',
              delivery_date: (orderData as any).delivery_date || (orderData as any).recipient?.deliveryDate || '',
              delivery_location: (orderData as any).delivery_place_type || (orderData as any).recipient?.deliveryPlaceType || 'Belirtilmemiş',

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
          }).then(res => {
            if (res.success) console.log('✅ Admin notification email sent');
            else console.error('❌ Failed to send admin email:', res.error);
          })
        );

        // Wait for emails but don't block the PayTR 'OK' response unnecessarily if they take too long
        // But for reliability, we can wait a bit.
        await Promise.allSettled(emailPromises);
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
