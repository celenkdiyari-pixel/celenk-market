import CityPageContent from '@/components/city-page-content';
import { getProducts } from '@/lib/get-products';

// Server Side Fetching
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache homepage for 5 minutes

export default async function Home() {
  const products = await getProducts();

  return (
    <CityPageContent initialProducts={products} />
  );
}