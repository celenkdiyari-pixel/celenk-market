'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  CheckCircle,
  Truck,
  ShieldCheck,
  Building2,
  Wallet,
  Send
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { DELIVERY_PLACES, DELIVERY_TIME_SLOTS } from '@/lib/constants';

// export const dynamic = 'force-dynamic'; // Removed for speed (Static Shell)

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface RecipientInfo {
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  notes: string;
  deliveryTime: string;
  deliveryDate: string;
  deliveryPlaceType: string;
  wreathText: string;
}

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();

  // Error State
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Sender (Ödeyen/Gönderen)
  const [senderInfo, setSenderInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  });

  // Recipient (Alıcı)
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    name: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    notes: '',
    deliveryDate: new Date().toISOString().split('T')[0], // Default to today
    deliveryTime: '',
    deliveryPlaceType: 'Ev',
    wreathText: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'transfer'>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'paytr_iframe_resize') {
        // Handle resize if needed
      }
    };
    window.addEventListener('message', handleMessage);

    // TASK-03: Restore Session from local storage
    const savedSession = localStorage.getItem('paytr_active_session');
    if (savedSession) {
      try {
        const { token, orderNumber, timestamp } = JSON.parse(savedSession);
        // Token valid for 30 minutes
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setPaytrToken(token);
          setOrderId(orderNumber);
        } else {
          localStorage.removeItem('paytr_active_session');
        }
      } catch (e) {
        console.error('Failed to restore PayTR session');
      }
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Sender validation
    if (!senderInfo.name) newErrors['senderName'] = true;
    if (!senderInfo.phone) newErrors['senderPhone'] = true;
    if (!senderInfo.email) newErrors['senderEmail'] = true;
    else if (!emailRegex.test(senderInfo.email)) {
      newErrors['senderEmail'] = true;
      toast.error('Geçerli bir e-posta adresi giriniz.');
    }

    if (senderInfo.phone && senderInfo.phone.replace(/\D/g, '').length < 10) {
      newErrors['senderPhone'] = true;
      toast.error('Geçerli bir telefon numarası giriniz.');
    }

    // Recipient validation
    if (!recipientInfo.name) newErrors['recipientName'] = true;
    if (!recipientInfo.phone) newErrors['recipientPhone'] = true;
    if (!recipientInfo.district) newErrors['recipientDistrict'] = true;
    if (!recipientInfo.address) newErrors['recipientAddress'] = true;
    if (!recipientInfo.deliveryPlaceType) newErrors['recipientPlace'] = true;
    if (!recipientInfo.deliveryDate) newErrors['recipientDate'] = true;
    if (!recipientInfo.deliveryTime) newErrors['recipientTime'] = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Lütfen eksik alanları doldurunuz.');

      // Auto-scroll to first error (simple logic)
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  };

  const generateOrderNumber = () => {
    // Generate empty or unique ID holder if needed, but backend will define it
    // For manual flow, we might still want to show a temporary UI or wait for response
    return "";
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const total = getTotalPrice();

      // Common payload structure - OrderNumber removed here, backend will generate
      const payload = {
        customer: {
          firstName: senderInfo.name.split(' ')[0],
          lastName: senderInfo.name.split(' ').slice(1).join(' '),
          name: senderInfo.name,
          email: senderInfo.email,
          phone: senderInfo.phone,
          address: recipientInfo.address
        },
        sender: senderInfo,
        recipient: recipientInfo,
        items: cartItems,
        total,
        deliveryAddress: {
          city: recipientInfo.city,
          district: recipientInfo.district,
          fullAddress: recipientInfo.address,
        },
        notes: recipientInfo.notes,
        shippingCost: 0, // Free shipping as per UI
        delivery_time: recipientInfo.deliveryTime,
        delivery_date: recipientInfo.deliveryDate,
        delivery_place_type: recipientInfo.deliveryPlaceType,
        wreath_text: recipientInfo.wreathText,
      };

      if (paymentMethod === 'credit_card') {
        // PayTR Flow
        console.log('💳 Initiating PayTR payment...', payload);
        // Google Ads Enhanced Conversions için verileri kaydet
        localStorage.setItem('gads_user_data', JSON.stringify({
          email: senderInfo.email,
          phone: senderInfo.phone,
          firstName: senderInfo.name.split(' ')[0],
          lastName: senderInfo.name.split(' ').slice(1).join(' '),
          address: recipientInfo.address,
          city: recipientInfo.city,
          district: recipientInfo.district,
          value: total
        }));

        const response = await fetch('/api/payments/paytr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.token) {
          setPaytrToken(data.token);
          setOrderId(data.orderNumber);
          // TASK-03: Persist session to survive refresh
          localStorage.setItem('paytr_active_session', JSON.stringify({
            token: data.token,
            orderNumber: data.orderNumber,
            timestamp: Date.now()
          }));
        } else {
          console.error('PayTR Error Detail:', data);
          const errorMsg = data.reason || data.error || (typeof data === 'object' ? JSON.stringify(data) : 'Bilinmeyen hata');
          alert('Ödeme sistemi başlatılamadı: ' + errorMsg);
        }

      } else {
        // Bank Transfer / Cash Flow
        console.log('📦 Creating standard order...');
        const orderData = {
          ...payload,
          paymentMethod: 'transfer',
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const result = await response.json();
          setOrderId(result.orderNumber);
          setOrderSuccess(true);
          clearCart();

          // WhatsApp Yönlendirmesi
          const waPhoneNumber = "905321378160"; // İletişim numarası
          const waMessage = `*Yeni Sipariş - Havale/EFT*

*Sipariş No:* ${result.orderNumber}

*GÖNDERİCİ BİLGİLERİ*
Ad Soyad: ${senderInfo.name}
Telefon: ${senderInfo.phone}
E-posta: ${senderInfo.email}

*ALICI BİLGİLERİ*
Ad Soyad: ${recipientInfo.name}
Telefon: ${recipientInfo.phone}
Şehir/İlçe: ${recipientInfo.city} / ${recipientInfo.district}
Adres: ${recipientInfo.address}
Not: ${recipientInfo.notes || 'Yok'}
Kuşak Yazısı: ${recipientInfo.wreathText || 'Belirtilmedi'}

*SİPARİŞ DETAYLARI*
${cartItems.map(item => `${item.name} x${item.quantity}`).join('\n')}

*Tutar:* ₺${getTotalPrice()}

Siparişimi oluşturdum, ödeme için IBAN bilgisi alabilir miyim?`;

          const waUrl = `https://wa.me/${waPhoneNumber}?text=${encodeURIComponent(waMessage)}`;
          window.open(waUrl, '_blank');

        } else {
          const errorData = await response.json();
          alert(`Sipariş oluşturulamadı: ${errorData.error || 'Hata'}`);
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 shadow-xl rounded-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-gray-600 mb-6">
            Sipariş numaranız: <span className="font-mono font-bold text-gray-900">{orderId}</span>
          </p>
          <div className="bg-green-50 p-6 rounded-xl text-green-800 mb-8 text-center space-y-4 border border-green-100">
            <div className="flex flex-col items-center gap-2">
              <Building2 className="w-8 h-8 text-green-600 mb-1" />
              <h4 className="font-bold text-lg">Ödeme Bekleniyor</h4>
            </div>
            <p className="text-sm opacity-90">
              Siparişinizin onaylanması için ödeme işlemini tamamlamanız gerekmektedir.
              Aşağıdaki butona tıklayarak WhatsApp hattımızdan IBAN bilgilerini hızlıca alabilirsiniz.
            </p>
            <Button
              className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full font-bold shadow-lg hover:shadow-xl transition-all h-12 text-base"
              onClick={() => window.open(`https://wa.me/905321378160?text=${encodeURIComponent(`Merhaba, ${orderId} numaralı siparişim için ödeme/IBAN bilgisi alabilir miyim?`)}`, '_blank')}
            >
              <Send className="w-5 h-5 mr-2" />
              WhatsApp'tan IBAN İste
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl">
                Ana Sayfaya Dön
              </Button>
            </Link>
            <Link href="/siparis-takip">
              <Button variant="outline" className="w-full h-12 rounded-xl text-gray-600 border-gray-300 hover:bg-gray-50">
                <Truck className="w-4 h-4 mr-2" />
                Siparişimi Takip Et
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (paytrToken) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => {
            setPaytrToken(null);
            localStorage.removeItem('paytr_active_session');
          }} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
          </Button>
          <Card className="w-full overflow-hidden shadow-2xl rounded-2xl">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-green-600" /> Güvenli Ödeme Sayfası
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                className="w-full min-h-[600px] border-0"
                id="paytriframe"
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h1>
        <p className="text-gray-500 mb-8">Henüz sepetinize ürün eklemediniz.</p>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700 px-8 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all">
            Alışverişe Başla
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sepet ve Sipariş</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Cart Items & Forms (Span 7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Cart Items */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Sepetim ({getTotalItems()} Ürün)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="relative w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                      <Image
                        src={item.image || '/images/logo.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">{item.name}</h3>
                          <p className="font-bold text-green-600 text-lg">₺{item.price}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 p-2 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 2. Sender Information Form */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Gönderici Bilgileri (Siz)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Ad Soyad *</Label>
                    <Input
                      placeholder="Adınız Soyadınız"
                      value={senderInfo.name}
                      onChange={(e) => setSenderInfo({ ...senderInfo, name: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Telefon *</Label>
                    <Input
                      placeholder="05XX..."
                      value={senderInfo.phone}
                      onChange={(e) => setSenderInfo({ ...senderInfo, phone: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>E-posta *</Label>
                    <Input
                      placeholder="email@ornek.com"
                      value={senderInfo.email}
                      onChange={(e) => setSenderInfo({ ...senderInfo, email: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Recipient Information Form */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-600" />
                  Alıcı Bilgileri (Teslim Edilecek Kişi)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Alıcı Adı Soyadı *</Label>
                    <Input
                      placeholder="Kime teslim edilecek?"
                      value={recipientInfo.name}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, name: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Alıcı Telefon *</Label>
                    <Input
                      placeholder="05XX..."
                      value={recipientInfo.phone}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, phone: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Şehir</Label>
                    <Input
                      placeholder="İl"
                      value={recipientInfo.city}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, city: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>İlçe *</Label>
                    <Input
                      placeholder="Örn: Kadıköy"
                      value={recipientInfo.district}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, district: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Açık Adres *</Label>
                    <Textarea
                      placeholder="Mahalle, Sokak, Kapı No, Tarif..."
                      className="min-h-[80px] rounded-xl bg-gray-50 border-gray-200 resize-none"
                      value={recipientInfo.address}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, address: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Sipariş Notu (Karta yazılacak not vb.)</Label>
                    <Input
                      placeholder="İletmek istediğiniz not..."
                      value={recipientInfo.notes}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, notes: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Kuşak Yazısı (Çelenk Üzerine Yazılacak İsim/Firma)</Label>
                    <Input
                      placeholder="Örn: X Ailesi, Y Şirketi"
                      value={recipientInfo.wreathText}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, wreathText: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Teslimat Yeri *</Label>
                    <select
                      value={recipientInfo.deliveryPlaceType}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, deliveryPlaceType: e.target.value })}
                      className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      {DELIVERY_PLACES.map((place) => (
                        <option key={place} value={place}>{place}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Teslimat Tarihi *</Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={recipientInfo.deliveryDate}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, deliveryDate: e.target.value })}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Label>Teslimat Saati (09:00 - 22:00) *</Label>
                    <select
                      value={recipientInfo.deliveryTime}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, deliveryTime: e.target.value })}
                      className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 px-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      <option value="" disabled className="text-gray-500">Lütfen Saati Seçiniz</option>
                      {DELIVERY_TIME_SLOTS.filter(slot => {
                        // 1. Get selected date and today's date strings (YYYY-MM-DD)
                        const selectedDateStr = recipientInfo.deliveryDate;
                        const todayStr = new Date().toISOString().split('T')[0];

                        // 2. If selected date is AFTER today, show all slots
                        if (selectedDateStr > todayStr) return true;

                        // 3. If selected date is TODAY (or somehow before, which min-date prevents), filter past slots
                        if (selectedDateStr === todayStr) {
                          const now = new Date();
                          const currentHour = now.getHours();
                          const currentMinute = now.getMinutes();
                          const currentTotalMinutes = currentHour * 60 + currentMinute;

                          // Parse slot start time (e.g., "09:00" or "09:00 - 10:00")
                          const slotStartHour = parseInt(slot.split(':')[0], 10);
                          const slotStartMinute = 0; // Assume slots start at :00 for simplicity

                          const slotTotalMinutes = slotStartHour * 60 + slotStartMinute;

                          // Buffer time (e.g. 60 mins from now)
                          const bufferMinutes = 60;

                          return slotTotalMinutes > (currentTotalMinutes + bufferMinutes);
                        }

                        return true;
                      }).map((slot) => (
                        <option key={slot} value={slot} className="text-gray-900">{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 rounded-2xl p-6 flex gap-4 items-start border border-green-100">
              <Truck className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900">Güvenli ve Hızlı Teslimat</h4>
                <p className="text-green-700 text-sm mt-1">
                  Türkiye geneli tüm siparişleriniz özenle hazırlanıp en hızlı şekilde belirtilen adrese teslim edilir.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Method & Summary (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden sticky top-8">
              <CardHeader className="bg-gray-900 text-white py-6">
                <CardTitle className="flex items-center justify-between">
                  <span>Ödeme & Onay</span>
                  <span className="text-2xl font-bold">₺{getTotalPrice()}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Payment Method - Custom Implementation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Ödeme Yöntemi
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-green-600 bg-green-50/50' : 'border-gray-200 hover:border-green-200'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border border-gray-300 absolute right-3 top-3 flex items-center justify-center ${paymentMethod === 'credit_card' ? 'border-green-600' : ''}`}>
                        {paymentMethod === 'credit_card' && <div className="w-2 h-2 rounded-full bg-green-600" />}
                      </div>
                      <CreditCard className={`w-8 h-8 mb-2 ${paymentMethod === 'credit_card' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-bold text-sm">Kredi Kartı</span>
                      <span className="text-[10px] text-gray-500">Online & Güvenli</span>
                    </div>
                    <div
                      onClick={() => setPaymentMethod('transfer')}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-green-600 bg-green-50/50' : 'border-gray-200 hover:border-green-200'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border border-gray-300 absolute right-3 top-3 flex items-center justify-center ${paymentMethod === 'transfer' ? 'border-green-600' : ''}`}>
                        {paymentMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-green-600" />}
                      </div>
                      <Building2 className={`w-8 h-8 mb-2 ${paymentMethod === 'transfer' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-bold text-sm">Havale / EFT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>₺{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Kargo</span>
                    <span>Ücretsiz</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900">
                    <span>Toplam</span>
                    <span>₺{getTotalPrice()}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-lg font-bold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      İşleniyor...
                    </div>
                  ) : (
                    <span>Siparişi Tamamla (₺{getTotalPrice()})</span>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-gray-400 grayscale opacity-70">
                  {/* Payment Icons Placeholder */}
                  <span className="text-xs font-semibold">Güvenli Ödeme: PayTR</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
