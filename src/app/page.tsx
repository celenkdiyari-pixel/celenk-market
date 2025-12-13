'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import AnnouncementBanner from '@/components/announcement-banner';
import FlowerParticles from '@/components/flower-particles';
import Logo from '@/components/logo';
import {
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  Award,
  Leaf,
  ArrowRight,
  Phone,
  Flower,
  Sparkles,
  Gift,
  Package,
  Star,
  Heart as HeartIcon,
  Building,
  Wrench
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
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();

  // Hero slider images - Çelenk Resimleri
  const heroImages = [
    {
      src: "/images/categories/açılıştören.jpg",
      alt: "Açılış & Tören Çelenkleri",
      title: "Açılış & Tören Çelenkleri",
      description: "İş yerinizin açılışında ve özel törenlerinizde kullanabileceğiniz şık ve profesyonel çelenk tasarımları"
    },
    {
      src: "/images/categories/söznişan.jpg",
      alt: "Söz & Nişan Çelenkleri",
      title: "Söz & Nişan Çelenkleri",
      description: "Hayatınızın en özel anlarında sevdiklerinizi mutlu edecek romantik ve zarif çelenk aranjmanları"
    },
    {
      src: "/images/categories/cenaze.jpg",
      alt: "Cenaze Çelenkleri",
      title: "Cenaze Çelenkleri",
      description: "Sevdiklerinizi son yolculuğunda uğurlarken saygı ve sevgi dolu anma çelenkleri"
    },
    {
      src: "/images/categories/ferforje.png",
      alt: "Ferforje Çelenkleri",
      title: "Ferforje Çelenkleri",
      description: "Metal işçiliği ile hazırlanmış dayanıklı ve estetik ferforje çelenk tasarımları"
    }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  // Listen for category selection from navbar
  useEffect(() => {
    const handleCategorySelect = (event: CustomEvent) => {
      setSelectedCategory(event.detail);
      // Scroll to products section
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    window.addEventListener('categorySelect', handleCategorySelect as EventListener);
    return () => {
      window.removeEventListener('categorySelect', handleCategorySelect as EventListener);
    };
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const loadProducts = async () => {
    try {
      console.log('🏠 Homepage: Loading products...');
      const response = await fetch('/api/products?mode=summary');
      console.log('🏠 Homepage: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🏠 Homepage: Products received:', data.length);
        console.log('🏠 Homepage: Products data:', data);
        setProducts(data);
      } else {
        console.error('🏠 Homepage: Response not ok:', response.status);
      }
    } catch (error) {
      console.error('🏠 Homepage: Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Flower Particles */}
      <FlowerParticles />

      {/* Announcement Banner */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-green-100 relative z-20">
        <div className="container mx-auto px-4 py-3">
          <AnnouncementBanner page="home" maxAnnouncements={2} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 min-h-screen flex items-center z-20">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-green-100/40 to-emerald-100/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-emerald-100/30 to-teal-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-green-300/30 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-emerald-300/30 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-32 left-40 w-5 h-5 bg-teal-300/30 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-cyan-300/30 rounded-full animate-bounce delay-500"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-[90vh]">

            {/* Left Content - Text Box */}
            <div className="space-y-8 flex flex-col justify-center animate-fade-in-up pl-0 lg:pl-8">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-6 py-3 rounded-full text-sm font-medium w-fit shadow-sm border border-green-100/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Sparkles className="h-4 w-4 text-green-600" />
                <span>Premium Çiçek Hizmetleri</span>
              </div>

              {/* Enhanced Main Heading */}
              <div className="space-y-6">
                <div className="flex justify-center lg:justify-start animate-fade-in-up delay-200">
                  <Logo size="xl" showText={true} className="hover:scale-105 transition-transform duration-500" />
                </div>

                <p className="text-xl text-gray-600 leading-relaxed max-w-lg text-center lg:text-left animate-fade-in-up delay-300 lg:max-w-none">
                  Her özel anınız için en güzel çelenkler ve çiçek aranjmanları.
                  <span className="text-green-600 font-semibold bg-green-50/50 px-2 py-1 rounded-lg"> Taze, kaliteli ve özel tasarım</span> çiçeklerle anılarınızı güzelleştirin.
                </p>
              </div>

              {/* Enhanced Features */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-400">
                <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Hızlı Teslimat</h3>
                    <p className="text-xs text-gray-500">Aynı gün teslimat</p>
                  </div>
                </div>

                <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Güvenli Alışveriş</h3>
                    <p className="text-xs text-gray-500">SSL koruması</p>
                  </div>
                </div>

                <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Kaliteli Ürünler</h3>
                    <p className="text-xs text-gray-500">Taze çiçekler</p>
                  </div>
                </div>

                <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Doğal Malzemeler</h3>
                    <p className="text-xs text-gray-500">Ekolojik ürünler</p>
                  </div>
                </div>
              </div>

              {/* Clean CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-500">
                <Link href="/products">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ürünleri İncele
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-semibold">
                    <Phone className="mr-2 h-5 w-5" />
                    İletişime Geç
                  </Button>
                </Link>
              </div>

              {/* Simple Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 animate-fade-in-up delay-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-500">Mutlu Müşteri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1000+</div>
                  <div className="text-sm text-gray-500">Başarılı Teslimat</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5★</div>
                  <div className="text-sm text-gray-500">Müşteri Puanı</div>
                </div>
              </div>
            </div>

            {/* Right Content - Slider Box */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-2xl h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">

                {/* Slider Container */}
                <div className="relative h-full">
                  {heroImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${currentSlide === index
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                        }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                      {/* Simple Image Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                          <p className="text-white/90 text-sm">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simple Slider Navigation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index
                        ? 'bg-green-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-green-50/20 relative overflow-hidden z-20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-green-200/10 to-emerald-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-blue-200/10 to-green-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 text-green-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-sm backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Sparkles className="w-4 h-4" />
              <span>Kategorilerimiz</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Çelenk
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Kategorileri
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Her özel gün için özel tasarım çelenklerimiz. Düğünden cenazeye, açılıştan törene kadar
              <span className="text-green-600 font-semibold"> tüm özel anlarınızda yanınızdayız</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Açılış & Tören",
                description: "Kutlama günleri için şık çelenkler",
                image: "/images/categories/açılıştören.jpg",
                category: "Açılış & Tören",
                slug: "acilistoren",
                icon: Gift,
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Cenaze Çelenkleri",
                description: "Saygı ve sevgi dolu anma çelenkleri",
                image: "/images/categories/cenaze.jpg",
                category: "Cenaze Çelenkleri",
                slug: "cenaze",
                icon: Flower,
                color: "from-gray-500 to-slate-500"
              },
              {
                title: "Ferforjeler",
                description: "Metal işçiliği ile hazırlanmış çelenkler",
                image: "/images/categories/ferforje.png",
                category: "Ferforjeler",
                slug: "ferforje",
                icon: Wrench,
                color: "from-yellow-500 to-amber-500"
              },
              {
                title: "Fuar & Stand",
                description: "Fuar ve stand etkinlikleri için çelenkler",
                image: "/images/categories/fuar stand.jpg",
                category: "Fuar & Stand",
                slug: "fuarstand",
                icon: Building,
                color: "from-purple-500 to-violet-500"
              },
              {
                title: "Ofis & Saksı Bitkileri",
                description: "Ofis ve ev için saksı bitkileri",
                image: "/images/categories/ofis bitki.jpg",
                category: "Ofis & Saksı Bitkileri",
                slug: "ofisbitki",
                icon: Leaf,
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Söz & Nişan",
                description: "Aşk dolu anlar için romantik çelenkler",
                image: "/images/categories/söznişan.jpg",
                category: "Söz & Nişan",
                slug: "soznisan",
                icon: HeartIcon,
                color: "from-pink-500 to-rose-500"
              }
            ].map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 border-0 overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Kategori kartına tıklandı:', category.slug);
                  console.log('Router:', router);
                  try {
                    // Scroll pozisyonunu koru
                    const currentScrollY = window.scrollY;
                    console.log('router.push çağrılıyor:', `/categories/${category.slug}`);

                    // Orijinal kategori sayfasına git
                    window.location.href = `/categories/${category.slug}`;

                    console.log('router.push tamamlandı');
                    // Sayfa yüklendikten sonra scroll pozisyonunu ayarla
                    setTimeout(() => {
                      window.scrollTo(0, currentScrollY);
                    }, 100);
                  } catch (error) {
                    console.error('router.push hatası:', error);
                  }
                }}
              >
                <Card className="h-full">
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover group-hover:scale-115 transition-transform duration-1000"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-500"></div>

                    {/* Category Icon Overlay */}
                    <div className="absolute top-6 right-6">
                      <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold group-hover:text-green-200 transition-colors duration-500 leading-tight">
                          {category.title}
                        </h3>
                        <p className="text-sm opacity-90 leading-relaxed group-hover:opacity-100 transition-opacity duration-500">
                          {category.description}
                        </p>
                      </div>

                      {/* Hover Arrow */}
                      <div className="mt-6 flex items-center text-green-200 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-sm font-medium mr-2">Keşfet</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tüm Çelenklerimiz</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Geniş ürün yelpazemizden seçim yapın
            </p>
          </div>

          {/* Enhanced Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={`group transition-all duration-500 transform hover:-translate-y-1 ${selectedCategory === 'all'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl hover:shadow-2xl'
                : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white backdrop-blur-sm bg-white/80'
                } rounded-2xl px-6 py-3 font-medium`}
            >
              <span className="group-hover:scale-105 transition-transform duration-300">Tümü</span>
            </Button>
            {['Açılış & Tören', 'Cenaze Çelenkleri', 'Ferforjeler', 'Fuar & Stand', 'Ofis & Saksı Bitkileri', 'Söz & Nişan'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`group transition-all duration-500 transform hover:-translate-y-1 ${selectedCategory === category
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl hover:shadow-2xl'
                  : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white backdrop-blur-sm bg-white/80'
                  } rounded-2xl px-6 py-3 font-medium`}
                style={{
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}
              >
                <span
                  className="group-hover:scale-105 transition-transform duration-300"
                  style={{
                    letterSpacing: 'normal',
                    fontFeatureSettings: '"kern" 1, "liga" 1'
                  }}
                >
                  {category}
                </span>
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz Ürün Eklenmemiş</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Bu kategoride henüz ürün bulunmamaktadır
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory)).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="group hover:shadow-3xl transition-all duration-700 hover:-translate-y-3 border-0 overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl cursor-pointer">
                    <div className="relative h-56 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-115 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl">
                            <Flower className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Status Badges - Removed Stock */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </Button>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-gray-700 border-gray-300 text-xs shadow-lg">
                          {product.category}
                        </Badge>
                      </div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-500 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-green-600">
                                {product.price} ₺
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className="group/btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl px-6 py-3"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                            <span className="text-sm font-medium">
                              {isInCart(product.id) ? 'Sepette' : 'Sepete Ekle'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neden Çelenk Diyarı?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Doğal Malzemeler</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  Sadece en taze ve doğal çiçekler kullanılarak hazırlanan çelenklerimiz
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Hızlı Teslimat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  Aynı gün teslimat imkanı ile özel günlerinizi kaçırmayın
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Kaliteli Hizmet</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  Profesyonel tasarım ve müşteri memnuniyeti odaklı hizmet anlayışımız
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Hemen Başlayın
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Hemen Sipariş Verin
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Özel günlerinizde sevdiklerinizi mutlu edecek çelenklerimizi keşfedin.
              Profesyonel tasarım ve kaliteli hizmet garantisi ile yanınızdayız.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Alışverişe Başla
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Phone className="mr-3 h-6 w-6" />
                  İletişime Geç
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}