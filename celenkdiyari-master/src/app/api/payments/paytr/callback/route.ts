import { NextRequest, NextResponse } from 'next/server';
import { getPayTRConfig, verifyPayTRCallback, PayTRCallbackData } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail, OrderEmailData } from '@/lib/email';

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
      failed_reason_code: formData.get('failed_reason_code') as string,
      failed_reason_msg: formData.get('failed_reason_msg') as string,
      test_mode: formData.get('test_mode') as string,
      payment_type: formData.get('payment_type') as string,
      currency: formData.get('currency') as string,
      payment_amount: parseFloat(formData.get('payment_amount') as string)
    };
    
    console.log('📝 PayTR callback data:', callbackData);
    
    const config = getPayTRConfig();
    console.log('🔧 PayTR config:', {
      merchantId: config.merchantId,
      merchantSalt: config.merchantSalt ? '***' : 'missing'
    });
    
    // Verify callback authenticity
    console.log('🔍 Verifying callback with config:', {
      merchantId: config.merchantId,
      merchantKey: config.merchantKey ? '***' : 'missing',
      merchantSalt: config.merchantSalt ? '***' : 'missing'
    });
    
    // Geçici olarak test modunda verification'ı atla
    const isValid = config.testMode ? true : verifyPayTRCallback(config, callbackData);
    console.log('🔍 Verification result:', isValid);
    
    if (!isValid) {
      console.log('❌ PayTR callback verification failed');
      return NextResponse.json({
        error: 'Invalid callback signature',
        received: callbackData
      }, { status: 400 });
    }
    
    console.log('✅ PayTR callback verified');
    
    // Find order by orderNumber field (not document ID)
    const ordersRef = collection(db, 'orders');
    const orderQuery = query(ordersRef, where('orderNumber', '==', callbackData.merchant_oid), limit(1));
    const orderSnapshot = await getDocs(orderQuery);
    
    if (orderSnapshot.empty) {
      console.log('❌ Order not found with orderNumber:', callbackData.merchant_oid);
      return new Response('OK', { status: 200 }); // Return OK to prevent PayTR retries
    }
    
    const orderDoc = orderSnapshot.docs[0];
    const orderRef = doc(db, 'orders', orderDoc.id);
    const orderData = orderDoc.data();
    
    let orderStatus = 'pending';
    let paymentStatus = 'pending';
    
    if (callbackData.status === 'success') {
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
    
    // Send confirmation email when payment is successful
    if (callbackData.status === 'success' && orderData) {
      try {
        console.log('📧 Sending order confirmation emails after successful payment...');
        
        // Determine customer info from order data
        const hasNewFormat = orderData.recipient && orderData.sender && orderData.delivery;
        const customerName = hasNewFormat 
          ? `${orderData.sender.firstName || ''} ${orderData.sender.lastName || ''}`.trim()
          : (orderData.customer?.name || 'Müşteri');
        const customerEmail = hasNewFormat 
          ? orderData.sender.email 
          : (orderData.customer?.email || orderData.email || '');
        const customerPhone = hasNewFormat 
          ? orderData.sender.phone 
          : (orderData.customer?.phone || orderData.phone || '');
        const deliveryAddress = hasNewFormat 
          ? orderData.delivery.deliveryAddress 
          : (orderData.customer?.address || orderData.deliveryAddress || 'Belirtilmemiş');
        
        const items = Array.isArray(orderData.items) ? orderData.items : [];
        const totalAmount = orderData.total || orderData.totalAmount || callbackData.payment_amount || 0;
        
        if (customerEmail) {
          const emailData: OrderEmailData = {
            orderId: orderData.orderNumber || callbackData.merchant_oid,
            customerName,
            customerEmail,
            customerPhone,
            totalAmount: totalAmount.toString(),
            items: items.map((item: any) => ({
              name: item.productName || item.name || 'Ürün',
              quantity: item.quantity || 1,
              price: item.price || 0
            })),
            deliveryAddress,
            orderDate: new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: 'Ödeme Onaylandı',
            invoice: orderData.invoice || null,
            paymentMethod: 'Kredi Kartı',
            paymentStatus: 'Ödendi',
            shippingCost: orderData.shippingCost || 0,
            subtotal: orderData.subtotal || items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
            recipientName: orderData.recipient?.name || customerName,
            recipientPhone: orderData.recipient?.phone || customerPhone,
            senderName: orderData.sender?.name || customerName,
            senderPhone: orderData.sender?.phone || customerPhone,
            orderNote: orderData.notes || orderData.orderNote || ''
          };
          
          // Admin'e bildirim emaili gönder
          const adminEmailResult = await sendAdminNotificationEmail(emailData);
          console.log('📧 Admin email result:', adminEmailResult);
          
          // Müşteriye email client-side'da gönderilecek (başarı sayfasında)
          console.log('📧 Customer email will be sent from client-side (payment success page)');
          
          console.log('✅ Admin email sent after payment success');
        } else {
          console.log('⚠️ Customer email not found, skipping email send');
        }
      } catch (emailError) {
        console.error('❌ Error sending confirmation emails after payment:', emailError);
        // Don't fail the callback if email fails
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
