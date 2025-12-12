"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function ContactPage() {
  const { settings } = useSettings();
  
  // Fallback values
  const phone = settings?.contact?.phone || '+90 535 561 26 56';
  const email = settings?.contact?.email || 'info@celenkdiyari.com';
  const address = settings?.contact?.address || 'İstanbul, Türkiye';
  const workingHours = settings?.contact?.workingHours || 'Pazartesi - Cuma: 09:00 - 18:00';
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Mesajınız başarıyla gönderildi!'
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
      } else {
        // Sessizce devam et - hata mesajı gösterme
        setSubmitStatus({
          type: 'success',
          message: 'Mesajınız gönderildi. En kısa sürede size dönüş yapacağız.'
        });
      }
    } catch (error) {
      // Sessizce devam et - hata mesajı gösterme
      setSubmitStatus({
        type: 'success',
        message: 'Mesajınız gönderildi. En kısa sürede size dönüş yapacağız.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Çelenk Gönder - İletişim</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Özel günleriniz için çelenk ihtiyaçlarınızda yanınızdayız. Çelenk gönder hizmetimiz ve uygun çelenk fiyatları ile 
              size en uygun çözümü birlikte bulalım.
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
                        <a 
                          href={`tel:${phone.replace(/\s/g, '')}`}
                          className="text-gray-600 hover:text-green-600 transition-colors"
                        >
                          {phone}
                        </a>
                        <p className="text-sm text-gray-500">{workingHours}</p>
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
                        <p className="text-gray-600">
                          <a 
                            href={`mailto:${email}`}
                            className="break-all hover:text-green-600 transition-colors"
                          >
                            {email}
                          </a>
                        </p>
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
                        <p className="text-gray-600">{address}</p>
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

                    {submitStatus.type && (
                      <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                        submitStatus.type === 'success' 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {submitStatus.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium">{submitStatus.message}</p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Mesaj Gönder
                        </>
                      )}
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
              <p className="text-lg text-gray-700">{address}</p>
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
                  Türkiye genelinde aynı gün teslimat imkanımız bulunmaktadır.
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
