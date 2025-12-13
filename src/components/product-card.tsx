'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const isLiked = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      images: product.images,
    });
  };

  const handleLike = () => {
    toggleFavorite(product.id);
  };

  const safePrice = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
  const safeOriginalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : Number(product.originalPrice) || 0;
  const discountPercentage = safeOriginalPrice 
    ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
    : 0;

  const safeRating = typeof product.rating === 'number' ? product.rating : 0;
  const safeReviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : 0;

  return (
    <Card className="group relative overflow-hidden hover-lift transition-all duration-300">
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
          className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.images?.[0] || '/images/logo.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Quick View Overlay */}
        {showQuickView && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Link href={`/products/${product.id}`}>
              <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                <Eye className="w-4 h-4 mr-2" />
                Hızlı Görüntüle
              </Button>
            </Link>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category */}
        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
        
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 mb-2">
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
                  i < Math.floor(safeRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({safeReviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ₺{safePrice.toFixed(2)}
          </span>
          {safeOriginalPrice > 0 && (
            <span className="text-sm text-gray-500 line-through">
              ₺{safeOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {product.inStock ? 'Stokta' : 'Stokta Yok'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Sepete Ekle
        </Button>
      </CardContent>
    </Card>
  );
}
