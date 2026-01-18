import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { collection, getDocs } from 'firebase/firestore';
import { db as clientDb } from '@/lib/firebase';

export async function GET() {
    try {
        const products = [];

        // Try Admin SDK first
        try {
            const db = getAdminDb();
            if (db) {
                const snapshot = await db.collection('products').get();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    products.push({
                        id: doc.id,
                        name: data.name,
                        category: data.category,
                        categories: data.categories
                    });
                });
            }
        } catch (e) {
            console.error("Admin SDK error", e);
        }

        // Fallback to client SDK if empty
        if (products.length === 0) {
            try {
                const snapshot = await getDocs(collection(clientDb, 'products'));
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    products.push({
                        id: doc.id,
                        name: data.name,
                        category: data.category,
                        categories: data.categories
                    });
                });
            } catch (e) {
                console.error("Client SDK error", e);
            }
        }

        return NextResponse.json({
            count: products.length,
            products: products
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
