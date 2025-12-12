import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - using environment variables only
const getFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  // Return config (will be validated during initialization)
  return {
    apiKey: apiKey || '',
    authDomain: authDomain || '',
    projectId: projectId || '',
    storageBucket: storageBucket || '',
    messagingSenderId: messagingSenderId || '',
    appId: appId || ''
  };
};

// Lazy initialization variables
let app: ReturnType<typeof initializeApp> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

const initFirebase = () => {
  // Return existing instances if already initialized
  if (app && dbInstance && storageInstance) {
    return { app, db: dbInstance, storage: storageInstance };
  }
  
  try {
    const firebaseConfig = getFirebaseConfig();
    
    // Check if config is valid
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      // During build, return null - will initialize at runtime
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                          (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL);
      if (isBuildTime) {
        return null;
      }
      // At runtime, throw error if still missing
      throw new Error('Firebase environment variables are not configured. Please set NEXT_PUBLIC_FIREBASE_API_KEY and other required variables.');
    }
    
    // Note: storageBucket is optional - Firebase will use default bucket ({projectId}.appspot.com) if not specified

    // Initialize Firebase
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firestore
    dbInstance = getFirestore(app);

    // Initialize Firebase Storage
    // If storageBucket is not provided, Firebase will use default bucket ({projectId}.appspot.com)
    try {
      if (firebaseConfig.storageBucket && firebaseConfig.storageBucket.trim() !== '') {
        console.log('📦 Initializing Firebase Storage with bucket:', firebaseConfig.storageBucket);
        storageInstance = getStorage(app, firebaseConfig.storageBucket);
      } else {
        // Use default bucket - Firebase will automatically use {projectId}.appspot.com
        console.log('📦 Initializing Firebase Storage with default bucket');
        storageInstance = getStorage(app);
      }
      console.log('✅ Firebase Storage initialized successfully');
    } catch (storageError) {
      console.error('❌ Error initializing Firebase Storage:', storageError);
      console.error('❌ Storage error details:', {
        message: storageError instanceof Error ? storageError.message : 'Unknown',
        stack: storageError instanceof Error ? storageError.stack : 'No stack'
      });
      
      // Try to initialize without explicit bucket as fallback
      try {
        console.log('🔄 Attempting fallback initialization with default bucket...');
        storageInstance = getStorage(app);
        console.log('✅ Firebase Storage initialized with default bucket (fallback)');
      } catch (fallbackError) {
        console.error('❌ Failed to initialize Firebase Storage even with default bucket:', fallbackError);
        const errorMsg = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        throw new Error(`Firebase Storage initialization failed: ${errorMsg}. Please check Firebase project configuration and Storage service status.`);
      }
    }

    return { app, db: dbInstance, storage: storageInstance };
  } catch (error) {
    // During build time, ignore errors - initialization will happen at runtime
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                        (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL);
    
    if (isBuildTime) {
      return null;
    }
    
    // At runtime, throw the error
    throw error;
  }
};

// Getter functions that ensure initialization
function getDb(): ReturnType<typeof getFirestore> {
  if (!dbInstance) {
    const initialized = initFirebase();
    if (!initialized || !initialized.db) {
      throw new Error('Firebase Firestore is not initialized. Please configure Firebase environment variables.');
    }
    dbInstance = initialized.db;
  }
  return dbInstance;
}

function getStorageInstance(): ReturnType<typeof getStorage> {
  if (!storageInstance) {
    try {
      const initialized = initFirebase();
      if (!initialized) {
        throw new Error('Firebase initialization returned null');
      }
      if (!initialized.storage) {
        throw new Error('Firebase Storage instance is null after initialization');
      }
      storageInstance = initialized.storage;
      console.log('✅ Storage instance obtained successfully');
    } catch (error) {
      console.error('❌ Error in getStorageInstance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Firebase Storage is not initialized: ${errorMessage}. Please check Firebase configuration and ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (or default bucket) is accessible.`);
    }
  }
  return storageInstance;
}

function getApp(): ReturnType<typeof initializeApp> {
  if (!app) {
    const initialized = initFirebase();
    if (!initialized || !initialized.app) {
      throw new Error('Firebase app is not initialized. Please configure Firebase environment variables.');
    }
    app = initialized.app;
  }
  return app;
}

// Try to initialize immediately if env vars are available (for faster first access)
if (
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
) {
  try {
    const initialized = initFirebase();
    if (initialized) {
      app = initialized.app;
      dbInstance = initialized.db;
      storageInstance = initialized.storage;
    }
  } catch (error) {
    // Will initialize on first use
  }
}

// Export as getter properties using Object.defineProperty
// This ensures collection(db, ...) works correctly because it returns the actual instance
const exportsObj: any = {};

Object.defineProperty(exportsObj, 'db', {
  get: getDb,
  enumerable: true,
  configurable: false
});

Object.defineProperty(exportsObj, 'storage', {
  get: getStorageInstance,
  enumerable: true,
  configurable: false
});

Object.defineProperty(exportsObj, 'default', {
  get: getApp,
  enumerable: true,
  configurable: false
});

// For ES6 module exports, we need to export the getters
// Since TypeScript doesn't support exporting getters directly, we use a module-level variable
// and export it as a constant that is evaluated on first access

// Check if we're in build-time
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL);

