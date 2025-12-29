'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import AnnouncementBanner from '@/components/announcement-banner';
import FlowerParticles from '@/components/flower-particles';
import Logo from '@/components/logo';
import {
    ShoppingCart,
    Truck,
    Shield,
    ArrowRight,
    Phone,
    MapPin
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from '@/components/product-card';

// Types duplicated here for safety or import from types/index
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
    initialProducts?: Product[];
}

export default function CityPageContent({ cityName = "Türkiye", initialProducts = [] }: CityPageContentProps) {
    const router = useRouter();
    // Initialize with prop if available, otherwise empty array
    const [products, setProducts] = useState<Product[]>(initialProducts);
    // If we have initial products, we are not loading. If not, we are loading.
    const [isLoading, setIsLoading] = useState(initialProducts.length === 0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // SEO variables
    const heroDescription = cityName !== "Türkiye"
        ? `${cityName} genelinde hızlı ve güvenilir çelenk gönder hizmeti. ${cityName} içi açılış, düğün ve cenaze törenleri için aynı gün teslimat.`
        : "Hızlı ve güvenilir çelenk gönder hizmeti ile duygularınızı en güzel şekilde ifade edin. Açılış, düğün ve cenaze törenleri için profesyonel tasarım çelenkler.";

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

    // Load products ONLY if initialProducts is empty
    useEffect(() => {
        if (products.length === 0) {
            loadProducts();
        }
    }, [products.length]);

    useEffect(() => {
        const handleCategorySelect = (event: CustomEvent) => {
            setSelectedCategory(event.detail);
            setTimeout(() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };
        window.addEventListener('categorySelect', handleCategorySelect as EventListener);
        return () => window.removeEventListener('categorySelect', handleCategorySelect as EventListener);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
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

    // Extract unique categories from actual products to ensure matching
    const dynamicCategories = products.length > 0
        ? Array.from(new Set(products.map(p => p.category?.trim()).filter(Boolean))).sort()
        : ['Açılış & Tören', 'Cenaze Çelenkleri', 'Ferforjeler', 'Fuar & Stand', 'Ofis & Saksı Bitkileri', 'Söz & Nişan'];

    // Robust Filtering Logic
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category?.trim() === selectedCategory?.trim());

    return (
        <div className="min-h-screen bg-white relative">
            <FlowerParticles />
            {/* ... component structure ... */}

            <section id="products" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{cityName} Çelenk Çeşitleri</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {cityName} için özel olarak hazırlanan geniş ürün yelpazemiz
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-16">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('all')}
                            className="transition-all duration-300 hover:scale-105"
                        >
                            Tümü
                        </Button>
                        {dynamicCategories.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(cat)}
                                className="transition-all duration-300 hover:scale-105"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="h-full">
                                    <ProductCard product={product as any} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">Bu kategoride henüz ürün bulunmuyor: <strong>{selectedCategory}</strong></p>
                            <Button variant="link" onClick={() => setSelectedCategory('all')} className="mt-2 text-green-600">Tüm ürünleri gör</Button>
                        </div>
                    )}
                </div>
            </section>

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
