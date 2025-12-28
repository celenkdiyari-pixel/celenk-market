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
        // Suppress warning during build time to keep logs clean
        if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
            return null;
        }
        console.warn('⚠️ Firebase Admin SDK config missing options.');
        // Return null instead of throwing, let the caller handle fallback
        return null;
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
