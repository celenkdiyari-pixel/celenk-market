'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart, Eye, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite, isInCart } = useCart();
  const isLiked = isFavorite(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation if wrapped
    e.stopPropagation();
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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const safePrice = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
  const safeOriginalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : Number(product.originalPrice) || 0;
  const discountPercentage = safeOriginalPrice
    ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
    : 0;

  const safeRating = typeof product.rating === 'number' ? product.rating : 5; // Default to 5 for aesthetics
  const safeReviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : 0;

  return (
    <div className="group relative h-full">
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white flex flex-col rounded-[2rem]">
        {/* Image Container with 2:3 Aspect Ratio (Taller for Wreaths) */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-50 p-2 flex items-center justify-center">
          <Link href={`/products/${product.id}`} className="block h-full w-full relative">
            <Image
              src={product.images?.[0] || '/images/logo.png'}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </Link>

          {/* Overlay Gradient (Subtle) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-fade-in-up">
                %{discountPercentage} İndirim
              </span>
            )}
          </div>

          {/* Action Buttons - Float in from right */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={handleLike}
              className={cn(
                "p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
                isLiked ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </button>
            {showQuickView && (
              <Link href={`/products/${product.id}`}>
                <button className="p-3 bg-white/90 text-gray-600 rounded-full shadow-lg hover:bg-white hover:text-green-600 hover:scale-110 transition-all duration-300">
                  <Eye className="w-5 h-5" />
                </button>
              </Link>
            )}
          </div>

          {/* Add to Cart Button - Visible on Hover */}
          <div className="absolute bottom-6 left-6 right-6 z-20 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <Button
              onClick={handleAddToCart}
              className={cn(
                "w-full h-12 rounded-xl text-base font-medium shadow-lg transition-all duration-300",
                inCart
                  ? "bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-500"
                  : "bg-white text-green-700 hover:bg-green-600 hover:text-white hover:border-transparent"
              )}
            >
              {inCart ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Sepette
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Sepete Ekle
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between relative bg-white text-center">
          <div>
            <div className="text-xs font-medium text-green-600 mb-2 uppercase tracking-wider">
              {product.category}
            </div>
            <Link href={`/products/${product.id}`} className="block group/title">
              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover/title:text-green-700 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.floor(safeRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                  )}
                />
              ))}
              <span className="text-xs text-gray-400 ml-2">({safeReviewCount})</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-end mt-2">
            {safeOriginalPrice > 0 && (
              <span className="text-sm text-gray-400 line-through mb-0.5">
                ₺{safeOriginalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold text-gray-900">
              ₺{safePrice.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
