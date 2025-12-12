'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
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
}

interface InvoiceInfo {
  needInvoice: boolean;
  invoiceType: 'individual' | 'corporate';
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
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

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }

    if (!recipientInfo.firstName || !recipientInfo.lastName || !recipientInfo.phone) {
      alert('Lütfen alıcı bilgilerini tam olarak doldurun!');
      return;
    }

    if (!senderInfo.firstName || !senderInfo.lastName || !senderInfo.phone || !senderInfo.email) {
      alert('Lütfen gönderici bilgilerini tam olarak doldurun!');
      return;
    }

    if (!deliveryInfo.city || !deliveryInfo.district || !deliveryInfo.deliveryDate || !deliveryInfo.deliveryTime) {
      alert('Lütfen teslimat bilgilerini tam olarak doldurun!');
      return;
    }

    // Store form data in localStorage to pass to checkout
    const formData = {
      recipient: recipientInfo,
      sender: senderInfo,
      delivery: deliveryInfo,
      invoice: invoiceInfo
    };
    
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    
    // Redirect to checkout page
    window.location.href = '/checkout';
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
            <Link href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Alışverişe Devam Et
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Sepetim ({getTotalItems()} ürün)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variantId || 'default'}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                            className="object-contain"
                        />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.variantName && (
                          <p className="text-sm text-gray-500">{item.variantName}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          ₺{item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      <Button
                          variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                              className="object-contain"
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
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ara Toplam:</span>
                      <span>₺{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Toplam:</span>
                      <span className="text-green-600">₺{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Proceed to Checkout Button */}
            <Button
                    onClick={handleProceedToCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl"
                  >
                    {isSubmitting ? 'Yönlendiriliyor...' : 'Ödemeye Geç'}
            </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}