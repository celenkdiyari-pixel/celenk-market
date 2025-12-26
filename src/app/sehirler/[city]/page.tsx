import { Metadata } from 'next';
import { cities, getCityBySlug } from '@/lib/cities';
import CityPageContent from '@/components/city-page-content';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
    return cities.map((city) => ({
        city: city.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const city = getCityBySlug(resolvedParams.city);

    if (!city) {
        return {
            title: 'Şehir Bulunamadı',
        };
    }

    return {
        title: `${city.name} Çelenk Siparişi | Hızlı Teslimat - Çelenk Diyarı`,
        description: `${city.name} içi ve çevresine aynı gün teslimatlı çelenk siparişi. En taze çiçeklerle hazırlanan cenaze, açılış ve düğün çelenkleri. ${city.name} çiçek gönder.`,
        keywords: [
            `${city.name.toLowerCase()} çelenk siparişi`,
            `${city.name.toLowerCase()} çelenk gönder`,
            `${city.name.toLowerCase()} cenaze çelengi`,
            `${city.name.toLowerCase()} açılış çelengi`,
            `${city.name.toLowerCase()} düğün çelengi`,
            "online çelenk"
        ],
        openGraph: {
            title: `${city.name} Çelenk Siparişi | 7/24 Hızlı Teslimat`,
            description: `${city.name} genelinde açılış, düğün ve cenaze törenleri için profesyonel çelenk hizmeti.`,
            url: `https://celenkdiyari.com/sehirler/${city.slug}`,
            type: 'website',
        },
        alternates: {
            canonical: `https://celenkdiyari.com/sehirler/${city.slug}`,
        }
    };
}

export default async function CityPage({ params }: Props) {
    const resolvedParams = await params;
    const city = getCityBySlug(resolvedParams.city);

    if (!city) {
        notFound();
    }

    return <CityPageContent cityName={city.name} />;
}
