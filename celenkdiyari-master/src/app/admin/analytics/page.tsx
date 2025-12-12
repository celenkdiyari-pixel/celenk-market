'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  LogIn,
  LogOut,
  MapPin,
  Clock,
  RefreshCw,
  UserCheck,
  Activity,
  Eye,
  TrendingUp
} from 'lucide-react';

interface UserActivity {
  id: string;
  type: 'login' | 'logout';
  timestamp: string;
  user: string;
  city: string;
  country: string;
  ip: string;
  device: string;
  browser: string;
}

interface AnalyticsData {
  activeUsers: number;
  totalLogins: number;
  totalLogouts: number;
  userActivities: UserActivity[];
  cityStats: Array<{ city: string; count: number }>;
  recentActivities: UserActivity[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    totalLogins: 0,
    totalLogouts: 0,
    userActivities: [],
    cityStats: [],
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Sadece gerçek Firebase verilerini yükle
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      
      if (response.ok) {
        const firebaseData = await response.json();
        
        // Firebase'den gelen gerçek verileri işle
        const userActivities: UserActivity[] = firebaseData.recentVisitors?.map((visitor: Record<string, unknown>) => ({
          id: visitor.id as string,
          type: 'login' as const,
          timestamp: visitor.timestamp as string,
          user: `Ziyaretçi ${(visitor.ip as string)?.split('.').pop() || 'Unknown'}`,
          city: (visitor.city as string) || 'Bilinmiyor',
          country: (visitor.country as string) || 'Türkiye',
          ip: visitor.ip as string,
          device: visitor.device as string,
          browser: visitor.browser as string
        })) || [];

        // Şehir istatistikleri
        const cityCounts: { [key: string]: number } = {};
        userActivities.forEach(activity => {
          cityCounts[activity.city] = (cityCounts[activity.city] || 0) + 1;
        });
        const cityStats = Object.entries(cityCounts)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count);

        const analyticsData: AnalyticsData = {
          activeUsers: firebaseData.uniqueVisitors || 0,
          totalLogins: userActivities.length,
          totalLogouts: 0,
          userActivities,
          cityStats,
          recentActivities: userActivities.slice(0, 20)
        };
        
        setAnalytics(analyticsData);
        console.log('✅ Gerçek Firebase analytics loaded:', analyticsData);
      } else {
        // Eğer Firebase'de veri yoksa, boş veri göster
        const analyticsData: AnalyticsData = {
          activeUsers: 0,
          totalLogins: 0,
          totalLogouts: 0,
          userActivities: [],
          cityStats: [],
          recentActivities: []
        };
        setAnalytics(analyticsData);
        console.log('ℹ️ No analytics data found, showing empty state');
      }
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      setError('Analitik verileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        loadAnalytics();
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

  useEffect(() => {
    if (isAuthenticated && timeRange) {
      loadAnalytics();
    }
  }, [timeRange, isAuthenticated, loadAnalytics]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '1': return 'Son 1 Gün';
      case '7': return 'Son 7 Gün';
      case '30': return 'Son 30 Gün';
      case '90': return 'Son 90 Gün';
      default: return 'Son 7 Gün';
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-elegant font-bold text-gray-900 mb-2">
              Kullanıcı Analitikleri
            </h1>
            <p className="text-gray-600">
              Gerçek kullanıcı verileri ve site trafiği analizi
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="1">Son 1 Gün</option>
              <option value="7">Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
              <option value="90">Son 90 Gün</option>
            </select>
            
            <Button
              onClick={loadAnalytics}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Ana İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Kullanıcılar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {getTimeRangeLabel(timeRange)} içinde
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Giriş</CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLogins}</div>
              <p className="text-xs text-muted-foreground">
                Site ziyaretleri
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Çıkış</CardTitle>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLogouts}</div>
              <p className="text-xs text-muted-foreground">
                Çıkış yapılan oturumlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Şehir Sayısı</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.cityStats.length}</div>
              <p className="text-xs text-muted-foreground">
                Farklı şehirlerden ziyaret
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Şehir Dağılımı */}
        {analytics.cityStats.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Şehir Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.cityStats.slice(0, 10).map((city, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <Badge variant="secondary">{city.count} ziyaret</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Son Aktiviteler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-gray-500">{activity.city}, {activity.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.type === 'login' ? 'Giriş' : 'Çıkış'}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz aktivite verisi bulunmuyor</p>
                <p className="text-sm text-gray-400 mt-2">
                  Site ziyaretçileri geldikçe burada görünecek
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}