import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sanitizeEnv } from './env-utils';

const serviceAccount = {
    projectId: sanitizeEnv(process.env.FIREBASE_PROJECT_ID),
    clientEmail: sanitizeEnv(process.env.FIREBASE_CLIENT_EMAIL),
    privateKey: sanitizeEnv(process.env.FIREBASE_PRIVATE_KEY),
};

export function getAdminDb() {
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.warn('⚠️ Firebase Admin SDK config missing. Server-side writes may fail if rules are restricted.');
        // In development without admin keys, we might want to throw or return null
        // But throwing allows the API to catch and report the configuration error
        throw new Error('Firebase Admin SDK not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
    }

    if (getApps().length === 0) {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        // Ensure we use the default app or handle multiple apps if needed
        // standard getApps() check is enough usually
    }

    return getFirestore();
}
