
import { getAdminDb } from './firebase-admin';

// Type definition based on what we saw in the components
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    images: string[];
    createdAt?: string;
    updatedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
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
