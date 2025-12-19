'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Package,
  Settings,
  Megaphone,
  ShoppingCart,
  Users,
  BarChart3,
  Home,
  Eye,
  Shield,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  images: string[];
}

interface RecentOrder {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  total: number;
  status: string;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const categories = [
    'Açılış & Tören',
    'Cenaze Çelenkleri',
    'Ferforjeler',
    'Fuar & Stand',
    'Ofis & Saksı Bitkileri',
    'Söz & Nişan'
  ];

  useEffect(() => {
    loadProducts();
    loadRecentOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const response = await fetch('/api/orders?limit=3');
      if (response.ok) {
        const data = await response.json();
        const orders = (data.orders || []).slice(0, 3).map((order: { orderNumber?: string; id?: string; customer?: { firstName?: string; lastName?: string }; total?: number; status?: string }) => ({
          orderNumber: order.orderNumber || order.id,
          customer: order.customer || { firstName: 'Bilinmiyor', lastName: '' },
          total: order.total || 0,
          status: order.status || 'pending'
        }));
        setRecentOrders(orders);
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setRecentOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Çelenk Diyarı Yönetim Paneli</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stokta</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {products.filter(p => p.inStock).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stokta Yok</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {products.filter(p => !p.inStock).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kategoriler</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Son Siparişler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const statusConfig: { [key: string]: { label: string; className: string } } = {
                      pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
                      confirmed: { label: 'Onaylandı', className: 'bg-green-100 text-green-800' },
                      processing: { label: 'Hazırlanıyor', className: 'bg-blue-100 text-blue-800' },
                      shipped: { label: 'Kargoda', className: 'bg-purple-100 text-purple-800' },
                      delivered: { label: 'Teslim Edildi', className: 'bg-gray-100 text-gray-800' },
                      cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800' }
                    };
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim() || 'Bilinmiyor';

                    return (
                      <div key={order.orderNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₺{order.total.toFixed(2)}</p>
                          <Badge className={status.className}>{status.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Henüz sipariş bulunmuyor</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full">
                    Tüm Siparişleri Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/products/new">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ürün Ekle
                </Button>
              </Link>

              <Link href="/admin/products">
                <Button variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Ürün Yönetimi
                </Button>
              </Link>

              <Link href="/admin/announcements">
                <Button variant="outline" className="w-full">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Duyuru Ekle
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Site Ayarları
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('/', '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Siteyi Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürünler</h3>
                <p className="text-gray-600 text-sm">Ürünleri ve stokları yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Siparişler</h3>
                <p className="text-gray-600 text-sm">Siparişleri yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/customers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Müşteriler</h3>
                <p className="text-gray-600 text-sm">Müşteri bilgilerini yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analitik</h3>
                <p className="text-gray-600 text-sm">Raporlar ve analiz</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcılar</h3>
                <p className="text-gray-600 text-sm">Yetki yönetimi</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/announcements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Megaphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Duyurular</h3>
                <p className="text-gray-600 text-sm">Site duyurularını yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/backup">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Yedekleme</h3>
                <p className="text-gray-600 text-sm">Veri güvenliği</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Ayarları</h3>
                <p className="text-gray-600 text-sm">Genel ayarları yönet</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}