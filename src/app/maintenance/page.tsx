'use client';

import { Wrench, Clock, Mail, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Wrench className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bakımdayız
        </h1>

        <div className="flex items-center justify-center mb-6">
          <Clock className="h-6 w-6 text-green-600 mr-2" />
          <p className="text-xl text-gray-700">
            Sitemiz şu anda bakım modunda
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Değerli müşterilerimiz, sizlere daha iyi hizmet verebilmek için sitemizde
            teknik bakım çalışmaları yapıyoruz. Kısa bir süre sonra tekrar hizmetinizde olacağız.
          </p>

          <div className="border-t pt-6 mt-6">
            <p className="text-sm text-gray-500 mb-4">
              Acil durumlar için bizimle iletişime geçebilirsiniz:
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:info@celenkdiyari.com"
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>info@celenkdiyari.com</span>
              </a>

              <a
                href="tel:+902121234567"
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+90 (212) 123 45 67</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500">
          Çelenk Diyarı &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

