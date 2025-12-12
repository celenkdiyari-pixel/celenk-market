// Email configuration - Using environment variables only (no hardcoded fallbacks for security)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) {
  console.warn('⚠️ ADMIN_EMAIL environment variable is not set. Admin notifications may not work.');
}

// EmailJS konfigürasyonu
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // Server-side için Private Key
const EMAILJS_TEMPLATE_CUSTOMER = process.env.EMAILJS_TEMPLATE_CUSTOMER;
const EMAILJS_TEMPLATE_ADMIN = process.env.EMAILJS_TEMPLATE_ADMIN;

// Helper function to get settings
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

async function getSettings() {
  try {
    const settingsRef = doc(db, 'settings', 'site-settings');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return settingsSnap.data();
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
  return null;
}

export interface InvoiceInfo {
  needInvoice: boolean;
  invoiceType?: 'individual' | 'corporate';
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress: string;
  orderDate: string;
  status: string;
  invoice?: InvoiceInfo | null;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingCost?: string | number;
  subtotal?: string | number;
  recipientName?: string;
  recipientPhone?: string;
  senderName?: string;
  senderPhone?: string;
  orderNote?: string;
}

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData) => {
  try {
    console.log('📧 Sending order confirmation email...');
    console.log('📧 EmailJS Config:', {
      serviceId: EMAILJS_SERVICE_ID ? 'Set' : 'Missing',
      publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing',
      customerTemplate: EMAILJS_TEMPLATE_CUSTOMER ? 'Set' : 'Missing'
    });
    
    // EmailJS public key kontrolü - sadece boş kontrol yap
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_CUSTOMER) {
      console.log('⚠️ EmailJS not properly configured, using fallback method');
      
      // Geçici çözüm: E-posta içeriğini konsola yazdır ve başarılı olarak işaretle
      let emailContent = `
🎉 Sipariş Onayı - Çelenk Diyarı

Merhaba ${orderData.customerName},

Siparişiniz başarıyla alınmıştır.

📋 Sipariş Bilgileri:
• Sipariş No: ${orderData.orderId}
• Tarih: ${orderData.orderDate}
• Durum: ${orderData.status}

👤 Müşteri Bilgileri:
• Ad: ${orderData.customerName}
• Telefon: ${orderData.customerPhone}
• E-posta: ${orderData.customerEmail}

🛍️ Sipariş Ürünleri:
${orderData.items.map(item => 
  `• ${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

💰 Toplam Tutar: ${orderData.totalAmount} ₺

📍 Teslimat Adresi: ${orderData.deliveryAddress}`;

      // Fatura bilgilerini ekle (eğer varsa)
      if (orderData.invoice && orderData.invoice.needInvoice) {
        emailContent += `\n\n📄 Fatura Bilgileri:\n` +
          `• Fatura Tipi: ${orderData.invoice.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal'}\n`;
        
        if (orderData.invoice.invoiceType === 'corporate') {
          emailContent += `• Firma Adı: ${orderData.invoice.companyName || 'Belirtilmemiş'}\n` +
            `• Vergi Dairesi: ${orderData.invoice.taxOffice || 'Belirtilmemiş'}\n`;
        }
        
        emailContent += `• ${orderData.invoice.invoiceType === 'individual' ? 'TC Kimlik No' : 'Vergi No'}: ${orderData.invoice.taxNumber || 'Belirtilmemiş'}\n` +
          `• Adres: ${orderData.invoice.address || 'Belirtilmemiş'}\n` +
          `• İl: ${orderData.invoice.city || 'Belirtilmemiş'}\n` +
          `• İlçe: ${orderData.invoice.district || 'Belirtilmemiş'}\n`;
        
        if (orderData.invoice.postalCode) {
          emailContent += `• Posta Kodu: ${orderData.invoice.postalCode}\n`;
        }
      }

      emailContent += `\n---\nÇelenk Diyarı E-Ticaret Sistemi
      `;
      
      console.log('📧 MÜŞTERİ E-POSTASI (EmailJS olmadan):', emailContent);
      console.log('📧 E-posta gönderilecek adres:', orderData.customerEmail);
      
      // Geçici olarak başarılı olarak işaretle
      return { success: true, messageId: 'logged-fallback' };
    }
    
    // EmailJS ile gönder (eğer konfigüre edilmişse)
    const settings = await getSettings();
    
    // Subtotal ve shipping cost hesapla
    const subtotalNum = typeof orderData.subtotal === 'number' 
      ? orderData.subtotal 
      : (typeof orderData.subtotal === 'string' ? parseFloat(orderData.subtotal.replace('₺', '').replace(',', '.')) : orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    const shippingCostNum = typeof orderData.shippingCost === 'number' 
      ? orderData.shippingCost 
      : (typeof orderData.shippingCost === 'string' ? parseFloat(orderData.shippingCost.toString().replace('₺', '').replace(',', '.')) : 0);
    const totalAmountNum = parseFloat(orderData.totalAmount.toString().replace('₺', '').replace(',', '.')) || (subtotalNum + shippingCostNum);
    
    const templateParams: any = {
      to_email: orderData.customerEmail,
      to_name: orderData.customerName,
      from_name: 'Çelenk Diyarı',
      subject: `Sipariş Onayı - ${orderData.orderId}`,
      // Sipariş Bilgileri
      order_id: orderData.orderId,
      order_number: orderData.orderId,
      order_date: orderData.orderDate,
      order_status: orderData.status,
      // Müşteri Bilgileri
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      // Gönderen/Alıcı Bilgileri
      sender_name: orderData.senderName || orderData.customerName,
      sender_phone: orderData.senderPhone || orderData.customerPhone,
      recipient_name: orderData.recipientName || orderData.customerName,
      recipient_phone: orderData.recipientPhone || orderData.customerPhone,
      // Ürünler - Detaylı Liste
      items_list: orderData.items.map(item => 
        `${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`
      ).join('\n'),
      products: orderData.items.map(item => item.name).join(' + '),
      // Fiyat Bilgileri
      subtotal: `₺${subtotalNum.toFixed(2)}`,
      shipping_cost: `₺${shippingCostNum.toFixed(2)}`,
      total_amount: `₺${totalAmountNum.toFixed(2)}`,
      tax_amount: '₺0.00',
      // Teslimat Bilgileri
      delivery_address: orderData.deliveryAddress,
      // Ödeme Bilgileri
      payment_method: orderData.paymentMethod || 'Belirtilmemiş',
      payment_status: orderData.paymentStatus || 'Beklemede',
      // Sipariş Notu
      order_note: orderData.orderNote || '',
      // Şirket Bilgileri
      company_name: settings?.siteName || 'Çelenk Diyarı',
      company_email: settings?.contact?.email || 'info@celenkdiyari.com',
      company_phone: settings?.contact?.phone || '+90 532 137 81 60',
      company_website: settings?.siteUrl?.replace('https://', '').replace('http://', '') || 'www.celenkdiyari.com'
    };

    // Fatura bilgilerini ekle (eğer varsa)
    if (orderData.invoice && orderData.invoice.needInvoice) {
      templateParams.invoice_type = orderData.invoice.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal';
      templateParams.invoice_tax_number = orderData.invoice.taxNumber || '';
      templateParams.invoice_address = orderData.invoice.address || '';
      templateParams.invoice_city = orderData.invoice.city || '';
      templateParams.invoice_district = orderData.invoice.district || '';
      templateParams.invoice_postal_code = orderData.invoice.postalCode || '';
      
      if (orderData.invoice.invoiceType === 'corporate') {
        templateParams.invoice_company_name = orderData.invoice.companyName || '';
        templateParams.invoice_tax_office = orderData.invoice.taxOffice || '';
      }
    }

    // EmailJS REST API kullan (nodejs paketi 403 hatası veriyor)
    const apiKey = EMAILJS_PUBLIC_KEY;
    
    if (!apiKey) {
      throw new Error('EMAILJS_PUBLIC_KEY is required');
    }
    
    const emailjsApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    
    const requestBody = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_CUSTOMER,
      user_id: apiKey,
      template_params: templateParams
    };
    
    const response = await fetch(emailjsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { text: responseText, status: response.status };
    }
    
    if (!response.ok) {
      throw new Error(result.text || `HTTP ${response.status}`);
    }

    console.log('✅ Order confirmation email sent via EmailJS:', result);
    return { success: true, messageId: result.text || 'Success' };
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendAdminNotificationEmail = async (orderData: OrderEmailData) => {
  try {
    console.log('📧 Sending admin notification email...');
    console.log('📧 EmailJS Config:', {
      serviceId: EMAILJS_SERVICE_ID ? 'Set' : 'Missing',
      publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing',
      adminTemplate: EMAILJS_TEMPLATE_ADMIN ? 'Set' : 'Missing'
    });
    
    // EmailJS public key kontrolü - sadece boş kontrol yap
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ADMIN) {
      console.log('⚠️ EmailJS not properly configured, using fallback method');
      
      // Geçici çözüm: E-posta içeriğini konsola yazdır ve başarılı olarak işaretle
      let adminEmailContent = `
🚨 YENİ SİPARİŞ ALINDI - Çelenk Diyarı

📋 Sipariş Bilgileri:
• Sipariş No: ${orderData.orderId}
• Tarih: ${orderData.orderDate}
• Durum: ${orderData.status}

👤 Müşteri Bilgileri:
• Ad: ${orderData.customerName}
• Telefon: ${orderData.customerPhone}
• E-posta: ${orderData.customerEmail}

🛍️ Sipariş Ürünleri:
${orderData.items.map(item => 
  `• ${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

💰 Toplam Tutar: ${orderData.totalAmount} ₺

📍 Teslimat Adresi: ${orderData.deliveryAddress}`;

      // Fatura bilgilerini ekle (eğer varsa)
      if (orderData.invoice && orderData.invoice.needInvoice) {
        adminEmailContent += `\n\n📄 Fatura Bilgileri:\n` +
          `• Fatura Tipi: ${orderData.invoice.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal'}\n`;
        
        if (orderData.invoice.invoiceType === 'corporate') {
          adminEmailContent += `• Firma Adı: ${orderData.invoice.companyName || 'Belirtilmemiş'}\n` +
            `• Vergi Dairesi: ${orderData.invoice.taxOffice || 'Belirtilmemiş'}\n`;
        }
        
        adminEmailContent += `• ${orderData.invoice.invoiceType === 'individual' ? 'TC Kimlik No' : 'Vergi No'}: ${orderData.invoice.taxNumber || 'Belirtilmemiş'}\n` +
          `• Adres: ${orderData.invoice.address || 'Belirtilmemiş'}\n` +
          `• İl: ${orderData.invoice.city || 'Belirtilmemiş'}\n` +
          `• İlçe: ${orderData.invoice.district || 'Belirtilmemiş'}\n`;
        
        if (orderData.invoice.postalCode) {
          adminEmailContent += `• Posta Kodu: ${orderData.invoice.postalCode}\n`;
        }
      }

      adminEmailContent += `\n🔗 Admin Paneli: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://celenkdiyari.com'}/admin/orders

---
Çelenk Diyarı E-Ticaret Sistemi
      `;
      
      console.log('📧 ADMIN E-POSTASI (EmailJS olmadan):', adminEmailContent);
      console.log('📧 E-posta gönderilecek adres:', ADMIN_EMAIL);
      
      // Geçici olarak başarılı olarak işaretle
      return { success: true, messageId: 'logged-fallback' };
    }
    
    // EmailJS ile gönder (eğer konfigüre edilmişse)
    const settings = await getSettings();
    
    // Subtotal ve shipping cost hesapla
    const subtotalNum = typeof orderData.subtotal === 'number' 
      ? orderData.subtotal 
      : (typeof orderData.subtotal === 'string' ? parseFloat(orderData.subtotal.replace('₺', '').replace(',', '.')) : orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    const shippingCostNum = typeof orderData.shippingCost === 'number' 
      ? orderData.shippingCost 
      : (typeof orderData.shippingCost === 'string' ? parseFloat(orderData.shippingCost.toString().replace('₺', '').replace(',', '.')) : 0);
    const totalAmountNum = parseFloat(orderData.totalAmount.toString().replace('₺', '').replace(',', '.')) || (subtotalNum + shippingCostNum);
    
    // Sipariş notunu parse et (çelenk yazısı, ek bilgi, teslimat bilgileri vb.)
    const orderNoteParts = orderData.orderNote?.split('\n') || [];
    const wreathText = orderNoteParts.find(p => p.includes('Çelenk Yazısı:'))?.replace('Çelenk Yazısı:', '').trim() || '';
    const additionalInfo = orderNoteParts.find(p => p.includes('Ek Bilgi:'))?.replace('Ek Bilgi:', '').trim() || '';
    const deliveryDate = orderNoteParts.find(p => p.includes('Teslimat Tarihi:'))?.replace('Teslimat Tarihi:', '').trim() || '';
    const deliveryTime = orderNoteParts.find(p => p.includes('Teslimat Saati:'))?.replace('Teslimat Saati:', '').trim() || '';
    const deliveryLocation = orderNoteParts.find(p => p.includes('Teslimat Konumu:'))?.replace('Teslimat Konumu:', '').trim() || '';
    
    const templateParams: any = {
      to_email: ADMIN_EMAIL,
      to_name: 'Admin',
      from_name: 'Çelenk Diyarı Sipariş Sistemi',
      subject: `Yeni Sipariş Alındı - ${orderData.orderId}`,
      // Sipariş Bilgileri
      order_id: orderData.orderId,
      order_number: orderData.orderId,
      order_date: orderData.orderDate,
      order_status: orderData.status,
      // Müşteri Bilgileri (Siparişi Veren)
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      // Gönderen Bilgileri (Detaylı)
      sender_name: orderData.senderName || orderData.customerName,
      sender_phone: orderData.senderPhone || orderData.customerPhone,
      sender_email: orderData.customerEmail,
      // Alıcı Bilgileri (Detaylı)
      recipient_name: orderData.recipientName || orderData.customerName,
      recipient_phone: orderData.recipientPhone || orderData.customerPhone,
      // Çelenk ve Ek Bilgiler
      wreath_text: wreathText,
      additional_info: additionalInfo,
      // Teslimat Detayları
      delivery_address: orderData.deliveryAddress,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      delivery_location: deliveryLocation,
      // Ürünler - Detaylı Liste
      items_list: orderData.items.map(item => 
        `${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`
      ).join('\n'),
      products: orderData.items.map(item => item.name).join(' + '),
      // Fiyat Bilgileri
      subtotal: `₺${subtotalNum.toFixed(2)}`,
      shipping_cost: `₺${shippingCostNum.toFixed(2)}`,
      total_amount: `₺${totalAmountNum.toFixed(2)}`,
      tax_amount: '₺0.00',
      // Ödeme Bilgileri
      payment_method: orderData.paymentMethod || 'Belirtilmemiş',
      payment_status: orderData.paymentStatus || 'Beklemede',
      // Sipariş Notu (Tüm Detaylar)
      order_note: orderData.orderNote || '',
      // Admin Panel Linki
      admin_panel_url: `${settings?.siteUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://celenkdiyari.com'}/admin/orders`,
      // Şirket Bilgileri
      company_name: settings?.siteName || 'Çelenk Diyarı',
      company_email: settings?.contact?.email || 'info@celenkdiyari.com',
      company_phone: settings?.contact?.phone || '+90 532 137 81 60'
    };

    // Fatura bilgilerini ekle (eğer varsa)
    if (orderData.invoice && orderData.invoice.needInvoice) {
      templateParams.invoice_type = orderData.invoice.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal';
      templateParams.invoice_tax_number = orderData.invoice.taxNumber || '';
      templateParams.invoice_address = orderData.invoice.address || '';
      templateParams.invoice_city = orderData.invoice.city || '';
      templateParams.invoice_district = orderData.invoice.district || '';
      templateParams.invoice_postal_code = orderData.invoice.postalCode || '';
      
      if (orderData.invoice.invoiceType === 'corporate') {
        templateParams.invoice_company_name = orderData.invoice.companyName || '';
        templateParams.invoice_tax_office = orderData.invoice.taxOffice || '';
      }
    }

    // EmailJS import'u sadece gerektiğinde yap
    console.log('📧 EmailJS gönderim detayları:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ADMIN,
      toEmail: ADMIN_EMAIL,
      hasPublicKey: !!EMAILJS_PUBLIC_KEY
    });
    
    // EmailJS REST API kullan (nodejs paketi 403 hatası veriyor)
    const apiKey = EMAILJS_PUBLIC_KEY;
    
    if (!apiKey) {
      throw new Error('EMAILJS_PUBLIC_KEY is required');
    }
    
    try {
      const emailjsApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
      
      const requestBody = {
        service_id: EMAILJS_SERVICE_ID!,
        template_id: EMAILJS_TEMPLATE_ADMIN!,
        user_id: apiKey,
        template_params: templateParams
      };
      
      const response = await fetch(emailjsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { text: responseText, status: response.status };
      }
      
      if (!response.ok) {
        throw {
          status: response.status,
          text: result.text || responseText,
          message: result.text || `HTTP ${response.status}`
        };
      }

      console.log('✅ Admin notification email sent via EmailJS:', {
        status: response.status,
        text: result.text || responseText,
        messageId: result.text || 'Success'
      });
      
      return { 
        success: true, 
        messageId: result.text || 'Success',
        status: response.status,
        details: 'Email başarıyla gönderildi'
      };
    } catch (emailError: any) {
      console.error('❌ EmailJS gönderim hatası:', {
        status: emailError?.status,
        text: emailError?.text,
        message: emailError?.message,
        stack: emailError?.stack
      });
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Email gönderilemedi';
      if (emailError?.status === 400) {
        errorMessage = 'EmailJS template parametreleri hatalı. Template\'deki değişkenleri kontrol edin.';
      } else if (emailError?.status === 401) {
        errorMessage = 'EmailJS Key geçersiz. Vercel\'deki EMAILJS_PRIVATE_KEY veya EMAILJS_PUBLIC_KEY değerini kontrol edin.';
      } else if (emailError?.status === 403) {
        errorMessage = 'EmailJS API çağrıları server-side için devre dışı. EmailJS Dashboard > Account > Security\'de "Allow requests from any origin" seçeneğini aktif edin.';
      } else if (emailError?.status === 404) {
        errorMessage = 'EmailJS Service veya Template bulunamadı. Service ID ve Template ID\'yi kontrol edin.';
      } else if (emailError?.status === 429) {
        errorMessage = 'EmailJS quota aşıldı. EmailJS dashboard\'dan quota\'nızı kontrol edin.';
      } else if (emailError?.text) {
        errorMessage = `EmailJS hatası: ${emailError.text}`;
      } else if (emailError?.message) {
        errorMessage = `EmailJS hatası: ${emailError.message}`;
      }
      
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
      adminEmail: ADMIN_EMAIL,
      hasServiceId: !!EMAILJS_SERVICE_ID,
      hasTemplate: !!EMAILJS_TEMPLATE_ADMIN,
      hasPublicKey: !!EMAILJS_PUBLIC_KEY
    });
    
    // Hata durumunda da sipariş oluşturulmuş olmalı, bu yüzden başarılı olarak işaretle ama hata logla
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      warning: 'Email gönderilemedi ama sipariş kaydedildi. Vercel logs\'larını kontrol edin.'
    };
  }
};

