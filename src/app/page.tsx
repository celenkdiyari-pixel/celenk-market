import CityPageContent from '@/components/city-page-content';
import { getProducts } from '@/lib/get-products';

// Server Side Fetching
export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function Home() {
  const products = await getProducts();

  return (
    <CityPageContent initialProducts={products} />
  );
}