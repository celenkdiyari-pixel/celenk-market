export const cities = [
    { name: 'Adana', slug: 'adana' },
    { name: 'Adıyaman', slug: 'adiyaman' },
    { name: 'Afyonkarahisar', slug: 'afyonkarahisar' },
    { name: 'Ağrı', slug: 'agri' },
    { name: 'Amasya', slug: 'amasya' },
    { name: 'Ankara', slug: 'ankara', priority: true },
    { name: 'Antalya', slug: 'antalya', priority: true },
    { name: 'Artvin', slug: 'artvin' },
    { name: 'Aydın', slug: 'aydin' },
    { name: 'Balıkesir', slug: 'balikesir' },
    { name: 'Bilecik', slug: 'bilecik' },
    { name: 'Bingöl', slug: 'bingol' },
    { name: 'Bitlis', slug: 'bitlis' },
    { name: 'Bolu', slug: 'bolu' },
    { name: 'Burdur', slug: 'burdur' },
    { name: 'Bursa', slug: 'bursa', priority: true },
    { name: 'Çanakkale', slug: 'canakkale' },
    { name: 'Çankırı', slug: 'cankiri' },
    { name: 'Çorum', slug: 'corum' },
    { name: 'Denizli', slug: 'denizli' },
    { name: 'Diyarbakır', slug: 'diyarbakir' },
    { name: 'Edirne', slug: 'edirne' },
    { name: 'Elazığ', slug: 'elazig' },
    { name: 'Erzincan', slug: 'erzincan' },
    { name: 'Erzurum', slug: 'erzurum' },
    { name: 'Eskişehir', slug: 'eskisehir' },
    { name: 'Gaziantep', slug: 'gaziantep' },
    { name: 'Giresun', slug: 'giresun' },
    { name: 'Gümüşhane', slug: 'gumushane' },
    { name: 'Hakkari', slug: 'hakkari' },
    { name: 'Hatay', slug: 'hatay' },
    { name: 'Isparta', slug: 'isparta' },
    { name: 'Mersin', slug: 'mersin' },
    { name: 'İstanbul', slug: 'istanbul', priority: true },
    { name: 'İzmir', slug: 'izmir', priority: true },
    { name: 'Kars', slug: 'kars' },
    { name: 'Kastamonu', slug: 'kastamonu' },
    { name: 'Kayseri', slug: 'kayseri' },
    { name: 'Kırklareli', slug: 'kirklareli' },
    { name: 'Kırşehir', slug: 'kirsehir' },
    { name: 'Kocaeli', slug: 'kocaeli' },
    { name: 'Konya', slug: 'konya' },
    { name: 'Kütahya', slug: 'kutahya' },
    { name: 'Malatya', slug: 'malatya' },
    { name: 'Manisa', slug: 'manisa' },
    { name: 'Kahramanmaraş', slug: 'kahramanmaras' },
    { name: 'Mardin', slug: 'mardin' },
    { name: 'Muğla', slug: 'mugla' },
    { name: 'Muş', slug: 'mus' },
    { name: 'Nevşehir', slug: 'nevsehir' },
    { name: 'Niğde', slug: 'nigde' },
    { name: 'Ordu', slug: 'ordu' },
    { name: 'Rize', slug: 'rize' },
    { name: 'Sakarya', slug: 'sakarya' },
    { name: 'Samsun', slug: 'samsun' },
    { name: 'Siirt', slug: 'siirt' },
    { name: 'Sinop', slug: 'sinop' },
    { name: 'Sivas', slug: 'sivas' },
    { name: 'Tekirdağ', slug: 'tekirdag' },
    { name: 'Tokat', slug: 'tokat' },
    { name: 'Trabzon', slug: 'trabzon' },
    { name: 'Tunceli', slug: 'tunceli' },
    { name: 'Şanlıurfa', slug: 'sanliurfa' },
    { name: 'Uşak', slug: 'usak' },
    { name: 'Van', slug: 'van' },
    { name: 'Yozgat', slug: 'yozgat' },
    { name: 'Zonguldak', slug: 'zonguldak' },
    { name: 'Aksaray', slug: 'aksaray' },
    { name: 'Bayburt', slug: 'bayburt' },
    { name: 'Karaman', slug: 'karaman' },
    { name: 'Kırıkkale', slug: 'kirikkale' },
    { name: 'Batman', slug: 'batman' },
    { name: 'Şırnak', slug: 'sirnak' },
    { name: 'Bartın', slug: 'bartin' },
    { name: 'Ardahan', slug: 'ardahan' },
    { name: 'Iğdır', slug: 'igdir' },
    { name: 'Yalova', slug: 'yalova' },
    { name: 'Karabük', slug: 'karabuk' },
    { name: 'Kilis', slug: 'kilis' },
    { name: 'Osmaniye', slug: 'osmaniye' },
    { name: 'Düzce', slug: 'duzce' }
];

// Helper to clean Turkish chars
function simpleSlugify(text: string): string {
    const trMap: Record<string, string> = {
        'İ': 'i', 'I': 'i', 'ı': 'i', 'Ş': 's', 'ş': 's', 'Ğ': 'g', 'ğ': 'g',
        'Ü': 'u', 'ü': 'u', 'Ö': 'o', 'ö': 'o', 'Ç': 'c', 'ç': 'c'
    };
    return text
        .split('')
        .map(char => trMap[char] || char)
        .join('')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '') // Allow alphanumeric and dashes
        .replace(/-+/g, '-');
}

export function getCityBySlug(slug: string) {
    if (!slug) return undefined;

    // 1. Direct decode
    const decoded = decodeURIComponent(slug);
    let match = cities.find(city => city.slug === decoded);
    if (match) return match;

    // 2. Slugify check
    const slugified = simpleSlugify(decoded);
    match = cities.find(city => city.slug === slugified);
    if (match) return match;

    // 3. Normalized check (legacy)
    const normalized = decoded.normalize('NFC').replace(/[\u0307]/g, '').toLowerCase();
    return cities.find(city => city.slug === normalized);
}
