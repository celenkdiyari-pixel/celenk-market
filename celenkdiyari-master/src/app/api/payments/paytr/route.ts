import { NextRequest, NextResponse } from 'next/server';
import { getPayTRConfig, createPayTRPayment, generatePayTRToken, PayTRPaymentRequest } from '@/lib/paytr';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// PayTR ödeme token oluşturma endpoint'i
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 payment attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`payment:${clientIP}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for payments from IP: ${clientIP}`);
      return NextResponse.json({
        success: false,
        error: rateLimitResult.message || 'Çok fazla ödeme denemesi yapıldı. Lütfen daha sonra tekrar deneyin.',
        rateLimit: {
          resetTime: rateLimitResult.resetTime,
          blocked: rateLimitResult.blocked
        },
        timestamp: new Date().toISOString()
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    }

    console.log('💳 Creating PayTR payment token...');
    
    const orderData = await request.json();
    console.log('📝 Order data for PayTR:', orderData);
    
    // Validate required fields - support both old and new format
    const hasOldFormat = orderData.customer && orderData.total;
    const hasNewFormat = orderData.recipient && orderData.sender && orderData.delivery && orderData.total;
    
    if (!hasOldFormat && !hasNewFormat) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: either (customer, total) or (recipient, sender, delivery, total)',
        received: orderData
      }, { status: 400 });
    }

    // Generate order number if not provided (PayTR alfanumerik olmalı)
    // Use orderNumber from request if provided, otherwise generate 4-digit order number
    let orderNumber = orderData.orderNumber;
    
    if (!orderNumber) {
      // Generate 4-digit order number (0001-9999)
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
      orderNumber = randomNum.toString();
    }
    
    const config = getPayTRConfig();
    
    // Check if PayTR is configured
    if (!config.merchantId || !config.merchantKey || !config.merchantSalt) {
      console.log('❌ PayTR not configured yet');
      return NextResponse.json({
        error: 'PayTR yapılandırması eksik. Lütfen environment variables kontrol edin.',
        message: 'PayTR configuration missing'
      }, { status: 503 });
    }
    
        // Prepare basket data - PayTR JSON format: [["Ürün Adı", "Birim Fiyat", Adet], ...]
        const userBasketArray = orderData.items.map((item: { productName: string; quantity: number; price: number }) => {
          // PayTR için Türkçe karakterleri İngilizce karakterlerle değiştir
          let productDescription = item.productName
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ü/g, 'u')
            .replace(/Ç/g, 'C')
            .replace(/Ğ/g, 'G')
            .replace(/İ/g, 'I')
            .replace(/Ö/g, 'O')
            .replace(/Ş/g, 'S')
            .replace(/Ü/g, 'U');
          
          // PayTR için açıklayıcı ürün adları kullan
          if (productDescription.length < 10 || productDescription.includes('fdsfsd')) {
            productDescription = `Celenk Diyari - ${productDescription}`;
          }
          
          // PayTR'nin beklediği format: [Ürün Adı, Birim Fiyat, Adet]
          return [productDescription, item.price.toString(), item.quantity];
        });
        
        const userBasketJson = JSON.stringify(userBasketArray);
        const userBasket = Buffer.from(userBasketJson).toString('base64');
    
    console.log('🛒 User Basket Array:', userBasketArray);
    console.log('🛒 User Basket JSON:', userBasketJson);
    console.log('🛒 User Basket (Base64):', userBasket);
    
    // Sipariş zaten checkout'ta kaydedilmiş olmalı, burada sadece güncelleme yapıyoruz
    // Order'ı orderNumber field'ına göre bul (document ID değil)
    const ordersRef = collection(db, 'orders');
    const orderQuery = query(ordersRef, where('orderNumber', '==', orderNumber), limit(1));
    const orderSnapshot = await getDocs(orderQuery);
    
    try {
      if (orderSnapshot.empty) {
        // Sipariş yoksa oluştur (checkout'ta kaydedilmemişse)
        const orderDataForFirebase = {
          orderNumber,
          ...orderData,
          paymentMethod: 'credit_card',
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const newOrderRef = doc(collection(db, 'orders'));
        await setDoc(newOrderRef, orderDataForFirebase);
        console.log('✅ Order created in database (fallback):', orderNumber);
      } else {
        // Sipariş zaten var, sadece güncelleme yap
        const orderDoc = orderSnapshot.docs[0];
        const orderRef = doc(db, 'orders', orderDoc.id);
        await updateDoc(orderRef, {
          paymentMethod: 'credit_card',
          paymentStatus: 'pending',
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Order updated in database:', orderNumber);
      }
    } catch (error) {
      console.error('❌ Error checking/creating order:', error);
      // Devam et, ödeme işlemi başlasın
    }

    // Determine customer info based on format
    let customerEmail, customerName, customerPhone, customerAddress;
    
    if (orderData.recipient && orderData.sender) {
      // New format
      customerEmail = orderData.sender.email;
      customerName = `${orderData.sender.firstName} ${orderData.sender.lastName}`;
      customerPhone = orderData.sender.phone;
      customerAddress = `${orderData.delivery.deliveryAddress}, ${orderData.delivery.district}, ${orderData.delivery.city}`;
    } else {
      // Old format
      customerEmail = orderData.customer.email;
      customerName = `${orderData.customer.firstName} ${orderData.customer.lastName}`;
      customerPhone = orderData.customer.phone;
      customerAddress = `${orderData.customer.address.street}, ${orderData.customer.address.district}, ${orderData.customer.address.city}`;
    }

    // Prepare payment request
    const paymentRequest: PayTRPaymentRequest = {
      merchant_id: config.merchantId,
      user_ip: clientIP,
      merchant_oid: orderNumber,
      email: customerEmail,
      payment_amount: Math.round(orderData.total * 100), // PayTR expects amount in kuruş
      paytr_token: '', // Will be generated
      user_basket: userBasket,
      debug_on: config.testMode ? 1 : 0,
      no_installment: 0,
      max_installment: 0,
      user_name: customerName,
      user_address: customerAddress,
      user_phone: customerPhone,
      merchant_ok_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-vercel-app.vercel.app'}/payment/success`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-vercel-app.vercel.app'}/payment/failed`,
      timeout_limit: 30,
      currency: 'TL',
      test_mode: config.testMode ? 1 : 0
    };
    
    // Generate PayTR token
    paymentRequest.paytr_token = generatePayTRToken(config, paymentRequest);
    
    console.log('✅ PayTR payment request prepared:', paymentRequest.merchant_oid);
    
        // Create PayTR payment
        console.log('🚀 Creating PayTR payment...');
        const paytrResponse = await createPayTRPayment(config, paymentRequest);

        console.log('📊 PayTR Response:', paytrResponse);

        if (paytrResponse.status === 'success') {
          console.log('✅ PayTR payment token created successfully');
          console.log('🔗 iFrame URL:', `https://www.paytr.com/odeme/guvenli/${paytrResponse.token}`);

          return NextResponse.json({
            success: true,
            token: paytrResponse.token,
            iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrResponse.token}`,
            orderNumber: orderNumber,
            message: 'PayTR payment token created successfully',
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('❌ PayTR payment creation failed:', paytrResponse.reason);
          console.log('❌ Full PayTR response:', paytrResponse);

          return NextResponse.json({
            error: 'PayTR payment creation failed',
            reason: paytrResponse.reason,
            details: paytrResponse,
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
