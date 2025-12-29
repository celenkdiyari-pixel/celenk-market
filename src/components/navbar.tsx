"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, User, Heart, Gift, Building, Wrench, Flower, Leaf, BookOpen, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Logo from "./logo";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { getTotalItems, favorites } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categories = [
    { name: "Açılış & Tören", slug: "acilis-toren", icon: Gift, color: "text-blue-600" },
    { name: "Cenaze Çelenkleri", slug: "cenaze-celenkleri", icon: Flower, color: "text-gray-600" },
    { name: "Ferforjeler", slug: "ferforjeler", icon: Wrench, color: "text-yellow-600" },
    { name: "Fuar & Stand", slug: "fuar-stand", icon: Building, color: "text-purple-600" },
    { name: "Ofis & Saksı Bitkileri", slug: "ofis-saksi-bitkileri", icon: Leaf, color: "text-green-600" },
    { name: "Söz & Nişan", slug: "soz-nisan", icon: Heart, color: "text-red-600" }
  ];

  const cartCount = isMounted ? getTotalItems() : 0;
  const favoriteCount = isMounted ? favorites.length : 0;

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group flex-shrink-0 relative z-[101]">
            <Logo size="md" showText={true} className="group-hover:scale-105 transition-transform duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/categories/${category.slug}`}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium transition-all duration-200 group"
              >
                <category.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", category.color)} />
                <span className="text-sm">{category.name}</span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/blog" className="flex items-center px-4 py-2 text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 rounded-xl transition-colors">
              <BookOpen className="w-4 h-4 mr-2" />
              Blog
            </Link>
            <Link href="/siparis-takip" className="flex items-center px-4 py-2 text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 rounded-xl transition-colors">
              <Truck className="w-4 h-4 mr-2" />
              Sipariş Takip
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link href="/favorites" className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
              <Heart className="h-5 w-5" />
              {favoriteCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0">
                  {favoriteCount}
                </Badge>
              )}
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 text-white border-0">
                  {cartCount}
                </Badge>
              )}
            </Link>

            <div className="hidden md:flex">
              <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-full transition-all">
                <User className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-20 bg-white border-b border-gray-200 shadow-2xl z-[90] animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-6 flex flex-col space-y-4 max-h-[80vh] overflow-y-auto">
              <Link href="/blog" className="flex items-center p-3 rounded-lg hover:bg-green-50 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>
                <BookOpen className="w-5 h-5 mr-3 text-green-600" />
                Blog Yazıları
              </Link>
              <Link href="/siparis-takip" className="flex items-center p-3 rounded-lg hover:bg-green-50 text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>
                <Truck className="w-5 h-5 mr-3 text-green-600" />
                Sipariş Takip
              </Link>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-4 px-3">Kategoriler</p>
                <div className="grid grid-cols-1 gap-1">
                  {categories.map((category, index) => (
                    <Link
                      key={index}
                      href={`/categories/${category.slug}`}
                      className="flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 p-3 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <category.icon className={cn("h-5 w-5", category.color)} />
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-around">
                <Link href="/favorites" className="flex flex-col items-center p-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="h-6 w-6 mb-1" />
                  <span className="text-xs">Favoriler</span>
                </Link>
                <Link href="/cart" className="flex flex-col items-center p-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="h-6 w-6 mb-1" />
                  <span className="text-xs">Sepet</span>
                </Link>
                <button className="flex flex-col items-center p-2 text-gray-600">
                  <User className="h-6 w-6 mb-1" />
                  <span className="text-xs">Profil</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}