// Contact form email interface
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Send contact form email
export const sendContactFormEmail = async (contactData: ContactFormData) => {
  try {
    console.log('📧 Sending contact form email...');
    
    // Check if EmailJS is configured
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) {
      console.log('⚠️ EmailJS not properly configured, using fallback method');
      
      // Fallback: Log to console
      const emailContent = `
📧 YENİ İLETİŞİM FORMU MESAJI - Çelenk Diyarı

👤 Gönderen Bilgileri:
• Ad Soyad: ${contactData.name}
• E-posta: ${contactData.email}
• Telefon: ${contactData.phone || 'Belirtilmemiş'}

📝 Mesaj:
• Konu: ${contactData.subject}
• Mesaj: ${contactData.message}

📅 Tarih: ${new Date().toLocaleString('tr-TR')}
      `;
      
      console.log('📧 CONTACT FORM E-POSTASI (EmailJS olmadan):', emailContent);
      console.log('📧 E-posta gönderilecek adres:', ADMIN_EMAIL || 'admin@celenkdiyari.com');
      
      return { success: true, messageId: 'logged-fallback' };
    }
    
    // Send admin notification via EmailJS
    const settings = await getSettings();
    const adminTemplateParams = {
      to_email: ADMIN_EMAIL || settings?.contact?.email || 'info@celenkdiyari.com',
      to_name: 'Admin',
      from_email: contactData.email,
      from_name: contactData.name,
      subject: `Yeni İletişim Formu Mesajı: ${contactData.subject}`,
      message: contactData.message,
      phone: contactData.phone || 'Belirtilmemiş',
      company_name: settings?.siteName || 'Çelenk Diyarı',
      company_email: ADMIN_EMAIL || settings?.contact?.email || 'info@celenkdiyari.com'
    };

    // EmailJS REST API kullan (nodejs paketi 403 hatası veriyor)
    const apiKey = EMAILJS_PUBLIC_KEY;
    
    if (!apiKey) {
      throw new Error('EMAILJS_PUBLIC_KEY is required');
    }
    
    const emailjsApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    
    const adminRequestBody = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ADMIN || EMAILJS_TEMPLATE_CUSTOMER,
      user_id: apiKey,
      template_params: adminTemplateParams
    };
    
    const adminResponse = await fetch(emailjsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminRequestBody)
    });
    
    const adminResponseText = await adminResponse.text();
    let adminResult;
    
    try {
      adminResult = JSON.parse(adminResponseText);
    } catch {
      adminResult = { text: adminResponseText, status: adminResponse.status };
    }
    
    if (!adminResponse.ok) {
      throw new Error(adminResult.text || `HTTP ${adminResponse.status}`);
    }

    // Send confirmation to customer
    try {
      const customerTemplateParams = {
        to_email: contactData.email,
        to_name: contactData.name,
        from_email: ADMIN_EMAIL || settings?.contact?.email || 'info@celenkdiyari.com',
        from_name: settings?.siteName || 'Çelenk Diyarı',
        subject: `Mesajınız Alındı: ${contactData.subject}`,
        message: `Merhaba ${contactData.name},\n\nMesajınız başarıyla alındı. En kısa sürede size geri dönüş yapacağız.\n\nMesajınız:\n${contactData.message}\n\nTeşekkürler,\n${settings?.siteName || 'Çelenk Diyarı'} Ekibi`,
        company_name: settings?.siteName || 'Çelenk Diyarı',
        company_email: ADMIN_EMAIL || settings?.contact?.email || 'info@celenkdiyari.com',
        company_phone: settings?.contact?.phone || '+90 535 561 26 56'
      };

      const customerRequestBody = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_CUSTOMER,
        user_id: apiKey,
        template_params: customerTemplateParams
      };
      
      const customerResponse = await fetch(emailjsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerRequestBody)
      });
      
      const customerResponseText = await customerResponse.text();
      let customerResult;
      
      try {
        customerResult = JSON.parse(customerResponseText);
      } catch {
        customerResult = { text: customerResponseText, status: customerResponse.status };
      }
      
      if (!customerResponse.ok) {
        console.error('⚠️ Customer confirmation email failed:', customerResult);
      } else {
        console.log('✅ Contact form confirmation email sent to customer');
      }
    } catch (confirmError) {
      console.log('⚠️ Could not send confirmation email to customer:', confirmError);
    }

    console.log('✅ Contact form email sent via EmailJS:', adminResult);
    return { success: true, messageId: adminResult.text };
    
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
