'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart, toggleFavorite, isInCart, isFavorite } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('📦 Loading product:', productId);
      const response = await fetch(`/api/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product loaded:', data);
        setProduct(data);
      } else {
        console.log('❌ Failed to load product');
        setError('Ürün bulunamadı');
      }
    } catch (error) {
      console.error('❌ Error loading product:', error);
      setError('Ürün yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız ürün bulunamadı'}</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-600 hover:text-gray-900"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(product.id)}
                className={`${isFavorite(product.id) ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}
              >
                <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-100 to-emerald-100">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl">
                    <Flower className="h-12 w-12 text-white" />
                  </div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                <Badge 
                  variant={product.inStock ? "default" : "destructive"} 
                  className="shadow-lg text-sm px-4 py-2"
                >
                  {product.inStock ? 'Stokta' : 'Stokta Yok'}
                </Badge>
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-6 right-6">
                <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-gray-700 border-gray-300 shadow-lg">
                  {product.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(4.8) • 24 değerlendirme</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-green-600">
                  {product.price} ₺
                </span>
                <span className="text-lg text-gray-500">KDV Dahil</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                {isInCart(product.id) ? 'Sepette' : 'Sepete Ekle'}
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-6 rounded-2xl transition-all duration-300"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  İletişim
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-6 rounded-2xl transition-all duration-300"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Favorilere Ekle
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Özellikler</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Hızlı Teslimat</div>
                    <div className="text-sm text-gray-600">Aynı gün teslimat imkanı</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Güvenli Alışveriş</div>
                    <div className="text-sm text-gray-600">SSL korumalı ödeme</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Kalite Garantisi</div>
                    <div className="text-sm text-gray-600">Profesyonel tasarım</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
