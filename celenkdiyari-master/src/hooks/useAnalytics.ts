'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  sessionId: string;
  pageViews: number;
  sessionStart: number;
  lastActivity: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const trackPageView = async (isExit = false) => {
    if (!analytics) return;

    try {
      const sessionDuration = Math.floor((Date.now() - analytics.sessionStart) / 1000);
      
      const trackingData = {
        page: window.location.pathname + window.location.search,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionId: analytics.sessionId,
        pageViews: analytics.pageViews,
        sessionDuration: isExit ? sessionDuration : 0
      };

      console.log('📊 Tracking page view:', trackingData);

      await fetch('/api/track-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData),
      });

      console.log('✅ Page view tracked successfully');
    } catch (error) {
      console.error('❌ Error tracking page view:', error);
    }
  };

  useEffect(() => {
    // Session ID'yi al veya oluştur
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    // Sayfa görüntüleme sayısını al
    const pageViews = parseInt(sessionStorage.getItem('analytics_page_views') || '0') + 1;
    sessionStorage.setItem('analytics_page_views', pageViews.toString());

    // Oturum başlangıç zamanını al
    const sessionStart = parseInt(sessionStorage.getItem('analytics_session_start') || Date.now().toString());
    if (!sessionStorage.getItem('analytics_session_start')) {
      sessionStorage.setItem('analytics_session_start', sessionStart.toString());
    }

    const analyticsData: AnalyticsData = {
      sessionId,
      pageViews,
      sessionStart,
      lastActivity: Date.now()
    };

    setAnalytics(analyticsData);

    // Sayfa kapatılırken son tracking gönder
    const handleBeforeUnload = () => {
      trackPageView(true);
    };

    // Kullanıcı aktivitesini takip et
    const updateActivity = () => {
      setAnalytics(prev => prev ? { ...prev, lastActivity: Date.now() } : null);
    };

    // Event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  // Analytics data değiştiğinde tracking gönder
  useEffect(() => {
    if (analytics) {
      trackPageView();
    }
  }, [analytics]);

  return { analytics, trackPageView };
}
