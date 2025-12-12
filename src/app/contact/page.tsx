"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">İletişim</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Özel günleriniz için çelenk ihtiyaçlarınızda yanınızdayız. 
              Size en uygun çözümü birlikte bulalım.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Çelenk ihtiyaçlarınız için bizimle iletişime geçebilirsiniz. 
                  Uzman ekibimiz size en uygun çözümü sunmak için burada.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="hover-lift shadow-modern">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Telefon</h3>
                        <p className="text-gray-600">+90 (212) 123 45 67</p>
                        <p className="text-sm text-gray-500">Pazartesi - Cuma: 09:00 - 18:00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift shadow-modern">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">E-posta</h3>
                        <p className="text-gray-600">info@celenkdiyari.com</p>
                        <p className="text-sm text-gray-500">24 saat içinde yanıt veriyoruz</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift shadow-modern">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Adres</h3>
                        <p className="text-gray-600">Çiçek Sokak No: 123</p>
                        <p className="text-gray-600">Kadıköy, İstanbul</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift shadow-modern">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Çalışma Saatleri</h3>
                        <p className="text-gray-600">Pazartesi - Cuma: 09:00 - 18:00</p>
                        <p className="text-gray-600">Cumartesi: 10:00 - 16:00</p>
                        <p className="text-gray-600">Pazar: Kapalı</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="shadow-modern">
                <CardHeader>
                  <CardTitle className="text-2xl">Bize Mesaj Gönderin</CardTitle>
                  <CardDescription>
                    Sorularınız, önerileriniz veya özel talepleriniz için formu doldurun.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Ad Soyad *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="Adınız ve soyadınız"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          E-posta *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="+90 (5xx) xxx xx xx"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Konu *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="Mesaj konusu"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Mesaj *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full min-h-[120px]"
                        placeholder="Mesajınızı buraya yazın..."
                      />
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                      <Send className="h-5 w-5 mr-2" />
                      Mesaj Gönder
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Konumumuz</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              İstanbul Kadıköy&apos;de bulunan mağazamızı ziyaret edebilir, 
              çelenklerimizi yakından inceleyebilirsiniz.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Çelenk Diyarı Mağazası</h3>
              <p className="text-lg text-gray-700">Çiçek Sokak No: 123, Kadıköy, İstanbul</p>
              <p className="text-gray-600 mt-2">Harita entegrasyonu yakında eklenecek</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Müşterilerimizin en çok merak ettiği konular
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover-lift shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">Teslimat süresi ne kadar?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Standart teslimat 1-2 iş günü, acil durumlar için aynı gün teslimat imkanımız bulunmaktadır.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-lift shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">Özel tasarım yapıyor musunuz?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Evet, müşterilerimizin özel isteklerine göre kişiye özel çelenk tasarımları yapıyoruz.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-lift shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">Hangi ödeme yöntemlerini kabul ediyorsunuz?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz bulunmaktadır.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-lift shadow-modern">
              <CardHeader>
                <CardTitle className="text-lg">Çelenkler ne kadar süre taze kalır?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Doğru bakım ile çelenklerimiz 5-7 gün taze kalır. Bakım önerilerimizi teslimat sırasında paylaşırız.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
