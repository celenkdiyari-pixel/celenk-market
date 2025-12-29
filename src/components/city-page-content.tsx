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
    Heart as HeartIcon,
    Building,
    Wrench,
    MapPin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from '@/components/product-card';

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

interface CityPageContentProps {
    cityName?: string;
}

export default function CityPageContent({ cityName = "Türkiye" }: CityPageContentProps) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // SEO variables
    const marketName = cityName !== "Türkiye" ? `${cityName} Çelenk Siparişi` : "Türkiye'nin En İyi Çelenk Sitesi";
    const heroDescription = cityName !== "Türkiye"
        ? `${cityName} genelinde hızlı ve güvenilir çelenk gönder hizmeti. ${cityName} içi açılış, düğün ve cenaze törenleri için aynı gün teslimat.`
        : "Hızlı ve güvenilir çelenk gönder hizmeti ile duygularınızı en güzel şekilde ifade edin. Açılış, düğün ve cenaze törenleri için profesyonel tasarım çelenkler.";

    // Hero slider images - Çelenk Resimleri
    const heroImages = [
        {
            src: "/images/categories/açılıştören.jpg",
            alt: `${cityName} Açılış & Tören Çelenkleri`,
            title: "Açılış & Tören Çelenkleri",
            description: "İş yerinizin açılışında ve özel törenlerinizde kullanabileceğiniz şık ve profesyonel çelenk tasarımları"
        },
        {
            src: "/images/categories/söznişan.jpg",
            alt: `${cityName} Söz & Nişan Çelenkleri`,
            title: "Söz & Nişan Çelenkleri",
            description: "Hayatınızın en özel anlarında sevdiklerinizi mutlu edecek romantik ve zarif çelenk aranjmanları"
        },
        {
            src: "/images/categories/cenaze.jpg",
            alt: `${cityName} Cenaze Çelenkleri`,
            title: "Cenaze Çelenkleri",
            description: "Sevdiklerinizi son yolculuğunda uğurlarken saygı ve sevgi dolu anma çelenkleri"
        },
        {
            src: "/images/categories/ferforje.png",
            alt: `${cityName} Ferforje Çelenkleri`,
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
            const response = await fetch('/api/products?mode=summary');

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative">
            <FlowerParticles />

            {/* Announcement Banner */}
            <div className="w-full bg-white/80 backdrop-blur-sm border-b border-green-100 relative z-20">
                <div className="container mx-auto px-4 py-3">
                    <AnnouncementBanner page="home" maxAnnouncements={2} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30 min-h-screen flex items-center z-20">
                {/* Background Elements omitted for brevity but keeping main structure */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-green-100/40 to-emerald-100/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-emerald-100/30 to-teal-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMwNTk2NjkIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')" }}
                    ></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-[90vh]">

                        <div className="space-y-8 flex flex-col justify-center animate-fade-in-up pl-0 lg:pl-8">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-6 py-3 rounded-full text-sm font-medium w-fit shadow-sm border border-green-100/50 backdrop-blur-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <MapPin className="h-4 w-4 text-green-600" />
                                <span>{cityName} Çelenk Siparişi</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-center lg:justify-start animate-fade-in-up delay-200">
                                    <Logo size="xl" showText={true} className="hover:scale-105 transition-transform duration-500" />
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight text-center lg:text-left">
                                    {cityName === "Türkiye" ? "Türkiye'nin En İyi" : `${cityName} İçin En İyi`}
                                    <span className="block text-green-600">Çelenk Sipariş Sitesi</span>
                                </h1>

                                <p className="text-xl text-gray-600 leading-relaxed max-w-lg text-center lg:text-left animate-fade-in-up delay-300 lg:max-w-none">
                                    {heroDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-400">
                                <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Hızlı Teslimat</h3>
                                        <p className="text-xs text-gray-500">{cityName === "Türkiye" ? "81 ile teslimat" : `${cityName} içi teslimat`}</p>
                                    </div>
                                </div>

                                <div className="group flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Güvenli Ödeme</h3>
                                        <p className="text-xs text-gray-500">256-bit SSL</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-500">
                                <Link href="/products">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Sipariş Ver
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
                        </div>

                        {/* Right Content - Slider Box */}
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-full max-w-2xl h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
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
                                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                                    <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                                                    <p className="text-white/90 text-sm">{image.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories & Products sections remain mostly same but could have enhanced titles */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{cityName} Çelenk Çeşitleri</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {cityName} için özel olarak hazırlanan geniş ürün yelpazemiz
                        </p>
                    </div>

                    {/* Simple filter reuse */}
                    <div className="flex flex-wrap justify-center gap-3 mb-16">
                        <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} onClick={() => setSelectedCategory('all')}>Tümü</Button>
                        {['Açılış & Tören', 'Cenaze Çelenkleri', 'Ferforjeler', 'Fuar & Stand', 'Ofis & Saksı Bitkileri', 'Söz & Nişan'].map((cat) => (
                            <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)}>{cat}</Button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {(selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory)).map((product) => (
                                <div key={product.id} className="h-full">
                                    <ProductCard product={product as any} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SEO Text Section Customized */}
            <section className="py-24 bg-slate-50 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">{cityName} Online Çelenk Siparişi</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Çelenk Diyarı olarak, <strong>{cityName} çelenk siparişi</strong> ihtiyaçlarınızda en taze ve kaliteli çiçeklerle hizmetinizdeyiz.
                                {cityName} içindeki tüm semtlere ve ilçelere (örneğin {cityName === 'İstanbul' ? 'Kadıköy, Beşiktaş, Şişli' : 'merkez ve ilçelerine'}) aynı gün hızlı teslimat yapıyoruz.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
