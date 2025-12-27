import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc as firestoreDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';

// Helper to determine which DB to use
async function getDbStrategy() {
  try {
    const adminDb = getAdminDb();
    return { type: 'admin' as const, db: adminDb };
  } catch (e) {
    // Admin SDK not configured, fall back to Client SDK
    return { type: 'client' as const, db };
  }
}

// Lightweight fallback products for development/offline cases
function isDataImageUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image');
}

function normalizeProductForList(raw: Record<string, unknown>, mode: 'full' | 'summary') {
  const imagesRaw = Array.isArray(raw.images) ? raw.images : [];
  const images = imagesRaw.filter((v): v is string => typeof v === 'string');

  // Normalize category: handle string, array of strings, or missing
  let category = 'Diğer';
  if (typeof raw.category === 'string' && raw.category.trim() !== '') {
    category = raw.category;
  } else if (Array.isArray(raw.category) && raw.category.length > 0) {
    category = String(raw.category[0]);
  }

  if (mode === 'full') {
    return {
      ...raw,
      images,
      category
    };
  }

  // summary mode: avoid returning huge base64 payloads (kills client perf / can fail fetch)
  const firstNonDataUrl = images.find((img) => !isDataImageUrl(img));
  const firstAnyImage = images[0];
  const mainImage = firstNonDataUrl || firstAnyImage || '';

  // Normalize categories if present, otherwise default to [category]
  let categories: string[] = [];
  if (Array.isArray(raw.categories)) {
    categories = raw.categories.filter((c): c is string => typeof c === 'string');
  }
  if (categories.length === 0 && category !== 'Diğer') {
    categories = [category];
  }

  return {
    ...raw,
    images: mainImage ? [mainImage] : [],
    category,
    categories
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get('mode');
    const categoryParam = searchParams.get('category');

    // Default to 'summary' unless explicitly 'full' is requested
    const mode: 'full' | 'summary' = modeParam === 'full' ? 'full' : 'summary';

    const strategy = await getDbStrategy();
    let rawProducts: any[] = [];

    // NOTE: For optimal performance with large datasets, we should use Firestore queries.
    // However, due to mixed schema (category string vs categories array) and Turkish chars,
    // we fetch (likely cached by Firestore) and filter in memory to ensure accuracy.
    // This significantly reduces the payload sent to the client.

    if (strategy.type === 'admin') {
      const snapshot = await strategy.db.collection('products').get();
      rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const productsRef = collection(strategy.db, 'products');
      const snapshot = await getDocs(productsRef);
      rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Filter AND Normalize on the server to reduce payload
    const products = rawProducts
      .filter((data) => {
        if (!categoryParam) return true;

        // Check both single 'category' and 'categories' array
        const cat = data.category;
        const cats = data.categories as string[] | undefined;
        const target = categoryParam;

        if (typeof cat === 'string' && cat === target) return true;
        if (Array.isArray(cats) && cats.includes(target)) return true;
        // Also check if stored as array but in data.category (legacy weirdness protection)
        if (Array.isArray(cat) && cat.includes(target)) return true;

        return false;
      })
      .map((data) => {
        const { id, ...rest } = data;
        return {
          id,
          ...normalizeProductForList(rest, mode),
        };
      });

    return NextResponse.json(products, {
      headers: {
        // Cache for 60 seconds on CDN, stale-while-revalidate for 5 minutes
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, max-age=60'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Creating new product...');

    const productData = await request.json();

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      return NextResponse.json({
        error: 'Missing required fields: name, description, price, category',
        received: productData
      }, { status: 400 });
    }

    const newProduct = {
      ...productData,
      quantity: 9999,
      inStock: productData.inStock ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const strategy = await getDbStrategy();
    let id = '';

    if (strategy.type === 'admin') {
      const docRef = await strategy.db.collection('products').add(newProduct);
      id = docRef.id;
    } else {
      const productsRef = collection(strategy.db, 'products');
      const docRef = await addDoc(productsRef, newProduct);
      id = docRef.id;
    }

    console.log('✅ Product created with ID:', id);

    return NextResponse.json({
      success: true,
      id,
      product: { id, ...newProduct },
      message: 'Product created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);

    // Check if it's a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({
        error: 'Firebase permission denied',
        details: 'Check Firebase security rules or setup Admin SDK',
        message: error.message
      }, { status: 403 });
    }

    return NextResponse.json({
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting product...');

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const strategy = await getDbStrategy();

    if (strategy.type === 'admin') {
      await strategy.db.collection('products').doc(productId).delete();
    } else {
      const productRef = firestoreDoc(strategy.db, 'products', productId);
      await deleteDoc(productRef);
    }

    console.log('✅ Product deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return NextResponse.json({
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
