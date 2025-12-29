
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

export async function getProducts(): Promise<Product[]> {
    // 1. Try Admin SDK First (Server-Side)
    try {
        const db = getAdminDb();
        if (db) {
            const productsRef = db.collection('products');
            const snapshot = await productsRef.get();
            if (snapshot.empty) return [];
            return snapshot.docs.map(doc => mapDocToProduct(doc.id, doc.data()));
        }
    } catch (error) {
        console.warn('⚠️ Admin SDK failed in getProducts, falling back to Client SDK:', error);
    }

    // 2. Fallback to Client SDK
    try {
        console.log('🔄 Fetching products via Client SDK...');
        const productsRef = collection(clientDb, 'products');
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

    // TASK-07: Resolve correct title from slug if needed
    const categoryTitle = getCategoryTitleBySlug(slugOrTitle);

    // 1. Try Admin SDK
    try {
        const db = getAdminDb();
        if (db) {
            const productsRef = db.collection('products');

            // TASK-08: Optimized Query - Only query the array-based 'categories' field 
            // if we trust the data model, otherwise keep fallback but sequentially to save quota
            const snapshot = await productsRef.where('categories', 'array-contains', categoryTitle).get();

            // If empty, try legacy string-based 'category' field
            if (snapshot.empty) {
                const legacySnap = await productsRef.where('category', '==', categoryTitle).get();
                legacySnap.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));
            } else {
                snapshot.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));
            }

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
            console.log(`🔄 Fetching category '${categoryTitle}' via Client SDK...`);
            const productsRef = collection(clientDb, 'products');

            // TASK-08: Sequential queries to save Read Quota
            const q1 = query(productsRef, where('categories', 'array-contains', categoryTitle));
            const snap1 = await getDocs(q1);

            if (!snap1.empty) {
                snap1.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));
            } else {
                const q2 = query(productsRef, where('category', '==', categoryTitle));
                const snap2 = await getDocs(q2);
                snap2.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));
            }

        } catch (clientError) {
            console.error('❌ Error fetching category products (Client SDK):', clientError);
        }
    }

    return Array.from(productMap.values());
}
