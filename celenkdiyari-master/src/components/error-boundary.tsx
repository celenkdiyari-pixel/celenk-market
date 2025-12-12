'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Browser extension hatalarını filtrele - state'e bile set etme
    const isExtensionError = error.message?.includes('One Click Image Downloader') ||
                            error.message?.includes('content_script') ||
                            error.stack?.includes('7880f8283a6f3daf.js') ||
                            error.stack?.includes('b1e8249f0d46c9fe.js') ||
                            error.stack?.includes('454879196fd41373.js');
    
    if (isExtensionError) {
      // Extension hatalarını tamamen görmezden gel
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Browser extension hatalarını filtrele
    const isExtensionError = error.message?.includes('One Click Image Downloader') ||
                            error.message?.includes('content_script') ||
                            error.stack?.includes('7880f8283a6f3daf.js') ||
                            error.stack?.includes('b1e8249f0d46c9fe.js') ||
                            error.stack?.includes('454879196fd41373.js');
    
    if (isExtensionError) {
      // Extension hatalarını tamamen görmezden gel - hiçbir şey loglama
      return;
    }
    
    // Sadece gerçek hataları logla (development'ta)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Hata durumunda sessizce devam et - hiçbir şey loglama
      return this.props.children;
    }

    return this.props.children;
  }
}
