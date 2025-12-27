
import { getAdminDb } from './firebase-admin';

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

export async function getProducts(): Promise<Product[]> {
    try {
        const db = getAdminDb();
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
    } catch (error) {
        console.error('Error fetching products on server:', error);
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const db = getAdminDb();
        const docRef = db.collection('products').doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Product;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching product ${id} on server:`, error);
        return null;
    }
}

export async function getProductsByCategory(categoryValue: string): Promise<Product[]> {
    try {
        const db = getAdminDb();
        const productsRef = db.collection('products');

        // Execute parallel queries for optimal performance
        // Query 1: Matches legacy single 'category' field
        const legacyQuery = productsRef.where('category', '==', categoryValue).get();

        // Query 2: Matches new 'categories' array field
        const modernQuery = productsRef.where('categories', 'array-contains', categoryValue).get();

        const [legacySnap, modernSnap] = await Promise.all([legacyQuery, modernQuery]);

        // Use a Map to deduplicate by ID
        const productMap = new Map<string, Product>();

        const addDocToMap = (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            productMap.set(doc.id, {
                id: doc.id,
                ...doc.data()
            } as Product);
        };

        legacySnap.docs.forEach(addDocToMap);
        modernSnap.docs.forEach(addDocToMap);

        return Array.from(productMap.values());
    } catch (error) {
        console.error('Error fetching category products on server:', error);
        // Fallback: Return empty array so the page renders (just empty) instead of crashing
        return [];
    }
}
