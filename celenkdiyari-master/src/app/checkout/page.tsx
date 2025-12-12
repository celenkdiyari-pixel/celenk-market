'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cities, getDistrictsByCity } from '@/data/cities';

interface RecipientInfo {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryLocation: string;
  deliveryAddress: string;
}

interface SenderInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  wreathText: string;
  additionalInfo?: string;
}

interface DeliveryInfo {
  city: string;
  district: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryLocation: string;
  deliveryAddress?: string;
}

interface InvoiceInfo {
  needInvoice: boolean;
  invoiceType: 'individual' | 'corporate'; // Bireysel veya Kurumsal
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [blockedDay, setBlockedDay] = useState<{name: string; message: string; endDate: string} | null>(null);
  
  // Get WhatsApp phone from settings
  const whatsappPhone = settings?.contact?.whatsapp || settings?.contact?.phone || '+90 535 561 26 56';
  const whatsappPhoneNumber = whatsappPhone.replace(/[\s\-+()]/g, '');
  
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    deliveryLocation: '',
    deliveryAddress: ''
  });

  const [senderInfo, setSenderInfo] = useState<SenderInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    wreathText: '',
    additionalInfo: ''
  });

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    city: '',
    district: '',
    deliveryDate: '',
    deliveryTime: '',
    deliveryLocation: ''
  });

  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>({
    needInvoice: false,
    invoiceType: 'individual',
    companyName: '',
    taxOffice: '',
    taxNumber: '',
    address: '',
    city: '',
    district: '',
    postalCode: ''
  });

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('checkoutFormData');
    if (savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        if (formData.recipient) setRecipientInfo(formData.recipient);
        if (formData.sender) setSenderInfo(formData.sender);
        if (formData.delivery) setDeliveryInfo(formData.delivery);
        if (formData.invoice) setInvoiceInfo(formData.invoice);
        // Clear the saved data after loading
        localStorage.removeItem('checkoutFormData');
      } catch (error) {
        // Sessizce devam et
      }
    }
  }, []);

  // Check for blocked days - update when deliveryDate changes
  useEffect(() => {
    const checkBlockedDays = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings?.orderBlockedDays) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            // Check delivery date if provided, otherwise check today
            let dateToCheck = now;
            if (deliveryInfo.deliveryDate) {
              try {
                const deliveryDate = new Date(deliveryInfo.deliveryDate);
                deliveryDate.setHours(0, 0, 0, 0);
                
                // Only check delivery date if it's today or in the past
                // Future dates are allowed even if blocked
                if (deliveryDate <= now) {
                  dateToCheck = deliveryDate;
                } else {
                  // Future date - don't show blocked day warning
                  setBlockedDay(null);
                  return;
                }
              } catch (error) {
                // If parsing fails, check today
              }
            }
            
            const activeBlockedDay = data.settings.orderBlockedDays.find((day: any) => {
              if (!day.isActive) return false;
              const startDate = new Date(day.startDate);
              startDate.setHours(0, 0, 0, 0);
              const endDate = new Date(day.endDate);
              endDate.setHours(23, 59, 59, 999);
              
              return dateToCheck >= startDate && dateToCheck <= endDate;
            });
            
            if (activeBlockedDay) {
              setBlockedDay({
                name: activeBlockedDay.name,
                message: activeBlockedDay.message,
                endDate: activeBlockedDay.endDate
              });
            } else {
              setBlockedDay(null);
            }
          }
        }
      } catch (error) {
        // Sessizce devam et
      }
    };
    
    checkBlockedDays();
  }, [deliveryInfo.deliveryDate]);

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'whatsapp' | 'bank_transfer'>('credit_card');
  const [shippingCost, setShippingCost] = useState(0);
  const [defaultConfig, setDefaultConfig] = useState({ defaultPrice: 0, defaultExpressPrice: 0 });

  // Fetch pricing when city/district changes
  useEffect(() => {
    const fetchPricing = async () => {
      // Önce settings'ten kargo ücretini kontrol et
      const settingsShippingCost = settings?.business?.shippingCost ?? 0;
      
      // Eğer settings'te kargo ücreti 0 ise, direkt 0 kullan (pricing API'yi kontrol etme)
      if (settingsShippingCost === 0) {
        setShippingCost(0);
        return;
      }
      
      if (deliveryInfo.city && deliveryInfo.district) {
        try {
          const response = await fetch(`/api/pricing?city=${encodeURIComponent(deliveryInfo.city)}&district=${encodeURIComponent(deliveryInfo.district)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.pricing) {
              // İlçe veya şehir fiyatı bulundu
              setShippingCost(data.pricing.basePrice);
            } else {
              // Fiyat bulunamadı, settings'ten kargo ücretini kullan
              setShippingCost(settingsShippingCost);
            }
          } else {
            setShippingCost(settingsShippingCost);
          }
        } catch (error) {
          // Hata durumunda settings'ten kargo ücretini kullan
          setShippingCost(settingsShippingCost);
        }
      } else if (deliveryInfo.city) {
        // Sadece şehir seçilmişse şehir fiyatını kontrol et
        try {
          const response = await fetch(`/api/pricing?city=${encodeURIComponent(deliveryInfo.city)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.pricing) {
              setShippingCost(data.pricing.basePrice);
            } else {
              setShippingCost(settingsShippingCost);
            }
          } else {
            setShippingCost(settingsShippingCost);
          }
        } catch (error) {
          setShippingCost(settingsShippingCost);
        }
      } else {
        // Hiçbir şey seçilmemişse settings'ten kargo ücretini kullan
        setShippingCost(settingsShippingCost);
      }
    };

    fetchPricing();
  }, [deliveryInfo.city, deliveryInfo.district, settings?.business?.shippingCost]);

  // Varsayılan fiyatları yükle
  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        const response = await fetch('/api/pricing');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.config) {
            setDefaultConfig(data.config);
          }
        }
      } catch (error) {
        // Sessizce devam et
      }
    };
    loadDefaultConfig();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      // Sepet boşsa ana sayfaya yönlendir
      window.location.href = '/';
      return;
    }

    // Check if orders are blocked - only block if delivery date is today or not set
    // Future delivery dates are allowed even if today is blocked
    if (blockedDay) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (deliveryInfo.deliveryDate) {
        try {
          const deliveryDate = new Date(deliveryInfo.deliveryDate);
          deliveryDate.setHours(0, 0, 0, 0);
          
          // If delivery date is in the future, allow the order
          if (deliveryDate > now) {
            console.log('✅ Future delivery date allowed even if today is blocked');
            // Continue with order
          } else {
            // Delivery date is today or past, block the order
            alert(blockedDay.message || 'Bu özel günde sipariş alımı kapalıdır.');
            return;
          }
        } catch (error) {
          // If parsing fails, block the order
          alert(blockedDay.message || 'Bu özel günde sipariş alımı kapalıdır.');
          return;
        }
      } else {
        // No delivery date set, block the order
        alert(blockedDay.message || 'Bu özel günde sipariş alımı kapalıdır.');
        return;
      }
    }

    // Validate invoice info if needed - sessizce devam et, eksik bilgiler varsa fatura bilgilerini gönderme
    if (invoiceInfo.needInvoice) {
      // TC/Vergi No validasyonu - eksikse fatura bilgilerini gönderme
      if (!invoiceInfo.taxNumber || 
          (invoiceInfo.invoiceType === 'individual' && invoiceInfo.taxNumber.length !== 11) ||
          (invoiceInfo.invoiceType === 'corporate' && invoiceInfo.taxNumber.length !== 10 && invoiceInfo.taxNumber.length !== 11) ||
          (invoiceInfo.invoiceType === 'corporate' && (!invoiceInfo.companyName || !invoiceInfo.taxOffice)) ||
          !invoiceInfo.address || !invoiceInfo.city || !invoiceInfo.district) {
        // Fatura bilgileri eksik - fatura olmadan devam et
        setInvoiceInfo({ ...invoiceInfo, needInvoice: false });
      }
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        recipient: recipientInfo,
        sender: senderInfo,
        delivery: deliveryInfo,
        invoice: invoiceInfo.needInvoice ? invoiceInfo : null, // Sadece fatura istiyorsa ekle
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          variantId: item.variantId,
          variantName: item.variantName,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        shippingMethod: 'standard' // Varsayılan teslimat yöntemi
      };

      // Basit sipariş numarası oluştur (4 haneli)
      const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
      
      // ÖNEMLİ: Ödeme ekranına geçmeden önce tüm bilgileri admin panelinde kaydet
      // Bu sayede ödeme tamamlanmasa bile sipariş bilgileri admin panelinde görünecek
      const orderToSave = {
        ...orderData,
        orderNumber,
        paymentMethod,
        shippingMethod: 'standard', // Varsayılan teslimat yöntemi
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Tüm ödeme yöntemleri için önce siparişi kaydet
      const saveOrderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderToSave),
      });

      if (!saveOrderResponse.ok) {
        // Sessizce devam et - hata durumunda bile WhatsApp mesajı gönderilmeye çalışılır
        // return;
      }

      // Sipariş kaydedildi
      
      // Handle payment based on method
      if (paymentMethod === 'whatsapp') {
        // WhatsApp payment - sipariş zaten kaydedildi, sadece WhatsApp mesajı gönder

        // Send WhatsApp message (order already saved above)
        // Düzenli ve eksiksiz WhatsApp mesajı oluştur
        let whatsappMessage = `🎉 YENİ ÇELENK SİPARİŞİ\n` +
          `═══════════════════════════════════\n\n` +
          
          `📋 SİPARİŞ BİLGİLERİ:\n` +
          `• Sipariş No: ${orderNumber}\n` +
          `• Sipariş Tarihi: ${new Date().toLocaleString('tr-TR')}\n` +
          `• Ödeme Yöntemi: WhatsApp İletişim\n\n` +
          
          `👤 ALICI BİLGİLERİ:\n` +
          `• Ad Soyad: ${recipientInfo.firstName || ''} ${recipientInfo.lastName || ''}\n` +
          `• Telefon: ${recipientInfo.phone || 'Belirtilmemiş'}\n` +
          `• Teslimat Yeri: ${recipientInfo.deliveryLocation || 'Belirtilmemiş'}\n` +
          `• Adres: ${recipientInfo.deliveryAddress || 'Belirtilmemiş'}\n\n` +
          
          `👤 GÖNDERİCİ BİLGİLERİ:\n` +
          `• Ad Soyad: ${senderInfo.firstName || ''} ${senderInfo.lastName || ''}\n` +
          `• Telefon: ${senderInfo.phone || 'Belirtilmemiş'}\n` +
          `• E-posta: ${senderInfo.email || 'Belirtilmemiş'}\n`;
        
        // Çelenk yazısı varsa ekle
        if (senderInfo.wreathText && senderInfo.wreathText.trim() !== '') {
          whatsappMessage += `• Çelenk Yazısı: ${senderInfo.wreathText}\n`;
        }
        
        // Ek bilgi varsa ekle
        if (senderInfo.additionalInfo && senderInfo.additionalInfo.trim() !== '') {
          whatsappMessage += `• Ek Bilgi: ${senderInfo.additionalInfo}\n`;
        }
        
        whatsappMessage += `\n🚚 TESLİMAT BİLGİLERİ:\n` +
          `• Şehir: ${deliveryInfo.city || 'Belirtilmemiş'}\n` +
          `• İlçe/Semt: ${deliveryInfo.district || 'Belirtilmemiş'}\n` +
          `• Teslimat Tarihi: ${deliveryInfo.deliveryDate || 'Belirtilmemiş'}\n` +
          `• Teslimat Saati: ${deliveryInfo.deliveryTime || 'Belirtilmemiş'}\n` +
          `• Teslimat Yeri: ${deliveryInfo.deliveryLocation || 'Belirtilmemiş'}\n`;
        
        // Teslimat adresi varsa ekle (recipientInfo'dan al)
        if (recipientInfo.deliveryAddress && recipientInfo.deliveryAddress.trim() !== '') {
          whatsappMessage += `• Teslimat Adresi: ${recipientInfo.deliveryAddress}\n`;
        }
        
        whatsappMessage += `\n🛒 SİPARİŞ DETAYLARI:\n`;
        
        // Her ürün için detaylı bilgi
        cartItems.forEach((item, index) => {
          whatsappMessage += `\n${index + 1}. ${item.name || 'Ürün'}\n`;
          whatsappMessage += `   • Miktar: ${item.quantity} adet\n`;
          whatsappMessage += `   • Birim Fiyat: ₺${item.price.toFixed(2)}\n`;
          whatsappMessage += `   • Toplam: ₺${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        whatsappMessage += `\n💰 FİYAT DETAYLARI:\n` +
          `• Ara Toplam: ₺${subtotal.toFixed(2)}\n` +
          `• Kargo Ücreti: ₺${shippingCost.toFixed(2)}\n` +
          `• Toplam Tutar: ₺${total.toFixed(2)}\n`;

        // Fatura bilgilerini ekle (eğer isteniyorsa)
        if (invoiceInfo.needInvoice) {
          whatsappMessage += `\n📄 FATURA BİLGİLERİ:\n` +
            `• Fatura İsteniyor: Evet\n` +
            `• Fatura Tipi: ${invoiceInfo.invoiceType === 'individual' ? 'Bireysel' : 'Kurumsal'}\n`;
          
          if (invoiceInfo.invoiceType === 'corporate') {
            whatsappMessage += `• Firma Adı: ${invoiceInfo.companyName || 'Belirtilmemiş'}\n` +
              `• Vergi Dairesi: ${invoiceInfo.taxOffice || 'Belirtilmemiş'}\n`;
          }
          
          whatsappMessage += `• ${invoiceInfo.invoiceType === 'individual' ? 'TC Kimlik No' : 'Vergi No'}: ${invoiceInfo.taxNumber || 'Belirtilmemiş'}\n` +
            `• Fatura Adresi: ${invoiceInfo.address || 'Belirtilmemiş'}\n` +
            `• İl: ${invoiceInfo.city || 'Belirtilmemiş'}\n` +
            `• İlçe: ${invoiceInfo.district || 'Belirtilmemiş'}\n`;
          
          if (invoiceInfo.postalCode && invoiceInfo.postalCode.trim() !== '') {
            whatsappMessage += `• Posta Kodu: ${invoiceInfo.postalCode}\n`;
          }
        } else {
          whatsappMessage += `\n📄 FATURA BİLGİLERİ:\n` +
            `• Fatura İsteniyor: Hayır\n`;
        }

        whatsappMessage += `\n═══════════════════════════════════\n` +
          `📞 İletişim için bu numaradan ulaşabilirsiniz.\n` +
          `Teşekkür ederiz! 🌹`;

        const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        // Redirect to success page with payment method info
        window.location.href = `/payment/success?merchant_oid=${orderNumber}&payment_method=whatsapp`;
      } else if (paymentMethod === 'credit_card') {
        // PayTR integration for credit card payments - sipariş zaten kaydedildi, ödeme işlemini başlat
        try {
          const paymentResponse = await fetch('/api/payments/paytr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...orderToSave,
              orderNumber
            }),
          });

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            
            if (paymentResult.success) {
              // Redirect to PayTR payment page
              window.location.href = paymentResult.iframeUrl;
            } else {
              // Ödeme başlatılamadı - WhatsApp ile devam et
              setPaymentMethod('whatsapp');
            }
          } else {
            // Ödeme başlatılamadı - WhatsApp ile devam et
            setPaymentMethod('whatsapp');
          }
        } catch (paymentError) {
          // Sessizce devam et - WhatsApp ile devam et
          setPaymentMethod('whatsapp');
        }
      } else if (paymentMethod === 'bank_transfer') {
        // Havale/EFT - sipariş zaten kaydedildi
        // WhatsApp mesajı API'de gönderilecek, burada sadece yönlendir
        setOrderNumber(orderNumber);
        setOrderSuccess(true);
        clearCart();
        
        // Başarı sayfasına yönlendir
        window.location.href = `/payment/success?merchant_oid=${orderNumber}&payment_method=bank_transfer`;
      }

    } catch (error) {
      // Sessizce devam et - hata durumunda bile başarı mesajı göster
      setOrderSuccess(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-6">Sipariş vermek için önce ürün ekleyin</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Alışverişe Devam Et
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h2>
            <p className="text-gray-600 mb-4">
              Sipariş numaranız: <span className="font-bold text-green-600">{orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Siparişiniz en kısa sürede hazırlanacak ve size ulaştırılacaktır.
            </p>
            <div className="space-y-2">
              <Link href="/">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Ana Sayfaya Dön
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Alışverişe Devam Et
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/cart">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sepete Dön
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Çelenk Gönder - Sipariş Ver</h1>
          </div>

          {/* Özel Gün Uyarısı */}
          {blockedDay && (
            <Card className="mb-6 border-red-500 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">
                      {blockedDay.name || 'Özel Gün'}
                    </h3>
                    <p className="text-sm text-red-700 mb-2">
                      {blockedDay.message}
                    </p>
                    <p className="text-xs text-red-600">
                      Bugün sipariş alımı: {new Date(blockedDay.endDate).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} tarihine kadar kapalıdır.
                    </p>
                    {deliveryInfo.deliveryDate && (() => {
                      try {
                        const deliveryDate = new Date(deliveryInfo.deliveryDate);
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        deliveryDate.setHours(0, 0, 0, 0);
                        
                        if (deliveryDate > now) {
                          return (
                            <p className="text-xs text-green-600 mt-2 font-semibold">
                              ✅ İleri tarihli siparişler alınabilir. Seçtiğiniz teslimat tarihi: {deliveryDate.toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          );
                        }
                      } catch (error) {
                        return null;
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Teslimat Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Teslimat Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gönderilecek Şehir *
                      </label>
                      <select
                        value={deliveryInfo.city}
                        onChange={(e) => {
                          setDeliveryInfo(prev => ({ 
                            ...prev, 
                            city: e.target.value,
                            district: '' // Şehir değiştiğinde ilçeyi sıfırla
                          }));
                        }}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Şehir seçin</option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İlçe *
                      </label>
                      <select
                        value={deliveryInfo.district}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, district: e.target.value }))}
                        required
                        disabled={!deliveryInfo.city}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">İlçe seçin</option>
                        {deliveryInfo.city && getDistrictsByCity(deliveryInfo.city).map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gönderilecek Tarih *
                      </label>
                      <Input
                        type="date"
                        value={deliveryInfo.deliveryDate}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gönderilecek Saat *
                      </label>
                      <select
                        value={deliveryInfo.deliveryTime}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, deliveryTime: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Saat seçin</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const hour = 11 + i;
                          const timeValue = `${hour.toString().padStart(2, '0')}:00`;
                          return (
                            <option key={timeValue} value={timeValue}>
                              {timeValue}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teslimat Yapılacak Yer *
                    </label>
                    <select
                      value={deliveryInfo.deliveryLocation}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base bg-white cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Seçiniz</option>
                      <option value="açılış">Açılış</option>
                      <option value="cenaze">Cenaze</option>
                      <option value="fuar">Fuar</option>
                      <option value="kilise">Kilise</option>
                      <option value="camii">Camii</option>
                      <option value="cemevi">Cemevi</option>
                      <option value="düğün salonu">Düğün Salonu</option>
                      <option value="ev">Ev</option>
                      <option value="hastane">Hastane</option>
                      <option value="işyeri">İşyeri</option>
                      <option value="ofis">Ofis</option>
                      <option value="otel">Otel</option>
                      <option value="okul">Okul</option>
                      <option value="spor salonu">Spor Salonu</option>
                      <option value="konser salonu">Konser Salonu</option>
                      <option value="kongre merkezi">Kongre Merkezi</option>
                      <option value="kültür merkezi">Kültür Merkezi</option>
                      <option value="nikah dairesi">Nikah Dairesi</option>
                      <option value="sinema">Sinema</option>
                      <option value="tiyatro">Tiyatro</option>
                      <option value="müze">Müze</option>
                      <option value="galeri">Galeri</option>
                      <option value="restoran">Restoran</option>
                      <option value="cafe">Cafe</option>
                      <option value="bar">Bar</option>
                      <option value="diğer">Diğer</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Alıcı Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Alıcı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad *
                      </label>
                      <Input
                        value={recipientInfo.firstName}
                        onChange={(e) => setRecipientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soyad *
                      </label>
                      <Input
                        value={recipientInfo.lastName}
                        onChange={(e) => setRecipientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <Input
                      type="tel"
                      value={recipientInfo.phone}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teslimat Yapılacak Yerin Adı *
                    </label>
                    <select
                      value={recipientInfo.deliveryLocation}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                      required
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="açılış">Açılış</option>
                      <option value="cenaze">Cenaze</option>
                      <option value="fuar">Fuar</option>
                      <option value="kilise">Kilise</option>
                      <option value="camii">Camii</option>
                      <option value="cemevi">Cemevi</option>
                      <option value="düğün salonu">Düğün Salonu</option>
                      <option value="ev">Ev</option>
                      <option value="hastane">Hastane</option>
                      <option value="işyeri">İşyeri</option>
                      <option value="ofis">Ofis</option>
                      <option value="otel">Otel</option>
                      <option value="okul">Okul</option>
                      <option value="spor salonu">Spor Salonu</option>
                      <option value="konser salonu">Konser Salonu</option>
                      <option value="kongre merkezi">Kongre Merkezi</option>
                      <option value="kültür merkezi">Kültür Merkezi</option>
                      <option value="nikah dairesi">Nikah Dairesi</option>
                      <option value="sinema">Sinema</option>
                      <option value="tiyatro">Tiyatro</option>
                      <option value="müze">Müze</option>
                      <option value="galeri">Galeri</option>
                      <option value="restoran">Restoran</option>
                      <option value="cafe">Cafe</option>
                      <option value="bar">Bar</option>
                      <option value="diğer">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gönderilecek Adres *
                    </label>
                    <Input
                      value={recipientInfo.deliveryAddress}
                      onChange={(e) => setRecipientInfo(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gönderici Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Gönderici Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad *
                      </label>
                      <Input
                        value={senderInfo.firstName}
                        onChange={(e) => setSenderInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soyad *
                      </label>
                      <Input
                        value={senderInfo.lastName}
                        onChange={(e) => setSenderInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon *
                      </label>
                      <Input
                        type="tel"
                        value={senderInfo.phone}
                        onChange={(e) => setSenderInfo(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <Input
                        type="email"
                        value={senderInfo.email}
                        onChange={(e) => setSenderInfo(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çelenk Üzerine Yazılacak Yazı *
                    </label>
                    <Input
                      value={senderInfo.wreathText}
                      onChange={(e) => setSenderInfo(prev => ({ ...prev, wreathText: e.target.value }))}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ek Bilgi (Varsa)
                    </label>
                    <Input
                      value={senderInfo.additionalInfo || ''}
                      onChange={(e) => setSenderInfo(prev => ({ ...prev, additionalInfo: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ödeme Yöntemi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { value: 'credit_card', label: 'Kredi Kartı', desc: 'Güvenli online ödeme' },
                      { value: 'bank_transfer', label: 'Havale/EFT', desc: 'Banka havalesi ile ödeme' },
                      { value: 'whatsapp', label: 'WhatsApp ile İletişim', desc: 'Diğer ödeme yöntemleri için bizimle iletişime geçin' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value as 'credit_card' | 'whatsapp' | 'bank_transfer')}
                          className="text-green-600"
                        />
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-gray-500">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {/* Havale/EFT Bilgisi */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-bold">🏦</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-800 mb-2">Havale/EFT ile Ödeme</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Siparişinizi tamamladıktan sonra sipariş numaranızı alacaksınız. Havale/EFT yaparken sipariş numaranızı açıklama kısmına yazmanızı rica ederiz.
                          </p>
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600 mb-2 font-semibold">Banka Bilgileri:</p>
                            {settings?.business?.bankTransferInfo ? (
                              <ul className="text-sm text-gray-600 space-y-1">
                                {settings.business.bankTransferInfo.bankName && (
                                  <li>• Banka: {settings.business.bankTransferInfo.bankName}</li>
                                )}
                                {settings.business.bankTransferInfo.iban && (
                                  <li>• IBAN: {settings.business.bankTransferInfo.iban}</li>
                                )}
                                {settings.business.bankTransferInfo.accountHolder && (
                                  <li>• Hesap Sahibi: {settings.business.bankTransferInfo.accountHolder}</li>
                                )}
                                {settings.business.bankTransferInfo.branchName && (
                                  <li>• Şube: {settings.business.bankTransferInfo.branchName}</li>
                                )}
                                {settings.business.bankTransferInfo.accountNumber && (
                                  <li>• Hesap No: {settings.business.bankTransferInfo.accountNumber}</li>
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">Banka bilgileri henüz eklenmemiş.</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Ödeme yaptıktan sonra sipariş numaranızı WhatsApp ile bize iletmeniz gerekmektedir.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp İletişim Bilgisi */}
                  {paymentMethod === 'whatsapp' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-bold">📱</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800 mb-2">WhatsApp ile İletişim</h4>
                          <p className="text-sm text-green-700 mb-3">
                            Havale ile ödeme yapmak istiyorsanız, aşağıdaki numaraya WhatsApp mesajı gönderin:
                          </p>
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-2">Mesajınızda şunları belirtin:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Seçtiğiniz ürünler</li>
                              <li>• Ödeme yöntemi (Havale)</li>
                              <li>• Teslimat adresiniz</li>
                            </ul>
                          </div>
                          <div className="mt-3">
                            <a
                              href={`https://wa.me/${whatsappPhoneNumber}?text=Merhaba, ${cartItems.map(item => item.name).join(', ')} ürünlerini havale ile ödeme yapmak istiyorum.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <span className="mr-2">📱</span>
                              WhatsApp&apos;ta Mesaj Gönder
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fatura Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Fatura Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="needInvoice"
                      checked={invoiceInfo.needInvoice}
                      onChange={(e) => setInvoiceInfo(prev => ({ ...prev, needInvoice: e.target.checked }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="needInvoice" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Fatura istiyorum
                    </label>
                  </div>

                  {invoiceInfo.needInvoice && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {/* Fatura Tipi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fatura Tipi *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="invoiceType"
                              value="individual"
                              checked={invoiceInfo.invoiceType === 'individual'}
                              onChange={(e) => setInvoiceInfo(prev => ({ ...prev, invoiceType: e.target.value as 'individual' | 'corporate' }))}
                              className="text-green-600"
                            />
                            <span className="text-sm font-medium">Bireysel</span>
                          </label>
                          <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="invoiceType"
                              value="corporate"
                              checked={invoiceInfo.invoiceType === 'corporate'}
                              onChange={(e) => setInvoiceInfo(prev => ({ ...prev, invoiceType: e.target.value as 'individual' | 'corporate' }))}
                              className="text-green-600"
                            />
                            <span className="text-sm font-medium">Kurumsal</span>
                          </label>
                        </div>
                      </div>

                      {/* Kurumsal Fatura Alanları */}
                      {invoiceInfo.invoiceType === 'corporate' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Firma Adı *
                            </label>
                            <Input
                              value={invoiceInfo.companyName}
                              onChange={(e) => setInvoiceInfo(prev => ({ ...prev, companyName: e.target.value }))}
                              required={invoiceInfo.needInvoice && invoiceInfo.invoiceType === 'corporate'}
                              className="rounded-xl"
                              placeholder="Firma adını girin"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vergi Dairesi *
                              </label>
                              <Input
                                value={invoiceInfo.taxOffice}
                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, taxOffice: e.target.value }))}
                                required={invoiceInfo.needInvoice && invoiceInfo.invoiceType === 'corporate'}
                                className="rounded-xl"
                                placeholder="Vergi dairesini girin"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vergi Numarası / TC Kimlik No *
                              </label>
                              <Input
                                value={invoiceInfo.taxNumber}
                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, taxNumber: e.target.value.replace(/\D/g, '').slice(0, invoiceInfo.invoiceType === 'corporate' ? 10 : 11) }))}
                                required={invoiceInfo.needInvoice}
                                className="rounded-xl"
                                placeholder={invoiceInfo.invoiceType === 'corporate' ? 'Vergi numarası (10 haneli)' : 'TC Kimlik No'}
                                maxLength={invoiceInfo.invoiceType === 'corporate' ? 10 : 11}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Bireysel Fatura Alanları */}
                      {invoiceInfo.invoiceType === 'individual' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            TC Kimlik No *
                          </label>
                          <Input
                            value={invoiceInfo.taxNumber}
                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, taxNumber: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                            required={invoiceInfo.needInvoice && invoiceInfo.invoiceType === 'individual'}
                            className="rounded-xl"
                            placeholder="TC Kimlik Numaranızı girin"
                            maxLength={11}
                          />
                        </div>
                      )}

                      {/* Fatura Adresi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fatura Adresi *
                        </label>
                        <Input
                          value={invoiceInfo.address}
                          onChange={(e) => setInvoiceInfo(prev => ({ ...prev, address: e.target.value }))}
                          required={invoiceInfo.needInvoice}
                          className="rounded-xl"
                          placeholder="Mahalle, Sokak, Bina No, Daire No"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            İl *
                          </label>
                          <select
                            value={invoiceInfo.city}
                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, city: e.target.value, district: '' }))}
                            required={invoiceInfo.needInvoice}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="">İl seçin</option>
                            {cities.map((city) => (
                              <option key={city.name} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            İlçe *
                          </label>
                          <select
                            value={invoiceInfo.district}
                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, district: e.target.value }))}
                            required={invoiceInfo.needInvoice}
                            disabled={!invoiceInfo.city}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">İlçe seçin</option>
                            {invoiceInfo.city && getDistrictsByCity(invoiceInfo.city).map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Posta Kodu
                          </label>
                          <Input
                            value={invoiceInfo.postalCode}
                            onChange={(e) => setInvoiceInfo(prev => ({ ...prev, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                            className="rounded-xl"
                            placeholder="34000"
                            maxLength={5}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.variantId || 'default'}`} className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          {item.variantName && (
                            <p className="text-xs text-gray-500">{item.variantName}</p>
                          )}
                          <p className="text-xs text-gray-500">Adet: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} ₺
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ara Toplam:</span>
                      <span>{subtotal.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kargo:</span>
                      <span>{shippingCost.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Toplam:</span>
                      <span className="text-green-600">{total.toFixed(2)} ₺</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl"
                  >
                    {isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
