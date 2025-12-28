'use client';

import { useState, useEffect } from 'react';
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
    Sparkles,
    Package
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from '@/components/product-card';
import { Product } from '@/lib/get-products';
import { CATEGORY_INFO, CategoryInfo } from '@/lib/constants';

interface CategoryClientProps {
    initialProducts: Product[];
    categorySlug: string;
}

export default function CategoryClient({ initialProducts, categorySlug }: CategoryClientProps) {
    const categoryInfo = CATEGORY_INFO[categorySlug];
    const [products] = useState<Product[]>(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);

    const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();
    const IconComponent = categoryInfo.icon;

    // Initialize price range based on products
    useEffect(() => {
        if (!products.length) return;
        const prices = products.map((p) => p.price || 0);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceRange([Math.max(0, Math.floor(min)), Math.ceil(max)]);
    }, [products]);

    // Filtering and Sorting
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Price filter
        const [minPrice, maxPrice] = priceRange;
        filtered = filtered.filter(product =>
            product.price >= minPrice && product.price <= maxPrice
        );

        // Sorting
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                <Image
                    src={categoryInfo.image}
                    alt={categoryInfo.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl mx-auto px-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${categoryInfo.color} mb-6`}>
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
                            {categoryInfo.title}
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
                            {categoryInfo.description}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {categoryInfo.features.map((feature, index) => (
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
                    <span className="text-gray-900 font-medium">{categoryInfo.title}</span>
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
                {filteredProducts.length === 0 ? (
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
                            viewMode === 'grid' ? (
                                <div key={product.id} className="h-full">
                                    <ProductCard product={product as any} />
                                </div>
                            ) : (
                                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 flex flex-row overflow-hidden h-48">
                                    <div className="relative w-48 shrink-0">
                                        {product.images && product.images[0] ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="192px"
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

                                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {product.description}
                                            </p>

                                            {/* Rating */}
                                            {product.rating && (
                                                <div className="flex items-center mb-2">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({product.reviews || 0})
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold text-green-600">
                                                {product.price} ₺
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => addToCart(product as any)}
                                                disabled={!product.inStock}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                {isInCart(product.id) ? 'Sepette' : 'Sepete Ekle'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
