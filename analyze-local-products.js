
const fs = require('fs');

// System defined categories (from constants.ts)
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
// Add slugs as valid values too, just in case data uses slug instead of title
const ALL_VALID_VALUES = [...VALID_TITLES, ...VALID_SLUGS];

try {
    const rawData = fs.readFileSync('products_clean.json', 'utf8');
    // Remove BOM if present
    const cleanData = rawData.replace(/^\uFEFF/, '');
    const products = JSON.parse(cleanData);

    console.log(`📦 Loaded ${products.length} products.`);

    let stats = {
        total: products.length,
        valid: 0,
        invalid: 0,
        orphaned: []
    };

    let categoriesFound = {};

    products.forEach(p => {
        const pCategories = [];

        // Normalize product category fields
        if (p.category) pCategories.push(p.category);
        if (p.categories && Array.isArray(p.categories)) {
            p.categories.forEach(c => {
                if (!pCategories.includes(c)) pCategories.push(c);
            });
        }

        let isValid = false;
        if (pCategories.length > 0) {
            // Check if ANY category matches a valid System Category (Title or Slug)
            const matches = pCategories.filter(c => ALL_VALID_VALUES.includes(c));

            if (matches.length > 0) {
                isValid = true;
                matches.forEach(m => {
                    categoriesFound[m] = (categoriesFound[m] || 0) + 1;
                });
            } else {
                // If no exact match, maybe case insensitive?
                stats.orphaned.push({
                    name: p.name,
                    categories: pCategories
                });
            }
        } else {
            // No category assigned
            stats.orphaned.push({
                name: p.name,
                categories: ['(No Category)']
            });
        }

        if (isValid) stats.valid++;
        else stats.invalid++;
    });

    console.log('\n📊 Category Distribution (Found in Products):');
    Object.keys(categoriesFound).forEach(c => {
        console.log(`   - "${c}": ${categoriesFound[c]} products`);
    });

    console.log('\n⚠️  Issues Found:');
    if (stats.invalid > 0) {
        console.log(`   Found ${stats.invalid} products with undefined/invalid categories:`);
        // Show first 10 issues
        stats.orphaned.slice(0, 50).forEach(o => {
            console.log(`     - [${o.name}] Categories: ${JSON.stringify(o.categories)}`);
        });
        if (stats.orphaned.length > 50) console.log(`     ... and ${stats.orphaned.length - 50} more.`);
    } else {
        console.log('   ✅ All products are assigned to valid categories.');
    }

    console.log('\n📋 System Categories Status:');
    VALID_TITLES.forEach(title => {
        const count = categoriesFound[title] || 0;
        const icon = count > 0 ? '✅' : '⚠️';
        console.log(`   ${icon} ${title}: ${count} products`);
    });

} catch (e) {
    console.error('Error analyzing products:', e.message);
}
