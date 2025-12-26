import { Metadata } from 'next';

const CATEGORY_NAMES: { [key: string]: string } = {
    'acilistoren': 'Açılış & Tören Çelenkleri',
    'cenaze': 'Cenaze Çelenkleri',
    'ferforje': 'Ferforje Çelenkleri',
    'fuarstand': 'Fuar & Stand Çelenkleri',
    'ofisbitki': 'Ofis & Saksı Bitkileri',
    'soznisan': 'Söz & Nişan Çelenkleri'
};

const CATEGORY_DESCRIPTIONS: { [key: string]: string } = {
    'acilistoren': 'İş yerinizin açılışında ve özel törenlerinizde kullanabileceğiniz şık ve profesyonel çelenk tasarımları. Aynı gün teslimat.',
    'cenaze': 'Sevdiklerinizi son yolculuğunda uğurlarken saygı ve sevgi dolu anma çelenkleri. Türkiye geneli cenaze çelenk siparişi.',
    'ferforje': 'Metal işçiliği ile hazırlanmış dayanıklı ve estetik ferforje çelenk tasarımları. Modern ve şık çelenk modelleri.',
    'fuarstand': 'Fuar ve stand etkinlikleri için dikkat çekici ve profesyonel çelenk tasarımları. Kurumsal çelenk gönderimi.',
    'ofisbitki': 'Ofis ve ev için hava kalitesini artıran, dekoratif saksı bitkileri. Ofis hediyesi saksı çiçekleri.',
    'soznisan': 'Hayatınızın en özel anlarında sevdiklerinizi mutlu edecek romantik ve zarif çelenk aranjmanları. Söz ve nişan çelenkleri.'
};

interface Props {
    params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const name = CATEGORY_NAMES[category] || 'Kategori';
    const description = CATEGORY_DESCRIPTIONS[category] || 'Çelenk Diyarı kategorileri.';

    return {
        title: `${name} | Türkiye Çelenk Siparişi`,
        description: description,
        keywords: [`${name}`, "çelenk sipariş", "çelenk gönder", "türkiye çelenk", "online çelenk"],
        openGraph: {
            title: `${name} | Çelenk Diyarı`,
            description: description,
            type: 'website',
        }
    };
}

export default function CategoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
