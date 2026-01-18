import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/get-products';
import { db as clientDb } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc as firestoreDoc } from 'firebase/firestore';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');

    // Use the comprehensive getProducts function from lib
    // This handles Admin/Client SDK fallback internally and robustly
    const allProducts = await getProducts({ limit: 1000 }); // Fetch all for admin/list views

    // Apply filtering if category param exists
    const products = categoryParam
      ? allProducts.filter(p => p.category === categoryParam || p.categories?.includes(categoryParam))
      : allProducts;

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, max-age=60'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products (API):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    // Basic validation
    if (!productData.name || !productData.price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = {
      ...productData,
      quantity: 9999,
      inStock: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Try Admin SDK first for write
    try {
      const db = getAdminDb();
      if (db) {
        const docRef = await db.collection('products').add(newProduct);
        return NextResponse.json({ success: true, id: docRef.id });
      }
    } catch (e) {
      console.warn('Admin SDK write failed, falling back to client');
    }

    // Client SDK Fallback
    const docRef = await addDoc(collection(clientDb, 'products'), newProduct);
    return NextResponse.json({ success: true, id: docRef.id });

  } catch (e) {
    console.error('POST Error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    if (!productId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
      const db = getAdminDb();
      if (db) {
        await db.collection('products').doc(productId).delete();
        return NextResponse.json({ success: true });
      }
    } catch (e) {
      console.warn('Admin SDK delete failed, falling back');
    }

    await deleteDoc(firestoreDoc(clientDb, 'products', productId));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE Error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
