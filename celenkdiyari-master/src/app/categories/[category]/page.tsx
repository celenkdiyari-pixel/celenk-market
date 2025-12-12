'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { 
  ArrowLeft,
  Package,
  Gift,
  Flower,
  Heart as HeartIcon,
  Building,
  Wrench,
  Leaf,
  ShoppingCart,
  Star,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | string[]; // Can be array or string
  inStock: boolean;
  images: string[];
  createdAt?: string | Date; // Can be string or Date
  rating?: number;
  reviews?: number;
}

interface CategoryInfo {
  title: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = decodeURIComponent(params.category as string);
  
  const { products: allProducts, isLoading, error } = useProducts();
  const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();
  
  // Client-side render kontrolü
  const [isClient, setIsClient] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kategori bilgileri
  const categoryInfo: { [key: string]: CategoryInfo } = {
    'açılış-tören': {
      title: 'Açılış & Tören Çelenkleri',
      description: 'İş yerinizin açılışında ve özel törenlerinizde kullanabileceğiniz şık ve profesyonel çelenk tasarımları',
      image: '/images/categories/açılıştören.jpg',
      icon: Gift,
      color: 'from-blue-500 to-cyan-500',
      features: ['Profesyonel Tasarım', 'Uzun Ömürlü', 'Özel Günler İçin', 'Kurumsal Kalite']
    },
    'cenaze-çelenkleri': {
      title: 'Cenaze Çelenkleri',
      description: 'Sevdiklerinizi son yolculuğunda uğurlarken saygı ve sevgi dolu anma çelenkleri',
      image: '/images/categories/cenaze.jpg',
      icon: Flower,
      color: 'from-gray-500 to-slate-500',
      features: ['Saygılı Tasarım', 'Kaliteli Malzeme', 'Türkiye genelinde aynı gün teslimat', 'Anma Hediyesi']
    },
    'ferforjeler': {
      title: 'Ferforje Çelenkleri',
      description: 'Metal işçiliği ile hazırlanmış dayanıklı ve estetik ferforje çelenk tasarımları',
      image: '/images/categories/ferforje.png',
      icon: Wrench,
      color: 'from-yellow-500 to-amber-500',
      features: ['Dayanıklı Malzeme', 'Estetik Tasarım', 'Uzun Ömürlü', 'Özel İşçilik']
    },
    'fuar-stand': {
      title: 'Fuar & Stand Çelenkleri',
      description: 'Fuar ve stand etkinlikleri için dikkat çekici ve profesyonel çelenk tasarımları',
      image: '/images/categories/fuar stand.jpg',
      icon: Building,
      color: 'from-purple-500 to-violet-500',
      features: ['Dikkat Çekici', 'Profesyonel', 'Etkinlik Odaklı', 'Kaliteli Görünüm']
    },
    'ofis-saksı-bitkileri': {
      title: 'Ofis & Saksı Bitkileri',
      description: 'Ofis ve ev için hava kalitesini artıran, dekoratif saksı bitkileri',
      image: '/images/categories/ofis bitki.jpg',
      icon: Leaf,
      color: 'from-green-500 to-emerald-500',
      features: ['Hava Temizleyici', 'Dekoratif', 'Bakım Kolay', 'Ofis Dostu']
    },
    'söz-nişan': {
      title: 'Söz & Nişan Çelenkleri',
      description: 'Hayatınızın en özel anlarında sevdiklerinizi mutlu edecek romantik ve zarif çelenk aranjmanları',
      image: '/images/categories/söznişan.jpg',
      icon: HeartIcon,
      color: 'from-pink-500 to-rose-500',
      features: ['Romantik Tasarım', 'Özel Günler', 'Zarif Görünüm', 'Aşk Dolu']
    }
  };

  const currentCategory = categoryInfo[categorySlug];

  // Client-side render kontrolü
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Ürünler Yüklenemedi</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Sayfayı Yenile
              </Button>
              <Link href="/">
                <Button variant="outline" className="border-gray-300">
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kategori eşleştirme mapping'i - slug'dan kategori adlarına
  const categoryMapping: { [key: string]: string[] } = {
    'açılış-tören': ['Açılış & Tören', 'Açılış', 'Tören', 'Açılış Tören', 'açılış & tören', 'açılış', 'tören'],
    'cenaze-çelenkleri': ['Cenaze Çelenkleri', 'Cenaze', 'Çelenk', 'cenaze çelenkleri', 'cenaze', 'çelenk'],
    'ferforjeler': ['Ferforjeler', 'Ferforje', 'ferforjeler', 'ferforje'],
    'fuar-stand': ['Fuar & Stand', 'Fuar', 'Stand', 'fuar & stand', 'fuar', 'stand'],
    'ofis-saksı-bitkileri': ['Ofis & Saksı Bitkileri', 'Ofis', 'Saksı Bitkileri', 'ofis & saksı bitkileri', 'ofis', 'saksı', 'bitki'],
    'söz-nişan': ['Söz & Nişan', 'Söz', 'Nişan', 'söz & nişan', 'söz', 'nişan']
  };

