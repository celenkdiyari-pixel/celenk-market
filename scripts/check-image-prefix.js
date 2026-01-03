
const fs = require('fs');
try {
    let raw = fs.readFileSync('products_clean.json', 'utf8');
    raw = raw.replace(/^\uFEFF/, '');
    const products = JSON.parse(raw);
    if (products.length > 0) {
        const img = products[0].images ? products[0].images[0] : '';
        console.log('Image starts with http?', img.startsWith('http'));
        console.log('Image starts with data?', img.startsWith('data'));
        console.log('First 50 chars:', img.substring(0, 50));
    }
} catch (e) { console.log(e); }
