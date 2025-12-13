'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  customer: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      district?: string;
      postalCode?: string;
    } | string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

function OrderTrackingContent() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        const foundOrder = data.orders?.find((o: Order) => o.orderNumber === orderNumber);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Sipariş bulunamadı');
        }
      } else {
        setError('Sipariş yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Sipariş yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Ödeme Bekleniyor',
      'paid': 'Ödendi',
      'failed': 'Ödeme Başarısız',
      'refunded': 'İade Edildi'
    };
    return statusMap[status] || status;
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`);
      if (response.ok) {
        // For HTML invoice, open in new window for printing
        const htmlContent = await response.text();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          // Auto print after a short delay
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
      } else {
        alert('Fatura indirilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Fatura indirilemedi. Lütfen daha sonra tekrar deneyin.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Sipariş yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              letterSpacing: 'normal'
            }}
          >
            Sipariş Bulunamadı
          </h1>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız sipariş bulunamadı'}</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const customerName = order.customer.firstName && order.customer.lastName
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : order.customer.name || 'Müşteri';

  const address = typeof order.customer.address === 'string'
    ? order.customer.address
    : order.customer.address
      ? `${order.customer.address.street || ''}, ${order.customer.address.district || ''}, ${order.customer.address.city || ''}`
      : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold text-gray-900"
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: 'normal'
                }}
              >
                Sipariş Takibi
              </h1>
              <p className="text-gray-600 mt-2">Sipariş No: {order.orderNumber}</p>
            </div>
            <Button onClick={handleDownloadInvoice} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Faturayı İndir
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Sipariş Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Ödeme Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {getPaymentStatusText(order.paymentStatus)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sipariş Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} ₺</p>
                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} ₺ / adet</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{order.subtotal.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo:</span>
                <span>{order.shippingCost.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Toplam:</span>
                <span className="text-green-600">{order.total.toFixed(2)} ₺</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Müşteri Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{customerName}</span>
            </div>
            {order.customer.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{order.customer.email}</span>
              </div>
            )}
            {order.customer.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.customer.phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span>{address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Sipariş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sipariş Tarihi:</span>
              <span>{new Date(order.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ödeme Yöntemi:</span>
              <span>
                {order.paymentMethod === 'cash' ? 'Kapıda Ödeme' :
                 order.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
                 order.paymentMethod === 'bank_transfer' ? 'Havale/EFT' :
                 order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Teslimat Yöntemi:</span>
              <span>
                {order.shippingMethod === 'standard' ? 'Standart Teslimat' :
                 order.shippingMethod === 'express' ? 'Hızlı Teslimat' :
                 order.shippingMethod === 'pickup' ? 'Mağazadan Teslim' :
                 order.shippingMethod}
              </span>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Notlar:</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}

