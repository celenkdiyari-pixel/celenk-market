'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Package,
    Home
} from 'lucide-react';
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
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/products');
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

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId));
            } else {
                alert('Ürün silinirken hata oluştu');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Ürün silinirken hata oluştu');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
                            <p className="text-gray-600 mt-1">Tüm ürünlerinizi buradan yönetebilirsiniz</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/admin">
                                <Button variant="outline">
                                    <Home className="mr-2 h-4 w-4" />
                                    Admin Panel
                                </Button>
                            </Link>
                            <Link href="/admin/products/new">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Yeni Ürün Ekle
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Ürün adı veya kategori ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product List */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Ürün Bulunamadı</h3>
                            <p className="text-gray-500 mt-2">Aramanızla eşleşen ürün bulunamadı veya henüz ürün eklenmemiş.</p>
                            {products.length === 0 && (
                                <Link href="/admin/products/new" className="mt-4 inline-block">
                                    <Button variant="outline">İlk Ürünü Ekle</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {filteredProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md flex flex-col items-center">
                                    <div className="relative w-full aspect-[3/4] bg-white pt-2">
                                        {product.images && product.images.length > 0 && product.images[0] ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-contain hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-50">
                                                <Package className="h-12 w-12 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 z-10">
                                            {product.inStock ? (
                                                <Badge className="bg-green-500/90 hover:bg-green-600 backdrop-blur-sm">Stokta</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="opacity-90 backdrop-blur-sm">Tükendi</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-4 w-full">
                                        <div className="mb-4">
                                            <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{product.category}</p>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <p className="text-lg font-bold text-green-600">
                                                {product.price.toFixed(2)} ₺
                                            </p>
                                            <div className="flex gap-2">
                                                <Link href={`/admin/products/edit/${product.id}`}>
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
