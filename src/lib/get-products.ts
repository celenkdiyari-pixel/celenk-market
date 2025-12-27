
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

        // Fetch all and filter in memory for now due to complex schema
        const snapshot = await productsRef.get();

        if (snapshot.empty) {
            return [];
        }

        const allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));

        return allProducts.filter(product => {
            const cat = product.category;
            const cats = product.categories;
            let productCategories: string[] = [];

            if (Array.isArray(cats)) {
                productCategories = cats;
            } else if (typeof cat === 'string') {
                productCategories = [cat];
            } else if (Array.isArray(cat)) {
                productCategories = cat as string[];
            }

            // Check if matches specific category value
            return productCategories.includes(categoryValue) || product.category === categoryValue;
        });
    } catch (error) {
        console.error('Error fetching category products on server:', error);
        return [];
    }
}
