import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { sanitizeEnv } from './env-utils';

// Firebase configuration - using environment variables with fallbacks
const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || "AIzaSyBBxerVs30ygKz4hslObXiEkDVsr4ieCx8",
  authDomain: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "celenk-diyari-new.firebaseapp.com",
  projectId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "celenk-diyari-new",
  storageBucket: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "celenk-diyari-new.firebasestorage.app",
  messagingSenderId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "1087814988486",
  appId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || "1:1087814988486:web:5ee023674c66b23a779dc7"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db = getFirestore(app);

export default app;