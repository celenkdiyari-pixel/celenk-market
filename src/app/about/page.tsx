import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Award, Leaf } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Hakkımızda</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Doğanın en güzel hediyelerini sevdiklerinize ulaştırmak için yola çıktık. 
              Çelenk Diyarı olarak, özel günlerinizi unutulmaz kılmak için buradayız.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Misyonumuz</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Çelenk Diyarı olarak, doğanın en güzel hediyelerini sevdiklerinize ulaştırmak 
                için çalışıyoruz. Her çelengimiz, özenle seçilmiş taze çiçekler ve doğal 
                malzemelerle hazırlanır.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Özel günlerinizde sevdiklerinizi mutlu etmek, anlamlı anları paylaşmak 
                ve doğanın güzelliğini yaşamınıza katmak için buradayız.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl flex items-center justify-center">
                <div className="text-8xl opacity-60">🌿</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Değerlerimiz</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Çalışma prensiplerimizi oluşturan temel değerlerimiz
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Doğallık</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Sadece en taze ve doğal malzemeler kullanarak çelenklerimizi hazırlıyoruz.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Sevgi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Her çelengimiz sevgi ve özenle hazırlanır, özel günlerinizi anlamlı kılar.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Kalite</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  En yüksek kalite standartlarında hizmet sunarak müşteri memnuniyetini sağlıyoruz.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Güven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Müşterilerimizle kurduğumuz güven ilişkisi bizim için en değerli varlığımızdır.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Hikayemiz</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Çelenk Diyarı, doğanın güzelliğini insanların yaşamına katma tutkusuyla 
                kuruldu. Kurucumuz, çiçeklerin ve doğal malzemelerin insanlar üzerindeki 
                olumlu etkisini gözlemleyerek bu alanda hizmet vermeye karar verdi.
              </p>
              <p>
                Yıllar içinde, özel günlerde sevdiklerini mutlu etmek isteyen binlerce 
                müşterimize hizmet verdik. Her projemizde, doğallık, kalite ve müşteri 
                memnuniyetini ön planda tuttuk.
              </p>
              <p>
                Bugün, Çelenk Diyarı olarak, Türkiye&apos;nin önde gelen çelenk üreticilerinden 
                biri olmanın gururunu yaşıyoruz. Gelecekte de aynı kalite ve hizmet 
                anlayışıyla yolumuza devam edeceğiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deneyimli ve uzman ekibimizle size en iyi hizmeti sunuyoruz
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <CardTitle className="text-xl">Ahmet Yılmaz</CardTitle>
                <CardDescription className="text-base">Kurucu & Genel Müdür</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  15 yıllık deneyimi ile çelenk sektöründe öncü isimlerden biri.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👩‍🎨</span>
                </div>
                <CardTitle className="text-xl">Ayşe Demir</CardTitle>
                <CardDescription className="text-base">Tasarım Uzmanı</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yaratıcı tasarımları ile özel günlerinizi unutulmaz kılıyor.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift shadow-modern">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍🌾</span>
                </div>
                <CardTitle className="text-xl">Mehmet Kaya</CardTitle>
                <CardDescription className="text-base">Üretim Sorumlusu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Doğal malzemelerin seçimi ve kalite kontrolü konusunda uzman.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bizimle İletişime Geçin</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Özel günleriniz için çelenk ihtiyaçlarınızda yanınızdayız. 
            Size en uygun çözümü birlikte bulalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-6 rounded-lg font-medium transition-colors"
            >
              İletişime Geç
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-6 rounded-lg font-medium transition-colors"
            >
              Ürünleri Görüntüle
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
