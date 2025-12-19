
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

async function getDbStrategy() {
    try {
        const adminDb = getAdminDb();
        return { type: 'admin' as const, db: adminDb };
    } catch (e) {
        return { type: 'client' as const, db, error: e };
    }
}

export async function GET(request: NextRequest) {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    try {
        log('Starting debug fetch...');

        // Check Env Vars (safely)
        log(`PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing'}`);
        log(`CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing'}`);
        log(`PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? 'Set (Length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'Missing'}`);

        const strategy = await getDbStrategy();
        log(`Strategy: ${strategy.type}`);
        if (strategy.error) {
            log(`Admin Init Error: ${strategy.error instanceof Error ? strategy.error.message : String(strategy.error)}`);
        }

        let rawProducts: any[] = [];
        if (strategy.type === 'admin') {
            log('Using Admin SDK');
            try {
                const snapshot = await strategy.db.collection('products').get();
                log(`Snapshot empty: ${snapshot.empty}`);
                log(`Docs count: ${snapshot.size}`);
                rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (e) {
                log(`Admin Query Error: ${e instanceof Error ? e.message : String(e)}`);
                throw e;
            }
        } else {
            log('Using Client SDK');
            try {
                const productsRef = collection(strategy.db, 'products');
                const snapshot = await getDocs(productsRef);
                log(`Docs count: ${snapshot.size}`);
                rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (e) {
                log(`Client Query Error: ${e instanceof Error ? e.message : String(e)}`);
                throw e;
            }
        }

        return NextResponse.json({
            success: true,
            count: rawProducts.length,
            logs,
            products: rawProducts.slice(0, 2)
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            logs
        }, { status: 500 });
    }
}
