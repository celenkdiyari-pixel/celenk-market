
import { NextRequest, NextResponse } from 'next/server';
import { db as clientDb } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc as firestoreDoc, query, where, limit } from 'firebase/firestore';

// Helper to determine which DB to use with explicit checks
async function getDbStrategy() {
  try {
    // Dynamic import to avoid build-time errors if admin module has issues
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const adminDb = getAdminDb();

    if (adminDb) {
      return { type: 'admin' as const, db: adminDb };
    } else {
      console.warn('⚠️ Admin SDK returned null, falling back to Client SDK');
    }
  } catch (e) {
    console.warn('⚠️ Admin SDK failed to load, falling back to Client SDK', e);
  }

  // Fallback to Client SDK
  return { type: 'client' as const, db: clientDb };
}

function isDataImageUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image');
}

function normalizeProductForList(raw: Record<string, unknown>, mode: 'full' | 'summary') {
  const imagesRaw = Array.isArray(raw.images) ? raw.images : [];
  const images = imagesRaw.filter((v): v is string => typeof v === 'string');
  let category = 'Diğer';
  if (typeof raw.category === 'string' && raw.category.trim() !== '') {
    category = raw.category;
  } else if (Array.isArray(raw.category) && raw.category.length > 0) {
    category = String(raw.category[0]);
  }
  if (mode === 'full') {
    return { ...raw, images, category };
  }
  const firstNonDataUrl = images.find((img) => !isDataImageUrl(img));
  const firstAnyImage = images[0];
  const mainImage = firstNonDataUrl || firstAnyImage || '';
  let categories: string[] = [];
  if (Array.isArray(raw.categories)) {
    categories = raw.categories.filter((c): c is string => typeof c === 'string');
  }
  if (categories.length === 0 && category !== 'Diğer') {
    categories = [category];
  }
  return { ...raw, images: mainImage ? [mainImage] : [], category, categories };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get('mode');
    const categoryParam = searchParams.get('category');
    const mode: 'full' | 'summary' = modeParam === 'full' ? 'full' : 'summary';

    const strategy = await getDbStrategy();
    let rawProducts: any[] = [];

    // console.log(`🔄 API/Products: Fetching using strategy: ${strategy.type}`);

    try {
      if (strategy.type === 'admin') {
        const snapshot = await strategy.db.collection('products').get();
        rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        // Client SDK Fallback
        const productsRef = collection(strategy.db, 'products');
        const snapshot = await getDocs(productsRef);
        rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (dbError) {
      console.error('❌ DB Fetch Error:', dbError);
      // If Admin Fetch failed, try Client SDK as last resort (if not already tried)
      if (strategy.type === 'admin') {
        console.warn('⚠️ Admin DB fetch failed despite init success, retrying with Client SDK...');
        try {
          const productsRef = collection(clientDb, 'products');
          const snapshot = await getDocs(productsRef);
          rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (retryError) {
          console.error('❌ Retry with Client SDK also failed:', retryError);
          throw retryError;
        }
      } else {
        throw dbError;
      }
    }

    const products = rawProducts
      .filter((data) => {
        if (!categoryParam) return true;
        const cat = data.category;
        const cats = data.categories as string[] | undefined;
        const target = categoryParam;
        if (typeof cat === 'string' && cat === target) return true;
        if (Array.isArray(cats) && cats.includes(target)) return true;
        if (Array.isArray(cat) && cat.includes(target)) return true;
        return false;
      })
      .map((data) => {
        const { id, ...rest } = data;
        return { id, ...normalizeProductForList(rest, mode) };
      });

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, max-age=60'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products (Global):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // ... [Original POST Logic with same getDbStrategy] ...
  // Since POST is less critical for "products not listing", I will keep it simple here.
  // Copying the original logic but using the improved getDbStrategy logic implicitly by using 'await getDbStrategy()'

  // For brevity and safety in this overwrite, I'll copy the robust POST/DELETE logic logic completely.
  try {
    const productData = await request.json();
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newProduct = { ...productData, quantity: 9999, inStock: true, createdAt: new Date().toISOString() };

    const strategy = await getDbStrategy();
    let id = '';
    if (strategy.type === 'admin') {
      const docRef = await strategy.db.collection('products').add(newProduct);
      id = docRef.id;
    } else {
      const docRef = await addDoc(collection(strategy.db, 'products'), newProduct);
      id = docRef.id;
    }
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    if (!productId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const strategy = await getDbStrategy();
    if (strategy.type === 'admin') {
      await strategy.db.collection('products').doc(productId).delete();
    } else {
      await deleteDoc(firestoreDoc(strategy.db, 'products', productId));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