// Export db - use getter to ensure runtime instance
// During build, return placeholder but at runtime, always return actual instance
// We use Object.defineProperty to create a getter that works at runtime
let _dbExported: ReturnType<typeof getFirestore> | null = null;

// Create a getter that ensures we always get the real instance at runtime
const dbGetter = () => {
  if (!_dbExported) {
    _dbExported = getDb();
  }
  return _dbExported;
};

// Export db - during build return placeholder, at runtime return actual instance
export const db: ReturnType<typeof getFirestore> = (() => {
  // If we're not in build and env vars exist, initialize immediately
  if (!isBuildTime && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    try {
      return getDb();
    } catch (error) {
      // At runtime, throw error
      throw error;
    }
  }
  
  // Build-time or no env vars: return a Proxy that initializes on first property access
  // This ensures collection(db, ...) works because the Proxy forwards to the real instance
  return new Proxy({} as ReturnType<typeof getFirestore>, {
    get(target, prop, receiver) {
      const instance = dbGetter();
      const value = (instance as any)[prop];
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
    has(target, prop) {
      const instance = dbGetter();
      return prop in instance;
    },
    ownKeys(target) {
      const instance = dbGetter();
      return Object.keys(instance as any);
    },
    getOwnPropertyDescriptor(target, prop) {
      const instance = dbGetter();
      return Object.getOwnPropertyDescriptor(instance as any, prop);
    }
  }) as ReturnType<typeof getFirestore>;
})();

let _storageExported: ReturnType<typeof getStorage> | null = null;
const storageGetter = () => {
  if (!_storageExported) {
    try {
      _storageExported = getStorageInstance();
      if (!_storageExported) {
        throw new Error('Storage instance is null after initialization');
      }
    } catch (error) {
      console.error('❌ Error in storageGetter:', error);
      throw error;
    }
  }
  return _storageExported;
};

export const storage: ReturnType<typeof getStorage> = (() => {
  // Always try to get the real instance, even during build
  // The Proxy will handle initialization lazily if needed
  return new Proxy({} as ReturnType<typeof getStorage>, {
    get(target, prop, receiver) {
      try {
        const instance = storageGetter();
        const value = (instance as any)[prop];
        if (typeof value === 'function') {
          return value.bind(instance);
        }
        return value;
      } catch (error) {
        // If initialization fails, log and rethrow
        console.error('❌ Error accessing storage property:', prop, error);
        throw error;
      }
    },
    has(target, prop) {
      try {
        const instance = storageGetter();
        return prop in instance;
      } catch {
        return false;
      }
    },
    ownKeys(target) {
      try {
        const instance = storageGetter();
        return Object.keys(instance as any);
      } catch {
        return [];
      }
    },
    getOwnPropertyDescriptor(target, prop) {
      try {
        const instance = storageGetter();
        return Object.getOwnPropertyDescriptor(instance as any, prop);
      } catch {
        return undefined;
      }
    }
  }) as ReturnType<typeof getStorage>;
})();

let _appExported: ReturnType<typeof initializeApp> | null = null;
const appGetter = () => {
  if (!_appExported) {
    _appExported = getApp();
  }
  return _appExported;
};

export default (() => {
  if (!isBuildTime && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    try {
      return getApp();
    } catch (error) {
      throw error;
    }
  }
  return new Proxy({} as ReturnType<typeof initializeApp>, {
    get(target, prop, receiver) {
      const instance = appGetter();
      const value = (instance as any)[prop];
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    }
  }) as ReturnType<typeof initializeApp>;
})();

