import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { OrderItem, CustomerInfo } from '@/types/product';

interface OrderData {
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer';
  shippingMethod?: 'standard' | 'express' | 'pickup';
  createdAt: string;
}

// Mail gönderme fonksiyonu
async function sendOrderEmails(order: OrderData, orderNumber: string) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@celenkdiyari.com';
    const customerEmail = order.customer?.email;
    
    if (!customerEmail) {
      console.warn('⚠️ Customer email not found, skipping email send');
      return;
    }

    // Sipariş özeti oluştur
    const itemsList = order.items.map((item: OrderItem) => 
      `- ${item.productName}${item.variantName ? ` (${item.variantName})` : ''} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₺`
    ).join('\n');

    const addressText = order.customer.address 
      ? `${order.customer.address.street}, ${order.customer.address.district}, ${order.customer.address.city}${order.customer.address.postalCode ? ` - ${order.customer.address.postalCode}` : ''}`
      : 'Adres bilgisi yok';

    const paymentMethodText = 
      order.paymentMethod === 'cash' ? 'Kapıda Ödeme' :
      order.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
      'Havale/EFT';

    // Kullanıcıya gönderilecek mail
    // EmailJS'deki mevcut template ID: template_t6bsxpr (Customer Order Template)
    const customerTemplateId = process.env.EMAILJS_CUSTOMER_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID || 'template_t6bsxpr';
    if (!customerTemplateId) {
      console.warn('⚠️ Customer email template ID not found');
      return; // Template ID yoksa mail gönderme
    }
    
    const customerEmailData = {
      to: customerEmail,
      subject: `Siparişiniz Alındı - ${orderNumber}`,
      templateId: customerTemplateId,
      templateParams: {
        order_number: orderNumber,
        customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
        items: itemsList,
        subtotal: order.subtotal?.toFixed(2) || '0.00',
        shipping_cost: order.shippingCost?.toFixed(2) || '0.00',
        total: order.total?.toFixed(2) || '0.00',
        payment_method: paymentMethodText,
        address: addressText,
        phone: order.customer.phone || '',
        notes: order.customer.notes || 'Yok',
        order_date: new Date(order.createdAt).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    };

    // Admin'e gönderilecek mail
    // EmailJS'deki mevcut template ID: template_zel5ngx (Admin Order Template)
    const adminTemplateId = process.env.EMAILJS_ADMIN_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID || 'template_zel5ngx';
    if (!adminTemplateId) {
      console.warn('⚠️ Admin email template ID not found');
      // Admin template yoksa sadece customer maili gönder
    }
    
    const adminEmailData = {
      to: adminEmail,
      subject: `Yeni Sipariş - ${orderNumber}`,
      templateId: adminTemplateId,
      templateParams: {
        order_number: orderNumber,
        customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
        customer_email: customerEmail,
        customer_phone: order.customer.phone || '',
        items: itemsList,
        subtotal: order.subtotal?.toFixed(2) || '0.00',
        shipping_cost: order.shippingCost?.toFixed(2) || '0.00',
        total: order.total?.toFixed(2) || '0.00',
        payment_method: paymentMethodText,
        address: addressText,
        notes: order.customer.notes || 'Yok',
        order_date: new Date(order.createdAt).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    };

    // EmailJS servis bilgileri
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID;

    if (!serviceId || !publicKey) {
      console.error('❌ EmailJS configuration missing');
      console.error('Service ID:', serviceId ? 'Found' : 'Missing');
      console.error('Public Key:', publicKey ? 'Found' : 'Missing');
      return; // EmailJS yapılandırması yoksa mail gönderme
    }

    // EmailJS API endpoint
    const emailjsUrl = 'https://api.emailjs.com/api/v1.0/email/send';

    // Her iki maili de paralel gönder
    const emailPromises = [];
    
    // Customer email
    if (customerTemplateId) {
      const customerEmailPayload = {
        service_id: serviceId,
        template_id: customerTemplateId,
        user_id: publicKey,
        template_params: {
          ...customerEmailData.templateParams,
          to_email: customerEmail,
          subject: customerEmailData.subject,
          reply_to: customerEmail,
        }
      };

      emailPromises.push(
        fetch(emailjsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerEmailPayload)
        }).then(async (res) => {
          const responseText = await res.text();
          if (res.ok) {
            console.log('✅ Customer email sent successfully');
            return { ok: true, result: responseText };
          } else {
            console.error('❌ Failed to send customer email:', responseText);
            console.error('❌ Status:', res.status);
            return { ok: false, result: responseText, status: res.status };
          }
        }).catch(err => {
          console.error('❌ Customer email fetch error:', err);
          return { ok: false, error: err.message };
        })
      );
    }
    
    // Admin email
    if (adminTemplateId) {
      const adminEmailPayload = {
        service_id: serviceId,
        template_id: adminTemplateId,
        user_id: publicKey,
        template_params: {
          ...adminEmailData.templateParams,
          to_email: adminEmail,
          subject: adminEmailData.subject,
          reply_to: customerEmail,
        }
      };

      emailPromises.push(
        fetch(emailjsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminEmailPayload)
        }).then(async (res) => {
          const responseText = await res.text();
          if (res.ok) {
            console.log('✅ Admin email sent successfully');
            return { ok: true, result: responseText };
          } else {
            console.error('❌ Failed to send admin email:', responseText);
            console.error('❌ Status:', res.status);
            return { ok: false, result: responseText, status: res.status };
          }
        }).catch(err => {
          console.error('❌ Admin email fetch error:', err);
          return { ok: false, error: err.message };
        })
      );
    }
    
    // Tüm mailleri paralel gönder
    await Promise.allSettled(emailPromises);

  } catch (error) {
    console.error('❌ Error in sendOrderEmails:', error);
    // Hata olsa bile devam et, sipariş zaten oluşturuldu
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Creating new order...');
    
    const orderData = await request.json();
    console.log('📝 Order data:', orderData);
    
    // Validate required fields
    if (!orderData.customer || !orderData.items || !orderData.items.length) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: customer, items',
        received: orderData
      }, { status: 400 });
    }
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const order = {
      ...orderData,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating order:', orderNumber);
    
    const docRef = await addDoc(collection(db, 'orders'), order);
    
    console.log('✅ Order created successfully in Firebase with ID:', docRef.id);
    
    // Mail gönderme işlemi (async olarak çalışır, hata olsa bile sipariş oluşturulur)
    sendOrderEmails(order, orderNumber).catch(error => {
      console.error('❌ Error sending order emails:', error);
      // Mail gönderme hatası sipariş oluşturmayı engellemez
    });
    
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

export async function GET() {
  try {
    console.log('📦 Fetching orders...');
    
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
    
    return NextResponse.json({
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}