'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  Home,
  Eye,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  orders: number;
  avgRating: number;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
  customerLifetimeValue: number;
}

interface CategoryAnalytics {
  category: string;
  revenue: number;
  orders: number;
  products: number;
  growth: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analytics?dateRange=${dateRange}`);
        if (response.ok) {
          const data = await response.json();
          setSalesData(data.salesData || []);
          setProductPerformance(data.productPerformance || []);
          setCustomerAnalytics(data.customerAnalytics || null);
          setCategoryAnalytics(data.categoryAnalytics || []);
        } else {
          console.error('Failed to load analytics');
          setSalesData([]);
          setProductPerformance([]);
          setCustomerAnalytics(null);
          setCategoryAnalytics([]);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        setSalesData([]);
        setProductPerformance([]);
        setCustomerAnalytics(null);
        setCategoryAnalytics([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const getTotalRevenue = () => {
    return salesData.reduce((sum, data) => sum + data.revenue, 0);
  };

  const getTotalOrders = () => {
    return salesData.reduce((sum, data) => sum + data.orders, 0);
  };

  const getTotalCustomers = () => {
    return salesData.reduce((sum, data) => sum + data.customers, 0);
  };

  const getGrowthRate = () => {
    if (salesData.length < 2) return 0;
    const firstWeek = salesData.slice(0, 3).reduce((sum, data) => sum + data.revenue, 0);
    const lastWeek = salesData.slice(-3).reduce((sum, data) => sum + data.revenue, 0);
    return ((lastWeek - firstWeek) / firstWeek) * 100;
  };

  const getTopPerformingProducts = () => {
    return productPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getTopCategories = () => {
    return categoryAnalytics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analitik & Raporlar</h1>
              <p className="text-gray-600 mt-1">İş performansınızı analiz edin ve raporlar oluşturun</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Rapor İndir
              </Button>
              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Zaman Aralığı:</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="7">Son 7 Gün</option>
                  <option value="30">Son 30 Gün</option>
                  <option value="90">Son 3 Ay</option>
                  <option value="365">Son 1 Yıl</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Büyüme Oranı:</span>
                <Badge className={`${getGrowthRate() >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                  {getGrowthRate() >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  %{Math.abs(getGrowthRate()).toFixed(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                  <p className="text-3xl font-bold text-gray-900">₺{getTotalRevenue().toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% bu ay</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                  <p className="text-3xl font-bold text-gray-900">{getTotalOrders()}</p>
                  <p className="text-xs text-blue-600 mt-1">+8.2% bu ay</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Müşteri</p>
                  <p className="text-3xl font-bold text-gray-900">{getTotalCustomers()}</p>
                  <p className="text-xs text-purple-600 mt-1">+15.3% bu ay</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ortalama Sipariş</p>
                  <p className="text-3xl font-bold text-gray-900">₺{customerAnalytics?.avgOrderValue.toFixed(2)}</p>
                  <p className="text-xs text-orange-600 mt-1">+5.7% bu ay</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Satış Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Grafik burada görüntülenecek</p>
                  <p className="text-sm text-gray-400">Chart.js veya Recharts entegrasyonu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Kategori Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopCategories().map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.orders} sipariş</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₺{category.revenue.toLocaleString()}</p>
                      <Badge className={`${category.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0 text-xs`}>
                        {category.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        %{Math.abs(category.growth).toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              En İyi Performans Gösteren Ürünler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopPerformingProducts().map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Satış</p>
                      <p className="font-bold text-blue-600">{product.sales}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Gelir</p>
                      <p className="font-bold text-green-600">₺{product.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sipariş</p>
                      <p className="font-bold text-purple-600">{product.orders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Puan</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-yellow-600">{product.avgRating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Müşteri Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Müşteri</span>
                <span className="font-bold text-2xl">{customerAnalytics?.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Yeni Müşteri</span>
                <span className="font-bold text-green-600">{customerAnalytics?.newCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dönen Müşteri</span>
                <span className="font-bold text-blue-600">{customerAnalytics?.returningCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ortalama Sipariş</span>
                <span className="font-bold text-purple-600">₺{customerAnalytics?.avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Müşteri Yaşam Değeri</span>
                <span className="font-bold text-orange-600">₺{customerAnalytics?.customerLifetimeValue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Günlük Aktivite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.slice(-7).map((data, index) => (
                  <div key={data.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(data.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">₺{data.revenue}</span>
                      <span className="text-blue-600">{data.orders} sipariş</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Hedefler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Aylık Gelir Hedefi</span>
                  <span>₺{getTotalRevenue().toLocaleString()} / ₺50,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((getTotalRevenue() / 50000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sipariş Hedefi</span>
                  <span>{getTotalOrders()} / 200</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((getTotalOrders() / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Müşteri Hedefi</span>
                  <span>{getTotalCustomers()} / 150</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((getTotalCustomers() / 150) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Rapor İndirme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span>Satış Raporu</span>
                <span className="text-xs text-gray-500">PDF</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span>Müşteri Raporu</span>
                <span className="text-xs text-gray-500">Excel</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                <span>Stok Raporu</span>
                <span className="text-xs text-gray-500">CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
