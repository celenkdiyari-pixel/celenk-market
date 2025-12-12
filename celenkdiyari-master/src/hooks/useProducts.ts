import { useState, useEffect, useCallback, useRef } from 'react';
import { cache } from '@/lib/cache';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | string[]; // Can be array or string
  inStock: boolean;
  images: string[];
  createdAt?: string | Date; // Can be string or Date
  updatedAt?: string | Date; // Can be string or Date
}

export function useProducts() {
  // Initialize with cache if available for instant display
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = cache.get('products');
    return (cached && Array.isArray(cached) && cached.length > 0) ? cached : [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    const cached = cache.get('products');
    return !(cached && Array.isArray(cached) && cached.length > 0);
  });
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      // If we already have cached products, don't show loading
      const cachedProducts = cache.get('products');
      if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
        // Only set loading if we don't have products yet
        if (products.length === 0) {
          setIsLoading(true);
        }
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Check cache first - immediate response
      if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
        setProducts(cachedProducts);
        setIsLoading(false);
        
        // Update in background (non-blocking) - Use CDN cache only
        // Don't use browser cache to avoid ERR_CACHE_WRITE_FAILURE
        fetch('/api/products', {
          cache: 'no-cache', // Always fetch from CDN, but don't write to browser cache
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return null;
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              setProducts(data);
              cache.set('products', data, 600000); // 10 minutes client cache
            }
          })
          .catch((error) => {
            // Cache hatası önemli değil, sessizce devam et
            if (process.env.NODE_ENV === 'development') {
              console.warn('Background fetch error (ignored):', error);
            }
          });
        return;
      }

      // Fetch from API if no cache - Use CDN cache only
      // Don't use browser cache to avoid ERR_CACHE_WRITE_FAILURE
      try {
        const response = await fetch('/api/products', {
          cache: 'no-cache', // Always fetch from CDN, but don't write to browser cache
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setProducts(data);
            cache.set('products', data, 600000); // 10 minutes client cache
            setIsLoading(false);
          } else {
            setError('Ürünler yüklenirken hata oluştu');
            setIsLoading(false);
          }
        } else {
          setError('Ürünler yüklenirken hata oluştu');
          setIsLoading(false);
        }
      } catch (error) {
        setError('Ürünler yüklenirken hata oluştu');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Ürünler yüklenirken hata oluştu');
      setIsLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refreshProducts = useCallback(() => {
    // Cache'i tamamen temizle
    cache.delete('products');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('products_cache');
    }
    // Yeni verileri yükle
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    error,
    refreshProducts
  };
}
