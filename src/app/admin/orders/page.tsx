'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Filter
} from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  image?: string;
}

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

interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer';
  shippingMethod: 'standard' | 'express' | 'pickup';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paymentDetails?: {
    paytrTransactionId?: string;
    paymentType?: string;
    paymentAmount?: number;
    currency?: string;
    testMode?: boolean;
    failedReasonCode?: string;
    failedReasonMsg?: string;
    processedAt?: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Validate and sanitize orders data from Firebase
        const validOrders = (data.orders || []).map((order: Partial<Order> & { id?: string; orderNumber?: string; customer?: Partial<CustomerInfo> & { address?: Partial<CustomerInfo['address']> }; items?: Array<Partial<OrderItem>> }) => {
          // Ensure customer object exists and has proper structure
          const customer = order.customer || {} as Partial<CustomerInfo>;
          const address = customer.address || {} as Partial<CustomerInfo['address']>;
          
          return {
            id: order.id || '',
            orderNumber: order.orderNumber || `ORD-${order.id || 'UNKNOWN'}`,
            customer: {
              firstName: customer.firstName || 'Bilinmiyor',
              lastName: customer.lastName || '',
              email: customer.email || 'N/A',
              phone: customer.phone || 'N/A',
              address: {
                street: address.street || '',
                city: address.city || '',
                district: address.district || '',
                postalCode: address.postalCode || '',
                country: address.country || 'Türkiye'
              },
              notes: customer.notes || ''
            },
            items: Array.isArray(order.items) ? order.items.map((item: Partial<OrderItem> & { name?: string; productImage?: string }) => ({
              productId: item.productId || '',
              productName: item.productName || item.name || 'Ürün Adı Yok',
              variantId: item.variantId,
              variantName: item.variantName,
              quantity: item.quantity || 1,
              price: item.price || 0,
              image: item.image || item.productImage
            })) : [],
            subtotal: typeof order.subtotal === 'number' ? order.subtotal : 0,
            shippingCost: typeof order.shippingCost === 'number' ? order.shippingCost : 0,
            total: typeof order.total === 'number' ? order.total : (order.subtotal || 0) + (order.shippingCost || 0),
            status: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(order.status) 
              ? order.status 
              : 'pending',
            paymentStatus: ['pending', 'paid', 'failed', 'refunded'].includes(order.paymentStatus)
              ? order.paymentStatus
              : 'pending',
            paymentMethod: ['cash', 'credit_card', 'bank_transfer'].includes(order.paymentMethod)
              ? order.paymentMethod
              : 'cash',
            shippingMethod: ['standard', 'express', 'pickup'].includes(order.shippingMethod)
              ? order.shippingMethod
              : 'standard',
            notes: order.notes || '',
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            paymentDetails: order.paymentDetails || undefined
          };
        });
        setOrders(validOrders);
      } else {
        console.error('Failed to load orders:', response.status, response.statusText);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedOrder = data.order || { status: newStatus };
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: updatedOrder.status as Order['status'], updatedAt: updatedOrder.updatedAt || new Date().toISOString() } 
            : order
        ));
        
        // Update modal if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { 
            ...prev, 
            status: updatedOrder.status as Order['status'],
            updatedAt: updatedOrder.updatedAt || new Date().toISOString()
          } : null);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Sipariş durumu güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Sipariş durumu güncellenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      preparing: { label: 'Hazırlanıyor', color: 'bg-orange-100 text-orange-800', icon: Package },
      shipped: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Ödendi', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Başarısız', color: 'bg-red-100 text-red-800' },
      refunded: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (!order || !order.customer) return false;
    
    const matchesSearch = 
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Yönetimi</h1>
            <p className="text-gray-600">Tüm siparişleri görüntüleyin ve yönetin</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Sipariş numarası, müşteri adı veya e-posta ile ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="pending">Beklemede</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="preparing">Hazırlanıyor</option>
                    <option value="shipped">Kargoya Verildi</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş Bulunamadı</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Arama kriterlerinize uygun sipariş bulunamadı.'
                      : 'Henüz hiç sipariş alınmamış.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{order.orderNumber}
                          </h3>
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>
                              {order.customer?.firstName || 'Bilinmiyor'} {order.customer?.lastName || ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate max-w-[200px]" title={order.customer?.email || 'N/A'}>
                              {order.customer?.email || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{order.customer?.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {order.createdAt 
                                ? new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Tarih yok'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>{(order.items || []).length} ürün</span>
                            <span className="mx-2">•</span>
                            <CreditCard className="h-4 w-4" />
                            <span className="capitalize">
                              {order.paymentMethod === 'cash' ? 'Kapıda Ödeme' :
                               order.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
                               'Havale/EFT'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Total & Actions */}
                      <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {(order.total || 0).toFixed(2)} ₺
                          </p>
                          <p className="text-sm text-gray-500">
                            Kargo: {(order.shippingCost || 0).toFixed(2)} ₺
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detay
                          </Button>
                          
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Onayla
                            </Button>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Hazırla
                            </Button>
                          )}
                          
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Kargoya Ver
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sipariş Detayı - #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Sipariş ID: {selectedOrder.id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowOrderModal(false)}
                >
                  Kapat
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ad Soyad</label>
                      <p className="text-gray-900 font-medium mt-1">
                        {selectedOrder.customer?.firstName || 'Bilinmiyor'} {selectedOrder.customer?.lastName || ''}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-posta</label>
                      <p className="text-gray-900 mt-1 break-all">
                        <a href={`mailto:${selectedOrder.customer?.email}`} className="text-blue-600 hover:underline">
                          {selectedOrder.customer?.email || 'N/A'}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefon</label>
                      <p className="text-gray-900 mt-1">
                        <a href={`tel:${selectedOrder.customer?.phone}`} className="text-blue-600 hover:underline">
                          {selectedOrder.customer?.phone || 'N/A'}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adres</label>
                      <div className="text-gray-900 mt-1 space-y-1">
                        {selectedOrder.customer?.address?.street && (
                          <p>{selectedOrder.customer.address.street}</p>
                        )}
                        <p>
                          {selectedOrder.customer?.address?.district || ''}
                          {selectedOrder.customer?.address?.district && selectedOrder.customer?.address?.city ? ', ' : ''}
                          {selectedOrder.customer?.address?.city || ''}
                        </p>
                        <p>
                          {selectedOrder.customer?.address?.postalCode || ''} 
                          {selectedOrder.customer?.address?.postalCode && selectedOrder.customer?.address?.country ? ' ' : ''}
                          {selectedOrder.customer?.address?.country || 'Türkiye'}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.customer?.notes && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Müşteri Notları</label>
                        <p className="text-gray-900 mt-1 text-sm bg-gray-50 p-2 rounded">{selectedOrder.customer.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Sipariş Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Durum</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ödeme Durumu</label>
                      <div className="mt-1">
                        {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ödeme Yöntemi</label>
                      <p className="text-gray-900 mt-1 font-medium">
                        {selectedOrder.paymentMethod === 'cash' ? 'Kapıda Ödeme' :
                         selectedOrder.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
                         selectedOrder.paymentMethod === 'bank_transfer' ? 'Havale/EFT' :
                         selectedOrder.paymentMethod || 'Belirtilmemiş'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teslimat Yöntemi</label>
                      <p className="text-gray-900 mt-1 font-medium">
                        {selectedOrder.shippingMethod === 'standard' ? 'Standart Kargo' :
                         selectedOrder.shippingMethod === 'express' ? 'Hızlı Kargo' :
                         selectedOrder.shippingMethod === 'pickup' ? 'Mağazadan Teslim' :
                         selectedOrder.shippingMethod || 'Belirtilmemiş'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sipariş Tarihi</label>
                      <p className="text-gray-900 mt-1">
                        {selectedOrder.createdAt 
                          ? new Date(selectedOrder.createdAt).toLocaleString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          : 'Tarih yok'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Son Güncelleme</label>
                      <p className="text-gray-900 mt-1">
                        {selectedOrder.updatedAt 
                          ? new Date(selectedOrder.updatedAt).toLocaleString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          : 'Tarih yok'}
                      </p>
                    </div>
                    {selectedOrder.notes && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sipariş Notları</label>
                        <p className="text-gray-900 mt-1 text-sm bg-gray-50 p-2 rounded">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Ödeme Detayları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOrder.paymentDetails ? (
                      <>
                        {selectedOrder.paymentDetails.paytrTransactionId && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">PayTR İşlem ID</label>
                            <p className="text-gray-900 mt-1 font-mono text-sm break-all">
                              {selectedOrder.paymentDetails.paytrTransactionId}
                            </p>
                          </div>
                        )}
                        {selectedOrder.paymentDetails.paymentType && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ödeme Tipi</label>
                            <p className="text-gray-900 mt-1">{selectedOrder.paymentDetails.paymentType}</p>
                          </div>
                        )}
                        {selectedOrder.paymentDetails.paymentAmount && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ödeme Tutarı</label>
                            <p className="text-gray-900 mt-1 font-medium">
                              {selectedOrder.paymentDetails.paymentAmount.toFixed(2)} {selectedOrder.paymentDetails.currency || '₺'}
                            </p>
                          </div>
                        )}
                        {selectedOrder.paymentDetails.processedAt && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">İşlem Tarihi</label>
                            <p className="text-gray-900 mt-1">
                              {new Date(selectedOrder.paymentDetails.processedAt).toLocaleString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        {selectedOrder.paymentDetails.testMode !== undefined && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Test Modu</label>
                            <div className="mt-1">
                              <Badge className={selectedOrder.paymentDetails.testMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                {selectedOrder.paymentDetails.testMode ? 'Aktif' : 'Kapalı'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {selectedOrder.paymentDetails.failedReasonCode && (
                          <div>
                            <label className="text-xs font-medium text-red-500 uppercase tracking-wide">Hata Kodu</label>
                            <p className="text-red-600 mt-1 font-medium">{selectedOrder.paymentDetails.failedReasonCode}</p>
                          </div>
                        )}
                        {selectedOrder.paymentDetails.failedReasonMsg && (
                          <div>
                            <label className="text-xs font-medium text-red-500 uppercase tracking-wide">Hata Mesajı</label>
                            <p className="text-red-600 mt-1 text-sm">{selectedOrder.paymentDetails.failedReasonMsg}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Ödeme detayı bulunmuyor</p>
                        {selectedOrder.paymentMethod === 'cash' && (
                          <p className="text-xs mt-1">Kapıda ödeme siparişi</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Sipariş Ürünleri</span>
                    <Badge variant="outline">{(selectedOrder.items || []).length} Ürün</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(selectedOrder.items || []).length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.productName || 'Ürün'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.productName || 'Ürün Adı Yok'}</h4>
                            {item.productId && (
                              <p className="text-xs text-gray-500 font-mono mb-1">ID: {item.productId}</p>
                            )}
                            {item.variantName && (
                              <p className="text-sm text-gray-600 mb-1">Varyant: {item.variantName}</p>
                            )}
                            {item.variantId && (
                              <p className="text-xs text-gray-500 font-mono">Varyant ID: {item.variantId}</p>
                            )}
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                              <span>Adet: <strong>{item.quantity || 1}</strong></span>
                              <span>Birim Fiyat: <strong>{item.price ? item.price.toFixed(2) : '0.00'} ₺</strong></span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900">
                              {((item.price || 0) * (item.quantity || 1)).toFixed(2)} ₺
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.price ? item.price.toFixed(2) : '0.00'} ₺ × {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Bu siparişte ürün bulunmuyor</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ara Toplam:</span>
                      <span className="font-medium">{(selectedOrder.subtotal || 0).toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kargo Ücreti:</span>
                      <span className="font-medium">{(selectedOrder.shippingCost || 0).toFixed(2)} ₺</span>
                    </div>
                    {selectedOrder.subtotal && selectedOrder.shippingCost && (
                      <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                        <span>KDV Dahil:</span>
                        <span>{(selectedOrder.subtotal + selectedOrder.shippingCost).toFixed(2)} ₺</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
                      <span>Toplam Tutar:</span>
                      <span className="text-green-600">{(selectedOrder.total || 0).toFixed(2)} ₺</span>
                    </div>
                    {selectedOrder.total && selectedOrder.subtotal && selectedOrder.shippingCost && (
                      <div className="text-xs text-gray-500 text-right mt-1">
                        (Ara Toplam: {(selectedOrder.subtotal).toFixed(2)} ₺ + Kargo: {(selectedOrder.shippingCost).toFixed(2)} ₺)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status Update Actions */}
              <div className="mt-6 flex justify-center space-x-4">
                {selectedOrder.status === 'pending' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'confirmed');
                      setShowOrderModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Siparişi Onayla
                  </Button>
                )}
                
                {selectedOrder.status === 'confirmed' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'preparing');
                      setShowOrderModal(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Hazırlamaya Başla
                  </Button>
                )}
                
                {selectedOrder.status === 'preparing' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'shipped');
                      setShowOrderModal(false);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Kargoya Ver
                  </Button>
                )}
                
                {selectedOrder.status === 'shipped' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'delivered');
                      setShowOrderModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Teslim Edildi Olarak İşaretle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}