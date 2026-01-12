import { getAdminDb } from './firebase-admin';

export async function getSiteSettings() {
    try {
        const db = getAdminDb();
        if (!db) return null;

        const docRef = db.collection('settings').doc('site-settings');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching site settings on server:', error);
        return null;
    }
}
