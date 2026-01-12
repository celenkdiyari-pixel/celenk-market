import { Metadata } from 'next';
import { FileText, Scale, Shield, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Şartları | Çelenk Diyarı',
  description: 'Çelenk Diyarı kullanım şartları ve hizmet koşulları hakkında detaylı bilgiler.',
};

export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-700 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <FileText className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Kullanım Şartları</h1>
            </div>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Çelenk Diyarı hizmetlerini kullanırken uymanız gereken
              şartlar ve koşullar hakkında detaylı bilgiler.
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
                <Scale className="h-6 w-6 text-gray-600" />
                Genel Hükümler
              </h2>
              <p className="text-gray-700 mb-6">
                Bu kullanım şartları, Çelenk Diyarı web sitesini ve hizmetlerini kullanırken
                uymanız gereken kuralları belirler. Sitemizi kullanarak bu şartları kabul etmiş sayılırsınız.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hizmet Tanımı</h3>
              <p className="text-gray-700 mb-6">
                Çelenk Diyarı, çelenk tasarımı, üretimi ve teslimatı konularında profesyonel hizmet sunan
                bir e-ticaret platformudur. Hizmetlerimiz şunları içerir:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Çelenk tasarımı ve üretimi</li>
                <li>Online sipariş alma ve işleme</li>
                <li>Teslimat hizmetleri</li>
                <li>Müşteri destek hizmetleri</li>
                <li>Özel tasarım hizmetleri</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-gray-600" />
                Kullanıcı Sorumlulukları
              </h2>
              <p className="text-gray-700 mb-6">
                Web sitemizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Yasak Faaliyetler</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Yanıltıcı veya yanlış bilgi verme</li>
                <li>Başkalarının haklarını ihlal etme</li>
                <li>Zararlı yazılım yükleme veya yayma</li>
                <li>Sistemi hacklemeye çalışma</li>
                <li>Spam veya istenmeyen içerik gönderme</li>
                <li>Telif hakkı ihlali yapma</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hesap Güvenliği</h3>
              <p className="text-gray-700 mb-6">
                Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güvenli tutun ve
                başkalarıyla paylaşmayın. Şüpheli aktivite fark ederseniz derhal bizimle iletişime geçin.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sipariş ve Ödeme
              </h2>
              <p className="text-gray-700 mb-6">
                Sipariş verme ve ödeme süreci hakkında önemli bilgiler:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Süreci</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Siparişler online olarak alınır</li>
                <li>Sipariş onayı e-posta ile gönderilir</li>
                <li>Ödeme onaylandıktan sonra üretim başlar</li>
                <li>Teslimat tarihi sipariş sırasında belirtilir</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ödeme Koşulları</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Kredi kartı, banka kartı ve havale ile ödeme</li>
                <li>Ödeme sipariş sırasında alınır</li>
                <li>Güvenli ödeme sistemleri kullanılır</li>
                <li>Fatura sipariş sonrası gönderilir</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-gray-600" />
                İade ve İptal Politikası
              </h2>
              <p className="text-gray-700 mb-6">
                İade ve iptal koşullarımız aşağıdaki gibidir:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">İptal Koşulları</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Üretim başlamadan önce iptal edilebilir</li>
                <li>İptal talebi 24 saat içinde değerlendirilir</li>
                <li>Üretim başladıktan sonra iptal edilemez</li>
                <li>İptal durumunda tam iade yapılır</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">İade Koşulları</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Hasarlı ürünler için tam iade</li>
                <li>Yanlış ürün gönderimi durumunda iade</li>
                <li>İade talebi 7 gün içinde yapılmalıdır</li>
                <li>İade kargo ücreti firmamız tarafından karşılanır</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Teslimat Koşulları
              </h2>
              <p className="text-gray-700 mb-6">
                Teslimat hizmetlerimiz hakkında bilgiler:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Türkiye geneli 81 ilde teslimat</li>
                <li>Hızlı ve güvenli gönderim</li>
                <li>Teslimat süresi 1-3 iş günü</li>
                <li>Özel teslimat tarihi belirleme</li>
                <li>Teslimat sırasında imza alınır</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sorumluluk Sınırları
              </h2>
              <p className="text-gray-700 mb-6">
                Çelenk Diyarı&apos;nın sorumluluğu aşağıdaki durumlarla sınırlıdır:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Doğal afetler ve mücbir sebep durumları</li>
                <li>Müşteri tarafından verilen yanlış bilgiler</li>
                <li>Üçüncü taraf hizmetlerindeki aksaklıklar</li>
                <li>Müşteri tarafından yapılan değişiklikler</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Fikri Mülkiyet Hakları
              </h2>
              <p className="text-gray-700 mb-6">
                Web sitemizdeki tüm içerik, tasarım ve yazılımlar Çelenk Diyarı&apos;na aittir.
                İzinsiz kullanım yasaktır ve yasal işlem başlatılabilir.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Değişiklikler ve Güncellemeler
              </h2>
              <p className="text-gray-700 mb-6">
                Bu kullanım şartlarını istediğimiz zaman güncelleyebiliriz.
                Değişiklikler web sitemizde yayınlandığında yürürlüğe girer.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Uygulanacak Hukuk
              </h2>
              <p className="text-gray-700 mb-6">
                Bu sözleşme Türk hukukuna tabidir. Anlaşmazlıklar İstanbul mahkemelerinde çözülür.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                İletişim
              </h2>
              <p className="text-gray-700 mb-6">
                Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>E-posta:</strong> info@celenkdiyari.com</p>
                <p className="text-gray-700 mb-2"><strong>Telefon:</strong> +90 (212) 555 0123</p>
                <p className="text-gray-700"><strong>Adres:</strong> İstanbul, Türkiye</p>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Son Güncelleme:</strong> Bu kullanım şartları son olarak 2024 yılında güncellenmiştir.
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
