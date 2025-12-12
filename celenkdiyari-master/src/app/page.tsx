'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Phone,
  Truck, 
  Shield, 
  Award, 
  Heart,
  ArrowRight, 
  ArrowLeft,
  Building,
  Wrench,
  Package,
  Leaf,
  Gift,
  CreditCard,
  Star,
  AlertCircle
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import Loading from "@/components/loading";

// Memoized Product Card Component for better performance
const ProductCard = memo(({ product, addToCart, toggleFavorite, isInCart, isFavorite }: {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string | string[]; // Can be array or string
    inStock: boolean;
    images: string[];
  };
  addToCart: (product: any) => void;
  toggleFavorite: (id: string) => void;
  isInCart: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
}) => {
  return (
    <Link 
      href={`/products/${encodeURIComponent(product.id)}`}
      prefetch={true}
      className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
    >
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
        
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            product.inStock 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {product.inStock ? 'Stokta' : 'Tükendi'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite(product.id) 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white shadow-md'
            }`}
            aria-label="Favorilere Ekle"
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

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

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          disabled={!product.inStock || isInCart(product.id)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 mt-auto ${
            !product.inStock || isInCart(product.id)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md'
          }`}
        >
          {!product.inStock
            ? 'Tükendi'
            : (isInCart(product.id) ? 'Sepette' : 'Sepete Ekle')
          }
        </button>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { products, isLoading, error } = useProducts();
  const [isClient, setIsClient] = useState(false);
  const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();
  const [blockedDay, setBlockedDay] = useState<{name: string; message: string; endDate: string} | null>(null);

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for blocked days on component mount
  useEffect(() => {
    const checkBlockedDays = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings?.orderBlockedDays) {
            const now = new Date();
            const activeBlockedDay = data.settings.orderBlockedDays.find((day: any) => {
              if (!day.isActive) return false;
              const startDate = new Date(day.startDate);
              const endDate = new Date(day.endDate);
              return now >= startDate && now <= endDate;
            });
            
            if (activeBlockedDay) {
              setBlockedDay({
                name: activeBlockedDay.name,
                message: activeBlockedDay.message,
                endDate: activeBlockedDay.endDate
              });
            }
          }
        }
      } catch (error) {
        // Sessizce devam et
      }
    };
    
    checkBlockedDays();
  }, []);

  const categories = [
    { id: 'açılış-tören', name: 'Açılış & Tören', icon: Building, image: '/images/categories/açılıştören.jpg', slug: 'açılış-tören' },
    { id: 'cenaze-çelenkleri', name: 'Cenaze Çelenkleri', icon: Heart, image: '/images/categories/cenaze.jpg', slug: 'cenaze-çelenkleri' },
    { id: 'ferforjeler', name: 'Ferforjeler', icon: Wrench, image: '/images/categories/ferforje.png', slug: 'ferforjeler' },
    { id: 'fuar-stand', name: 'Fuar & Stand', icon: Package, image: '/images/categories/fuar stand.jpg', slug: 'fuar-stand' },
    { id: 'ofis-saksı-bitkileri', name: 'Ofis & Saksı Bitkileri', icon: Leaf, image: '/images/categories/ofis bitki.jpg', slug: 'ofis-saksı-bitkileri' },
    { id: 'söz-nişan', name: 'Söz & Nişan', icon: Gift, image: '/images/categories/söznişan.jpg', slug: 'söz-nişan' },
  ];

  // Auto-slide functionality - Defer to avoid blocking initial render
  useEffect(() => {
    // Delay auto-slide to improve initial page load
    let interval: NodeJS.Timeout | null = null;
    const timeoutId = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % categories.length);
      }, 5000); // 5 saniyede bir değişsin (daha az CPU kullanımı)
    }, 1000); // Start after 1 second
    
    return () => {
      clearTimeout(timeoutId);
      if (interval) clearInterval(interval);
    };
  }, [categories.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + categories.length) % categories.length);
  };

  // Memoize displayed products to prevent unnecessary re-renders (move before error check)
  const displayedProducts = useMemo(() => {
    return products.slice(0, 6);
  }, [products]);

  // Error durumunda sessizce devam et - kullanıcıya hata gösterme
  // Sadece console'da log tut

  const features = [
    {
      icon: Truck,
      title: "Hızlı Teslimat",
      description: "Türkiye genelinde aynı gün teslimat"
    },
    {
      icon: Shield,
      title: "Kalite Garantisi",
      description: "Taze ve doğal malzemelerle, profesyonel tasarım garantisi"
    },
    {
      icon: Award,
      title: "Uzman Ekip",
      description: "Yılların deneyimi ile çelenk tasarımında uzman ekibimiz"
    },
    {
      icon: Heart,
      title: "Özel Tasarım",
      description: "Her özel gün için özel tasarım çelenkler"
    }
  ];

  const stats = [
    { number: "500+", label: "Mutlu Müşteri" },
    { number: "1000+", label: "Başarılı Teslimat" },
    { number: "50+", label: "Çelenk Çeşidi" },
    { number: "5", label: "Yıllık Deneyim" }
  ];

  return (
    <div className="min-h-screen">
      {/* Özel Gün Banner - Sipariş Kapalı */}
      {blockedDay && (
        <div className="bg-red-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-3 max-w-6xl mx-auto">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 text-center">
                <p className="font-semibold text-lg mb-1">
                  {blockedDay.name || 'Özel Gün'} - Sipariş Alımı Kapalı
                </p>
                <p className="text-sm text-red-100">
                  {blockedDay.message}
                </p>
                <p className="text-xs text-red-200 mt-1">
                  Sipariş alımı: {new Date(blockedDay.endDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} tarihine kadar kapalıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Sol Kutu - Ana İçerik */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <Image
                  src="/images/logo-removebg-preview.png"
                  alt="Çelenk Diyarı"
                  width={150}
                  height={150}
                  className="mx-auto lg:mx-0"
                  priority
                  quality={90}
                  fetchPriority="high"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 text-gray-900 italic" style={{ fontFamily: 'var(--font-dancing)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '0.05em' }}>
                Çelenk Diyarı - En Uygun Çelenk Fiyatları ile Çelenk Gönder
              </h1>
              
              <p className="text-lg md:text-xl mb-6 text-gray-600 font-serif italic max-w-2xl">
                Özel günlerinizde sevdiklerinizi mutlu edecek, doğal ve taze çelenklerimizi en uygun fiyatlarla sunuyoruz. 
                Profesyonel çelenk gönder hizmetimiz ile açılış, cenaze, söz-nişan ve tüm özel anlarınızda yanınızdayız. 
                İstanbul ve tüm Türkiye'ye hızlı teslimat garantisi ile çelenk siparişlerinizi güvenle verin.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/products" prefetch={true}>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ürünleri Görüntüle
                </Button>
                </Link>
                
                <Link href="/contact" prefetch={true}>
                  <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <Phone className="mr-2 h-5 w-5" />
                  İletişime Geç
                </Button>
                </Link>
              </div>
            </div>

            {/* Sağ Kutu - Kategoriler Slider */}
            <div className="relative">
              <div className="relative h-80 overflow-hidden rounded-lg">
                {/* Slider Container */}
                <div 
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {categories.map((category, index) => (
                    <div key={category.id} className="w-full flex-shrink-0">
                      <Link href={`/categories/${encodeURIComponent(category.slug || category.id)}`} prefetch={true}>
                        <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden h-full">
                          <div className="relative h-full">
                <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              priority={index === 0}
                              loading={index === 0 ? "eager" : "lazy"}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              quality={85}
                              fetchPriority={index === 0 ? "high" : "low"}
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                                <category.icon className="h-8 w-8 text-green-600" />
                              </div>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 text-center">
                              <h3 className="text-white font-bold text-xl group-hover:text-green-200 transition-colors">
                                {category.name}
                              </h3>
                        </div>
                      </div>
                        </Card>
                      </Link>
                    </div>
                  ))}
              </div>
              
                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {categories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                  {stat.number}
        </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-elegant font-bold text-gray-900 mb-6">
              Çelenk Kategorileri ve Çelenk Fiyatları
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-serif italic">
              Her özel gün için özel tasarım çelenkler. Uygun çelenk fiyatları ile çelenk gönder hizmetimizden yararlanın. 
              Kategorilerimizi keşfedin ve ihtiyacınıza uygun çelenği bulun.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${encodeURIComponent(category.slug || category.id)}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
                  <div className="relative h-48">
                  <Image
                    src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <category.icon className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {category.name}
                      </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-elegant font-bold text-gray-900 mb-6">
              Neden Çelenk Diyarı?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-serif italic">
              Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz. 
              Taze ve doğal çelenklerle özel günlerinizi unutulmaz kılıyoruz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-elegant font-bold text-gray-900 mb-6">
              Çelenk Fiyatları ve Modelleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-serif italic">
              En popüler ve en çok tercih edilen çelenk modellerimiz. Uygun çelenk fiyatları ile 
              kaliteli malzemelerle hazırlanmış, özel tasarım çelenkler. Çelenk gönder hizmetimiz ile hızlı teslimat.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Loading key={index} text="Yükleniyor..." className="h-64" />
              ))}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart || (() => {})}
                  toggleFavorite={toggleFavorite || (() => {})}
                  isInCart={isInCart || (() => false)}
                  isFavorite={isFavorite || (() => false)}
                />
              ))}
            </div>
          )}
          
          {products.length > 6 && (
            <div className="text-center mt-12">
              <Link href="/products" prefetch={true}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                  Tüm Ürünleri Gör
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Çelenk Gönder - Özel Gününüz İçin Çelenk Siparişi
            </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Sevdiklerinizi mutlu edecek, özel tasarım çelenkler. Uygun çelenk fiyatları ile çelenk gönder hizmetimizden yararlanın. 
            Profesyonel ekibimizle iletişime geçin ve hayalinizdeki çelenği tasarlayalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" prefetch={true}>
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Phone className="mr-2 h-5 w-5" />
                Hemen İletişime Geç
                </Button>
              </Link>
            <Link href="/products" prefetch={true}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ürünleri İncele
                </Button>
              </Link>
          </div>
        </div>
      </section>
    </div>
  );
}