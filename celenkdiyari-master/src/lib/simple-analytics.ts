// Simple Analytics - Kolay kurulabilir analitik sistemi
export interface SimpleAnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  referrers: Array<{ referrer: string; visits: number }>;
  devices: Array<{ device: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  cities: Array<{ city: string; count: number }>;
  realtimeVisitors: number;
  lastUpdated: string;
}

// Basit analitik verileri oluştur
export function generateSimpleAnalytics(): SimpleAnalyticsData {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Gerçekçi veriler oluştur
  const pageViews = Math.floor(Math.random() * 500) + 200;
  const uniqueVisitors = Math.floor(pageViews * 0.6);
  const bounceRate = Math.floor(Math.random() * 30) + 40; // 40-70% arası
  const avgSessionDuration = Math.floor(Math.random() * 300) + 120; // 2-7 dakika arası
  
  return {
    pageViews,
    uniqueVisitors,
    bounceRate,
    avgSessionDuration,
    topPages: [
      { page: '/', views: Math.floor(pageViews * 0.3) },
      { page: '/products', views: Math.floor(pageViews * 0.25) },
      { page: '/categories/açılış-töreni', views: Math.floor(pageViews * 0.15) },
      { page: '/categories/cenaze-töreni', views: Math.floor(pageViews * 0.12) },
      { page: '/categories/ferforje', views: Math.floor(pageViews * 0.08) },
      { page: '/about', views: Math.floor(pageViews * 0.05) },
      { page: '/contact', views: Math.floor(pageViews * 0.05) }
    ],
    referrers: [
      { referrer: 'Google', visits: Math.floor(uniqueVisitors * 0.4) },
      { referrer: 'Direct', visits: Math.floor(uniqueVisitors * 0.25) },
      { referrer: 'Facebook', visits: Math.floor(uniqueVisitors * 0.15) },
      { referrer: 'Instagram', visits: Math.floor(uniqueVisitors * 0.1) },
      { referrer: 'WhatsApp', visits: Math.floor(uniqueVisitors * 0.05) },
      { referrer: 'Other', visits: Math.floor(uniqueVisitors * 0.05) }
    ],
    devices: [
      { device: 'Mobile', count: Math.floor(uniqueVisitors * 0.7) },
      { device: 'Desktop', count: Math.floor(uniqueVisitors * 0.25) },
      { device: 'Tablet', count: Math.floor(uniqueVisitors * 0.05) }
    ],
    browsers: [
      { browser: 'Chrome', count: Math.floor(uniqueVisitors * 0.5) },
      { browser: 'Safari', count: Math.floor(uniqueVisitors * 0.25) },
      { browser: 'Firefox', count: Math.floor(uniqueVisitors * 0.15) },
      { browser: 'Edge', count: Math.floor(uniqueVisitors * 0.1) }
    ],
    countries: [
      { country: 'Türkiye', count: Math.floor(uniqueVisitors * 0.9) },
      { country: 'Almanya', count: Math.floor(uniqueVisitors * 0.05) },
      { country: 'Hollanda', count: Math.floor(uniqueVisitors * 0.03) },
      { country: 'Diğer', count: Math.floor(uniqueVisitors * 0.02) }
    ],
    cities: [
      { city: 'İstanbul', count: Math.floor(uniqueVisitors * 0.3) },
      { city: 'Ankara', count: Math.floor(uniqueVisitors * 0.2) },
      { city: 'İzmir', count: Math.floor(uniqueVisitors * 0.15) },
      { city: 'Bursa', count: Math.floor(uniqueVisitors * 0.1) },
      { city: 'Antalya', count: Math.floor(uniqueVisitors * 0.08) },
      { city: 'Adana', count: Math.floor(uniqueVisitors * 0.07) },
      { city: 'Diğer', count: Math.floor(uniqueVisitors * 0.1) }
    ],
    realtimeVisitors: Math.floor(Math.random() * 10) + 1,
    lastUpdated: now.toISOString()
  };
}

// Ziyaretçi takibi için basit fonksiyon
export function trackVisitor(page: string, userAgent: string, ip: string) {
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop';
  const browser = getBrowserFromUserAgent(userAgent);
  const country = 'Türkiye'; // Basit varsayım
  const city = getRandomCity();
  
  return {
    page,
    device,
    browser,
    country,
    city,
    ip,
    timestamp: new Date().toISOString()
  };
}

function getBrowserFromUserAgent(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

function getRandomCity(): string {
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];
  return cities[Math.floor(Math.random() * cities.length)];
}
