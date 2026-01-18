
import { getAdminDb } from './firebase-admin';
import { db as clientDb } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, DocumentData } from 'firebase/firestore';

// Type definition based on what we saw in the components
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    categories?: string[];
    inStock: boolean;
    images: string[];
    createdAt?: string;
    updatedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    rating?: number;
    reviews?: number;
}

// Helper to safely convert Firestore timestamps to serializable strings
const safeDate = (val: any): string | undefined => {
    if (!val) return undefined;
    if (typeof val === 'string') return val;
    if (typeof val?.toDate === 'function') return val.toDate().toISOString(); // Firestore Timestamp
    if (val instanceof Date) return val.toISOString();
    return undefined;
};

// Convert Firestore doc to Product
const mapDocToProduct = (id: string, data: DocumentData): Product => {
    return {
        id: id,
        name: data.name || '',
        description: data.description || '',
        price: Number(data.price) || 0,
        category: data.category || '',
        categories: data.categories || [],
        inStock: data.inStock !== false, // default true
        images: data.images || [],
        createdAt: safeDate(data.createdAt),
        updatedAt: safeDate(data.updatedAt),
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        rating: data.rating,
        reviews: data.reviews,
    };
};

export async function getProducts(options: { limit?: number } = {}): Promise<Product[]> {
    const limitCount = options.limit || 50; // Default limit to save bandwidth

    // 1. Try Admin SDK First (Server-Side)
    try {
        const db = getAdminDb();
        if (db) {
            let productsRef: any = db.collection('products');
            if (options.limit) {
                productsRef = productsRef.limit(limitCount);
            }
            const snapshot = await productsRef.get();
            if (snapshot.empty) return [];
            return snapshot.docs.map((doc: any) => mapDocToProduct(doc.id, doc.data()));
        }
    } catch (error) {
        console.warn('⚠️ Admin SDK failed in getProducts, falling back to Client SDK:', error);
    }

    // 2. Fallback to Client SDK
    try {
        console.log('🔄 Fetching products via Client SDK...');
        let productsRef: any = collection(clientDb, 'products');
        if (options.limit) {
            // Note: client SDK query with limit needs query() wrapper, simplified here for now as usually admin SDK works
            // If we really need strict limit on client side we should use query(collection, limit(n))
            // For now just fetching all on fallback is acceptable or we implement proper query
            // Let's implement proper query
            const { limit: firestoreLimit, query } = await import('firebase/firestore');
            const q = query(productsRef, firestoreLimit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => mapDocToProduct(doc.id, doc.data()));
        }

        const snapshot = await getDocs(productsRef);
        return snapshot.docs.map(doc => mapDocToProduct(doc.id, doc.data()));
    } catch (clientError) {
        console.error('❌ Error fetching products (Client SDK):', clientError);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    // 1. Try Admin SDK
    try {
        const db = getAdminDb();
        if (db) {
            const docRef = db.collection('products').doc(id);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                return mapDocToProduct(docSnap.id, docSnap.data()!);
            }
            return null;
        }
    } catch (error) {
        console.warn(`⚠️ Admin SDK failed for product ${id}, falling back...`);
    }

    // 2. Fallback to Client SDK
    try {
        const docRef = doc(clientDb, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return mapDocToProduct(docSnap.id, docSnap.data());
        }
        return null;
    } catch (clientError) {
        console.error(`❌ Error fetching product ${id} (Client SDK):`, clientError);
        return null;
    }
}

import { getCategoryTitleBySlug } from './constants';

export async function getProductsByCategory(slugOrTitle: string): Promise<Product[]> {
    const productMap = new Map<string, Product>();

    // 1. Determine Title and Slug
    // If input is a slug (e.g. 'acilis-toren'), get title 'Açılış & Tören'
    // If input is already a title, slug might be undefined but that's fine
    const categoryTitle = getCategoryTitleBySlug(slugOrTitle); // "Açılış & Tören"
    const rawSlug = slugOrTitle; // "acilis-toren"

    const searchTerms = new Set<string>();
    if (categoryTitle) searchTerms.add(categoryTitle);
    if (rawSlug) searchTerms.add(rawSlug);

    // Add fallback/variations if needed (e.g. manual mapping for known issues)
    // if (rawSlug === 'categories') ...

    const db = getAdminDb();

    // ---------------------------------------------------------
    // STRATEGY: Try fetching by ALL potential keys (Title & Slug)
    // ---------------------------------------------------------

    try {
        if (db) {
            const productsRef = db.collection('products');

            // We will run parallel queries for best performance
            const promises = [];

            for (const term of searchTerms) {
                // Query 1: 'categories' array contains term
                promises.push(productsRef.where('categories', 'array-contains', term).get());
                // Query 2: 'category' string equals term
                promises.push(productsRef.where('category', '==', term).get());
            }

            const snapshots = await Promise.all(promises);

            snapshots.forEach(snap => {
                snap.docs.forEach(doc => {
                    productMap.set(doc.id, mapDocToProduct(doc.id, doc.data()));
                });
            });

            if (productMap.size > 0) {
                return Array.from(productMap.values());
            }
        }
    } catch (error) {
        console.warn('⚠️ Admin SDK failed for category search, falling back...', error);
    }

    // 2. Fallback to Client SDK
    if (productMap.size === 0) {
        try {
            console.log(`🔄 Fetching category '${slugOrTitle}' via Client SDK...`);
            const productsRef = collection(clientDb, 'products');

            const promises = [];

            for (const term of searchTerms) {
                const q1 = query(productsRef, where('categories', 'array-contains', term));
                const q2 = query(productsRef, where('category', '==', term));
                promises.push(getDocs(q1), getDocs(q2));
            }

            const snapshots = await Promise.all(promises);
            snapshots.forEach(snap => {
                snap.docs.forEach(doc => {
                    productMap.set(doc.id, mapDocToProduct(doc.id, doc.data()));
                });
            });

        } catch (clientError) {
            console.error('❌ Error fetching category products (Client SDK):', clientError);
        }
    }

    return Array.from(productMap.values());
}
