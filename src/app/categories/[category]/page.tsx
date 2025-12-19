'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingCart,
  Heart,
  Search,
  Grid3X3,
  List,
  ArrowLeft,
  Star,
  Leaf,
  Gift,
  Flower,
  Heart as HeartIcon,
  Building,
  Wrench,
  Package,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  images: string[];
  createdAt?: string;
  rating?: number;
  reviews?: number;
}

interface CategoryInfo {
  title: string;
  categoryValue: string; // exact category text stored on products
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
}

// Stable category metadata to avoid re-renders/useEffect re-runs
const CATEGORY_INFO: { [key: string]: CategoryInfo } = {
  'acilistoren': {
    title: 'Açılış & Tören Çelenkleri',
    categoryValue: 'Açılış & Tören',
    description: 'İş yerinizin açılışında ve özel törenlerinizde kullanabileceğiniz şık ve profesyonel çelenk tasarımları',
    image: '/images/categories/açılıştören.jpg',
    icon: Gift,
    color: 'from-blue-500 to-cyan-500',
    features: ['Profesyonel Tasarım', 'Uzun Ömürlü', 'Özel Günler İçin', 'Kurumsal Kalite']
  },
  'cenaze': {
    title: 'Cenaze Çelenkleri',
    categoryValue: 'Cenaze Çelenkleri',
    description: 'Sevdiklerinizi son yolculuğunda uğurlarken saygı ve sevgi dolu anma çelenkleri',
    image: '/images/categories/cenaze.jpg',
    icon: Flower,
    color: 'from-gray-500 to-slate-500',
    features: ['Saygılı Tasarım', 'Kaliteli Malzeme', 'Hızlı Teslimat', 'Anma Hediyesi']
  },
  'ferforje': {
    title: 'Ferforje Çelenkleri',
    categoryValue: 'Ferforjeler',
    description: 'Metal işçiliği ile hazırlanmış dayanıklı ve estetik ferforje çelenk tasarımları',
    image: '/images/categories/ferforje.png',
    icon: Wrench,
    color: 'from-yellow-500 to-amber-500',
    features: ['Dayanıklı Malzeme', 'Estetik Tasarım', 'Uzun Ömürlü', 'Özel İşçilik']
  },
  'fuarstand': {
    title: 'Fuar & Stand Çelenkleri',
    categoryValue: 'Fuar & Stand',
    description: 'Fuar ve stand etkinlikleri için dikkat çekici ve profesyonel çelenk tasarımları',
    image: '/images/categories/fuar stand.jpg',
    icon: Building,
    color: 'from-purple-500 to-violet-500',
    features: ['Dikkat Çekici', 'Profesyonel', 'Etkinlik Odaklı', 'Kaliteli Görünüm']
  },
  'ofisbitki': {
    title: 'Ofis & Saksı Bitkileri',
    categoryValue: 'Ofis & Saksı Bitkileri',
    description: 'Ofis ve ev için hava kalitesini artıran, dekoratif saksı bitkileri',
    image: '/images/categories/ofis bitki.jpg',
    icon: Leaf,
    color: 'from-green-500 to-emerald-500',
    features: ['Hava Temizleyici', 'Dekoratif', 'Bakım Kolay', 'Ofis Dostu']
  },
  'soznisan': {
    title: 'Söz & Nişan Çelenkleri',
    categoryValue: 'Söz & Nişan',
    description: 'Hayatınızın en özel anlarında sevdiklerinizi mutlu edecek romantik ve zarif çelenk aranjmanları',
    image: '/images/categories/söznişan.jpg',
    icon: HeartIcon,
    color: 'from-pink-500 to-rose-500',
    features: ['Romantik Tasarım', 'Özel Günler', 'Zarif Görünüm', 'Aşk Dolu']
  }
};

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);

  const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();

  const currentCategory = CATEGORY_INFO[categorySlug];

  // Ürünleri yükle
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products?mode=summary');
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Kategori sayfası - Ürünler yüklendi:', data);

          // Kategoriye göre filtrele
          const categoryProducts = data.filter((product: Product) => {
            const productCat = product.category;
            const targetVal = currentCategory?.categoryValue;
            const targetTitle = currentCategory?.title;

            if (typeof productCat === 'string') {
              return (targetVal && productCat === targetVal) || (targetTitle && productCat === targetTitle);
            } else if (Array.isArray(productCat)) {
              const cats = productCat as any[];
              return (targetVal && cats.includes(targetVal)) || (targetTitle && cats.includes(targetTitle));
            }
            return false;
          });

          setProducts(categoryProducts);
          setFilteredProducts(categoryProducts);
        } else {
          console.error('❌ Ürünler yüklenemedi');
        }
      } catch (error) {
        console.error('❌ Ürün yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentCategory) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]); // currentCategory stable via CATEGORY_INFO mapping

  // Ürünler yüklendiğinde fiyat aralığını dinamik ayarla
  useEffect(() => {
    if (!products.length) return;
    const prices = products.map((p) => p.price || 0);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    setPriceRange([Math.max(0, Math.floor(min)), Math.ceil(max)]);
  }, [products]);

  // Filtreleme ve sıralama
  useEffect(() => {
    let filtered = [...products];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Fiyat filtresi
    const [minPrice, maxPrice] = priceRange;
    filtered = filtered.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'newest':
          comparison = new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, sortOrder, priceRange]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              letterSpacing: 'normal'
            }}
          >
            Kategori Bulunamadı
          </h1>
          <p
            className="text-gray-600 mb-6"
            style={{
              fontFeatureSettings: '"kern" 1, "liga" 1',
              textRendering: 'optimizeLegibility',
              letterSpacing: 'normal'
            }}
          >
            Aradığınız kategori mevcut değil.
          </p>
          <Link href="/">
            <Button
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                letterSpacing: 'normal'
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = currentCategory.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={currentCategory.image}
          alt={currentCategory.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${currentCategory.color} mb-6`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              {currentCategory.title}
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-200 mb-8"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              {currentCategory.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {currentCategory.features.map((feature, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                  style={{
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    textRendering: 'optimizeLegibility',
                    letterSpacing: 'normal'
                  }}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-green-600">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{currentCategory.title}</span>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
                <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                <option value="newest-desc">En Yeni</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat Aralığı: {priceRange[0]}₺ - {priceRange[1]}₺
            </label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-24"
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} ürün bulundu
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Arama kriterlerinize uygun ürün bulunamadı.' : 'Bu kategoride henüz ürün bulunmuyor.'}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <div className={`h-48 ${viewMode === 'list' ? 'w-48' : 'w-full'} relative overflow-hidden rounded-t-lg`}>
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes={viewMode === 'list' ? "192px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <Package className="h-12 w-12 text-green-500" />
                      </div>
                    )}

                    {/* Stock Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? 'Stokta' : 'Stokta Yok'}
                      </Badge>
                    </div>

                    {/* Favorite Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({product.reviews || 0})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-600">
                      {product.price} ₺
                    </div>

                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {isInCart(product.id) ? 'Sepette' : 'Sepete Ekle'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
