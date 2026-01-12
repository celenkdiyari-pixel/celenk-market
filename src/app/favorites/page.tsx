'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  Star,
  Package,
  Trash2
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

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

export default function FavoritesPage() {
  const { favorites, toggleFavorite, addToCart, isInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

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

  const favoriteProducts = products.filter(product => favorites.includes(product.id));

  const handleRemoveFromFavorites = (productId: string) => {
    toggleFavorite(productId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Favoriler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              Favorilerim
            </h1>
          </div>

          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: 'normal'
              }}
            >
              Favori Ürününüz Yok
            </h2>
            <p
              className="text-lg text-gray-600 mb-8"
              style={{
                fontFeatureSettings: '"kern" 1, "liga" 1',
                textRendering: 'optimizeLegibility',
                letterSpacing: 'normal'
              }}
            >
              Beğendiğiniz ürünleri favorilere ekleyerek burada görüntüleyebilirsiniz.
            </p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Alışverişe Başla
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Favorilerim</h1>
          <p className="text-gray-600 mt-2">{favoriteProducts.length} favori ürün</p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="relative h-48 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Badge variant={product.inStock ? "default" : "destructive"} className="shadow-lg text-xs">
                    {product.inStock ? 'Stokta' : 'Stokta Yok'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 bg-white/80 hover:bg-white rounded-full shadow-lg"
                    onClick={() => handleRemoveFromFavorites(product.id)}
                  >
                    <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                  </Button>
                </div>

                <div className="absolute top-3 left-3">
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-gray-700 border-gray-300 text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {product.price} ₺
                    </span>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {isInCart(product.id) ? 'Sepette' : 'Sepete Ekle'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFromFavorites(product.id)}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clear All Button */}
        {favoriteProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => {
                favoriteProducts.forEach(product => toggleFavorite(product.id));
              }}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tüm Favorileri Temizle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
