'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Eye, 
  DollarSign,
  Package,
  FileText,
  Activity,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  totalBlogPosts: number;
  recentOrders: any[];
  topPages: any[];
  deviceStats: any;
  browserStats: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [searchConsoleData, setSearchConsoleData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Dashboard verilerini yükle
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Analytics verilerini yükle
      const analyticsResponse = await fetch('/api/analytics?range=7d');
      const analyticsData = await analyticsResponse.json();
      
      // Search Console verilerini yükle (optional - endpoint may not exist)
      let searchConsoleData = null;
      try {
        const searchConsoleResponse = await fetch('/api/analytics/search-console');
        if (searchConsoleResponse.ok) {
          searchConsoleData = await searchConsoleResponse.json();
        }
      } catch (error) {
        // Search Console endpoint not available, ignore
      }
      
      // Müşteri verilerini yükle
      const customersResponse = await fetch('/api/customers?limit=10');
      const customersData = await customersResponse.json();
      
      // Blog verilerini yükle
      const blogResponse = await fetch('/api/blog?limit=10');
      const blogData = await blogResponse.json();
      
      // Sipariş verilerini yükle
      const ordersResponse = await fetch('/api/orders');
      const ordersData = await ordersResponse.json();
      
      // Dashboard istatistiklerini hesapla
      const dashboardStats: DashboardStats = {
        totalVisitors: analyticsData?.totalVisitors || 0,
        uniqueVisitors: analyticsData?.uniqueVisitors || 0,
        pageViews: analyticsData?.pageViews || 0,
        sessions: analyticsData?.sessions || 0,
        avgSessionDuration: analyticsData?.avgSessionDuration || 0,
        bounceRate: analyticsData?.bounceRate || 0,
        totalOrders: ordersData?.success && Array.isArray(ordersData.orders) ? ordersData.orders.length : 0,
        totalRevenue: ordersData?.success && Array.isArray(ordersData.orders) 
          ? ordersData.orders.reduce((sum: number, order: any) => {
              const total = order.total || order.totalAmount || 0;
              return sum + (typeof total === 'number' ? total : 0);
            }, 0) 
          : 0,
        totalProducts: 0, // Ürün sayısı için ayrı API gerekli
        totalCustomers: customersData?.stats?.total || 0,
        totalBlogPosts: blogData?.stats?.total || 0,
        recentOrders: ordersData?.success && Array.isArray(ordersData.orders) ? ordersData.orders.slice(0, 5) : [],
        topPages: analyticsData?.topPages || [],
        deviceStats: analyticsData?.deviceStats || {},
        browserStats: analyticsData?.browserStats || []
      };
      
      setStats(dashboardStats);
      setSearchConsoleData(searchConsoleData?.data || null);
      setCustomers(customersData?.customers || []);
      setBlogPosts(blogData?.blogPosts || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoadingAuth(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Site performansı ve yönetim paneli</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ziyaretçi</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVisitors || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.uniqueVisitors || 0} benzersiz ziyaretçi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sayfa Görüntüleme</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pageViews || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.sessions || 0} oturum
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                ₺{stats?.totalRevenue?.toFixed(2) || 0} toplam gelir
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Müşteri Sayısı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalBlogPosts || 0} blog yazısı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Performans Metrikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ortalama Oturum Süresi</span>
                  <Badge variant="outline">{stats?.avgSessionDuration || 0} saniye</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Çıkış Oranı</span>
                  <Badge variant="outline">{stats?.bounceRate || 0}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Toplam Oturum</span>
                  <Badge variant="outline">{stats?.sessions || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Cihaz İstatistikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Masaüstü</span>
                  <Badge variant="outline">{stats?.deviceStats?.desktop || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mobil</span>
                  <Badge variant="outline">{stats?.deviceStats?.mobile || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tablet</span>
                  <Badge variant="outline">{stats?.deviceStats?.tablet || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Son Siparişler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.customer?.name || 'Müşteri'}</p>
                      <p className="text-sm text-gray-600">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₺{order.totalAmount || 0}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">Henüz sipariş bulunmuyor</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Son Blog Yazıları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blogPosts?.slice(0, 5).map((post: any) => (
                  <div key={post.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-gray-600">{post.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{post.views || 0} görüntüleme</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">Henüz blog yazısı bulunmuyor</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Top Pages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              En Popüler Sayfalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topPages?.slice(0, 10).map((page: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{page.page}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{page.views} görüntüleme</Badge>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Veri bulunamadı</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Verileri Yenile
          </Button>
        </div>
      </div>
    </div>
  );
}
