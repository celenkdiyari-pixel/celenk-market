import { Metadata } from 'next';
import { Cookie, Settings, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Çerez Politikası | Çelenk Diyarı',
  description: 'Çelenk Diyarı çerez politikası ve çerez kullanımı hakkında detaylı bilgiler.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Cookie className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Çerez Politikası</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Web sitemizde çerez kullanımı hakkında detaylı bilgiler ve 
              çerez tercihlerinizi nasıl yönetebileceğiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="h-6 w-6 text-blue-600" />
                Çerez Nedir?
              </h2>
              <p className="text-gray-700 mb-6">
                Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. 
                Bu dosyalar, web sitesinin daha iyi çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Çerez Türleri
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Zorunlu Çerezler</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Web sitesinin temel işlevselliği için gerekli olan çerezlerdir.
                  </p>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Oturum yönetimi</li>
                    <li>• Güvenlik önlemleri</li>
                    <li>• Form verileri</li>
                    <li>• Dil tercihleri</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Analitik Çerezler</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Web sitesi kullanımını analiz etmek için kullanılan çerezlerdir.
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Sayfa görüntüleme sayıları</li>
                    <li>• Kullanıcı davranışları</li>
                    <li>• Site performansı</li>
                    <li>• Hata raporları</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Fonksiyonel Çerezler</h3>
                  <p className="text-purple-700 text-sm mb-3">
                    Kullanıcı tercihlerini hatırlamak için kullanılan çerezlerdir.
                  </p>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Dil seçimi</li>
                    <li>• Tema tercihi</li>
                    <li>• Sipariş geçmişi</li>
                    <li>• Favori ürünler</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">Pazarlama Çerezleri</h3>
                  <p className="text-orange-700 text-sm mb-3">
                    Kişiselleştirilmiş reklam ve içerik için kullanılan çerezlerdir.
                  </p>
                  <ul className="text-orange-700 text-sm space-y-1">
                    <li>• Hedefli reklamlar</li>
                    <li>• Sosyal medya entegrasyonu</li>
                    <li>• E-posta pazarlama</li>
                    <li>• A/B testleri</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Çerez Yönetimi
              </h2>
              <p className="text-gray-700 mb-6">
                Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Ancak, bazı çerezleri devre dışı bırakmanız 
                web sitesinin bazı özelliklerinin düzgün çalışmamasına neden olabilir.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tarayıcı Ayarları</h3>
              <p className="text-gray-700 mb-4">
                Çerezleri tarayıcınızın ayarlarından yönetebilirsiniz:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Chrome:</strong> Ayarlar {'>'} Gizlilik ve güvenlik {'>'} Çerezler</li>
                <li><strong>Firefox:</strong> Seçenekler {'>'} Gizlilik ve güvenlik {'>'} Çerezler</li>
                <li><strong>Safari:</strong> Tercihler {'>'} Gizlilik {'>'} Çerezler</li>
                <li><strong>Edge:</strong> Ayarlar {'>'} Çerezler ve site izinleri</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Çerez Tercih Merkezi</h3>
              <p className="text-gray-700 mb-6">
                Web sitemizde çerez tercihlerinizi kolayca yönetebilirsiniz:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Zorunlu Çerezler</h4>
                    <p className="text-sm text-gray-600">Web sitesinin çalışması için gerekli</p>
                  </div>
                  <Button disabled className="bg-green-100 text-green-800">
                    Zorunlu
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Analitik Çerezler</h4>
                    <p className="text-sm text-gray-600">Site kullanımını analiz etmek için</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Kabul Et
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Pazarlama Çerezleri</h4>
                    <p className="text-sm text-gray-600">Kişiselleştirilmiş içerik için</p>
                  </div>
                  <Button variant="outline">
                    Reddet
                  </Button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Üçüncü Taraf Çerezler
              </h2>
              <p className="text-gray-700 mb-6">
                Web sitemizde aşağıdaki üçüncü taraf hizmetlerin çerezlerini kullanıyoruz:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Google Analytics:</strong> Web sitesi trafiğini analiz etmek için</li>
                <li><strong>Google Ads:</strong> Hedefli reklamlar için</li>
                <li><strong>Facebook Pixel:</strong> Sosyal medya pazarlama için</li>
                <li><strong>YouTube:</strong> Video içerik entegrasyonu için</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                İletişim
              </h2>
              <p className="text-gray-700 mb-6">
                Çerez politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-blue-800 mb-2"><strong>E-posta:</strong> info@celenkdiyari.com</p>
                <p className="text-blue-800 mb-2"><strong>Telefon:</strong> +90 (212) 555 0123</p>
                <p className="text-blue-800"><strong>Adres:</strong> İstanbul, Türkiye</p>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>Son Güncelleme:</strong> Bu çerez politikası son olarak 2024 yılında güncellenmiştir. 
                  Değişiklikler web sitemizde yayınlanacaktır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
