"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Menu, X, User, Heart, Heart as HeartIcon, Gift, Building, Wrench, Flower, Leaf } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Logo from "./logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems, favorites } = useCart();
  const router = useRouter();

  const categories = [
    { name: "Açılış & Tören", category: "Açılış & Tören", slug: "acilistoren", icon: Gift, color: "text-blue-600" },
    { name: "Cenaze Çelenkleri", category: "Cenaze Çelenkleri", slug: "cenaze", icon: Flower, color: "text-gray-600" },
    { name: "Ferforjeler", category: "Ferforjeler", slug: "ferforje", icon: Wrench, color: "text-yellow-600" },
    { name: "Fuar & Stand", category: "Fuar & Stand", slug: "fuarstand", icon: Building, color: "text-purple-600" },
    { name: "Ofis & Saksı Bitkileri", category: "Ofis & Saksı Bitkileri", slug: "ofisbitki", icon: Leaf, color: "text-green-600" },
    { name: "Söz & Nişan", category: "Söz & Nişan", slug: "soznisan", icon: HeartIcon, color: "text-red-600" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="group">
            <Logo size="md" showText={true} className="group-hover:scale-105 transition-transform duration-300" />
          </Link>

          {/* Desktop Navigation - Sıralı Kategoriler */}
          <div className="hidden lg:flex items-center space-x-1">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  router.push(`/categories/${category.slug}`, { scroll: false });
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium transition-all duration-200 group"
                style={{ 
                  fontFeatureSettings: '"kern" 1, "liga" 1',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: 'normal'
                }}
              >
                <category.icon className={`h-4 w-4 ${category.color} group-hover:scale-110 transition-transform`} />
                <span 
                  className="text-sm" 
                  style={{ 
                    letterSpacing: 'normal', 
                    fontVariant: 'normal',
                    fontFeatureSettings: '"kern" 1, "liga" 1',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Çelenk ara..."
                className="pl-10 pr-4 py-2 w-64 rounded-full border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="hidden sm:flex relative hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="hidden sm:flex relative hover:bg-green-50 hover:text-green-600 transition-all duration-200">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 animate-pulse">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-gray-100 transition-all duration-200">
              <User className="h-5 w-5" />
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <div className="relative px-4">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Çelenk ara..."
                  className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              {/* Mobile Categories */}
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    router.push(`/categories/${category.slug}`, { scroll: false });
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-gray-700 hover:text-green-600 font-medium transition-colors px-4 py-2 w-full text-left"
                >
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  <span>{category.name}</span>
                </button>
              ))}
              
              <div className="flex items-center space-x-4 px-4 pt-4 border-t border-gray-200">
                <Link href="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Favoriler</span>
                    {favorites.length > 0 && (
                      <Badge className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500">
                        {favorites.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Sepet</span>
                    {getTotalItems() > 0 && (
                      <Badge className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-green-500">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}