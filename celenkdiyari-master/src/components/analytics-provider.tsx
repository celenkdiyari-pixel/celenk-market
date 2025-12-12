'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { analytics } = useAnalytics();

  useEffect(() => {
    // Analytics tracking'i başlat
    console.log('📊 Analytics provider initialized');
  }, []);

  // Error boundary için try-catch
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('❌ Analytics provider error:', error);
    return <>{children}</>;
  }
}
