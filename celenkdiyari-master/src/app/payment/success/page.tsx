'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, Mail, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';
import emailjs from '@emailjs/browser';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Get WhatsApp phone from settings
  const whatsappPhone = settings?.contact?.whatsapp || settings?.contact?.phone || '+90 535 561 26 56';
  const whatsappPhoneNumber = whatsappPhone.replace(/[\s\-+()]/g, '');

  const handleSupportClick = () => {
    if (!orderNumber) return;

    // Create support message with order number
    const supportMessage = `Merhaba, sipariş numaram: ${orderNumber}. Destek almak istiyorum.`;

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(supportMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Müşteriye email gönder (client-side)
  const sendCustomerEmail = async (orderNum: string) => {
    if (emailSent || emailSending) return;
    
    setEmailSending(true);
    
    try {
      // Sipariş bilgilerini API'den al
      const orderResponse = await fetch(`/api/orders?orderNumber=${orderNum}`);
      const orderData = await orderResponse.json();
      
      if (!orderData.exists || !orderData.order) {
        console.log('⚠️ Order not found for email, orderNumber:', orderNum);
        setEmailSending(false);
        return;
      }
      
      const order = orderData.order;
      
      // EmailJS config'i al - direkt environment variables kullan
      let serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CUSTOMER || 'template_zel5ngx';
      let publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      
      // Eğer env variables yoksa API'den al
      if (!serviceId || !publicKey) {
        try {
          const configResponse = await fetch('/api/test-email-direct');
          const config = await configResponse.json();
          serviceId = serviceId || config?.emailjsConfig?.serviceId;
          publicKey = publicKey || config?.emailjsConfig?.publicKey;
        } catch (configError) {
          console.error('❌ Error fetching EmailJS config:', configError);
        }
      }
      
      if (!serviceId || !templateId || !publicKey) {
        console.error('❌ EmailJS config missing:', {
          hasServiceId: !!serviceId,
          hasTemplateId: !!templateId,
          hasPublicKey: !!publicKey
        });
        setEmailSending(false);
        return;
      }
      
      // Müşteri bilgilerini belirle
      const customerName = order.customer?.name || (order.sender ? `${order.sender.firstName} ${order.sender.lastName}` : 'Müşteri');
      const customerEmail = order.customer?.email || order.sender?.email;
      const customerPhone = order.customer?.phone || order.sender?.phone;
      
      if (!customerEmail) {
        console.log('⚠️ Customer email not found');
        setEmailSending(false);
        return;
      }
      
      // Subtotal ve shipping hesapla
      const subtotal = order.subtotal || order.items?.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
      const shippingCost = order.shippingCost || 0;
      const totalAmount = order.total || order.totalAmount || (subtotal + shippingCost);
      
      // Delivery address
      const deliveryAddress = order.delivery?.deliveryAddress || order.deliveryAddress || '';
      const deliveryCity = order.delivery?.city || '';
      const deliveryDistrict = order.delivery?.district || '';
      const fullDeliveryAddress = `${deliveryAddress}${deliveryCity ? `, ${deliveryCity}` : ''}${deliveryDistrict ? `, ${deliveryDistrict}` : ''}`;
      
      // Recipient ve sender bilgileri
      const recipientName = order.recipient ? `${order.recipient.firstName} ${order.recipient.lastName}` : customerName;
      const recipientPhone = order.recipient?.phone || customerPhone;
      const senderName = order.sender ? `${order.sender.firstName} ${order.sender.lastName}` : customerName;
      const senderPhone = order.sender?.phone || customerPhone;
      
      // Order note parse
      const wreathText = order.sender?.wreathText || '';
      const additionalInfo = order.sender?.additionalInfo || '';
      const deliveryDate = order.delivery?.deliveryDate || '';
      const deliveryTime = order.delivery?.deliveryTime || '';
      const deliveryLocation = order.delivery?.deliveryLocation || '';
      
      // EmailJS'i initialize et
      emailjs.init(publicKey);
      
      const templateParams: any = {
        // EmailJS template'inde kullanılacak parametreler
        // ÖNEMLİ: to_email parametresi template'te doğru kullanılmalı
        to_email: customerEmail, // Müşteri email'i - EmailJS template'inde bu parametre kullanılmalı
        to_name: customerName,
        from_name: 'Çelenk Diyarı',
        subject: `Sipariş Onayı - ${orderNum}`,
        // Email gönderilecek adres (EmailJS template'inde kullanılacak alternatif parametreler)
        email: customerEmail, // Alternatif parametre adı
        user_email: customerEmail, // Başka bir alternatif
        // Sipariş Bilgileri
        order_id: orderNum,
        order_number: orderNum,
        order_date: new Date(order.createdAt || Date.now()).toLocaleDateString('tr-TR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        order_status: order.status === 'pending' ? 'Sipariş Alındı' : order.status,
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
        items_list: order.items?.map((item: any) => 
          `${item.productName || item.name || 'Ürün'} x${item.quantity || 1} = ₺${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
        ).join('\n') || '',
        products: order.items?.map((item: any) => item.productName || item.name || 'Ürün').join(' + ') || '',
        // Fiyat Bilgileri
        subtotal: `₺${subtotal.toFixed(2)}`,
        shipping_cost: `₺${shippingCost.toFixed(2)}`,
        total_amount: `₺${totalAmount.toFixed(2)}`,
        tax_amount: '₺0.00',
        // Ödeme Bilgileri
        payment_method: order.paymentMethod || 'Belirtilmemiş',
        payment_status: order.paymentStatus === 'pending' ? 'Beklemede' : (order.paymentStatus === 'paid' ? 'Ödendi' : 'Beklemede'),
        // Sipariş Notu
        order_note: `${wreathText ? `Çelenk Yazısı: ${wreathText}\n` : ''}${additionalInfo ? `Ek Bilgi: ${additionalInfo}\n` : ''}${deliveryDate ? `Teslimat Tarihi: ${deliveryDate}\n` : ''}${deliveryTime ? `Teslimat Saati: ${deliveryTime}\n` : ''}${deliveryLocation ? `Teslimat Konumu: ${deliveryLocation}\n` : ''}`,
        // Şirket Bilgileri
        company_name: settings?.siteName || 'Çelenk Diyarı',
        company_email: settings?.contact?.email || 'info@celenkdiyari.com',
        company_phone: settings?.contact?.phone || '+90 532 137 81 60'
      };
      
      // Fatura bilgilerini ekle (varsa)
      if (order.invoice && order.invoice.needInvoice) {
        templateParams.invoice_type = order.invoice.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal';
        templateParams.invoice_tax_number = order.invoice.taxNumber || '';
        templateParams.invoice_address = order.invoice.address || '';
        templateParams.invoice_city = order.invoice.city || '';
        templateParams.invoice_district = order.invoice.district || '';
        templateParams.invoice_postal_code = order.invoice.postalCode || '';
        
        if (order.invoice.invoiceType === 'corporate') {
          templateParams.invoice_company_name = order.invoice.companyName || '';
          templateParams.invoice_tax_office = order.invoice.taxOffice || '';
        }
      }
      
      console.log('📧 Sending customer email with params:', {
        serviceId,
        templateId,
        to_email: customerEmail,
        orderNumber: orderNum,
        hasPublicKey: !!publicKey
      });
      
      const result = await emailjs.send(serviceId, templateId, templateParams);
      
      console.log('✅ Customer email sent via client-side:', result);
      setEmailSent(true);
      
    } catch (error: any) {
      console.error('❌ Error sending customer email:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        text: error?.text,
        status: error?.status,
        response: error?.response
      });
      
      // EmailJS hata detaylarını göster
      if (error?.text) {
        console.error('❌ EmailJS error text:', error.text);
      }
      if (error?.response) {
        console.error('❌ EmailJS error response:', error.response);
      }
      
      // Hata olsa bile devam et
      setEmailSent(false);
    } finally {
      setEmailSending(false);
    }
  };

  useEffect(() => {
    const merchantOid = searchParams.get('merchant_oid');
    const paymentMethodParam = searchParams.get('payment_method');
    
    if (merchantOid) {
      setOrderNumber(merchantOid);
      
      // Müşteriye email gönder (client-side)
      // Kısa bir gecikme ile gönder (sayfa yüklendikten sonra)
      setTimeout(() => {
        sendCustomerEmail(merchantOid);
      }, 2000); // 2 saniye bekle (sipariş kaydının tamamlanması için)
    }
    
    if (paymentMethodParam) {
      setPaymentMethod(paymentMethodParam);
    }
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          {paymentMethod === 'whatsapp' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h2>
              <p className="text-gray-600 mb-4">
                Siparişiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.
              </p>
              {orderNumber && (
                <p className="text-sm text-gray-500 mb-6">
                  Sipariş numaranız: <span className="font-bold text-green-600">{orderNumber}</span>
                </p>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>WhatsApp mesajı gönderildi</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>En kısa sürede sizinle iletişime geçeceğiz</span>
                </div>
              </div>
            </>
          ) : paymentMethod === 'bank_transfer' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h2>
              <p className="text-gray-600 mb-4">
                Siparişiniz başarıyla oluşturuldu. Havale/EFT yaparken sipariş numaranızı açıklama kısmına yazmanızı rica ederiz.
              </p>
              {orderNumber && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    Sipariş numaranız:
                  </p>
                  <p className="text-2xl font-bold text-green-600 mb-4">{orderNumber}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 font-semibold mb-2">Önemli:</p>
                    <p className="text-xs text-blue-700">
                      Havale/EFT yaparken açıklama kısmına <strong>{orderNumber}</strong> yazmanız gerekmektedir.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>
                    {emailSending ? 'E-posta gönderiliyor...' : emailSent ? 'Sipariş detayları e-posta adresinize gönderildi' : 'Sipariş detayları e-posta adresinize gönderiliyor...'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h2>
              <p className="text-gray-600 mb-4">
                Siparişiniz başarıyla alındı ve ödemeniz onaylandı.
              </p>
              {orderNumber && (
                <p className="text-sm text-gray-500 mb-6">
                  Sipariş numaranız: <span className="font-bold text-green-600">{orderNumber}</span>
                </p>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>
                    {emailSending ? 'E-posta gönderiliyor...' : emailSent ? 'Sipariş detayları e-posta adresinize gönderildi' : 'Sipariş detayları e-posta adresinize gönderiliyor...'}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>En kısa sürede sizinle iletişime geçeceğiz</span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            {orderNumber && (
              <Button 
                onClick={handleSupportClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Destek Al (WhatsApp)
              </Button>
            )}
            <Link href="/">
              <Button variant="outline" className="w-full">
                Ana Sayfaya Dön
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full">
                Alışverişe Devam Et
              </Button>
            </Link>
            {paymentMethod !== 'whatsapp' && paymentMethod !== 'bank_transfer' && (
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Faturayı İndir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
