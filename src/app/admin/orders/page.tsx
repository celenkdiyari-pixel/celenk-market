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
  Filter,
  Send,
  MapPin
} from 'lucide-react';
import Image from 'next/image';

// Shared Types & Constants
import { Order, OrderStatus } from '@/types';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { OrderService } from '@/services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load Orders
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // Service call
      const data = await OrderService.getAllOrders();

      // Sort by createdAt desc
      const sorted = data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(sorted);
      setFilteredOrders(sorted);
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error);
      alert('Siparişler yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = orders;

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.orderNumber?.toLowerCase().includes(lowerTerm) ||
        order.customer?.firstName?.toLowerCase().includes(lowerTerm) ||
        order.customer?.email?.toLowerCase().includes(lowerTerm) ||
        order.sender?.firstName?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  // Actions
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await OrderService.updateStatus(orderId, newStatus);

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

      // Update modal if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error(error);
      alert('Durum güncellenemedi.');
    }
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`#${order.orderNumber} numaralı siparişi silmek istediğinize emin misiniz?`)) return;

    try {
      setIsDeleting(order.id);
      await OrderService.deleteOrder(order.id);

      setOrders(prev => prev.filter(o => o.id !== order.id));
      if (selectedOrder?.id === order.id) {
        setShowOrderModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error(error);
      alert('Silme işlemi başarısız.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('DİKKAT! Tüm siparişler silinecek. Bu işlem geri alınamaz!')) return;
    try {
      setIsLoading(true);
      await OrderService.deleteAll();
      setOrders([]);
      setFilteredOrders([]);
      alert('Tüm siparişler silindi.');
    } catch (error) {
      alert('Toplu silme başarısız.');
    } finally {
      setIsLoading(false);
    }
  };

  // UI Helpers
  const getStatusBadge = (status: string) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    let Icon = Clock;
    let label = status;

    switch (status) {
      case ORDER_STATUS.PENDING:
        colorClass = 'bg-yellow-100 text-yellow-800';
        label = 'Beklemede';
        break;
      case ORDER_STATUS.CONFIRMED:
        colorClass = 'bg-blue-100 text-blue-800';
        Icon = CheckCircle;
        label = 'Onaylandı';
        break;
      case ORDER_STATUS.PREPARING:
        colorClass = 'bg-orange-100 text-orange-800';
        Icon = Package;
        label = 'Hazırlanıyor';
        break;
      case ORDER_STATUS.SHIPPED:
        colorClass = 'bg-purple-100 text-purple-800';
        Icon = Truck;
        label = 'Kargoya Verildi';
        break;
      case ORDER_STATUS.DELIVERED:
        colorClass = 'bg-green-100 text-green-800';
        Icon = CheckCircle;
        label = 'Teslim Edildi';
        break;
      case ORDER_STATUS.CANCELLED:
        colorClass = 'bg-red-100 text-red-800';
        Icon = XCircle;
        label = 'İptal Edildi';
        break;
    }

    return (
      <Badge className={`${colorClass} border-0 flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const isPaid = status === 'paid';
    return (
      <Badge variant={isPaid ? 'default' : 'secondary'} className={isPaid ? 'bg-green-600' : 'bg-yellow-500'}>
        {isPaid ? 'Ödendi' : 'Ödeme Bekliyor'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sipariş Yönetimi</h1>
            <p className="text-gray-500 mt-1">Tüm siparişleri görüntüleyin ve yönetin</p>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Sipariş no, isim veya e-posta..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={handleDeleteAll}>Tümünü Sil</Button>
                <select
                  className="h-10 rounded-md border border-gray-200 px-3 bg-white"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tüm Durumlar</option>
                  {Object.values(ORDER_STATUS).map(s => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Sipariş Bulunamadı</h3>
              <p className="text-gray-500">Arama kriterlerinize uygun sipariş yok.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-all duration-200 border-gray-100">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-200">
                      {order.items && order.items[0]?.image ? (
                        <Image src={order.items[0].image} alt="Product" fill className="object-cover" />
                      ) : (
                        <Package className="w-8 h-8 m-auto text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                      {order.items.length > 1 && (
                        <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md">
                          +{order.items.length - 1}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg text-gray-900">#{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus || 'pending')}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {order.customer?.firstName} {order.customer?.lastName}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {order.customer?.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {/* Creation Date Format */}
                            {new Date(order.createdAt).toLocaleString('tr-TR', {
                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        <span className="text-2xl font-bold text-green-600">{(Number(order.total) || 0).toFixed(2)} ₺</span>
                        <span className="text-sm text-gray-400">Kargo: {(Number(order.shippingCost) || 0).toFixed(2)} ₺</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-2">
                      <Button variant="outline" onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                        <Eye className="w-4 h-4 mr-2" /> Detay
                      </Button>
                      {order.status === ORDER_STATUS.PENDING && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.CONFIRMED)}>
                          Onayla
                        </Button>
                      )}
                      {order.status === ORDER_STATUS.CONFIRMED && (
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.PREPARING)}>
                          Hazırla
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Detail Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Sipariş: #{selectedOrder.orderNumber}</h2>
                    <p className="text-sm text-gray-500">ID: {selectedOrder.id}</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowOrderModal(false)}>Kapat</Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Customer & Recipient */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader><CardTitle className="text-lg flex items-center"><User className="w-5 h-5 mr-2" /> Gönderici</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p><span className="font-semibold">Ad Soyad:</span> {selectedOrder.sender?.firstName || selectedOrder.customer?.firstName} {selectedOrder.sender?.lastName || selectedOrder.customer?.lastName}</p>
                        <p><span className="font-semibold">Email:</span> {selectedOrder.sender?.email || selectedOrder.customer?.email}</p>
                        <p><span className="font-semibold">Telefon:</span> {selectedOrder.sender?.phone || selectedOrder.customer?.phone}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg flex items-center"><Send className="w-5 h-5 mr-2" /> Alıcı (Teslimat)</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <p><span className="font-semibold">Alıcı:</span> {selectedOrder.recipient?.name}</p>
                        <p><span className="font-semibold">Telefon:</span> {selectedOrder.recipient?.phone}</p>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="font-semibold">Adres:</p>
                          <p>{selectedOrder.recipient?.address}</p>
                          <p>{selectedOrder.recipient?.district} / {selectedOrder.recipient?.city}</p>
                        </div>
                        <div className="flex gap-4 mt-2">
                          {/* Delivery Date */}
                          {selectedOrder.delivery_date && (
                            <div className="flex-1 bg-blue-50 p-2 rounded text-blue-800">
                              <span className="block text-xs font-bold uppercase text-blue-400">Tarih</span>
                              <div className="flex items-center font-bold">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(selectedOrder.delivery_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                              </div>
                            </div>
                          )}
                          {/* Delivery Time */}
                          {selectedOrder.delivery_time && (
                            <div className="flex-1 bg-orange-50 p-2 rounded text-orange-800">
                              <span className="block text-xs font-bold uppercase text-orange-400">Saat</span>
                              <div className="flex items-center font-bold">
                                <Clock className="w-4 h-4 mr-1" />
                                {selectedOrder.delivery_time}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Order Info & Items */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader><CardTitle className="text-lg flex items-center"><Package className="w-5 h-5 mr-2" /> Sipariş Özeti</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <span className="text-xs text-gray-500 uppercase font-bold">Sipariş Tarihi</span>
                          <p className="font-medium">
                            {new Date(selectedOrder.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500 uppercase font-bold">Durum</span>
                            <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase font-bold">Ödeme</span>
                            <div className="mt-1">{getPaymentStatusBadge(selectedOrder.paymentStatus || 'pending')}</div>
                          </div>
                        </div>

                        {selectedOrder.paymentDetails && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> Ödeme Detayları
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">İşlem ID:</span>
                                <span className="font-mono text-xs">{selectedOrder.paymentDetails.paytrTransactionId || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Ödeme Tutarı:</span>
                                <span className="font-bold text-green-600">
                                  {(Number(selectedOrder.paymentDetails.paymentAmount) || Number(selectedOrder.total) || 0).toFixed(2)} {selectedOrder.paymentDetails.currency || '₺'}
                                </span>
                              </div>
                              {selectedOrder.paymentDetails.processedAt && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">İşlem Tarihi:</span>
                                  <span>{new Date(selectedOrder.paymentDetails.processedAt).toLocaleString('tr-TR')}</span>
                                </div>
                              )}
                              {selectedOrder.paymentDetails.testMode && (
                                <Badge className="w-full justify-center bg-orange-100 text-orange-800 border-0">Test Modu</Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500 uppercase font-bold mb-2 block">Sipariş Durumunu Değiştir</span>
                          <select
                            className="w-full h-10 rounded-lg border border-gray-200 px-3 bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                            value={selectedOrder.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                          >
                            {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                              <option key={status} value={status}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400 mt-2">
                            * Durumu değiştirdiğinizde müşteriye otomatik güncelleme görünür.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg">Ürünler</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50">
                            <div className="w-16 h-16 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              ) : <Package className="w-6 h-6 m-auto text-gray-300 absolute inset-0" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.productName || item.name}</p>
                              <div className="flex justify-between mt-1 text-sm text-gray-500">
                                <span>x{item.quantity}</span>
                                <span className="font-bold text-gray-900">{(Number(item.price) || 0).toFixed(2)} ₺</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="p-4 bg-gray-50 rounded-b-xl">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Toplam</span>
                            <span className="text-green-600">{(Number(selectedOrder.total) || 0).toFixed(2)} ₺</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}