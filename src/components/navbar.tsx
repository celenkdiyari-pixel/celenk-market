"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, User, Heart, Gift, Building, Wrench, Flower, Leaf, BookOpen, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Logo from "./logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { getTotalItems, favorites } = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categories = [
    { name: "Açılış & Tören", category: "Açılış & Tören", slug: "acilis-toren", icon: Gift, color: "text-blue-600" },
    { name: "Cenaze Çelenkleri", category: "Cenaze Çelenkleri", slug: "cenaze-celenkleri", icon: Flower, color: "text-gray-600" },
    { name: "Ferforjeler", category: "Ferforjeler", slug: "ferforjeler", icon: Wrench, color: "text-yellow-600" },
    { name: "Fuar & Stand", category: "Fuar & Stand", slug: "fuar-stand", icon: Building, color: "text-purple-600" },
    { name: "Ofis & Saksı Bitkileri", category: "Ofis & Saksı Bitkileri", slug: "ofis-saksi-bitkileri", icon: Leaf, color: "text-green-600" },
    { name: "Söz & Nişan", category: "Söz & Nişan", slug: "soz-nisan", icon: Heart, color: "text-red-600" }
  ];

  const cartCount = isMounted ? getTotalItems() : 0;
  const favoriteCount = isMounted ? favorites.length : 0;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group flex-shrink-0">
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
                <category.icon className={`h-4 w-4 ${category.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm">{category.name}</span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/blog">
              <Button variant="ghost" className="text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 rounded-xl px-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Link href="/siparis-takip">
              <Button variant="ghost" className="text-gray-600 hover:text-green-600 font-medium hover:bg-green-50 rounded-xl px-4">
                <Truck className="w-4 h-4 mr-2" />
                Sipariş Takip
              </Button>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                <Heart className="h-5 w-5" />
                {favoriteCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
                    {favoriteCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-green-50 hover:text-green-600 transition-all duration-200">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 animate-pulse">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <div className="md:hidden lg:flex">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-all duration-200">
                <User className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-2">
              <Link href="/blog" className="px-4 py-2 hover:bg-green-50 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Blog Yazıları
              </Link>
              <Link href="/siparis-takip" className="px-4 py-2 hover:bg-green-50 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Sipariş Takip
              </Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Kategoriler</p>
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={`/categories/${category.slug}`}
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}