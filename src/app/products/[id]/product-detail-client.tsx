'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart,
    Heart,
    ArrowLeft,
    Star,
    Truck,
    Shield,
    CheckCircle,
    Package,
    Flower,
    Phone,
    Share2
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    images: string[];
    createdAt?: string;
    updatedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

interface ProductDetailClientProps {
    product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <Button variant="ghost" className="text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                <span className="font-medium">Ana Sayfaya Dön</span>
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Paylaş
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleFavorite(product.id)}
                                className={`rounded-full transition-all ${isFavorite(product.id) ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
                            >
                                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Product Images - Left Side (Span 7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/5] lg:aspect-square w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-white group">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Flower className="h-24 w-24 text-gray-300" />
                                </div>
                            )}

                            {/* Image Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-3">
                                {/* Stock badge removed */}
                            </div>
                        </div>

                        {/* Additional Features Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-3 border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Aynı Gün Teslimat</h4>
                                    <p className="text-xs text-gray-500 mt-1">İstanbul içi özel kurye</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-3 border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Güvenli Ödeme</h4>
                                    <p className="text-xs text-gray-500 mt-1">256-bit SSL koruması</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-3 border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Tazelik Garantisi</h4>
                                    <p className="text-xs text-gray-500 mt-1">Günlük taze çiçekler</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details - Right Side (Span 5 cols) - Sticky */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-28 space-y-8">
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-gray-500 border-gray-200 px-3 py-1 text-sm bg-white">
                                    {product.category}
                                </Badge>

                                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-3">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-gray-500 font-medium">(4.9/5 • 42 Değerlendirme)</span>
                                </div>

                                <div className="flex items-baseline gap-4 pt-2">
                                    <span className="text-5xl font-bold text-green-600 tracking-tight">
                                        ₺{product.price}
                                    </span>
                                    <span className="text-lg text-gray-400 font-medium line-through">
                                        {product.price * 1.2 > 0 && `₺${(product.price * 1.2).toFixed(2)}`}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Ürün Açıklaması</h3>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Actions */}
                                <div className="space-y-4">
                                    <Button
                                        size="lg"
                                        className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 font-bold tracking-wide"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="h-6 w-6 mr-3" />
                                        {isInCart(product.id) ? 'Sepette Mevcut' : 'Sepete Ekle'}
                                    </Button>

                                    <Link href="/contact" className="block">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full h-14 border-2 border-gray-200 hover:border-green-600 hover:text-green-600 rounded-2xl text-lg font-semibold transition-all"
                                        >
                                            <Phone className="h-5 w-5 mr-2" />
                                            Özel Sipariş İçin Arayın
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex gap-4 items-start">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Teslimat Notu</h4>
                                    <p className="text-blue-700/80 text-sm mt-1 leading-relaxed">
                                        Siparişleriniz özel korumalı araçlarımızla, formunu bozmadan teslim edilmektedir. Teslimat saatini sepet aşamasında belirtebilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
