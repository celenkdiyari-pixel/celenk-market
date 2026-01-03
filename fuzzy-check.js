
const fs = require('fs');

try {
    let rawData = fs.readFileSync('products_clean.json', 'utf8');
    rawData = rawData.replace(/^\uFEFF/, '');
    const products = JSON.parse(rawData);

    // Count occurences of category strings (fuzzy)
    const counts = {
        'Acilis': 0,
        'Cenaze': 0,
        'Nisan': 0,
        'Ofis': 0
    };

    products.forEach(p => {
        const str = JSON.stringify(p);
        if (str.match(/Açılış|AÃ§/i)) counts.Acilis++;
        if (str.match(/Cenaze|Cenaze/i)) counts.Cenaze++;
        if (str.match(/Nişan|NiÅŸ/i)) counts.Nisan++;
        if (str.match(/Ofis/i)) counts.Ofis++;
    });

    console.log('Fuzzy counts:', counts);

} catch (e) { console.log(e); }
