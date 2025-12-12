'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Eye, 
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  BookOpen
} from 'lucide-react';

// Metadata is not available in client components, but SEO is handled by layout.tsx

export default function CelenkNedirPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm mb-4">
            <Link href="/" className="hover:underline">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <span>/</span>
            <span>Çelenk Nedir?</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Çelenk Nedir? Çeşitleri ve Kullanım Alanları
          </h1>
          
          <p className="text-xl opacity-90 mb-6">
            Çelenklerin tarihinden günümüzdeki kullanım alanlarına kadar her şey
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>Çelenk Diyarı</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>15 Aralık 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>8 dk okuma</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>1,234 görüntüleme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="mb-8">
              <CardContent className="p-8">
                {/* Featured Image */}
                <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                  <Image
                    src="/images/blog/celenk-nedir.jpg"
                    alt="Çelenk nedir, çelenk çeşitleri"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Çelenk Nedir?
                  </h2>
                  
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    <strong>Çelenk</strong>, genellikle çiçekler, yapraklar, dallar veya diğer doğal malzemelerden yapılan, 
                    halka şeklinde veya yarım halka şeklinde düzenlenmiş dekoratif objelerdir. Çelenkler, 
                    antik çağlardan beri insanlık tarihinde önemli bir yere sahip olmuş ve günümüzde de 
                    çeşitli amaçlarla kullanılmaya devam etmektedir.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                    Çelenklerin Tarihi
                  </h3>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Çelenklerin tarihi MÖ 3000 yıllarına kadar uzanır. Antik Yunan ve Roma medeniyetlerinde 
                    çelenkler, zafer, onur ve kutlama sembolleri olarak kullanılırdı. Olimpiyat oyunlarında 
                    kazanan sporculara defne yapraklarından yapılmış çelenkler takılırdı. Bu gelenek, 
                    günümüzdeki madalya sisteminin temelini oluşturur.
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                    Çelenk Çeşitleri
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6">
                      <h4 className="text-xl font-semibold text-green-600 mb-3">Düğün Çelenkleri</h4>
                      <p className="text-gray-700">
                        Düğün törenlerinde kullanılan çelenkler, genellikle beyaz ve pastel renkli çiçeklerden 
                        yapılır. Gelin ve damat için özel tasarlanan bu çelenkler, mutluluğu ve birlikteliği simgeler.
                      </p>
                    </Card>
                    
                    <Card className="p-6">
                      <h4 className="text-xl font-semibold text-green-600 mb-3">Cenaze Çelenkleri</h4>
                      <p className="text-gray-700">
                        Cenaze törenlerinde kullanılan çelenkler, genellikle koyu renkli çiçeklerden yapılır. 
                        Yas ve saygıyı ifade eden bu çelenkler, merhumun anısına gönderilir.
                      </p>
                    </Card>
                    
                    <Card className="p-6">
                      <h4 className="text-xl font-semibold text-green-600 mb-3">Açılış Çelenkleri</h4>
                      <p className="text-gray-700">
                        İş yerleri, mağazalar ve ofislerin açılışlarında kullanılan çelenkler, 
                        başarı ve bolluğu simgeler. Genellikle kırmızı ve altın renkli çiçeklerden yapılır.
                      </p>
                    </Card>
                    
                    <Card className="p-6">
                      <h4 className="text-xl font-semibold text-green-600 mb-3">Yapay Çelenkler</h4>
                      <p className="text-gray-700">
                        Uzun ömürlü ve bakım gerektirmeyen yapay çelenkler, iç mekan dekorasyonu için 
                        idealdir. Gerçekçi görünümleri sayesinde doğal çelenklerin yerini alabilir.
                      </p>
                    </Card>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                    Çelenk Kullanım Alanları
                  </h3>
                  
                  <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                    <li><strong>Düğün ve Nişan Törenleri:</strong> Mutluluk ve birliktelik sembolü</li>
                    <li><strong>Cenaze ve Taziye:</strong> Yas ve saygı ifadesi</li>
                    <li><strong>İş Açılışları:</strong> Başarı ve bolluk dileği</li>
                    <li><strong>Dini Törenler:</strong> Kutsallık ve temizlik sembolü</li>
                    <li><strong>İç Mekan Dekorasyonu:</strong> Estetik ve huzur verici atmosfer</li>
                    <li><strong>Hediye ve Kutlamalar:</strong> Sevinç ve mutluluk ifadesi</li>
                  </ul>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                    Çelenk Seçimi İpuçları
                  </h3>
                  
                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Doğru Çelenk Seçimi İçin:</h4>
                    <ul className="list-disc list-inside text-green-700 space-y-2">
                      <li>Etkinliğin türüne uygun renk seçimi yapın</li>
                      <li>Mekanın büyüklüğüne göre boyut belirleyin</li>
                      <li>Bütçenizi önceden planlayın</li>
                      <li>Güvenilir çelenk firması seçin</li>
                      <li>Teslimat tarihini netleştirin</li>
                    </ul>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                    Çelenk Bakımı
                  </h3>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Çelenklerin ömrünü uzatmak için düzenli su verme, doğrudan güneş ışığından koruma 
                    ve serin ortamda saklama önemlidir. Yapay çelenkler için ise düzenli temizlik ve 
                    toz alma yeterlidir.
                  </p>

                  <div className="bg-blue-50 p-6 rounded-lg mb-8">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">💡 İlginç Bilgi</h4>
                    <p className="text-blue-700">
                      Dünyanın en büyük çelenk rekoru, 2019 yılında Hindistan&apos;da 2.5 km uzunluğunda 
                      yapılan çelenk ile kırılmıştır. Bu çelenk, 50,000&apos;den fazla çiçekten oluşuyordu.
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                    Sonuç
                  </h3>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Çelenkler, sadece dekoratif objeler değil, aynı zamanda duygusal ve sembolik değerleri 
                    olan özel eşyalardır. Doğru seçim ve bakım ile çelenkler, özel anlarınızı daha da 
                    anlamlı kılabilir. Çelenk Diyarı olarak, her türlü ihtiyacınıza uygun, kaliteli ve 
                    özel tasarım çelenkler sunmaktayız.
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                  <Badge variant="outline">çelenk</Badge>
                  <Badge variant="outline">çelenk nedir</Badge>
                  <Badge variant="outline">çelenk çeşitleri</Badge>
                  <Badge variant="outline">düğün çelenkleri</Badge>
                  <Badge variant="outline">cenaze çelenkleri</Badge>
                  <Badge variant="outline">açılış çelenkleri</Badge>
                  <Badge variant="outline">çelenk siparişi</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">İlgili Yazılar</h3>
                <div className="space-y-4">
                  <Link href="/blog/düğün-çelenkleri-seçimi" className="block hover:text-green-600">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">Düğün Çelenkleri Seçimi</h4>
                        <p className="text-xs text-gray-500 mt-1">5 dk okuma</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/blog/cenaze-çelenkleri-rehberi" className="block hover:text-green-600">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">Cenaze Çelenkleri Rehberi</h4>
                        <p className="text-xs text-gray-500 mt-1">6 dk okuma</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/blog/çelenk-bakımı-ipuçları" className="block hover:text-green-600">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-yellow-100 rounded-lg flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">Çelenk Bakımı İpuçları</h4>
                        <p className="text-xs text-gray-500 mt-1">4 dk okuma</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Kategoriler</h3>
                <div className="space-y-2">
                  <Link href="/blog?category=Çiçek Bakımı" className="block text-sm hover:text-green-600">
                    Çiçek Bakımı
                  </Link>
                  <Link href="/blog?category=Dekorasyon" className="block text-sm hover:text-green-600">
                    Dekorasyon
                  </Link>
                  <Link href="/blog?category=Etkinlik" className="block text-sm hover:text-green-600">
                    Etkinlik
                  </Link>
                  <Link href="/blog?category=Çelenk" className="block text-sm hover:text-green-600">
                    Çelenk
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Link href="/blog" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Blog&apos;a Dön
          </Link>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            Paylaş
          </button>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="h-4 w-4 mr-2" />
            Beğen
          </button>
          
          <Link href="/products" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <BookOpen className="h-4 w-4 mr-2" />
            Çelenklerimizi İncele
          </Link>
        </div>
      </div>
    </div>
  );
}
