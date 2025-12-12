import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test order for customer email...');
    
    // Test sipariş verileri
    const testOrderData = {
      orderNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      customer: {
        name: 'Test Müşteri',
        email: 'yasinnabialtun@gmail.com',
        phone: '+90 555 123 45 67'
      },
      sender: {
        firstName: 'Test',
        lastName: 'Müşteri',
        email: 'yasinnabialtun@gmail.com',
        phone: '+90 555 123 45 67',
        wreathText: 'Test çelenk yazısı',
        additionalInfo: 'Test ek bilgi'
      },
      recipient: {
        firstName: 'Alıcı',
        lastName: 'Test',
        phone: '+90 555 987 65 43'
      },
      delivery: {
        deliveryAddress: 'Test Mahallesi, Test Sokak No:1',
        city: 'İstanbul',
        district: 'Kadıköy',
        deliveryDate: '2024-12-25',
        deliveryTime: '14:00',
        deliveryLocation: 'Kapıda'
      },
      items: [],
      subtotal: 250,
      shippingCost: 0,
      total: 250,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Bir ürün al (test için)
    try {
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, limit(1));
      const productsSnapshot = await getDocs(productsQuery);
      
      if (!productsSnapshot.empty) {
        const productDoc = productsSnapshot.docs[0];
        const productData = productDoc.data();
        
        testOrderData.items = [{
          productId: productDoc.id,
          productName: productData.name || 'Test Ürün',
          quantity: 1,
          price: productData.price || 250,
          image: productData.images?.[0] || ''
        }];
        
        testOrderData.subtotal = productData.price || 250;
        testOrderData.total = (productData.price || 250) + testOrderData.shippingCost;
      } else {
        // Ürün yoksa varsayılan ürün ekle
        testOrderData.items = [{
          productId: 'test-product',
          productName: 'Kırmızı Gül Çelenk',
          quantity: 1,
          price: 250,
          image: ''
        }];
      }
    } catch (productError) {
      console.log('⚠️ Could not fetch product, using default:', productError);
      testOrderData.items = [{
        productId: 'test-product',
        productName: 'Kırmızı Gül Çelenk',
        quantity: 1,
        price: 250,
        image: ''
      }];
    }
    
    // Siparişi Firebase'e kaydet
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, testOrderData);
    
    console.log('✅ Test order created:', docRef.id, 'Order Number:', testOrderData.orderNumber);
    
    // EmailJS config'i al
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_CUSTOMER || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CUSTOMER || 'template_zel5ngx';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    
    if (!serviceId || !templateId || !publicKey) {
      return NextResponse.json({
        success: false,
        error: 'EmailJS configuration missing',
        details: {
          hasServiceId: !!serviceId,
          hasTemplateId: !!templateId,
          hasPublicKey: !!publicKey
        },
        orderNumber: testOrderData.orderNumber,
        orderId: docRef.id
      }, { status: 400 });
    }
    
    // Müşteri bilgileri
    const customerName = testOrderData.customer.name;
    const customerEmail = testOrderData.customer.email;
    const customerPhone = testOrderData.customer.phone;
    
    // Subtotal ve shipping hesapla
    const subtotal = testOrderData.subtotal;
    const shippingCost = testOrderData.shippingCost;
    const totalAmount = testOrderData.total;
    
    // Delivery address
    const fullDeliveryAddress = `${testOrderData.delivery.deliveryAddress}, ${testOrderData.delivery.city}, ${testOrderData.delivery.district}`;
    
    // Recipient ve sender bilgileri
    const recipientName = `${testOrderData.recipient.firstName} ${testOrderData.recipient.lastName}`;
    const recipientPhone = testOrderData.recipient.phone;
    const senderName = `${testOrderData.sender.firstName} ${testOrderData.sender.lastName}`;
    const senderPhone = testOrderData.sender.phone;
    
    // Order note parse
    const wreathText = testOrderData.sender.wreathText || '';
    const additionalInfo = testOrderData.sender.additionalInfo || '';
    const deliveryDate = testOrderData.delivery.deliveryDate || '';
    const deliveryTime = testOrderData.delivery.deliveryTime || '';
    const deliveryLocation = testOrderData.delivery.deliveryLocation || '';
    
    const templateParams: any = {
      to_email: customerEmail,
      to_name: customerName,
      from_name: 'Çelenk Diyarı',
      subject: `Sipariş Onayı - ${testOrderData.orderNumber}`,
      // Sipariş Bilgileri
      order_id: testOrderData.orderNumber,
      order_number: testOrderData.orderNumber,
      order_date: new Date(testOrderData.createdAt).toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      order_status: 'Sipariş Alındı',
      // Müşteri Bilgileri
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      // Gönderen/Alıcı Bilgileri
      sender_name: senderName,
      sender_phone: senderPhone,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      // Çelenk ve Ek Bilgiler
      wreath_text: wreathText,
      additional_info: additionalInfo,
      // Teslimat Detayları
      delivery_address: fullDeliveryAddress,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_location: deliveryLocation,
      // Ürünler
      items_list: testOrderData.items.map((item: any) => 
        `${item.productName} x${item.quantity} = ₺${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
      ).join('\n'),
      products: testOrderData.items.map((item: any) => item.productName).join(' + '),
      // Fiyat Bilgileri
      subtotal: `₺${subtotal.toFixed(2)}`,
      shipping_cost: `₺${shippingCost.toFixed(2)}`,
      total_amount: `₺${totalAmount.toFixed(2)}`,
      tax_amount: '₺0.00',
      // Ödeme Bilgileri
      payment_method: testOrderData.paymentMethod || 'Belirtilmemiş',
      payment_status: 'Beklemede',
      // Sipariş Notu
      order_note: `${wreathText ? `Çelenk Yazısı: ${wreathText}\n` : ''}${additionalInfo ? `Ek Bilgi: ${additionalInfo}\n` : ''}${deliveryDate ? `Teslimat Tarihi: ${deliveryDate}\n` : ''}${deliveryTime ? `Teslimat Saati: ${deliveryTime}\n` : ''}${deliveryLocation ? `Teslimat Konumu: ${deliveryLocation}\n` : ''}`,
      // Şirket Bilgileri
      company_name: 'Çelenk Diyarı',
      company_email: 'info@celenkdiyari.com',
      company_phone: '+90 532 137 81 60'
    };
    
    // EmailJS'i initialize et ve gönder (client-side benzeri, ama server-side'da çalışmayacak)
    // Bu endpoint sadece sipariş oluşturur, email client-side'da gönderilecek
    
    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      orderId: docRef.id,
      orderNumber: testOrderData.orderNumber,
      customerEmail: customerEmail,
      note: 'Order created. Customer email will be sent from payment success page (client-side).',
      orderData: {
        ...testOrderData,
        id: docRef.id
      },
      emailConfig: {
        serviceId,
        templateId,
        hasPublicKey: !!publicKey,
        note: 'Email will be sent client-side using @emailjs/browser'
      },
      nextStep: 'Visit /payment/success?merchant_oid=' + testOrderData.orderNumber + '&payment_method=bank_transfer to trigger customer email'
    });
    
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create test order',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

