import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';

// Lightweight fallback products for development/offline cases
const FALLBACK_PRODUCTS: Array<Record<string, unknown>> = [
  // Açılış & Tören
  {
    id: 'acilis-1',
    name: 'Kırmızı Beyaz Açılış Çelengi',
    description: 'Yeni iş yeri açılışları için klasik kırmızı ve beyaz gerberalardan oluşan gösterişli çelenk.',
    price: 1500,
    category: 'Açılış & Tören',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/açılıştören.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acilis-2',
    name: 'Renkli Tören Çelengi',
    description: 'Resmi törenler ve kutlamalar için renkli çiçeklerle hazırlanmış premium çelenk.',
    price: 1750,
    category: 'Açılış & Tören',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/açılıştören.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Cenaze Çelenkleri
  {
    id: 'cenaze-1',
    name: 'Beyaz Karanfil Cenaze Çelengi',
    description: 'Sonsuz saygı ve rahmet dilekleri için beyaz karanfillerle hazırlanmış cenaze çelengi.',
    price: 1250,
    category: 'Cenaze Çelenkleri',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/cenaze.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cenaze-2',
    name: 'Sade Anma Çelengi',
    description: 'Vefat ve anma törenleri için sade ve vakur bir görünüm sunan özel tasarım çelenk.',
    price: 1400,
    category: 'Cenaze Çelenkleri',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/cenaze.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Ferforjeler
  {
    id: 'ferforje-1',
    name: 'Tek Katlı Ferforje Aranjmanı',
    description: 'Zarif metal ayak üzerinde sergilenen, mevsimin en taze çiçekleriyle hazırlanmış ferforje.',
    price: 2000,
    category: 'Ferforjeler',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/ferforje.png'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ferforje-2',
    name: 'Lüks Çift Katlı Ferforje',
    description: 'Gösterişli ve dikkat çekici, iki katlı özel tasarım ferforje çelenk.',
    price: 3500,
    category: 'Ferforjeler',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/ferforje.png'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Fuar & Stand
  {
    id: 'fuar-1',
    name: 'Fuar Tebrik Aranjmanı',
    description: 'Fuar stantlarına şıklık katmak ve başarı dilemek için hazırlanan özel aranjman.',
    price: 1600,
    category: 'Fuar & Stand',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/fuar stand.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fuar-2',
    name: 'Kurumsal Stand Çiçeği',
    description: 'Marka imajınızı güçlendirecek, kurumsal renklere uygun stand çiçeği.',
    price: 1850,
    category: 'Fuar & Stand',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/fuar stand.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Ofis & Saksı Bitkileri
  {
    id: 'ofis-1',
    name: 'Büyük Boy Salon Bitkisi',
    description: 'Ofis ve iş yerleri için hava temizleyen, dekoratif büyük boy yeşil bitki.',
    price: 950,
    category: 'Ofis & Saksı Bitkileri',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/ofis bitki.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ofis-2',
    name: 'Orkide Aranjmanı',
    description: 'Yeni iş tebriği için asil ve zarif beyaz orkide aranjmanı.',
    price: 1100,
    category: 'Ofis & Saksı Bitkileri',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/ofis bitki.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Söz & Nişan
  {
    id: 'soz-1',
    name: 'Kız İsteme Çiçeği (Gondol)',
    description: 'Kız isteme merasimi için özenle hazırlanmış, çikolata eşliğinde sunulabilecek gondol aranjman.',
    price: 2500,
    category: 'Söz & Nişan',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/söznişan.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'soz-2',
    name: 'Nişan Töreni Panosu',
    description: 'Nişan tören mekanını süsleyecek, fotoğraf çekimleri için ideal çiçekli pano çelenk.',
    price: 3000,
    category: 'Söz & Nişan',
    inStock: true,
    quantity: 9999,
    images: ['/images/categories/söznişan.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

function isDataImageUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image');
}

function normalizeProductForList(raw: Record<string, unknown>, mode: 'full' | 'summary') {
  const imagesRaw = Array.isArray(raw.images) ? raw.images : [];
  const images = imagesRaw.filter((v): v is string => typeof v === 'string');

  if (mode === 'full') {
    return {
      ...raw,
      images,
    };
  }

  // summary mode: avoid returning huge base64 payloads (kills client perf / can fail fetch)
  const firstNonDataUrl = images.find((img) => !isDataImageUrl(img));
  const firstAnyImage = images[0];
  const mainImage = firstNonDataUrl || firstAnyImage || '';

  return {
    ...raw,
    images: mainImage ? [mainImage] : [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get('mode');
    const mode: 'full' | 'summary' = modeParam === 'summary' ? 'summary' : 'full';

    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const products = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      return {
        id: docSnap.id,
        ...normalizeProductForList(data, mode),
      };
    });

    // If Firestore is empty, serve fallback catalog to avoid blank UI
    if (products.length === 0) {
      const fallback = FALLBACK_PRODUCTS.map((p) => normalizeProductForList(p, mode));
      return NextResponse.json(fallback);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ Error fetching products from Firebase:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');

    // Return fallback products if Firebase fails
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get('mode');
    const mode: 'full' | 'summary' = modeParam === 'summary' ? 'summary' : 'full';
    const fallback = FALLBACK_PRODUCTS.map((p) => normalizeProductForList(p, mode));
    return NextResponse.json(fallback);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Creating new product...');

    const productData = await request.json();
    console.log('📝 Product data:', productData);

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: name, description, price, category',
        received: productData
      }, { status: 400 });
    }

    console.log('✅ Validation passed');

    // Try Firebase
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      quantity: 9999, // Stock management disabled
      inStock: productData.inStock ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Product created in Firebase with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      product: { id: docRef.id, ...productData },
      message: 'Product created successfully in Firebase',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Check if it's a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules',
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    return NextResponse.json({
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting product...');

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      console.log('❌ No product ID provided');
      return NextResponse.json({
        error: 'Product ID is required'
      }, { status: 400 });
    }

    console.log('📝 Deleting product with ID:', productId);

    // Delete from Firebase
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    console.log('✅ Product deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);

    return NextResponse.json({
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}