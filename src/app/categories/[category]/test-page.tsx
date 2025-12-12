'use client';

import { useParams } from 'next/navigation';

export default function TestCategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  console.log('Test kategori sayfası yüklendi:', categorySlug);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Kategori Sayfası
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Kategori Bilgileri:</h2>
          <p><strong>Slug:</strong> {categorySlug}</p>
          <p><strong>URL:</strong> /categories/{categorySlug}</p>
          <p><strong>Zaman:</strong> {new Date().toLocaleString()}</p>
        </div>
        
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Başarılı!</h3>
          <p className="text-green-700">
            Bu sayfa yüklendiğine göre kategori routing çalışıyor demektir.
          </p>
        </div>
      </div>
    </div>
  );
}
