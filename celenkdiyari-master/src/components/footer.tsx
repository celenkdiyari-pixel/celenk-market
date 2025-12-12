'use client';

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function Footer() {
  const { settings, isLoading } = useSettings();
  
  // Fallback values
  const phone = settings?.contact?.phone || '+90 535 561 26 56';
  const email = settings?.contact?.email || 'info@celenkdiyari.com';
  const address = settings?.contact?.address || 'İstanbul, Türkiye';
  
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Ç</span>
              </div>
              <span className="text-xl font-elegant font-bold">Çelenk Diyarı</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Doğanın en güzel hediyelerini sevdiklerinize ulaştırıyoruz. 
              Taze ve doğal çelenklerle özel günlerinizi unutulmaz kılıyoruz.
            </p>
            <div className="flex space-x-4">
              {settings?.socialMedia?.facebook && (
                <a 
                  href={settings.socialMedia.facebook.startsWith('http') ? settings.socialMedia.facebook : `https://www.facebook.com/${settings.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.socialMedia?.instagram && (
                <a 
                  href={settings.socialMedia.instagram.startsWith('http') ? settings.socialMedia.instagram : `https://www.instagram.com/${settings.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.socialMedia?.twitter && (
                <a 
                  href={settings.socialMedia.twitter.startsWith('http') ? settings.socialMedia.twitter : `https://www.twitter.com/${settings.socialMedia.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-elegant font-semibold">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/products" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/about" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/cart" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Sepetim
                </Link>
              </li>
              <li>
                <Link href="/favorites" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Favorilerim
                </Link>
              </li>
              <li>
                <Link href="/blog" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-elegant font-semibold">Kategoriler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/açılış-tören" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Açılış & Tören
                </Link>
              </li>
              <li>
                <Link href="/categories/cenaze-çelenkleri" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Cenaze Çelenkleri
                </Link>
              </li>
              <li>
                <Link href="/categories/ferforjeler" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Ferforjeler
                </Link>
              </li>
              <li>
                <Link href="/categories/fuar-stand" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Fuar & Stand
                </Link>
              </li>
              <li>
                <Link href="/categories/ofis-saksı-bitkileri" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Ofis & Saksı Bitkileri
                </Link>
              </li>
              <li>
                <Link href="/categories/söz-nişan" prefetch={true} className="text-gray-300 hover:text-green-400 transition-colors">
                  Söz & Nişan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-elegant font-semibold">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">{address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400" />
                <a 
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  {phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-400" />
                <a 
                  href={`mailto:${email}`}
                  className="text-gray-300 hover:text-green-400 transition-colors break-all"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <span>© 2024 Çelenk Diyarı. Tüm hakları saklıdır.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                Kullanım Şartları
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                Çerez Politikası
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                Hakkımızda
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                İletişim
              </Link>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm flex items-center justify-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>in Turkey by</span>
              <a 
                href="https://www.ynadijital.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors font-medium"
              >
                YNA Dijital
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