  // Filter products based on category - iyileştirilmiş eşleştirme mantığı
  const getFilteredProducts = () => {
    try {
      if (!allProducts || allProducts.length === 0) {
        return [];
      }

      if (!currentCategory) {
        return [];
      }

      // Kategori slug'ı için eşleşen kategori adlarını al
      const matchingCategoryNames = categoryMapping[categorySlug] || [];
      
      // Category title'ı da ekle
      if (currentCategory.title) {
        matchingCategoryNames.push(currentCategory.title, currentCategory.title.toLowerCase());
      }

      return allProducts.filter((product: Product) => {
        try {
          // Product category'yi array veya string olarak işle
          const productCategories = Array.isArray(product.category) 
            ? product.category 
            : (product.category ? [product.category] : []);
          
          if (productCategories.length === 0) {
            return false;
          }
          
          // Her kategori adını kontrol et
          return productCategories.some((cat: string) => {
            if (!cat || typeof cat !== 'string') {
              return false;
            }
            
            const catLower = cat.toLowerCase().trim();
            
            // Direct exact match
            if (matchingCategoryNames.some(name => name.toLowerCase().trim() === catLower)) {
              return true;
            }
            
            // Partial match - kategori adının içinde geçiyor mu
            for (const matchName of matchingCategoryNames) {
              const matchLower = matchName.toLowerCase().trim();
              
              // Her iki yönde de kontrol et
              if (catLower.includes(matchLower) || matchLower.includes(catLower)) {
                // Çok kısa kelimeler için ekstra kontrol
                if (matchLower.length >= 3 && catLower.length >= 3) {
                  return true;
                }
              }
            }
            
            // Özel durumlar için kelime bazlı eşleştirme
            const categoryWords = categorySlug.split('-');
            const productWords = catLower.split(/[\s,&-]+/);
            
            // Her kategori kelimesi için ürün kategorisinde eşleşme var mı kontrol et
            let wordMatches = 0;
            for (const catWord of categoryWords) {
              if (catWord.length >= 3 && productWords.some(pw => pw.includes(catWord) || catWord.includes(pw))) {
                wordMatches++;
              }
            }
            
            // En az yarısı eşleşirse kabul et
            if (wordMatches >= Math.ceil(categoryWords.length / 2)) {
              return true;
            }
            
            return false;
          });
        } catch (err) {
          return false;
        }
      });
    } catch (err) {
      return [];
    }
  };

  // Filter and sort products
  const filteredProducts = getFilteredProducts().sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return a.name.localeCompare(b.name, 'tr');
      case 'newest':
      default:
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    }
  });

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız kategori mevcut değil.</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = currentCategory.icon;

  const handleAddToCart = (product: Product) => {
    if (addToCart) {
      addToCart(product);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    if (toggleFavorite) {
      toggleFavorite(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-green-600 transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{currentCategory.title}</span>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {currentCategory.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {currentCategory.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {currentCategory.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ana Sayfaya Dön
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={currentCategory.image}
                  alt={currentCategory.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* Sort Options */}
          {filteredProducts.length > 0 && (
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredProducts.length}</span> ürün bulundu
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
                  Sırala:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high' | 'name')}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="newest">En Yeni</option>
                  <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                  <option value="name">İsme Göre (A-Z)</option>
                </select>
              </div>
            </div>
          )}
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ürün Bulunamadı</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Bu kategoride henüz ürün bulunmuyor. Yakında yeni ürünler eklenecek.
              </p>
              <Link href="/products">
                <Button className="bg-green-600 hover:bg-green-700">
                  Tüm Ürünleri Gör
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filteredProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/products/${encodeURIComponent(product.id)}`}
                  prefetch={true}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
                >
                  {/* Product Image - Çiçekçi sitesi stili: büyük ve net görsel */}
                  <div className="relative h-80 overflow-hidden">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority={false}
                        loading="lazy"
                        quality={80}
                        fetchPriority="low"
                        unoptimized={product.images[0]?.includes('blob.vercel-storage.com')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                        <Package className="h-20 w-20 text-green-400" />
                      </div>
                    )}
                    
                    {/* Stock Badge - Çiçekçi sitesi stili: minimal ve şık */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {product.inStock ? 'Stokta' : 'Tükendi'}
                      </span>
                    </div>

                    {/* Favorite Button - Çiçekçi sitesi stili: sade */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFavorite(product.id);
                        }}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          isFavorite && isFavorite(product.id) 
                            ? 'bg-red-500 text-white shadow-lg' 
                            : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white shadow-md'
                        }`}
                        aria-label="Favorilere Ekle"
                      >
                        <HeartIcon className={`h-4 w-4 ${isFavorite && isFavorite(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Product Info - Çiçekçi sitesi stili: sade ve net */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Product Name - Çiçekçi sitesi stili: büyük ve belirgin */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Description - Çiçekçi sitesi stili: kısa ve öz */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price - Çiçekçi sitesi stili: büyük ve belirgin */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold text-green-600">
                        ₺{product.price?.toFixed(2) || '0.00'}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= 4 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                      </div>
                    </div>

                    {/* Add to Cart Button - Çiçekçi sitesi stili: büyük ve belirgin */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.inStock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 mt-auto ${
                        !product.inStock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md'
                      }`}
                    >
                      {!product.inStock ? 'Tükendi' : 'Sepete Ekle'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}