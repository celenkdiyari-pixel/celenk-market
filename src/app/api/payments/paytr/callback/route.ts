import { NextRequest, NextResponse } from 'next/server';
import { getPayTRConfig, verifyPayTRCallback, PayTRCallbackData, PAYTR_STATUS } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
    
    // Verify callback authenticity
    if (!verifyPayTRCallback(config, callbackData)) {
      console.log('❌ PayTR callback verification failed');
      return NextResponse.json({
        error: 'Invalid callback signature'
      }, { status: 400 });
    }
    
    console.log('✅ PayTR callback verified');
    
    // Find order by order number
    const orderRef = doc(db, 'orders', callbackData.merchant_oid);
    
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
    
    // Return success response to PayTR
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('❌ Error processing PayTR callback:', error);
    
    // Still return OK to PayTR to prevent retries
    return new Response('OK', { status: 200 });
  }
}
