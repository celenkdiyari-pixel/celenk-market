'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const cartContext = useCart();
  const { addToCart, toggleFavorite, isInCart, isFavorite } = cartContext || {};

  const handleAddToCart = async () => {
    if (!addToCart) return;
    setIsLoading(true);
    try {
      addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleLike = () => {
    if (toggleFavorite) {
      toggleFavorite(product.id);
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -%{discountPercentage}
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={handleLike}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
      >
        <Heart 
          className={`w-4 h-4 ${isFavorite && isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${encodeURIComponent(product.id)}`} prefetch={true} className="block w-full h-full">
          <Image
            src={product.images?.[0] || '/images/placeholder.svg'}
            alt={product.name}
            fill
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            loading="lazy"
            quality={80}
            fetchPriority="low"
            unoptimized={product.images?.[0]?.includes('blob.vercel-storage.com')}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder.svg';
            }}
          />
        </Link>
        
        {/* Quick View Overlay */}
        {showQuickView && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Link href={`/products/${encodeURIComponent(product.id)}`} prefetch={true}>
              <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                <Eye className="w-4 h-4 mr-2" />
                Hızlı Görüntüle
              </Button>
            </Link>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category */}
        <div className="text-xs text-gray-500 font-medium">
          {Array.isArray(product.category) 
            ? product.category.join(', ') 
            : product.category}
        </div>
        
        {/* Product Name */}
        <Link href={`/products/${encodeURIComponent(product.id)}`} prefetch={true}>
          <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₺{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₺{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {product.inStock ? 'Stokta' : 'Stokta Yok'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isLoading ? 'Ekleniyor...' : isInCart && isInCart(product.id) ? 'Sepete Eklendi' : 'Sepete Ekle'}
        </Button>
      </CardContent>
    </Card>
  );
}
