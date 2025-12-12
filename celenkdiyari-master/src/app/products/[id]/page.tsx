'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams } from 'next/navigation';
import { cache } from '@/lib/cache';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Heart, 
  Star,
  Shield,
  CheckCircle,
  Phone,
  Share2,
  Minus,
  Plus,
  Eye,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Flower
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string | string[];
  tags: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  features?: string[];
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  weight?: number;
  materials?: string[];
  careInstructions?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Memoized Related Product Card
const RelatedProductCard = memo(({ product }: { product: Product }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
    <Link href={`/products/${product.id}`} prefetch={true}>
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <Image
          src={product.images?.[0] || '/images/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">₺{product.price.toFixed(2)}</span>
          <Badge className={`text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.inStock ? 'Stokta' : 'Stokta Yok'}
          </Badge>
        </div>
      </div>
    </Link>
  </div>
));

RelatedProductCard.displayName = 'RelatedProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const cartContext = useCart();
  const { addToCart, toggleFavorite, isInCart, isFavorite } = cartContext || {};
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('features');

  const productId = useMemo(() => {
    if (!params || !params.id) return null;
    const id = String(params.id).trim();
    return (id && id !== 'undefined' && id !== 'null' && id !== '') ? id : null;
  }, [params]);

  const loadRelatedProducts = useCallback(async (category: string | string[], currentProductId: string) => {
    if (!category) return;
    try {
      const categoryStr = Array.isArray(category) ? category[0] : category;
      const response = await fetch(`/api/products?category=${encodeURIComponent(categoryStr)}&limit=4`, {
        next: { revalidate: 300 }
      });
      
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((p: Product) => p.id !== currentProductId);
        setRelatedProducts(filtered.slice(0, 3));
      }
    } catch (error) {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      setError('Ürün ID bulunamadı');
      return;
    }

    const loadProduct = async () => {
      try {
        setProduct(null);
        setIsLoading(true);
        setError('');
        
        const cacheKey = `product-${productId}`;
        const cachedProduct = cache.get(cacheKey);
        
        if (cachedProduct && cachedProduct.id && cachedProduct.name) {
          setProduct(cachedProduct);
          setIsLoading(false);
          setError('');
          
          // Update in background
          fetch(`/api/products/${encodeURIComponent(productId)}`, {
            next: { revalidate: 300 }
          })
            .then(async (response) => {
              if (!response.ok) return;
              const data = await response.json();
              if (data && !data.error && data.id) {
                setProduct(data);
                cache.set(cacheKey, data, 300000);
              }
            })
            .catch(() => {});
          return;
        }
        
        const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
          next: { revalidate: 300 }
        });
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: `Ürün yüklenemedi (${response.status})` };
          }
          setError(errorData.error || `Ürün yüklenemedi (${response.status})`);
          setIsLoading(false);
          setProduct(null);
          return;
        }
        
        const data = await response.json();
        
        if (data && !data.error && data.id && data.name) {
          setError('');
          cache.set(cacheKey, data, 300000);
          setProduct(data);
          setIsLoading(false);
        } else if (data.error) {
          setError(data.error);
          setProduct(null);
          setIsLoading(false);
        } else {
          setError('Ürün bulunamadı');
          setProduct(null);
          setIsLoading(false);
        }
      } catch (error) {
        setError('Ürün yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setIsLoading(false);
        setProduct(null);
      }
    };
    
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product && product.category && product.id) {
      loadRelatedProducts(product.category, product.id);
    }
  }, [product?.id, product?.category, loadRelatedProducts]);

  const handleAddToCart = useCallback(() => {
    if (product && addToCart) {
      addToCart(product);
    }
  }, [product, addToCart]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Silently fail
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  }, [product]);

  // SEO - Structured Data
  useEffect(() => {
    if (!product || !product.id) return;
    
    const timeoutId = setTimeout(() => {
      try {
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) existingCanonical.remove();
        
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = `https://www.celenkdiyari.com/products/${product.id}`;
        document.head.appendChild(link);
        
        const existingScript = document.querySelector('script[type="application/ld+json"][data-product-id]');
        if (existingScript) existingScript.remove();
        
        setTimeout(() => {
          try {
            const structuredData = {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name || 'Ürün',
              "description": `${product.description || ''} Uygun çelenk fiyatları ile çelenk gönder hizmetimizden yararlanın.`,
              "image": product.images || [],
              "category": Array.isArray(product.category) ? product.category[0] : product.category || '',
              "brand": {
                "@type": "Brand",
                "name": "Çelenk Diyarı"
              },
              "offers": {
                "@type": "Offer",
                "price": product.price || 0,
                "priceCurrency": "TRY",
                "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": "Çelenk Diyarı",
                  "url": "https://www.celenkdiyari.com"
                },
                "url": `https://www.celenkdiyari.com/products/${product.id}`
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating || 4.5,
                "reviewCount": product.reviewCount || 1,
                "bestRating": 5,
                "worstRating": 1
              }
            };
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-product-id', product.id);
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error adding structured data:', error);
            }
          }
        }, 100);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding canonical link:', error);
        }
      }
    }, 200);
    
    return () => {
      clearTimeout(timeoutId);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
      const scriptToRemove = document.querySelector(`script[type="application/ld+json"][data-product-id="${product.id}"]`);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [product?.id]);

  const isInCartMemo = useMemo(() => isInCart && product ? isInCart(product.id) : false, [isInCart, product]);
  const isFavoriteMemo = useMemo(() => isFavorite && product ? isFavorite(product.id) : false, [isFavorite, product]);
  const featuresArray = useMemo(() => {
    if (!product?.features) return [];
    const features: string[] | string | undefined = product.features as string[] | string | undefined;
    if (Array.isArray(features)) {
      return features.filter((f: any) => f && String(f).trim());
    }
    if (typeof features === 'string') {
      return features.split('\n').filter((f: string) => f && f.trim());
    }
    return [];
  }, [product?.features]);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Ürün Yüklenemedi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Sayfayı Yenile
              </Button>
              <Link href="/products">
                <Button variant="outline" className="border-gray-300">
                  Ürünlere Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ürün bulunamadı.</p>
          <Link href="/products" className="text-green-600 hover:underline mt-4 inline-block">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" prefetch={true} className="hover:text-green-600">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/products" prefetch={true} className="hover:text-green-600">Ürünler</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 group cursor-pointer max-h-96"
                 onClick={() => setShowImageModal(true)}>
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  unoptimized={product.images[selectedImageIndex]?.includes('blob.vercel-storage.com')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Flower className="h-24 w-24 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-20 h-20 relative overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-green-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-elegant font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl lg:text-4xl font-bold text-green-600">₺{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">₺{product.originalPrice.toFixed(2)}</span>
                )}
                <Badge className={`px-3 py-1 ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.inStock ? 'Stokta' : 'Stokta Yok'}
                </Badge>
              </div>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm lg:text-base line-clamp-4">
                  {product.description}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Adet:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isInCartMemo ? 'Sepete Eklendi' : 'Sepete Ekle'}
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => toggleFavorite && toggleFavorite(product.id)}
                  className={`flex-1 py-3 ${
                    isFavoriteMemo 
                      ? 'text-red-500 border-red-500 hover:bg-red-50' 
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavoriteMemo ? 'fill-current' : ''}`} />
                  {isFavoriteMemo ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1 py-3 text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Paylaş
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4 border-t">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800 text-sm">Güvenli Ödeme</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800 text-sm">Kalite Garantisi</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <Phone className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 text-sm">Müşteri Desteği</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('features')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'features'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Özellikler</span>
              </button>
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'features' && (
              <div className="space-y-6">
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Ürün Açıklaması</h3>
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </div>
                    </div>
                  </div>
                )}
                
                {featuresArray.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Ürün Özellikleri</h3>
                    <ul className="space-y-3">
                      {featuresArray.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {featuresArray.length === 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Ürün Özellikleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>%100 Doğal Malzeme</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Profesyonel Tasarım</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Uzun Ömürlü</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Hediyelik Paketleme</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Kullanım Alanları</h4>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Düğün & Nikah</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Açılış & Tören</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Özel Günler</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Hediyelik</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showImageModal && product.images && product.images.length > 0 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative">
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                width={800}
                height={800}
                className="rounded-lg"
                priority
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => 
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => 
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
