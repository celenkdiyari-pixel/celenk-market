import { Metadata } from 'next';
import { cities, getCityBySlug } from '@/lib/cities';
import CityPageContent from '@/components/city-page-content';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/get-products';

interface Props {
    params: Promise<{ city: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache city pages for 24 hours to minimize ISR usage

// Disable static generation at build time to prevent Quota Exceeded errors
export async function generateStaticParams() {
    return [];
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

    console.log('CityPage Params:', resolvedParams);
    console.log('CityPage Params.city (raw):', resolvedParams.city);

    // Decode URI component to handle Turkish characters correctly
    const decodedSlug = decodeURIComponent(resolvedParams.city);
    console.log('CityPage Decoded Slug:', decodedSlug);

    const city = getCityBySlug(decodedSlug) || getCityBySlug(resolvedParams.city);
    console.log('CityPage Found City:', city ? city.name : 'NULL');

    // Fetch products server side with limit to save bandwidth
    const products = await getProducts({ limit: 50 });

    if (!city) {
        notFound();
    }

    return <CityPageContent cityName={city.name} initialProducts={products} />;
}
