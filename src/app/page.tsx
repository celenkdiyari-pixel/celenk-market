import CityPageContent from '@/components/city-page-content';
import { getProducts } from '@/lib/get-products';

// Server Side Fetching
// Server Side Fetching
// export const dynamic = 'force-dynamic'; // Removed for ISR (Speed)
export const revalidate = 3600; // Cache homepage for 1 hour to save ISR usage

export const metadata = {
  title: 'Çelenk Siparişi - 81 İle Hızlı Çelenk Gönder | Çelenk Diyarı',
  description: "En uygun fiyatlı cenaze, açılış ve düğün çelenk siparişi. Türkiye'nin her yerine aynı gün teslimat garantisiyle online çelenk gönder. %100 Müşteri Memnuniyeti.",
  keywords: "çelenk siparişi, çelenk gönder, istanbul çelenk, ankara çelenk, izmir çelenk, cenaze çelengi fiyatları, açılış çelengi modelleri, düğün çelengi, online çelenk, ucuz çelenk gönder",
  alternates: {
    canonical: 'https://celenkdiyari.com',
  },
};

export default async function Home() {
  const products = await getProducts({ minimal: true, limit: 12 });

  return (
    <CityPageContent initialProducts={products} />
  );
}