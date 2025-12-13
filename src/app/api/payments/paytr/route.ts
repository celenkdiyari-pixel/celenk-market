import { NextRequest, NextResponse } from 'next/server';
import { getPayTRConfig, createPayTRPayment, generatePayTRToken, PayTRPaymentRequest } from '@/lib/paytr';

// PayTR ödeme token oluşturma endpoint'i
export async function POST(request: NextRequest) {
  try {
    console.log('💳 Creating PayTR payment token...');
    
    const orderData = await request.json();
    console.log('📝 Order data for PayTR:', orderData);
    
    // Validate required fields
    if (!orderData.orderNumber || !orderData.customer || !orderData.total) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: orderNumber, customer, total',
        received: orderData
      }, { status: 400 });
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({
        error: 'Order items are required',
        received: orderData.items
      }, { status: 400 });
    }
    
    const config = getPayTRConfig();
    
    // Check if PayTR is configured
    if (!config.merchantId || !config.merchantKey || !config.merchantSalt) {
      console.log('❌ PayTR not configured yet');
      return NextResponse.json({
        error: 'PayTR henüz yapılandırılmamış. Evraklar hazır olduğunda aktif hale getirilecek.',
        message: 'PayTR configuration pending'
      }, { status: 503 });
    }
    
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    
    // Prepare basket data - PayTR format: "Product Name||Quantity||Price||Total"
    // PayTR basket format: base64(JSON.stringify([["Product", "1", "10.00"]]))
    const basketArray = (orderData.items || []).map((item: { productName?: string; name?: string; quantity: number; price: number }) => {
      const productName = (item.productName || item.name || 'Ürün').slice(0, 100);
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      return [productName, quantity.toString(), price.toFixed(2)];
    });
    const encodedBasket = Buffer.from(JSON.stringify(basketArray), 'utf-8').toString('base64');

    const safePhone = (orderData.customer.phone || '').replace(/\D+/g, '').slice(-15); // PayTR max 15

    // PayTR amount (kuruş) basket toplamı + kargo ile uyuşmalı
    const basketTotal = (orderData.items || []).reduce((sum: number, item: { quantity?: number; price?: number }) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      return sum + quantity * price;
    }, 0);
    const shippingCost = typeof orderData.shippingCost === 'number' ? orderData.shippingCost : 0;
    const computedTotal = basketTotal + shippingCost;
    const paymentAmountKurus = Math.round((orderData.total || computedTotal) * 100);
    
    // Prepare payment request
    const paymentRequest: PayTRPaymentRequest = {
      merchant_id: config.merchantId,
      user_ip: clientIP,
      merchant_oid: orderData.orderNumber,
      email: orderData.customer.email,
      payment_amount: paymentAmountKurus, // PayTR expects amount in kuruş
      paytr_token: '', // Will be generated
      user_basket: encodedBasket,
      debug_on: config.testMode ? 1 : 0,
      no_installment: 0,
      max_installment: 0,
      user_name: `${orderData.customer.firstName || ''} ${orderData.customer.lastName || ''}`.trim() || 'Musteri',
      user_address: orderData.customer.address
        ? typeof orderData.customer.address === 'string'
          ? orderData.customer.address
          : `${orderData.customer.address.street || ''}, ${orderData.customer.address.district || ''}, ${orderData.customer.address.city || ''}`.trim()
        : 'Adres belirtilmedi',
      user_phone: safePhone || '0000000000',
      merchant_ok_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/failed`,
      timeout_limit: 30,
      currency: 'TL',
      test_mode: config.testMode ? 1 : 0,
      // Optional but recommended fields
      lang: 'tr'
    };
    
    // Generate PayTR token
    paymentRequest.paytr_token = generatePayTRToken(config, paymentRequest);
    
    console.log('✅ PayTR payment request prepared:', paymentRequest.merchant_oid);
    
    // Create PayTR payment (will be active when credentials are ready)
    const paytrResponse = await createPayTRPayment(config, paymentRequest);
    
    if (paytrResponse.status === 'success') {
      console.log('✅ PayTR payment token created successfully');
      
      return NextResponse.json({
        success: true,
        token: paytrResponse.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrResponse.token}`,
        orderNumber: orderData.orderNumber,
        message: 'PayTR payment token created successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ PayTR payment creation failed:', paytrResponse.reason, paytrResponse);
      
      return NextResponse.json({
        error: 'PayTR payment creation failed',
        reason: paytrResponse.reason,
        raw: paytrResponse,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error creating PayTR payment:', error);
    
    return NextResponse.json({
      error: 'Failed to create PayTR payment',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
