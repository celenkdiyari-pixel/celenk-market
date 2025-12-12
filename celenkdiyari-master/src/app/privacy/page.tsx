'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { Shield, Lock, Eye, FileText } from 'lucide-react';

// Metadata is not available in client components, but SEO is handled by layout.tsx

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-700 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Gizlilik Politikası</h1>
            </div>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Kişisel verilerinizin korunması bizim için önemlidir. 
              Gizlilik politikamızı detaylı olarak inceleyebilirsiniz.
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
                <Lock className="h-6 w-6 text-gray-600" />
                Veri Toplama ve Kullanım
              </h2>
              <p className="text-gray-700 mb-6">
                Çelenk Diyarı olarak, hizmetlerimizi sunabilmek için belirli kişisel verilerinizi topluyoruz. 
                Bu veriler yalnızca belirtilen amaçlar doğrultusunda kullanılır ve üçüncü taraflarla paylaşılmaz.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Toplanan Veriler</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Ad, soyad ve iletişim bilgileri</li>
                <li>E-posta adresi ve telefon numarası</li>
                <li>Teslimat adresi bilgileri</li>
                <li>Sipariş geçmişi ve tercihleri</li>
                <li>Web sitesi kullanım verileri</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="h-6 w-6 text-gray-600" />
                Veri Güvenliği
              </h2>
              <p className="text-gray-700 mb-6">
                Kişisel verilerinizin güvenliği için endüstri standardı güvenlik önlemleri alıyoruz. 
                Verileriniz şifrelenmiş olarak saklanır ve yetkisiz erişime karşı korunur.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Güvenlik Önlemleri</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>SSL şifreleme kullanımı</li>
                <li>Güvenli sunucu altyapısı</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Erişim kontrolü ve izleme</li>
                <li>Veri yedekleme sistemleri</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-gray-600" />
                Çerezler (Cookies)
              </h2>
              <p className="text-gray-700 mb-6">
                Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz. 
                Bu çerezler kişisel bilgilerinizi toplamaz ve tarayıcınızda saklanır.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Çerez Türleri</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevselliği için gerekli</li>
                <li><strong>Analitik Çerezler:</strong> Site kullanımını analiz etmek için</li>
                <li><strong>Fonksiyonel Çerezler:</strong> Kullanıcı tercihlerini hatırlamak için</li>
                <li><strong>Pazarlama Çerezleri:</strong> Kişiselleştirilmiş içerik için</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Veri Paylaşımı
              </h2>
              <p className="text-gray-700 mb-6">
                Kişisel verilerinizi üçüncü taraflarla paylaşmayız. Ancak, yasal yükümlülüklerimizi 
                yerine getirmek veya hizmetlerimizi sunmak için gerekli durumlarda sınırlı paylaşım yapabiliriz.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Kullanıcı Hakları
              </h2>
              <p className="text-gray-700 mb-6">
                KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Yanlış verilerin düzeltilmesi hakkı</li>
                <li>Verilerin silinmesi hakkı</li>
                <li>Veri işlemeye itiraz hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                İletişim
              </h2>
              <p className="text-gray-700 mb-6">
                Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>E-posta:</strong>{' '}
                  <a 
                    href="mailto:info@celenkdiyari.com"
                    className="text-green-600 hover:underline break-all"
                    onClick={(e) => {
                      e.preventDefault();
                      const email = 'info' + '@' + 'celenkdiyari.com';
                      window.location.href = 'mailto:' + email;
                    }}
                  >
                    info@celenkdiyari.com
                  </a>
                </p>
                <p className="text-gray-700 mb-2"><strong>Telefon:</strong> +90 535 561 26 56</p>
                <p className="text-gray-700"><strong>Adres:</strong> İstanbul, Türkiye</p>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Son Güncelleme:</strong> Bu gizlilik politikası son olarak 2024 yılında güncellenmiştir. 
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
