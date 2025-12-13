'use client';

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
  CheckCircle
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
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
  
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});
  const [loadingStocks, setLoadingStocks] = useState(true);
  
  // Fetch product stocks
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocks: Record<string, number> = {};
        for (const item of cartItems) {
          const response = await fetch(`/api/products/${item.id}`);
          if (response.ok) {
            const product = await response.json();
            stocks[item.id] = product.quantity || 0;
          }
        }
        setProductStocks(stocks);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoadingStocks(false);
      }
    };
    
    if (cartItems.length > 0) {
      fetchStocks();
    } else {
      setLoadingStocks(false);
    }
  }, [cartItems]);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const availableStock = productStocks[productId] || 0;
    if (newQuantity > availableStock) {
      alert(`Bu üründen stokta sadece ${availableStock} adet bulunmaktadır.`);
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert('Lütfen adınızı ve telefon numaranızı girin!');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer: customerInfo,
        items: cartItems,
        total: getTotalPrice(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('📦 Submitting order:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Order submitted successfully:', result);
        
        setOrderSuccess(true);
        clearCart();
        setCustomerInfo({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          notes: ''
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Order submission failed:', errorData);
        alert(`Sipariş gönderilirken hata oluştu: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('❌ Order submission error:', error);
      alert('Sipariş gönderilirken bir hata oluştu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="py-16">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 
                className="text-3xl font-bold text-gray-900 mb-4"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: 'normal'
                }}
              >
                Siparişiniz Alındı!
              </h1>
              <p 
                className="text-lg text-gray-600 mb-8"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  textRendering: 'optimizeLegibility',
                  letterSpacing: 'normal'
                }}
              >
                Siparişiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ana Sayfaya Dön
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline">
                    Alışverişe Devam Et
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 
              className="text-3xl font-bold text-gray-900 mb-4"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              Sepetiniz Boş
            </h1>
            <p 
              className="text-lg text-gray-600 mb-8"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                letterSpacing: 'normal'
              }}
            >
              Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
            </p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Alışverişe Başla
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Alışverişe Devam Et
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
          <p className="text-gray-600 mt-2">{getTotalItems()} ürün</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Sepetim ({getTotalItems()} ürün)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-green-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant={item.inStock ? "default" : "destructive"}>
                          {loadingStocks ? 'Kontrol ediliyor...' : 
                           productStocks[item.id] !== undefined 
                             ? `Stokta: ${productStocks[item.id]} adet` 
                             : item.inStock ? 'Stokta' : 'Stokta Yok'}
                        </Badge>
                        {productStocks[item.id] !== undefined && item.quantity > productStocks[item.id] && (
                          <Badge variant="destructive" className="ml-2">
                            Stok yetersiz!
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 mb-2">
                        {item.price} ₺
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={loadingStocks || (productStocks[item.id] !== undefined && item.quantity >= productStocks[item.id])}
                          title={productStocks[item.id] !== undefined && item.quantity >= productStocks[item.id] ? 'Stokta yeterli miktar yok' : ''}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Customer Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Ürünler ({getTotalItems()})</span>
                  <span>{getTotalPrice()} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span>{getTotalPrice()} ₺</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad *
                  </label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Adınızı girin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Telefon *
                  </label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0555 123 45 67"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    E-posta
                  </label>
                  <Input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Adres
                  </label>
                  <Input
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Teslimat adresi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <Input
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="İstanbul"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <Input
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Özel notlarınız..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Link href="/checkout" className="w-full">
              <Button
                disabled={cartItems.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Siparişe Devam Et ({getTotalPrice()} ₺)
              </Button>
            </Link>
            
            {/* Quick Order Button (Optional - for quick orders) */}
            <Button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cartItems.length === 0}
              variant="outline"
              className="w-full text-lg py-6 mt-2"
            >
              {isSubmitting ? 'Sipariş Gönderiliyor...' : 'Hızlı Sipariş Ver'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
