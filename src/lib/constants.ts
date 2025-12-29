import { Store, Users, Heart, Flower2, Briefcase, Truck } from 'lucide-react';

// Sipariş Durumları
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [ORDER_STATUS.PENDING]: 'Beklemede',
    [ORDER_STATUS.CONFIRMED]: 'Onaylandı',
    [ORDER_STATUS.PREPARING]: 'Hazırlanıyor',
    [ORDER_STATUS.SHIPPED]: 'Dağıtımda',
    [ORDER_STATUS.DELIVERED]: 'Teslim Edildi',
    [ORDER_STATUS.CANCELLED]: 'İptal Edildi',
};

// Ödeme Yöntemleri
export const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    BANK_TRANSFER: 'transfer',
    CASH: 'cash',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PAYMENT_METHODS.CREDIT_CARD]: 'Kredi Kartı (PayTR)',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Havale / EFT',
    [PAYMENT_METHODS.CASH]: 'Kapıda Ödeme',
};

// Teslimat Yerleri
export const DELIVERY_PLACES = [
    'Ev',
    'İş Yeri',
    'Hastane',
    'Cami',
    'Düğün / Nikah Salonu',
    'Açılış / Tören Alanı',
    'Okul',
    'Otel',
    'Mezarlık',
    'Diğer'
] as const;

// Teslimat Saatleri Oluşturucu
export const generateTimeSlots = () => {
    const slots: string[] = [];
    let startHour = 9;
    let startMinute = 0;
    const endHour = 20;

    while (startHour < endHour || (startHour === endHour && startMinute === 0)) {
        const timeString = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

        let endH = startHour;
        let endM = startMinute + 30;
        if (endM >= 60) {
            endH += 1;
            endM = 0;
        }
        const endTimeString = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        slots.push(`${timeString} - ${endTimeString}`);

        startMinute += 30;
        if (startMinute >= 60) {
            startHour += 1;
            startMinute = 0;
        }
    }
    return slots;
};

export const DELIVERY_TIME_SLOTS = generateTimeSlots();

// Şehir Listesi
export const CRITICAL_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

// Kategori Bilgileri
export interface CategoryInfo {
    title: string;
    description: string;
    image: string;
    icon: any;
    color: string;
    features: string[];
}

export const CATEGORY_INFO: Record<string, CategoryInfo> = {
    'acilis-toren': {
        title: 'Açılış & Tören',
        description: 'Yeni başlangıçlar için en görkemli tebrik çelenkleri',
        image: 'https://images.unsplash.com/photo-1563241527-90038898168f?q=80&w=1000',
        icon: Store,
        color: 'from-blue-500 to-blue-600',
        features: ['Hızlı Teslimat', 'Logo Baskılı Şerit', 'Görkemli Tasarım']
    },
    'cenaze-celenkleri': {
        title: 'Cenaze Çelenkleri',
        description: 'Acınızı paylaşıyor, merhuma son görevinizde yanınızdayız',
        image: 'https://images.unsplash.com/photo-1596435552713-33230d359a16?q=80&w=1000',
        icon: Users,
        color: 'from-gray-500 to-gray-600',
        features: ['Hızlı Teslimat', 'Taziye Bandı', 'Ciddi ve Saygın']
    },
    'soz-nisan': {
        title: 'Söz & Nişan',
        description: 'En mutlu gününüze şıklık katan tasarımlar',
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000',
        icon: Heart,
        color: 'from-pink-500 to-rose-600',
        features: ['Canlı Çiçekler', 'Özel Tasarım', 'Zarif Süsleme']
    },
    'ferforjeler': {
        title: 'Ferforjeler',
        description: 'Modern ve şık ferforje aranjmanları',
        image: 'https://images.unsplash.com/photo-1563241527-90038898168f?q=80&w=1000',
        icon: Flower2,
        color: 'from-purple-500 to-purple-600',
        features: ['Uzun Ömürlü', 'Şık Sunum', 'Farklı Boyutlar']
    },
    'fuar-stand': {
        title: 'Fuar & Stand',
        description: 'Kurumsal kimliğinizi yansıtan fuar çiçekleri',
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1000',
        icon: Briefcase,
        color: 'from-amber-500 to-amber-600',
        features: ['Kurumsal Renkler', 'Dayanıklı Türler', 'Yerinde Kurulum']
    },
    'ofis-saksi-bitkileri': {
        title: 'Ofis & Saksı Bitkileri',
        description: 'Çalışma alanlarınıza doğallık katın',
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1000',
        icon: Briefcase,
        color: 'from-green-500 to-green-600',
        features: ['Bakımı Kolay', 'Hava Temizleyen', 'Dekoratif']
    }
};

// TASK-07 Helpers
export const getCategoryBySlug = (slug: string) => CATEGORY_INFO[slug];
export const getCategoryTitleBySlug = (slug: string) => CATEGORY_INFO[slug]?.title || slug;
export const getAllCategoryTitles = () => Object.values(CATEGORY_INFO).map(c => c.title);
export const getAllCategorySlugs = () => Object.keys(CATEGORY_INFO);
