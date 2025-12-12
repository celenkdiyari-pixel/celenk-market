'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

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
            <h1 className="text-3xl font-bold text-gray-900">Favorilerim</h1>
          </div>

          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Favori Ürününüz Yok</h2>
            <p className="text-lg text-gray-600 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {favoriteProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${encodeURIComponent(product.id)}`}
              prefetch={true}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
            >
              {/* Product Image - Çiçekçi sitesi stili: büyük ve net görsel */}
              <div className="relative h-80 overflow-hidden">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
                    <Package className="h-20 w-20 text-pink-400" />
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

                {/* Remove from Favorites Button - Çiçekçi sitesi stili: sade */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromFavorites(product.id);
                    }}
                    className="p-2 rounded-full transition-all duration-200 bg-red-500 text-white hover:bg-red-600 shadow-md"
                    aria-label="Favorilerden Çıkar"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </div>

              {/* Product Info - Çiçekçi sitesi stili: sade ve net */}
              <div className="p-4 flex flex-col flex-1">
                {/* Product Name - Çiçekçi sitesi stili: büyük ve belirgin */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {product.name}
                </h3>

                {/* Description - Çiçekçi sitesi stili: kısa ve öz */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price - Çiçekçi sitesi stili: büyük ve belirgin */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xl font-bold text-pink-600">
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
                    addToCart(product);
                  }}
                  disabled={!product.inStock}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 mt-auto ${
                    !product.inStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-pink-600 hover:bg-pink-700 text-white hover:shadow-md'
                  }`}
                >
                  {!product.inStock ? 'Tükendi' : 'Sepete Ekle'}
                </button>
              </div>
            </Link>
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