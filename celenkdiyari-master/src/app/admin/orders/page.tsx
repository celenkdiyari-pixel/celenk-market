'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  RefreshCw,
  ArrowLeft,
  Shield,
  FileText,
  Trash2,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const statusOptions = [
    { value: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Kargoda', color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'İptal Edildi', color: 'bg-red-100 text-red-800' }
  ];

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Loading orders...');

      const response = await fetch(`/api/orders?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('📊 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Orders data:', data);

        if (data.success && Array.isArray(data.orders)) {
          const newOrders: Order[] = data.orders.map((raw: any) => {
            const items = Array.isArray(raw.items) ? raw.items : [];

            // Handle both old format (customer) and new format (sender/recipient)
            let customer;
            if (raw.sender) {
              // New format: sender is the customer
              customer = {
                name: raw.sender.name || `${raw.sender.firstName || ''} ${raw.sender.lastName || ''}`.trim() || '-',
                email: raw.sender.email || '-',
                phone: raw.sender.phone || '-',
                address: raw.delivery?.deliveryAddress || raw.deliveryAddress || '-'
              };
            } else if (raw.customer) {
              // Old format
              customer = {
                name: raw.customer.name || '-',
                email: raw.customer.email || '-',
                phone: raw.customer.phone || '-',
                address: raw.deliveryAddress || '-'
              };
            } else {
              customer = {
                name: '-',
                email: '-',
                phone: '-',
                address: '-'
              };
            }

            const mappedItems = items.map((it: any) => ({
              productId: it.productId || it.id || '',
              productName: it.productName || it.name || 'Ürün',
              quantity: Number(it.quantity || 1),
              price: Number(it.price || 0),
              image: it.image || it.imageUrl || undefined
            }));
            const subtotal = typeof raw.subtotal === 'number' ? raw.subtotal : Number(raw.subtotal || raw.totalAmount || 0);
            const shippingCost = Number(raw.shippingCost || 0);
            const total = typeof raw.total === 'number' ? raw.total : Number(raw.total || raw.totalAmount || subtotal + shippingCost);
            return {
              id: raw.id,
              orderNumber: raw.orderNumber || raw.id || '-',
              customer: customer,
              items: mappedItems,
              subtotal,
              shippingCost,
              total,
              status: (raw.status || 'pending') as Order['status'],
              paymentStatus: (raw.paymentStatus || 'pending') as Order['paymentStatus'],
              paymentMethod: raw.paymentMethod || '-',
              createdAt: raw.createdAt || new Date().toISOString(),
              updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
              notes: raw.notes || '',
              // Store full order data for modal
              rawData: raw
            } as Order & { rawData?: any };
          });
          setOrders(newOrders);
          setLastUpdateTime(new Date());
          console.log('✅ Orders loaded:', newOrders.length);

          if (newOrders.length === 0) {
            console.log('⚠️ No orders found');
          }
        } else {
          console.error('❌ Invalid orders data format:', data);
          setError('Sipariş verisi formatı hatalı');
          setOrders([]);
        }
      } else {
        console.error('❌ Failed to load orders:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error details:', errorData);
        setError(`Siparişler yüklenirken hata oluştu: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setError(`Siparişler yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();

      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        setAdminUsername(data.username || 'Admin');
        loadOrders();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
          console.log('🔄 Auto-refreshing orders...');
          loadOrders();
        }, 30000);

        return () => clearInterval(interval);
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const filterOrders = useCallback(() => {
    let filtered = orders || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        (order.orderNumber || '').toLowerCase().includes(term) ||
        (order.customer?.name || '').toLowerCase().includes(term) ||
        (order.customer?.email || '').toLowerCase().includes(term) ||
        (order.customer?.phone || '').includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === (statusFilter as Order['status']));
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);


  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating order status:', orderId, 'to', newStatus);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        ));

        // Update modal if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
        }

        console.log('✅ Order status updated successfully');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update order status:', errorData);
        alert('Sipariş durumu güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting order:', orderId);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setOrders(prev => prev.filter(order => order.id !== orderId));

        // Close modal if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }

        console.log('✅ Order deleted successfully');
        alert('Sipariş başarıyla silindi');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete order:', errorData);
        alert('Sipariş silinirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      alert('Sipariş silinirken hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge className={statusOption?.color || 'bg-gray-100 text-gray-800'}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:py-6 space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sipariş Yönetimi</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Hoş geldiniz, {adminUsername}</p>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-3">
              <Button onClick={loadOrders} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/login'}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex flex-col space-y-2 lg:hidden">
              <Button onClick={loadOrders} variant="outline" size="sm" disabled={isLoading} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/login'}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Beklemede</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hazırlanıyor</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'processing').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teslim Edildi</p>
                  <p className="text-3xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Sipariş ara (numara, müşteri, telefon)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    variant={statusFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'Arama kriterlerinize uygun sipariş bulunamadı'
                  : 'Henüz sipariş bulunmuyor'
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Farklı arama terimleri deneyin veya filtreleri temizleyin'
                  : 'Yeni siparişler geldiğinde burada görünecek'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Müşteri</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{order.customer.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{order.customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{order.customer.phone}</span>
                            </div>
                            {/* NEW ADDRESS LINE */}
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>{order.customer.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Ürünler</h4>
                          <div className="space-y-1">
                            {(order.items || []).slice(0, 2).map((item, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {item.productName} x{item.quantity}
                              </div>
                            ))}
                            {(order.items || []).length > 2 && (
                              <div className="text-sm text-gray-500">
                                +{order.items.length - 2} ürün daha
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Total */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Toplam</h4>
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(order.total)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(order.items || []).length} ürün
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>

                      <Button
                        onClick={() => deleteOrder(order.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </Button>

                      {order.status === 'pending' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Onayla
                        </Button>
                      )}

                      {order.status === 'confirmed' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Hazırla
                        </Button>
                      )}

                      {order.status === 'processing' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Kargoya Ver
                        </Button>
                      )}

                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Teslim Et
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sipariş Detayı #{selectedOrder.orderNumber}
                </h2>
                <Button
                  onClick={() => setShowOrderModal(false)}
                  variant="outline"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer/Sender Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gönderici Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.customer?.name || '-'}</p>
                        <p className="text-sm text-gray-500">Ad Soyad</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.customer?.email || '-'}</p>
                        <p className="text-sm text-gray-500">E-posta</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.customer?.phone || '-'}</p>
                        <p className="text-sm text-gray-500">Telefon</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.customer?.address || '-'}</p>
                        <p className="text-sm text-gray-500">Adres</p>
                      </div>
                    </div>
                    {/* Çelenk Yazısı ve Ek Bilgi */}
                    {(selectedOrder as any).rawData?.sender?.wreathText && (
                      <div className="flex items-start space-x-3 pt-3 border-t">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.sender.wreathText}</p>
                          <p className="text-sm text-gray-500">Çelenk Yazısı</p>
                        </div>
                      </div>
                    )}
                    {(selectedOrder as any).rawData?.sender?.additionalInfo && (
                      <div className="flex items-start space-x-3 pt-3 border-t">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.sender.additionalInfo}</p>
                          <p className="text-sm text-gray-500">Ek Bilgi</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipient Information (if exists) */}
                  {(selectedOrder as any).rawData?.recipient && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alıcı Bilgileri</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {(selectedOrder as any).rawData.recipient.name ||
                                `${(selectedOrder as any).rawData.recipient.firstName || ''} ${(selectedOrder as any).rawData.recipient.lastName || ''}`.trim() || '-'}
                            </p>
                            <p className="text-sm text-gray-500">Ad Soyad</p>
                          </div>
                        </div>
                        {(selectedOrder as any).rawData.recipient.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.recipient.phone}</p>
                              <p className="text-sm text-gray-500">Telefon</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder as any).rawData.delivery?.city && (
                          <div className="flex items-center space-x-3">
                            <div className="h-5 w-5">
                              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {(selectedOrder as any).rawData.delivery.city}
                                {(selectedOrder as any).rawData.delivery.district && ` / ${(selectedOrder as any).rawData.delivery.district}`}
                              </p>
                              <p className="text-sm text-gray-500">Şehir / İlçe</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder as any).rawData.delivery?.deliveryLocation && (
                          <div className="flex items-start space-x-3">
                            <div className="h-5 w-5 mt-1">
                              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.delivery.deliveryLocation}</p>
                              <p className="text-sm text-gray-500">Teslimat Yeri</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder as any).rawData.delivery?.deliveryAddress && (
                          <div className="flex items-start space-x-3">
                            <div className="h-5 w-5 mt-1">
                              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.delivery.deliveryAddress}</p>
                              <p className="text-sm text-gray-500">Teslimat Adresi</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder as any).rawData.delivery?.deliveryDate && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.delivery.deliveryDate}</p>
                              <p className="text-sm text-gray-500">Teslimat Tarihi</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder as any).rawData.delivery?.deliveryTime && (
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.delivery.deliveryTime}</p>
                              <p className="text-sm text-gray-500">Teslimat Saati</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder as any).rawData.delivery?.deliveryNote && (
                          <div className="flex items-start space-x-3">
                            <div className="h-5 w-5 mt-1">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{(selectedOrder as any).rawData.delivery.deliveryNote}</p>
                              <p className="text-sm text-gray-500">Teslimat Notu</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                        <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(selectedOrder.status)}
                      <div>
                        <p className="font-medium text-gray-900">{statusOptions.find(s => s.value === selectedOrder.status)?.label}</p>
                        <p className="text-sm text-gray-500">Durum</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.paymentMethod || '-'}</p>
                        <p className="text-sm text-gray-500">Ödeme Yöntemi</p>
                      </div>
                    </div>
                    {(selectedOrder as any).rawData?.shippingMethod && (
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {(selectedOrder as any).rawData.shippingMethod === 'standard' ? 'Standart Kargo' :
                              (selectedOrder as any).rawData.shippingMethod === 'express' ? 'Hızlı Kargo' :
                                (selectedOrder as any).rawData.shippingMethod === 'pickup' ? 'Mağazadan Teslim' :
                                  (selectedOrder as any).rawData.shippingMethod || '-'}
                          </p>
                          <p className="text-sm text-gray-500">Kargo Yöntemi</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div className="flex items-start space-x-3">
                        <div className="h-5 w-5 mt-1">
                          <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedOrder.notes}</p>
                          <p className="text-sm text-gray-500">Notlar</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fatura Bilgileri */}
              {(selectedOrder as any).invoice && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Fatura Bilgileri</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Fatura Tipi</p>
                      <p className="font-medium text-gray-900">
                        {(selectedOrder as any).invoice.invoiceType === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                      </p>
                    </div>
                    {(selectedOrder as any).invoice.invoiceType === 'corporate' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Firma Adı</p>
                          <p className="font-medium text-gray-900">{(selectedOrder as any).invoice.companyName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Vergi Dairesi</p>
                          <p className="font-medium text-gray-900">{(selectedOrder as any).invoice.taxOffice || '-'}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {(selectedOrder as any).invoice.invoiceType === 'corporate' ? 'Vergi No' : 'TC Kimlik No'}
                      </p>
                      <p className="font-medium text-gray-900">{(selectedOrder as any).invoice.taxNumber || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Fatura Adresi</p>
                      <p className="font-medium text-gray-900">{(selectedOrder as any).invoice.address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">İl / İlçe</p>
                      <p className="font-medium text-gray-900">
                        {(selectedOrder as any).invoice.city || '-'} / {(selectedOrder as any).invoice.district || '-'}
                      </p>
                    </div>
                    {(selectedOrder as any).invoice.postalCode && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Posta Kodu</p>
                        <p className="font-medium text-gray-900">{(selectedOrder as any).invoice.postalCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {item.image && (
                        <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-500">Birim Fiyat</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Kargo:</span>
                  <span className="font-medium">{formatPrice(selectedOrder.shippingCost)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                    <span className="text-lg font-bold text-green-600">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  onClick={() => setShowOrderModal(false)}
                  variant="outline"
                >
                  Kapat
                </Button>

                {selectedOrder.status === 'pending' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'confirmed');
                      setShowOrderModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Onayla
                  </Button>
                )}

                {selectedOrder.status === 'confirmed' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'processing');
                      setShowOrderModal(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Hazırla
                  </Button>
                )}

                {selectedOrder.status === 'processing' && (
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'shipped');
                      setShowOrderModal(false);
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Truck className="h-4 w-4 mr-2" />
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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Teslim Et
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