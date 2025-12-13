import { NextRequest, NextResponse } from 'next/server';
import { getPayTRConfig, createPayTRPayment, generatePayTRToken, PayTRPaymentRequest } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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

    // Optional but recommended: sender, recipient/delivery, invoice info
    const sender = orderData.sender || {};
    const recipient = orderData.recipient || orderData.customer || {};
    const deliveryAddress = orderData.deliveryAddress || orderData.customer?.address || {};
    const invoice = orderData.invoice || {};

    // PayTR merchant_oid must be alphanumeric only (no special characters)
    // Always generate a clean alphanumeric ID for PayTR, use originalOrderNumber for reference only
    const originalOrderNumber = orderData.orderNumber?.toString() || '';
    // Try to sanitize first, but if it becomes empty or too short, generate a new one
    const sanitizedOrderNumber = originalOrderNumber.replace(/[^a-zA-Z0-9]/g, '');
    // Generate a guaranteed alphanumeric merchant_oid for PayTR
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    const paytrOrderNumber = sanitizedOrderNumber && sanitizedOrderNumber.length >= 8
      ? sanitizedOrderNumber.slice(0, 64)
      : `ORD${timestamp}${randomPart}`;

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

    const shippingCost = typeof orderData.shippingCost === 'number' ? orderData.shippingCost : 0;

    // If there is a shipping cost, add it as a basket item to ensure totals match
    if (shippingCost > 0) {
      basketArray.push(['Kargo Ücreti', '1', shippingCost.toFixed(2)]);
    }

    const encodedBasket = Buffer.from(JSON.stringify(basketArray), 'utf-8').toString('base64');

    const safePhone = (orderData.customer.phone || '').replace(/\D+/g, '').slice(-15); // PayTR max 15

    // Recalculate strict total from the final basket array to ensure 100% match with PayTR requirements
    // PayTR requires payment_amount equal to sum(price * quantity) of user_basket
    const strictBasketTotal = basketArray.reduce((sum: number, item: string[]) => {
      const qty = parseInt(item[1], 10);
      const price = parseFloat(item[2]);
      return sum + (qty * price);
    }, 0);

    // PayTR amount (kuruş)
    const paymentAmountKurus = Math.round(strictBasketTotal * 100);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const safeOkUrl = `${baseUrl}/api/payments/paytr/callback?status=success`; // Client-side redirect isn't enough for OK/Fail URLs usually, but PayTR redirects browser here. 
    // Wait, merchant_ok_url is where the USER is redirected. 
    // In many PayTR flows, this page validates the POST result or just shows success.
    // For this app, let's keep it pointing to /payment/success client route, but ensure backend validation relies on the persistent session.
    // Actually, stick to the existing /payment/success flow if it works, but I will make sure the URL is absolute and correct.
    const merchantOkUrl = `${baseUrl}/payment/success`;
    const merchantFailUrl = `${baseUrl}/payment/failed`;

    // Prepare payment request
    if (paymentAmountKurus <= 0) {
      return NextResponse.json({
        error: 'payment_amount must be greater than 0',
        strictBasketTotal
      }, { status: 400 });
    }

    const safeEmail = orderData.customer.email || 'ornek@example.com';

    const paymentRequest: PayTRPaymentRequest = {
      merchant_id: config.merchantId,
      user_ip: clientIP,
      merchant_oid: paytrOrderNumber,
      email: safeEmail,
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
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      timeout_limit: 30,
      currency: 'TL',
      test_mode: config.testMode ? 1 : 0,
      // Optional but recommended fields
      lang: 'tr'
    };

    // Generate PayTR token
    paymentRequest.paytr_token = generatePayTRToken(config, paymentRequest);

    console.log('✅ PayTR payment request prepared:', paymentRequest.merchant_oid);

    // Persist a draft session so callback can create the order only after success
    try {
      await setDoc(doc(db, 'paytr_sessions', paytrOrderNumber), {
        orderNumber: paytrOrderNumber,
        originalOrderNumber,
        customer: orderData.customer,
        sender,
        recipient,
        deliveryAddress,
        invoice,
        items: orderData.items,
        subtotal: orderData.subtotal || 0,
        shippingCost,
        total: orderData.total || strictBasketTotal,
        notes: orderData.notes || '',
        paymentMethod: 'credit_card',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('❌ Failed to persist paytr session:', err);
      return NextResponse.json({
        error: 'Failed to persist payment session',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
    }

    // Create PayTR payment (will be active when credentials are ready)
    const paytrResponse = await createPayTRPayment(config, paymentRequest);

    if (paytrResponse.status === 'success') {
      console.log('✅ PayTR payment token created successfully');

      return NextResponse.json({
        success: true,
        token: paytrResponse.token,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrResponse.token}`,
        orderNumber: paytrOrderNumber,
        originalOrderNumber,
        message: 'PayTR payment token created successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ PayTR payment creation failed:', paytrResponse.reason, paytrResponse);

      return NextResponse.json({
        error: 'PayTR payment creation failed',
        reason: paytrResponse.reason,
        raw: paytrResponse,
        debug: {
          payment_amount: paymentRequest.payment_amount,
          strictBasketTotal,
          shippingCost,
          merchant_ok_url: paymentRequest.merchant_ok_url,
          merchant_fail_url: paymentRequest.merchant_fail_url,
          user_ip: paymentRequest.user_ip,
          test_mode: paymentRequest.test_mode,
          email: paymentRequest.email,
          phone: paymentRequest.user_phone,
          merchant_oid: paymentRequest.merchant_oid,
          originalOrderNumber,
          paytrOrderNumber,
        },
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
