import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc, updateDoc, where } from 'firebase/firestore';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail, OrderEmailData } from '@/lib/email';
import { sendWhatsAppMessage, WhatsAppOrderData } from '@/lib/whatsapp';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { SiteSettings } from '@/types/settings';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 10 orders per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`order:${clientIP}`, {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for orders from IP: ${clientIP}`);
      return NextResponse.json({
        success: false,
        error: rateLimitResult.message || 'Çok fazla sipariş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.',
        rateLimit: {
          resetTime: rateLimitResult.resetTime,
          blocked: rateLimitResult.blocked
        },
        timestamp: new Date().toISOString()
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    }

    console.log('🛒 Creating new order...');
    
    const orderData = await request.json();
    console.log('📝 Order data:', orderData);
    
    // Check if orders are blocked on special days
    // If deliveryDate is in the future, only check if that specific date is blocked
    // If deliveryDate is today or not provided, check if today is blocked
    const settingsRef = doc(db, 'settings', 'site-settings');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const settings = settingsSnap.data() as SiteSettings;
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      
      // Get delivery date from order data
      const deliveryDateStr = orderData.delivery?.deliveryDate;
      let dateToCheck = now;
      
      if (deliveryDateStr) {
        try {
          const deliveryDate = new Date(deliveryDateStr);
          deliveryDate.setHours(0, 0, 0, 0);
          
          // If delivery date is in the future, check that date
          // If delivery date is today or past, check today
          if (deliveryDate > now) {
            dateToCheck = deliveryDate;
            console.log('📅 Future delivery date selected:', deliveryDateStr, '- checking if that date is blocked');
          } else {
            dateToCheck = now;
            console.log('📅 Delivery date is today or past, checking if today is blocked');
          }
        } catch (error) {
          console.error('Error parsing delivery date:', error);
          // If delivery date parsing fails, check today
        }
      }
      
      if (settings.orderBlockedDays && Array.isArray(settings.orderBlockedDays) && settings.orderBlockedDays.length > 0) {
        const activeBlockedDay = settings.orderBlockedDays.find(day => {
          if (!day || !day.isActive) return false;
          if (!day.startDate || !day.endDate) return false;
          
          try {
            const startDate = new Date(day.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(day.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            
            // Check if the date we're checking falls within the blocked period
            return dateToCheck >= startDate && dateToCheck <= endDate;
          } catch (error) {
            console.error('Error parsing blocked day dates:', error);
            return false;
          }
        });
        
        if (activeBlockedDay) {
          // If checking a future date (delivery date is in the future), allow the order
          // This allows customers to place orders for future dates even if today is blocked
          if (dateToCheck > now) {
            console.log('✅ Future delivery date is on a blocked day, but allowing order:', activeBlockedDay.name);
            console.log('📅 Delivery date:', deliveryDateStr, 'is in the future, order allowed');
            // Allow future orders - customer can place orders for future dates
            // even if the delivery date falls on a blocked day
          } else {
            // Delivery date is today or past, and today is blocked - block the order
            console.log('🚫 Order blocked - today is a special day:', activeBlockedDay.name);
            return NextResponse.json({
              success: false,
              error: activeBlockedDay.message || 'Bu özel günde sipariş alımı kapalıdır. İleri tarihli sipariş verebilirsiniz.',
              blockedDay: {
                name: activeBlockedDay.name,
                startDate: activeBlockedDay.startDate,
                endDate: activeBlockedDay.endDate
              },
              timestamp: new Date().toISOString()
            }, { status: 403 });
          }
        }
      }
    }
    console.log('📝 Order data:', orderData);
    
    // Validate required fields - support both old and new format
    const hasOldFormat = orderData.customer && orderData.items;
    const hasNewFormat = orderData.recipient && orderData.sender && orderData.delivery && orderData.items;
    
    if (!hasOldFormat && !hasNewFormat) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: either (customer, items) or (recipient, sender, delivery, items)',
        received: orderData
      }, { status: 400 });
    }
    
    // Use orderNumber from request if provided, otherwise generate 4-digit order number
    let orderNumber = orderData.orderNumber;
    
    if (!orderNumber) {
      // Generate 4-digit order number (0001-9999)
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 100) {
        // Generate random 4-digit number
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
        orderNumber = randomNum.toString();
        
        // Check if order number already exists
        const ordersRef = collection(db, 'orders');
        const orderQuery = query(ordersRef, where('orderNumber', '==', orderNumber), limit(1));
        const orderSnapshot = await getDocs(orderQuery);
        
        if (orderSnapshot.empty) {
          isUnique = true;
        }
        
        attempts++;
      }
      
      // Fallback: use timestamp-based if all attempts failed
      if (!isUnique) {
        const timestamp = Date.now();
        orderNumber = (timestamp % 9000 + 1000).toString(); // Last 4 digits of timestamp, ensure 4 digits
      }
    }
    
    // Determine customer info based on format (for both email and WhatsApp)
    let customerName, customerEmail, customerPhone, deliveryAddress;
    
    // Create or update customer automatically
    try {
      if (hasNewFormat) {
        customerName = `${orderData.sender.firstName} ${orderData.sender.lastName}`;
        customerEmail = orderData.sender.email;
        customerPhone = orderData.sender.phone;
        deliveryAddress = orderData.delivery.deliveryAddress || 'Belirtilmemiş';
      } else {
        customerName = orderData.customer.name;
        customerEmail = orderData.customer.email;
        customerPhone = orderData.customer.phone;
        deliveryAddress = orderData.deliveryAddress || 'Belirtilmemiş';
      }
      
      // Check if customer exists
      const customersRef = collection(db, 'customers');
      const customerQuery = query(
        customersRef,
        where('email', '==', customerEmail)
      );
      const customerSnapshot = await getDocs(customerQuery);
      
      const orderTotal = orderData.total || orderData.totalAmount || 0;
      
      if (!customerSnapshot.empty) {
        // Update existing customer
        const customerDoc = customerSnapshot.docs[0];
        const customerData = customerDoc.data();
        const updatedData = {
          ...customerData,
          name: customerName,
          phone: customerPhone || customerData.phone,
          address: deliveryAddress || customerData.address,
          totalOrders: (customerData.totalOrders || 0) + 1,
          totalSpent: (customerData.totalSpent || 0) + parseFloat(orderTotal.toString()),
          lastOrderDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active'
        };
        
        await updateDoc(doc(db, 'customers', customerDoc.id), updatedData);
        console.log('✅ Customer updated:', customerDoc.id);
      } else {
        // Create new customer
        const newCustomer = {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || '',
          address: deliveryAddress,
          status: 'active',
          totalOrders: 1,
          totalSpent: parseFloat(orderTotal.toString()),
          lastOrderDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          notes: '',
          source: 'website',
          isVip: false,
          customerSince: new Date().toISOString()
        };
        
        await addDoc(customersRef, newCustomer);
        console.log('✅ New customer created');
      }
    } catch (customerError) {
      console.error('⚠️ Error creating/updating customer:', customerError);
      // Customer creation error shouldn't fail the order
    }
    
    // Tüm sipariş bilgilerini detaylı olarak kaydet
    const order = {
      ...orderData,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      // Müşteri bilgilerini de ekle (hem eski hem yeni format için)
      customer: hasNewFormat ? {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      } : orderData.customer,
      // Tüm detayları ekle
      recipient: hasNewFormat ? orderData.recipient : undefined,
      sender: hasNewFormat ? orderData.sender : undefined,
      delivery: hasNewFormat ? orderData.delivery : undefined,
      invoice: orderData.invoice || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating order:', orderNumber);
    
    const docRef = await addDoc(collection(db, 'orders'), order);
    
    console.log('✅ Order created successfully in Firebase with ID:', docRef.id);
    
    // Customer info is already set above, continue with email/WhatsApp
    
    // Ödeme yöntemine göre bildirim gönder
    const paymentMethod = orderData.paymentMethod || '';
    const isBankTransfer = paymentMethod.toLowerCase().includes('havale') || 
                          paymentMethod.toLowerCase().includes('eft') ||
                          paymentMethod.toLowerCase().includes('bank_transfer') ||
                          paymentMethod === 'bank_transfer';
    
    if (isBankTransfer) {
      // Havale/EFT: Sadece WhatsApp mesajı gönder (email gönderme)
      try {
        console.log('📱 Sending WhatsApp message for bank transfer payment...');
        
        // Havale için WhatsApp mesajı oluştur
        const whatsappMessage = `🎉 Siparişiniz Alındı!\n\n` +
          `📋 Sipariş Numaranız: ${orderNumber}\n\n` +
          `👤 Müşteri Bilgileri:\n` +
          `• Ad Soyad: ${customerName}\n` +
          `• Telefon: ${customerPhone}\n` +
          `• E-posta: ${customerEmail}\n\n` +
          `🚚 Teslimat Adresi:\n` +
          `• ${deliveryAddress}\n\n` +
          `🛒 Sipariş Detayları:\n` +
          orderData.items.map((item: {
            name?: string;
            productName?: string;
            quantity: number;
            price: number;
          }) => `• ${item.name || item.productName} x${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`).join('\n') +
          `\n\n💰 Toplam Tutar: ₺${orderData.total?.toString() || orderData.totalAmount?.toString() || '0'}\n\n` +
          `💳 Ödeme Yöntemi: Havale/EFT\n\n` +
          `⚠️ ÖNEMLİ: Havale/EFT yaparken açıklama kısmına sipariş numaranızı (${orderNumber}) yazmanız gerekmektedir.\n\n` +
          `📞 Sorularınız için bizimle iletişime geçebilirsiniz.\n\n` +
          `Teşekkür ederiz! 🌹`;
        
        // WhatsApp URL oluştur
        const settingsRef = doc(db, 'settings', 'site-settings');
        const settingsSnap = await getDoc(settingsRef);
        const whatsappPhone = settingsSnap.exists() 
          ? (settingsSnap.data()?.contact?.whatsapp || settingsSnap.data()?.contact?.phone || '+90 535 561 26 56')
          : '+90 535 561 26 56';
        const whatsappPhoneNumber = whatsappPhone.replace(/[\s\-+()]/g, '');
        const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        console.log('✅ WhatsApp message prepared for bank transfer');
        console.log('📱 WhatsApp URL:', whatsappUrl);
        
        // WhatsApp mesajını admin panelinde kaydet (sipariş kodu ile)
        try {
          await addDoc(collection(db, 'whatsapp-messages'), {
            orderNumber,
            message: whatsappMessage,
            type: 'order_notification',
            paymentMethod: 'bank_transfer',
            customerPhone,
            customerEmail,
            customerName,
            createdAt: new Date().toISOString(),
            status: 'sent'
          });
          console.log('✅ WhatsApp message logged in admin panel');
        } catch (logError) {
          console.error('⚠️ Error logging WhatsApp message:', logError);
        }
        
        // Müşteriye ve Admin'e email gönder (sipariş kodu ile)
        try {
          // Tüm detayları topla
          const recipientFullName = hasNewFormat 
            ? `${orderData.recipient?.firstName || ''} ${orderData.recipient?.lastName || ''}`.trim()
            : customerName;
          const senderFullName = hasNewFormat
            ? `${orderData.sender?.firstName || ''} ${orderData.sender?.lastName || ''}`.trim()
            : customerName;
          
          const deliveryCity = hasNewFormat ? orderData.delivery?.city : '';
          const deliveryDistrict = hasNewFormat ? orderData.delivery?.district : '';
          const deliveryDate = hasNewFormat ? orderData.delivery?.deliveryDate : '';
          const deliveryTime = hasNewFormat ? orderData.delivery?.deliveryTime : '';
          const deliveryLocation = hasNewFormat ? orderData.delivery?.deliveryLocation : '';
          
          const wreathText = hasNewFormat ? orderData.sender?.wreathText : '';
          const additionalInfo = hasNewFormat ? orderData.sender?.additionalInfo : '';
          
          const fullDeliveryAddress = hasNewFormat
            ? `${deliveryAddress}${deliveryCity ? `, ${deliveryCity}` : ''}${deliveryDistrict ? `, ${deliveryDistrict}` : ''}`
            : deliveryAddress;
          
          const emailData: OrderEmailData = {
            orderId: orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            totalAmount: orderData.total?.toString() || orderData.totalAmount?.toString() || '0',
            items: orderData.items.map((item: {
              name?: string;
              productName?: string;
              quantity: number;
              price: number;
            }) => ({
              name: item.name || item.productName || '',
              quantity: item.quantity,
              price: item.price
            })),
            deliveryAddress: fullDeliveryAddress,
            orderDate: new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: 'Sipariş Alındı',
            invoice: orderData.invoice || null,
            paymentMethod: orderData.paymentMethod || 'Havale/EFT',
            paymentStatus: 'Beklemede',
            shippingCost: orderData.shippingCost || 0,
            subtotal: orderData.subtotal || orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
            recipientName: recipientFullName,
            recipientPhone: hasNewFormat ? orderData.recipient?.phone : customerPhone,
            senderName: senderFullName,
            senderPhone: hasNewFormat ? orderData.sender?.phone : customerPhone,
            orderNote: `${wreathText ? `Çelenk Yazısı: ${wreathText}\n` : ''}${additionalInfo ? `Ek Bilgi: ${additionalInfo}\n` : ''}${deliveryDate ? `Teslimat Tarihi: ${deliveryDate}\n` : ''}${deliveryTime ? `Teslimat Saati: ${deliveryTime}\n` : ''}${deliveryLocation ? `Teslimat Konumu: ${deliveryLocation}\n` : ''}${orderData.notes || orderData.orderNote || ''}`
          };
          
          // Admin'e bildirim emaili gönder
          const adminEmailResult = await sendAdminNotificationEmail(emailData);
          console.log('📧 Admin email result:', adminEmailResult);
          
          // Müşteriye email client-side'da gönderilecek (başarı sayfasında)
          console.log('📧 Customer email will be sent from client-side (payment success page)');
        } catch (emailError) {
          console.error('❌ Error sending emails:', emailError);
        }
        
      } catch (whatsappError) {
        console.error('❌ Error preparing WhatsApp message:', whatsappError);
      }
    } else {
      // Diğer ödeme yöntemleri: Sadece Email gönder
    try {
      console.log('📧 Sending order confirmation emails...');
      
        // Tüm detayları topla
        const recipientFullName = hasNewFormat 
          ? `${orderData.recipient?.firstName || ''} ${orderData.recipient?.lastName || ''}`.trim()
          : customerName;
        const senderFullName = hasNewFormat
          ? `${orderData.sender?.firstName || ''} ${orderData.sender?.lastName || ''}`.trim()
          : customerName;
        
        const deliveryCity = hasNewFormat ? orderData.delivery?.city : '';
        const deliveryDistrict = hasNewFormat ? orderData.delivery?.district : '';
        const deliveryDate = hasNewFormat ? orderData.delivery?.deliveryDate : '';
        const deliveryTime = hasNewFormat ? orderData.delivery?.deliveryTime : '';
        const deliveryLocation = hasNewFormat ? orderData.delivery?.deliveryLocation : '';
        
        const wreathText = hasNewFormat ? orderData.sender?.wreathText : '';
        const additionalInfo = hasNewFormat ? orderData.sender?.additionalInfo : '';
        
        const fullDeliveryAddress = hasNewFormat
          ? `${deliveryAddress}${deliveryCity ? `, ${deliveryCity}` : ''}${deliveryDistrict ? `, ${deliveryDistrict}` : ''}`
          : deliveryAddress;
      
      // Müşteriye onay maili gönder
      const customerEmailData: OrderEmailData = {
        orderId: orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        totalAmount: orderData.total?.toString() || orderData.totalAmount?.toString() || '0',
        items: orderData.items.map((item: {
            name?: string;
            productName?: string;
          quantity: number;
          price: number;
        }) => ({
            name: item.name || item.productName || '',
          quantity: item.quantity,
          price: item.price
        })),
          deliveryAddress: fullDeliveryAddress,
          orderDate: new Date().toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
        status: 'Sipariş Alındı',
          invoice: orderData.invoice || null,
          paymentMethod: orderData.paymentMethod || 'Kredi Kartı',
          paymentStatus: 'Ödendi',
          shippingCost: orderData.shippingCost || 0,
          subtotal: orderData.subtotal || orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
          recipientName: recipientFullName,
          recipientPhone: hasNewFormat ? orderData.recipient?.phone : customerPhone,
          senderName: senderFullName,
          senderPhone: hasNewFormat ? orderData.sender?.phone : customerPhone,
          orderNote: `${wreathText ? `Çelenk Yazısı: ${wreathText}\n` : ''}${additionalInfo ? `Ek Bilgi: ${additionalInfo}\n` : ''}${deliveryDate ? `Teslimat Tarihi: ${deliveryDate}\n` : ''}${deliveryTime ? `Teslimat Saati: ${deliveryTime}\n` : ''}${deliveryLocation ? `Teslimat Konumu: ${deliveryLocation}\n` : ''}${orderData.notes || orderData.orderNote || ''}`
      };
      
      // Admin'e bildirim maili
      const adminEmailResult = await sendAdminNotificationEmail(customerEmailData);
      console.log('📧 Admin email result:', adminEmailResult);
      
      // Müşteriye email client-side'da gönderilecek (başarı sayfasında)
      console.log('📧 Customer email will be sent from client-side (payment success page)');
      
      console.log('✅ Admin email sent successfully');
      
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
      // Mail hatası olsa bile sipariş oluşturulmuş, devam et
    }
    }
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      orderNumber,
      order: { id: docRef.id, ...order },
      message: 'Order created successfully in Firebase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules',
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
    // Check if checking for order number existence
    const { searchParams } = new URL(request.url);
    const checkOrderNumber = searchParams.get('orderNumber');
    
    if (checkOrderNumber) {
      // Get order by order number
      const ordersRef = collection(db, 'orders');
      const orderQuery = query(ordersRef, where('orderNumber', '==', checkOrderNumber), limit(1));
      const orderSnapshot = await getDocs(orderQuery);
      
      if (orderSnapshot.empty) {
        return NextResponse.json({
          exists: false,
          orderNumber: checkOrderNumber,
          order: null
        });
      }
      
      const orderDoc = orderSnapshot.docs[0];
      const order = {
        id: orderDoc.id,
        ...orderDoc.data()
      };
      
      return NextResponse.json({
        exists: true,
        orderNumber: checkOrderNumber,
        order
      });
    }
    
    // Normal orders fetch
    console.log('📦 Fetching orders...');
    console.log('🔧 Firebase DB:', db ? 'Connected' : 'Not connected');
    
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${orders.length} orders`);
    
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    return NextResponse.json({
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}