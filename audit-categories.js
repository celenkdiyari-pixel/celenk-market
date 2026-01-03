
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const loadEnv = (filename) => {
    const p = path.join(process.cwd(), filename);
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
    }
};

loadEnv('.env.production');
loadEnv('.env.local');

// Disable Firestore Telemetry to avoid Span Error
process.env.FIRESTORE_EMULATOR_HOST = '';
// This specific error "Metadata string value... contains illegal characters" often happens with gRPC tracing
// We will try to suppress it by not loading some debug vars or just proceed.
// It seems unrelated to our logic but crashes the process.


const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing credentials.');
    process.exit(1);
}

if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        })
    });
}

const db = admin.firestore();

// Defined Categories in the system (from src/lib/constants.ts)
const SYSTEM_CATEGORIES = {
    'acilis-toren': 'Açılış & Tören',
    'cenaze-celenkleri': 'Cenaze Çelenkleri',
    'soz-nisan': 'Söz & Nişan',
    'ferforjeler': 'Ferforjeler',
    'fuar-stand': 'Fuar & Stand',
    'ofis-saksi-bitkileri': 'Ofis & Saksı Bitkileri'
};

const VALID_TITLES = Object.values(SYSTEM_CATEGORIES);
const VALID_SLUGS = Object.keys(SYSTEM_CATEGORIES);

async function checkCategories() {
    console.log('🔍 Checking product categories...');
    console.log(`📋 Defined System Categories: ${VALID_TITLES.join(', ')}`);

    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();

    if (snapshot.empty) {
        console.log('No products found.');
        return;
    }

    let stats = {
        total: 0,
        valid: 0,
        invalid: 0,
        orphaned: []
    };

    let categoriesFound = {};

    snapshot.forEach(doc => {
        const p = doc.data();
        stats.total++;

        // Products might have 'category' (string) or 'categories' (array)
        const pCategories = [];

        if (p.category) pCategories.push(p.category);
        if (p.categories && Array.isArray(p.categories)) {
            p.categories.forEach(c => {
                if (!pCategories.includes(c)) pCategories.push(c);
            });
        }

        let isValid = false;
        if (pCategories.length > 0) {
            // Check if at least one category matches a valid title
            const matches = pCategories.filter(c => VALID_TITLES.includes(c));
            if (matches.length > 0) {
                isValid = true;
                matches.forEach(m => {
                    categoriesFound[m] = (categoriesFound[m] || 0) + 1;
                });
            } else {
                stats.orphaned.push({
                    id: doc.id,
                    name: p.name,
                    categories: pCategories
                });
            }
        } else {
            // No category assigned
            stats.orphaned.push({
                id: doc.id,
                name: p.name,
                categories: ['(No Category)']
            });
        }

        if (isValid) stats.valid++;
        else stats.invalid++;
    });

    console.log('\n📊 Category Distribution:');
    Object.keys(categoriesFound).forEach(c => {
        console.log(`   - ${c}: ${categoriesFound[c]} products`);
    });

    console.log('\n⚠️  Issues Found:');
    if (stats.invalid > 0) {
        console.log(`   Found ${stats.invalid} products with undefined/invalid categories:`);
        stats.orphaned.forEach(o => {
            console.log(`     Product: ${o.name} (ID: ${o.id}) -> Categories: ${JSON.stringify(o.categories)}`);
        });
    } else {
        console.log('   ✅ All products are assigned to valid categories.');
    }

    // Check for empty system categories
    const emptyCategories = VALID_TITLES.filter(t => !categoriesFound[t]);
    if (emptyCategories.length > 0) {
        console.log('\n⚠️  Unused System Categories (No products assigned):');
        emptyCategories.forEach(c => console.log(`   - ${c}`));
    }
}

checkCategories().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
