'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Türkiye'
    },
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'bank_transfer'>('cash');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === 'express' ? 50 : shippingMethod === 'pickup' ? 0 : 25;
  const total = subtotal + shippingCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Sepetinizde ürün bulunmuyor');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customer: customerInfo,
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
        shippingMethod,
        notes: customerInfo.notes
      };

      // First create the order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        alert('Sipariş oluşturulurken hata oluştu: ' + error.error);
        return;
      }

      const orderResult = await orderResponse.json();
      setOrderNumber(orderResult.orderNumber);

      // Handle payment based on method
      if (paymentMethod === 'cash') {
        // Cash on delivery - no payment processing needed
        setOrderSuccess(true);
        clearCart();
      } else if (paymentMethod === 'credit_card') {
        // PayTR integration for credit card payments
        try {
          const paymentResponse = await fetch('/api/payments/paytr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...orderData,
              orderNumber: orderResult.orderNumber
            }),
          });

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            
            if (paymentResult.success) {
              // Redirect to PayTR payment page
              window.location.href = paymentResult.iframeUrl;
            } else {
              alert('Ödeme işlemi başlatılamadı: ' + paymentResult.error);
            }
          } else {
            const error = await paymentResponse.json();
            if (error.message === 'PayTR configuration pending') {
              // PayTR not configured yet, show success for now
              setOrderSuccess(true);
              clearCart();
            } else {
              alert('Ödeme işlemi başlatılamadı: ' + error.error);
            }
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          alert('Ödeme işlemi başlatılamadı');
        }
      } else if (paymentMethod === 'bank_transfer') {
        // Bank transfer - show bank details
        setOrderSuccess(true);
        clearCart();
      }

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Sipariş oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              Sepetiniz Boş
            </h2>
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
            <h2 
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              Siparişiniz Alındı!
            </h2>
            <p className="text-gray-600 mb-4">
              Sipariş numaranız: <span className="font-bold text-green-600">{orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Siparişiniz en kısa sürede hazırlanacak ve size ulaştırılacaktır.
            </p>
            <div className="space-y-2">
              <Link href={`/orders/${orderNumber}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Siparişimi Takip Et
                </Button>
              </Link>
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
            <h1 className="text-3xl font-bold text-gray-900">Sipariş Ver</h1>
          </div>

          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Kişisel Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad *
                      </label>
                      <Input
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soyad *
                      </label>
                      <Input
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <Input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon *
                      </label>
                      <Input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Adres Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres *
                    </label>
                    <Input
                      value={customerInfo.address.street}
                      onChange={(e) => setCustomerInfo(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İl *
                      </label>
                      <Input
                        value={customerInfo.address.city}
                        onChange={(e) => setCustomerInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İlçe *
                      </label>
                      <Input
                        value={customerInfo.address.district}
                        onChange={(e) => setCustomerInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, district: e.target.value }
                        }))}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posta Kodu
                      </label>
                      <Input
                        value={customerInfo.address.postalCode}
                        onChange={(e) => setCustomerInfo(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, postalCode: e.target.value }
                        }))}
                        className="rounded-xl"
                      />
                    </div>
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
                      { value: 'cash', label: 'Kapıda Ödeme', desc: 'Teslimat sırasında nakit ödeme' },
                      { value: 'credit_card', label: 'Kredi Kartı', desc: 'Güvenli online ödeme' },
                      { value: 'bank_transfer', label: 'Havale/EFT', desc: 'Banka havalesi ile ödeme' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'credit_card' | 'bank_transfer')}
                          className="text-green-600"
                        />
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-gray-500">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Teslimat Yöntemi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { value: 'standard', label: 'Standart Teslimat', desc: '2-3 iş günü', cost: '25 ₺' },
                      { value: 'express', label: 'Hızlı Teslimat', desc: '1 iş günü', cost: '50 ₺' },
                      { value: 'pickup', label: 'Mağazadan Teslim', desc: 'Ücretsiz', cost: 'Ücretsiz' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.value}
                            checked={shippingMethod === method.value}
                            onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express' | 'pickup')}
                            className="text-green-600"
                          />
                          <div>
                            <div className="font-medium">{method.label}</div>
                            <div className="text-sm text-gray-500">{method.desc}</div>
                          </div>
                        </div>
                        <div className="font-medium text-green-600">{method.cost}</div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Özel Notlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Siparişinizle ilgili özel notlarınızı buraya yazabilirsiniz..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  />
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
