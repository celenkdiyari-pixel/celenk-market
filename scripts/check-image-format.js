
const fs = require('fs');
try {
    let raw = fs.readFileSync('products_clean.json', 'utf8');
    raw = raw.replace(/^\uFEFF/, '');
    const products = JSON.parse(raw);
    if (products.length > 0) {
        console.log('Sample Image:', products[0].images);
        console.log('Sample Image[0]:', products[0].images ? products[0].images[0] : 'No image');
    }
} catch (e) { console.log(e); }
