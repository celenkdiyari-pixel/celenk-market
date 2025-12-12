'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Home, Phone } from 'lucide-react';

interface HolidayClosureProps {
  isEnabled: boolean;
  startDate: string;
  endDate: string;
  message: string;
  showCountdown: boolean;
}

export default function HolidayClosure({ 
  isEnabled, 
  startDate, 
  endDate, 
  message, 
  showCountdown 
}: HolidayClosureProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!isEnabled || !showCountdown) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isEnabled, endDate, showCountdown]);

  if (!isEnabled) return null;

  const isCurrentlyClosed = () => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  if (!isCurrentlyClosed()) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Calendar className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Özel Günlerde Kapalıyız
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {message || 'Özel günlerde hizmet vermiyoruz. Anlayışınız için teşekkür ederiz.'}
            </p>
          </div>

          {showCountdown && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Açılış Tarihine Kalan Süre:
              </h2>
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.days}</div>
                  <div className="text-sm text-red-500">Gün</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.hours}</div>
                  <div className="text-sm text-red-500">Saat</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.minutes}</div>
                  <div className="text-sm text-red-500">Dakika</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.seconds}</div>
                  <div className="text-sm text-red-500">Saniye</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p><strong>Kapanış Tarihi:</strong> {new Date(startDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Açılış Tarihi:</strong> {new Date(endDate).toLocaleDateString('tr-TR')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </a>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/settings');
                    if (response.ok) {
                      const data = await response.json();
                      const phone = data.settings?.contact?.phone || '+90 535 561 26 56';
                      window.open(`tel:${phone.replace(/\s/g, '')}`, '_self');
                    } else {
                      window.open('tel:+905355612656', '_self');
                    }
                  } catch {
                    window.open('tel:+905355612656', '_self');
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors w-full sm:w-auto"
              >
                <Phone className="h-4 w-4 mr-2" />
                Bizi Arayın
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
