import { NextRequest } from 'next/server';
import { getPayTRConfig, verifyPayTRCallback, PayTRCallbackData, PAYTR_STATUS } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';

// PayTR callback endpoint - ödeme sonucu bildirimi
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 PayTR callback received...');
    
    const formData = await request.formData();
    const callbackData: PayTRCallbackData = {
      merchant_oid: formData.get('merchant_oid') as string,
      status: formData.get('status') as string,
      total_amount: parseFloat(formData.get('total_amount') as string),
      hash: formData.get('hash') as string,
      failed_reason_code: formData.get('failed_reason_code') as string || undefined,
      failed_reason_msg: formData.get('failed_reason_msg') as string || undefined,
      test_mode: formData.get('test_mode') as string,
      payment_type: formData.get('payment_type') as string,
      currency: formData.get('currency') as string,
      payment_amount: parseFloat(formData.get('payment_amount') as string)
    };
    
    console.log('📝 PayTR callback data:', callbackData);
    
    const config = getPayTRConfig();
    
    // Verify callback authenticity
    if (!verifyPayTRCallback(config, callbackData)) {
      console.log('❌ PayTR callback verification failed');
      return new Response('FAIL', { status: 400 });
    }
    
    console.log('✅ PayTR callback verified');
    
    // Load draft session
    const draftRef = doc(db, 'paytr_sessions', callbackData.merchant_oid);
    const draftSnap = await getDoc(draftRef);

    let orderDocId: string | null = null;
    let orderData: Record<string, unknown> | null = null;

    if (draftSnap.exists()) {
      // Create order only on success; on fail we keep nothing
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
        orderDocId = created.id;
        orderData = newOrder;
      }
      // Draft consumed; remove to avoid duplicates
      await deleteDoc(draftRef);
    } else {
      // Fallback: try to find existing order by orderNumber
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('orderNumber', '==', callbackData.merchant_oid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('❌ Order not found and no draft:', callbackData.merchant_oid);
        return new Response('OK', { status: 200 });
      }
      
      const orderDoc = querySnapshot.docs[0];
      orderDocId = orderDoc.id;
      orderData = orderDoc.data() as Record<string, unknown>;
    }

    if (!orderDocId || !orderData) {
      console.error('❌ No order created or found for callback:', callbackData.merchant_oid);
      return new Response('OK', { status: 200 });
    }

    const orderRef = doc(db, 'orders', orderDocId);
    
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
    
    // Update order in database
    await updateDoc(orderRef, {
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
    });
    
    console.log('✅ Order updated in database:', callbackData.merchant_oid);
    
    // Send email notification if payment was successful
    const customerData = (orderData as Record<string, any>)?.customer || {};
    if (callbackData.status === PAYTR_STATUS.SUCCESS && customerData) {
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'celenkdiyari@gmail.com';
        const customerEmail = customerData.email || '';
        const customerName = customerData.firstName && customerData.lastName
          ? `${customerData.firstName} ${customerData.lastName}`
          : customerData.name || 'Müşteri';
        const totalAmount = (orderData as any).total || ((orderData as any).subtotal || 0) + ((orderData as any).shippingCost || 0);
        
        // Send confirmation email to customer
        if (customerEmail) {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: customerEmail,
              subject: `Ödemeniz Onaylandı - ${callbackData.merchant_oid}`,
              templateId: process.env.EMAILJS_TEMPLATE_CUSTOMER || 'template_customer',
              templateParams: {
                orderNumber: callbackData.merchant_oid,
                customerName: customerName.trim(),
                total: totalAmount.toFixed(2),
                items: (orderData.items || []).map((item: { productName?: string; name?: string; quantity: number }) => {
                  const productName = item.productName || item.name || 'Ürün';
                  return `${productName} x${item.quantity}`;
                }).join(', '),
                orderDate: new Date().toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                paymentStatus: 'Ödendi',
              }
            })
          }).catch(err => console.error('Failed to send payment confirmation email to customer:', err));
        }
        
        // Send notification email to admin about payment confirmation
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: adminEmail,
            subject: `Ödeme Onaylandı - ${callbackData.merchant_oid}`,
            templateId: process.env.EMAILJS_TEMPLATE_ADMIN || 'template_admin',
            templateParams: {
              orderNumber: callbackData.merchant_oid,
              customerName: customerName.trim(),
              customerEmail: customerEmail || '',
              customerPhone: orderData.customer?.phone || '',
              total: totalAmount.toFixed(2),
              items: (orderData.items || []).map((item: { productName?: string; name?: string; quantity: number; price: number }) => {
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
              paymentStatus: 'Ödendi',
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
