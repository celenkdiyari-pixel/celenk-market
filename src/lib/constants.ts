
import {
    Gift,
    Flower,
    Wrench,
    Building,
    Leaf,
    Heart as HeartIcon,
    LucideIcon
} from "lucide-react";

export interface CategoryInfo {
    title: string;
    categoryValue: string; // exact category text stored on products
    description: string;
    image: string;
    icon: LucideIcon;
    color: string;
    features: string[];
}

export const CATEGORY_INFO: { [key: string]: CategoryInfo } = {
    'acilistoren': {
        title: 'Açılış & Tören Çelenkleri',
        categoryValue: 'Açılış & Tören',
        description: 'İş yerinizin açılışında ve özel törenlerinizde kullanabileceğiniz şık ve profesyonel çelenk tasarımları',
        image: '/images/categories/açılıştören.jpg',
        icon: Gift,
        color: 'from-blue-500 to-cyan-500',
        features: ['Profesyonel Tasarım', 'Uzun Ömürlü', 'Özel Günler İçin', 'Kurumsal Kalite']
    },
    'cenaze': {
        title: 'Cenaze Çelenkleri',
        categoryValue: 'Cenaze Çelenkleri',
        description: 'Sevdiklerinizi son yolculuğunda uğurlarken saygı ve sevgi dolu anma çelenkleri',
        image: '/images/categories/cenaze.jpg',
        icon: Flower,
        color: 'from-gray-500 to-slate-500',
        features: ['Saygılı Tasarım', 'Kaliteli Malzeme', 'Hızlı Teslimat', 'Anma Hediyesi']
    },
    'ferforje': {
        title: 'Ferforje Çelenkleri',
        categoryValue: 'Ferforjeler',
        description: 'Metal işçiliği ile hazırlanmış dayanıklı ve estetik ferforje çelenk tasarımları',
        image: '/images/categories/ferforje.png',
        icon: Wrench,
        color: 'from-yellow-500 to-amber-500',
        features: ['Dayanıklı Malzeme', 'Estetik Tasarım', 'Uzun Ömürlü', 'Özel İşçilik']
    },
    'fuarstand': {
        title: 'Fuar & Stand Çelenkleri',
        categoryValue: 'Fuar & Stand',
        description: 'Fuar ve stand etkinlikleri için dikkat çekici ve profesyonel çelenk tasarımları',
        image: '/images/categories/fuar stand.jpg',
        icon: Building,
        color: 'from-purple-500 to-violet-500',
        features: ['Dikkat Çekici', 'Profesyonel', 'Etkinlik Odaklı', 'Kaliteli Görünüm']
    },
    'ofisbitki': {
        title: 'Ofis & Saksı Bitkileri',
        categoryValue: 'Ofis & Saksı Bitkileri',
        description: 'Ofis ve ev için hava kalitesini artıran, dekoratif saksı bitkileri',
        image: '/images/categories/ofis bitki.jpg',
        icon: Leaf,
        color: 'from-green-500 to-emerald-500',
        features: ['Hava Temizleyici', 'Dekoratif', 'Bakım Kolay', 'Ofis Dostu']
    },
    'soznisan': {
        title: 'Söz & Nişan Çelenkleri',
        categoryValue: 'Söz & Nişan',
        description: 'Hayatınızın en özel anlarında sevdiklerinizi mutlu edecek romantik ve zarif çelenk aranjmanları',
        image: '/images/categories/söznişan.jpg',
        icon: HeartIcon,
        color: 'from-pink-500 to-rose-500',
        features: ['Romantik Tasarım', 'Özel Günler', 'Zarif Görünüm', 'Aşk Dolu']
    }
};
