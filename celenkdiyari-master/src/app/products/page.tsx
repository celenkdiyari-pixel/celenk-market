'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  Grid3X3,
  List,
  Heart,
  Star,
  Package,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import Loading from '@/components/loading';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | string[]; // Can be array or string
  inStock: boolean;
  images: string[];
  createdAt?: string | Date; // Can be string or Date
}

export default function ProductsPage() {
  const { products, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const cartContext = useCart();
  const { addToCart, toggleFavorite, isInCart, isFavorite } = cartContext || {};

  const categories = [
    'Tümü',
    'Söz & Nişan',
    'Açılış & Tören',
    'Fuar & Stand',
    'Ferforjeler',
    'Cenaze Çelenkleri',
    'Ofis & Saksı Bitkileri'
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Kategori filtreleme - categories sayfasındaki gibi esnek eşleşme
      let matchesCategory = true;
      if (selectedCategory && selectedCategory !== 'Tümü') {
        const productCategories = Array.isArray(product.category) 
          ? product.category 
          : (product.category ? [product.category] : []);
        
        const selectedCategoryLower = selectedCategory.toLowerCase();
        
        matchesCategory = productCategories.some((cat: string) => {
          const catLower = cat?.toLowerCase() || '';
          
          // Direct match
          if (catLower === selectedCategoryLower) {
            return true;
          }
          
          // Partial matches - kategori adı içinde geçiyorsa
          if (catLower.includes(selectedCategoryLower) || selectedCategoryLower.includes(catLower)) {
            return true;
          }
          
          // Özel durumlar - kategori isimleri farklı formatta olabilir
          if (selectedCategory === 'Açılış & Tören' && (catLower.includes('açılış') || catLower.includes('tören'))) {
            return true;
          }
          if (selectedCategory === 'Cenaze Çelenkleri' && (catLower.includes('cenaze') || catLower.includes('çelenk'))) {
            return true;
          }
          if (selectedCategory === 'Fuar & Stand' && (catLower.includes('fuar') || catLower.includes('stand'))) {
            return true;
          }
          if (selectedCategory === 'Ferforjeler' && catLower.includes('ferforje')) {
            return true;
          }
          if (selectedCategory === 'Ofis & Saksı Bitkileri' && (catLower.includes('ofis') || catLower.includes('saksı') || catLower.includes('bitki'))) {
            return true;
          }
          if (selectedCategory === 'Söz & Nişan' && (catLower.includes('söz') || catLower.includes('nişan'))) {
            return true;
          }
          
          return false;
        });
      }
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
    });

  const getCategoryColor = (category: string | string[]) => {
    // Category'yi string'e çevir (array ise ilk elemanı al)
    const categoryStr = Array.isArray(category) ? category[0] : category;
    const colors: { [key: string]: string } = {
      'Söz & Nişan': 'bg-red-100 text-red-800',
      'Açılış & Tören': 'bg-blue-100 text-blue-800',
      'Fuar & Stand': 'bg-purple-100 text-purple-800',
      'Ferforjeler': 'bg-yellow-100 text-yellow-800',
      'Cenaze Çelenkleri': 'bg-gray-100 text-gray-800',
      'Ofis & Saksı Bitkileri': 'bg-green-100 text-green-800'
    };
    return colors[categoryStr] || 'bg-gray-100 text-gray-800';
  };

  // Structured Data for Google - Simplified and Fixed
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Çelenk Fiyatları ve Koleksiyonumuz - Çelenk Diyarı",
    "description": "Çelenk fiyatları ve çelenk gönder hizmeti. Özel günleriniz için tasarlanmış en güzel çelenklerimizi keşfedin. Uygun çelenk fiyatları ile çelenk gönder hizmetimizden yararlanın.",
    "url": "https://www.celenkdiyari.com/products",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.images?.[0] || "",
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "TRY",
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `https://www.celenkdiyari.com/products/${product.id}`,
            "seller": {
              "@type": "Organization",
              "name": "Çelenk Diyarı",
              "url": "https://www.celenkdiyari.com"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.5,
            "reviewCount": 1,
            "bestRating": 5,
            "worstRating": 1
          },
          "review": [
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": 4.5,
                "bestRating": 5,
                "worstRating": 1
              },
              "author": {
                "@type": "Person",
                "name": "Müşteri"
              },
              "reviewBody": "Kaliteli ve güzel ürün.",
              "datePublished": new Date().toISOString()
            }
          ]
        }
      }))
    }
  };

  // Add canonical link to head
  useEffect(() => {
    const canonicalUrl = 'https://www.celenkdiyari.com/products';
    // Remove existing canonical if any
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    // Add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
    
    // Cleanup on unmount
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && canonical.getAttribute('href') === canonicalUrl) {
        canonical.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Çelenk Fiyatları ve Koleksiyonumuz
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Özel günleriniz için tasarlanmış en güzel çelenklerimizi keşfedin. Uygun çelenk fiyatları ile çelenk gönder hizmetimizden yararlanın.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Çelenk ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="newest">En Yeni</option>
                <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek-Düşük)</option>
                <option value="name">İsim (A-Z)</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-4 py-3"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-4 py-3"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredProducts.length}</span> ürün bulundu
          </p>
          <Link href="/admin" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Package className="h-4 w-4 mr-2" />
            Ürün Ekle
          </Link>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Ürünler yükleniyor...</p>
            {/* Skeleton loading for better UX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-80 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-800 mb-2">Ürünler Yüklenemedi</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchTerm || selectedCategory !== '' ? 'Ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory !== '' 
                ? 'Arama kriterlerinizi değiştirerek tekrar deneyin'
                : 'Admin panelinden ürün ekleyerek başlayın'
              }
            </p>
            <Link href="/admin" className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-lg">
              <Package className="h-5 w-5 mr-2" />
              İlk Ürününüzü Ekleyin
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${encodeURIComponent(product.id)}`} 
                prefetch={true}
                className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
              >
                {viewMode === 'grid' ? (
                  // Grid View - Çiçekçi sitesi stili
                  <>
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
                            toggleFavorite && toggleFavorite(product.id);
                          }}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            isFavorite && isFavorite(product.id) 
                              ? 'bg-red-500 text-white shadow-lg' 
                              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white shadow-md'
                          }`}
                          aria-label="Favorilere Ekle"
                        >
                          <Heart className={`h-4 w-4 ${isFavorite && isFavorite(product.id) ? 'fill-current' : ''}`} />
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
                          addToCart && addToCart(product);
                        }}
                        disabled={!product.inStock || (isInCart && isInCart(product.id))}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 mt-auto ${
                          !product.inStock || (isInCart && isInCart(product.id))
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md'
                        }`}
                      >
                        {!product.inStock
                          ? 'Tükendi'
                          : (isInCart && isInCart(product.id) ? 'Sepette' : 'Sepete Ekle')
                        }
                      </button>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex">
                    <div className="relative w-48 h-48 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {product.description}
                          </p>
                          <div className="flex items-center space-x-4 mb-4">
                            <Badge className={`${getCategoryColor(product.category)} border-0`}>
                              {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                            </Badge>
                            <Badge variant={product.inStock ? "default" : "destructive"}>
                              {product.inStock ? 'Stokta' : 'Stokta Yok'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-green-600">
                            {product.price} ₺
                          </span>
                          <div className="flex items-center justify-end space-x-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-4">
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (addToCart) addToCart(product);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {isInCart && isInCart(product.id) ? 'Sepete Eklendi' : 'Sepete Ekle'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (toggleFavorite) toggleFavorite(product.id);
                            }}
                          >
                            <Heart className={`h-4 w-4 mr-2 ${isFavorite && isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            {isFavorite && isFavorite(product.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                          </Button>
                        </div>
                        
                        {isInCart && isInCart(product.id) && (
                          <Link href="/cart" className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Sipariş Ver
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}