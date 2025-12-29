
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
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
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

export async function getProductsByCategory(categoryValue: string): Promise<Product[]> {
    const productMap = new Map<string, Product>();

    // Helper to add docs to map
    const addDocsToMap = (docs: DocumentData[], getProductData: (d: any) => Product) => {
        docs.forEach(d => {
            const p = getProductData(d);
            productMap.set(p.id, p);
        });
    };

    // 1. Try Admin SDK
    try {
        const db = getAdminDb();
        if (db) {
            const productsRef = db.collection('products');

            // Parallel queries
            const [legacySnap, modernSnap] = await Promise.all([
                productsRef.where('category', '==', categoryValue).get(),
                productsRef.where('categories', 'array-contains', categoryValue).get()
            ]);

            legacySnap.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));
            modernSnap.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));

            if (productMap.size > 0) {
                return Array.from(productMap.values());
            }
            // If empty, it might be truly empty OR admin sdk issue (less likely if db instance existed)
            // But we can return here if we trust Admin SDK conectivity.
        }
    } catch (error) {
        console.warn('⚠️ Admin SDK failed for category search, falling back...', error);
    }

    // 2. Fallback to Client SDK (if map is empty or admin failed)
    if (productMap.size === 0) {
        try {
            console.log(`🔄 Fetching category '${categoryValue}' via Client SDK...`);
            const productsRef = collection(clientDb, 'products');

            const q1 = query(productsRef, where('category', '==', categoryValue));
            const q2 = query(productsRef, where('categories', 'array-contains', categoryValue));

            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

            snap1.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));
            snap2.docs.forEach(doc => productMap.set(doc.id, mapDocToProduct(doc.id, doc.data())));

        } catch (clientError) {
            console.error('❌ Error fetching category products (Client SDK):', clientError);
        }
    }

    return Array.from(productMap.values());
}
