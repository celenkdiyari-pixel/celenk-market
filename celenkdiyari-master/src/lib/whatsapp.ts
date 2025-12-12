// WhatsApp API utility functions
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Helper function to get settings
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

export interface WhatsAppOrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  totalAmount: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  orderDate: string;
  paymentMethod: string;
  invoice?: InvoiceInfo | null;
}

export const sendWhatsAppMessage = async (orderData: WhatsAppOrderData) => {
  try {
    console.log('📱 Sending WhatsApp message...');
    
    // Get WhatsApp phone from settings
    const settings = await getSettings();
    const whatsappPhoneRaw = settings?.contact?.whatsapp || settings?.contact?.phone || '+90 535 561 26 56';
    // Remove spaces and special characters for WhatsApp URL
    const whatsappPhone = whatsappPhoneRaw.replace(/[\s\-+()]/g, '');
    
    // Format the message
    let message = `🛒 *YENİ SİPARİŞ ALINDI*

📋 *Sipariş Bilgileri:*
• Sipariş No: ${orderData.orderId}
• Tarih: ${orderData.orderDate}
• Ödeme: ${orderData.paymentMethod}

👤 *Müşteri Bilgileri:*
• Ad: ${orderData.customerName}
• Telefon: ${orderData.customerPhone}
• E-posta: ${orderData.customerEmail}
• Adres: ${orderData.deliveryAddress}

🛍️ *Sipariş Ürünleri:*
${orderData.items.map(item =>
  `• ${item.name} x${item.quantity} = ₺${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

💰 *Toplam Tutar: ${orderData.totalAmount} ₺*`;

    // Fatura bilgilerini ekle (eğer varsa)
    if (orderData.invoice && orderData.invoice.needInvoice) {
      message += `\n\n📄 *FATURA BİLGİLERİ:*\n` +
        `• Fatura Tipi: ${orderData.invoice.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal'}\n`;
      
      if (orderData.invoice.invoiceType === 'corporate') {
        message += `• Firma Adı: ${orderData.invoice.companyName || 'Belirtilmemiş'}\n` +
          `• Vergi Dairesi: ${orderData.invoice.taxOffice || 'Belirtilmemiş'}\n`;
      }
      
      message += `• ${orderData.invoice.invoiceType === 'individual' ? 'TC Kimlik No' : 'Vergi No'}: ${orderData.invoice.taxNumber || 'Belirtilmemiş'}\n` +
        `• Adres: ${orderData.invoice.address || 'Belirtilmemiş'}\n` +
        `• İl: ${orderData.invoice.city || 'Belirtilmemiş'}\n` +
        `• İlçe: ${orderData.invoice.district || 'Belirtilmemiş'}\n`;
      
      if (orderData.invoice.postalCode) {
        message += `• Posta Kodu: ${orderData.invoice.postalCode}\n`;
      }
    }

    message += `\n---\nÇelenk Diyarı E-Ticaret Sistemi`;

    // Create WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('✅ WhatsApp message formatted:', whatsappUrl);
    
    return {
      success: true,
      whatsappUrl,
      message: 'WhatsApp mesajı hazırlandı'
    };
    
  } catch (error) {
    console.error('❌ Error creating WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const openWhatsApp = async (orderData: WhatsAppOrderData) => {
  try {
    const result = await sendWhatsAppMessage(orderData);
    
    if (result.success && result.whatsappUrl) {
      // Open WhatsApp in new tab
      window.open(result.whatsappUrl, '_blank');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error opening WhatsApp:', error);
    return false;
  }
};
