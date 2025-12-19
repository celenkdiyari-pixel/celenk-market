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
import Image from 'next/image';

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
}

const generateTimeSlots = () => {
  const slots = [];
  let startHour = 11;
  let startMinute = 0;
  const endHour = 20;

  while (startHour < endHour || (startHour === endHour && startMinute === 0)) {
    const timeString = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

    let endH = startHour;
    let endM = startMinute + 30;
    if (endM >= 60) {
      endH += 1;
      endM = 0;
    }
    const endTimeString = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    slots.push(`${timeString} - ${endTimeString}`);

    startMinute += 30;
    if (startMinute >= 60) {
      startHour += 1;
      startMinute = 0;
    }
  }
  return slots;
};

const DELIVERY_TIME_SLOTS = generateTimeSlots();

const DELIVERY_PLACES = [
  'Ev',
  'İş Yeri',
  'Hastane',
  'Cami',
  'Düğün / Nikah Salonu',
  'Açılış / Tören Alanı',
  'Okul',
  'Otel',
  'Mezarlık',
  'Diğer'
];

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();

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
    city: 'İstanbul',
    district: '',
    address: '',
    notes: '',
    deliveryDate: new Date().toISOString().split('T')[0], // Default to today
    deliveryTime: DELIVERY_TIME_SLOTS[0],
    deliveryPlaceType: 'Ev'
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
    // Basic RegEx for email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Sender validation
    if (!senderInfo.name || !senderInfo.phone || !senderInfo.email) {
      alert('Lütfen gönderici bilgilerini eksiksiz doldurunuz (Ad Soyad, Telefon, E-posta).');
      return false;
    }

    if (!emailRegex.test(senderInfo.email)) {
      alert('Lütfen geçerli bir e-posta adresi giriniz.');
      return false;
    }

    if (senderInfo.phone.replace(/\D/g, '').length < 10) {
      alert('Lütfen geçerli bir telefon numarası giriniz (Başında 0 olmadan veya 05... şeklinde).');
      return false;
    }

    // Recipient validation
    if (!recipientInfo.name || !recipientInfo.phone || !recipientInfo.address || !recipientInfo.district || !recipientInfo.deliveryPlaceType) {
      alert('Lütfen alıcı bilgilerini eksiksiz doldurunuz (Ad, Telefon, Bölge, Adres, Teslimat Yeri).');
      return false;
    }
    return true;
  };

  const generateOrderNumber = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${datePart}-${randomPart}`;
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();
      const total = getTotalPrice();

      // Common payload structure
      const payload = {
        orderNumber,
        customer: { // PayTR expects 'customer' as the paying user
          firstName: senderInfo.name.split(' ')[0],
          lastName: senderInfo.name.split(' ').slice(1).join(' '),
          name: senderInfo.name,
          email: senderInfo.email,
          phone: senderInfo.phone,
          address: recipientInfo.address // PayTR requires an address, use delivery address
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
      };

      if (paymentMethod === 'credit_card') {
        // PayTR Flow
        console.log('💳 Initiating PayTR payment...', payload);
        const response = await fetch('/api/payments/paytr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.status === 'success' && data.token) {
          setPaytrToken(data.token);
        } else if (data.token) {
          // Some implementations return token even without explicit status='success' wrapper
          setPaytrToken(data.token);
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
          const waPhoneNumber = "905551234567"; // İletişim numarası
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
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 mb-8 text-left">
            <h4 className="font-bold mb-1 flex items-center"><Building2 className="w-4 h-4 mr-2" /> Banka Hesap Bilgileri:</h4>
            <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
            <p>Alıcı: Çelenk Diyarı</p>
            <p className="mt-2 text-xs opacity-75">* Lütfen açıklama kısmına sipariş numaranızı yazınız.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl">
                Ana Sayfaya Dön
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
          <Button variant="ghost" onClick={() => setPaytrToken(null)} className="mb-4">
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
                    <Label>Teslimat Zamanı Saat Aralığı *</Label>
                    <select
                      value={recipientInfo.deliveryTime}
                      onChange={(e) => setRecipientInfo({ ...recipientInfo, deliveryTime: e.target.value })}
                      className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 px-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      {DELIVERY_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 rounded-2xl p-6 flex gap-4 items-start border border-green-100">
              <Truck className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900">Ücretsiz Teslimat</h4>
                <p className="text-green-700 text-sm mt-1">
                  İstanbul içi tüm siparişlerinizde teslimat ücretsizdir. Siparişiniz özenle hazırlanıp belirtilen adrese teslim edilecektir.
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
                      <span className="text-[10px] text-gray-500">%5 İndirimli</span>
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
