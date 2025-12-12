'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  
  // Fallback to default phone number
  const whatsappPhone = settings?.contact?.whatsapp || settings?.contact?.phone || '+90 535 561 26 56';
  // Remove spaces and special characters for WhatsApp URL
  const phoneNumber = whatsappPhone.replace(/[\s\-+()]/g, '');
  const message = "Merhaba! Çelenk Diyarı'ndan bilgi almak istiyorum.";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
