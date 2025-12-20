export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML content or rich text
    coverImage: string;
    date: string;
    author: string;
    tags: string[];
    readTime: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'celenk-nedir-ve-hangi-durumlarda-gonderilir',
        title: 'Çelenk Nedir ve Hangi Durumlarda Gönderilir?',
        excerpt: 'Çelenklerin tarihçesinden günümüzdeki kullanım alanlarına kadar kapsamlı bir rehber. Cenaze, açılış ve düğünlerde çelenk göndermenin incelikleri.',
        coverImage: 'https://images.unsplash.com/photo-1596627670783-6f8cb7b0d912?q=80&w=1200', // Placeholder
        date: '2024-01-15',
        author: 'Çelenk Diyarı Editör',
        tags: ['Çelenk Rehberi', 'Çelenk Kültürü', 'Çiçek Gönderimi'],
        readTime: '4 dk',
        content: `
      <h2>Çelenk Nedir?</h2>
      <p>Çelenk, genellikle çiçekler, yapraklar, meyveler veya dalların bir halka şeklinde örülmesiyle oluşturulan dekoratif bir düzenlemedir. Tarih boyunca zafer, onur, anma ve kutlama sembolü olarak kullanılmıştır. Günümüzde ise hem sevinçli hem de hüzünlü günlerin en önemli ifade biçimlerinden biridir.</p>

      <h2>Çelenk Hangi Durumlarda Gönderilir?</h2>
      <p>Çelenk gönderimi, duygularınızı büyük ve gösterişli bir şekilde ifade etmenin yoludur. İşte en yaygın kullanım alanları:</p>

      <h3>1. Cenaze Törenleri</h3>
      <p>Vefat eden kişiye son görev, ailesine ise başsağlığı dilemek amacıyla gönderilir. Genellikle üzerine "Başımız Sağ Olsun" veya kurum/kişi adı yazılır. Hüzünlü bir atmosferde saygıyı temsil eder.</p>

      <h3>2. Açılış Törenleri</h3>
      <p>Yeni bir iş yeri, mağaza veya kurum açılışında "Hayırlı Olsun" dileklerini iletmek için gönderilir. Açılış çelenkleri genellikle renkli, canlı ve dikkat çekici çiçeklerden oluşur. İş dünyasında prestij göstergesidir.</p>

      <h3>3. Düğün ve Nikah Törenleri</h3>
      <p>Katılamadığınız düğünlere veya nikah törenlerine mutluluk dileklerinizi iletmek için çelenk gönderebilirsiniz. Genellikle beyaz ve pastel tonların hakim olduğu, zarif tasarımlar tercih edilir.</p>

      <h3>4. Anma Törenleri ve Resmi Bayramlar</h3>
      <p>Atatürk anıtlarına veya şehitliklere, resmi bayramlarda ve anma günlerinde kurumları temsilen çelenk bırakılması bir devlet geleneğidir.</p>

      <h2>Çelenk Seçerken Nelere Dikkat Edilmeli?</h2>
      <ul>
        <li><strong>Amaca Uygunluk:</strong> Cenaze için daha sade ve ciddi, açılış için ise renkli ve coşkulu modeller seçilmelidir.</li>
        <li><strong>Çiçek Kalitesi:</strong> Taze ve dayanıklı çiçekler, çelengin tören boyunca diri kalmasını sağlar.</li>
        <li><strong>Bant Yazısı:</strong> Çelenk üzerindeki yazı okunaklı, kısa ve net olmalıdır.</li>
      </ul>
    `
    },
    {
        id: '2',
        slug: 'cenaze-torenleri-icin-celenk-secimi',
        title: 'Cenaze Törenleri İçin Çelenk Seçimi ve Adabı',
        excerpt: 'Cenaze törenlerinde saygınızı ifade etmenin en doğru yolu. Çelenk üzerine ne yazılır, hangi renkler tercih edilir?',
        coverImage: 'https://images.unsplash.com/photo-1595350352554-b384a32630ce?q=80&w=1200',
        date: '2024-02-01',
        author: 'Çelenk Diyarı Editör',
        tags: ['Cenaze Çelengi', 'Başsağlığı', 'Protokol'],
        readTime: '3 dk',
        content: `
      <h2>Cenaze Çelengi Nasıl Olmalı?</h2>
      <p>Cenaze törenleri, büyük bir hassasiyet ve saygı gerektirir. Bu nedenle gönderilecek çelengin de bu atmosfere uygun olması şarttır.</p>

      <h3>Renk Seçimi</h3>
      <p>Cenaze çelenklerinde genellikle aşırı parlak ve neon renklerden kaçınılır. En çok tercih edilen renkler şunlardır:</p>
      <ul>
        <li><strong>Beyaz:</strong> Masumiyeti ve saygıyı temsil eder.</li>
        <li><strong>Kırmızı:</strong> Sevgiyi ve derin bağlılığı ifade eder (Genellikle beyazla kombinlenir).</li>
        <li><strong>Yeşil:</strong> Ebediyeti ve huzuru simgeler (Yaprak detayları).</li>
      </ul>

      <h3>Çelenk Üzerine Ne Yazılır?</h3>
      <p>Çelenk bandı, gönderen kişiyi veya kurumu temsil eder. Yazıların okunaklı olması önemlidir. Yaygın ifadeler:</p>
      <ul>
        <li>KİŞİ ADI SOYADI</li>
        <li>ŞİRKET ADI</li>
        <li>AİLESİ ADINA ...</li>
        <li>BAŞIMIZ SAĞ OLSUN</li>
        <li>MEKANI CENNET OLSUN</li>
      </ul>

      <h3>Zamanlama</h3>
      <p>Çelengin, cenaze namazından en az 1 saat önce cami veya tören alanında hazır bulunması gerekir. Çelenk Diyarı olarak İstanbul içi cenaze çelenk siparişlerinde tam zamanında teslimat garantisi veriyoruz.</p>
    `
    },
    {
        id: '3',
        slug: 'acilis-ve-dugunler-icin-sik-celenk-modelleri',
        title: 'Açılış ve Düğünler İçin En Şık Çelenk Modelleri',
        excerpt: 'Mutlu günlerde sevdiklerinizi yalnız bırakmayın. Açılış ve düğünler için en çok tercih edilen, gösterişli çelenk modelleri.',
        coverImage: 'https://images.unsplash.com/photo-1519225448520-5616b76c8c16?q=80&w=1200',
        date: '2024-02-20',
        author: 'Tasarım Ekibi',
        tags: ['Açılış Çelengi', 'Düğün Çelengi', 'Kutlama'],
        readTime: '5 dk',
        content: `
      <h2>Mutluluğa Ortak Olun</h2>
      <p>Düğünler ve iş yeri açılışları, hayatın en heyecanlı anlarıdır. Bu özel günlerde fiziksel olarak orada olamasanız bile, göndereceğiniz şık bir çelenk ile varlığınızı hissettirebilirsiniz.</p>

      <h3>Açılış Çelenklerinde Trendler</h3>
      <p>Yeni bir başlangıcı kutlarken enerjik ve bereket simgesi çiçekler tercih edilir:</p>
      <ul>
        <li><strong>Gerberalar:</strong> Renkli ve büyük yapılarıyla dikkat çeker, neşe saçar.</li>
        <li><strong>Karanfiller:</strong> Dayanıklı yapılarıyla dış mekan açılışları için idealdir.</li>
        <li><strong>Lilyumlar:</strong> Zarif kokusu ve asil duruşuyla prestiji artırır.</li>
      </ul>
      <p>Açılış çelenklerinde genellikle firma logosu renklerine uygun tasarımlar veya çok renkli "karışık" aranjmanlar popülerdir.</p>

      <h3>Düğün Çelenklerinde Zarafet</h3>
      <p>Düğün çelenkleri genellikle daha romantik ve soft tonlarda hazırlanır. Beyaz, pembe, lila tonları hakimdir. Son yıllarda klasik ayaklı sepetlerin yanı sıra, modern ferforje tasarımlar da düğün salonlarının girişini süslemektedir.</p>

      <h3>Ferforje Çelenk Nedir?</h3>
      <p>Klasik ayaklı çelenklerden farklı olarak, metal bir iskelet üzerine daha modern ve sanatsal bir şekilde hazırlanan çiçek düzenlemeleridir. Özellikle düğün ve nişan organizasyonlarında daha "şık" ve "modern" bir görüntü sunduğu için sıkça tercih edilmektedir.</p>
    `
    },
    {
        id: '4',
        slug: 'istanbul-celenk-siparisi-rehberi',
        title: "İstanbul'da Çelenk Siparişi Verirken Dikkat Edilmesi Gerekenler",
        excerpt: "İstanbul gibi büyük bir metropolde çelenk siparişi verirken trafiği, zamanlamayı ve kaliteyi nasıl yönetirsiniz? İşte ipuçları.",
        coverImage: 'https://images.unsplash.com/photo-1591192949826-cf85340a6311?q=80&w=1200',
        date: '2024-03-05',
        author: 'Lojistik Ekibi',
        tags: ['İstanbul Çelenk', 'Online Sipariş', 'Hızlı Teslimat'],
        readTime: '4 dk',
        content: `
      <h2>İstanbul'da Çiçek ve Çelenk Lojistiği</h2>
      <p>İstanbul trafiği, zamanlı teslimatlar için en büyük meydan okumadır. Özellikle cenaze törenleri gibi saati kesin olan organizasyonlarda gecikme kabul edilemez.</p>

      <h3>1. Lokasyona Yakın Çiçekçi Tercihi</h3>
      <p>Sipariş vereceğiniz firmanın, teslimatın yapılacağı bölgeye hakim olması veya geniş bir dağıtım ağına sahip olması kritiktir. Çelenk Diyarı olarak İstanbul'un her iki yakasında da bulunan dağıtım noktalarımızla en hızlı teslimatı sağlıyoruz.</p>

      <h3>2. Online Sipariş Kolaylığı</h3>
      <p>Yoğun iş temposunda çiçekçiye gitmeye vakit bulamayabilirsiniz. Web sitemiz üzerinden:</p>
      <ul>
        <li>Kategorilere göre filtreleme yapabilir,</li>
        <li>Çelenk üzerindeki yazıyı kendiniz belirleyebilir,</li>
        <li>Teslimat saati seçebilirsiniz.</li>
      </ul>

      <h3>3. Güvenilirlik ve Referanslar</h3>
      <p>Gönderdiğiniz çelengin görseldeki gibi gidip gitmediği önemlidir. Biz, siparişiniz yola çıkmadan önce size fotoğraf onayı sunan ender firmalardan biriyiz.</p>

      <h3>4. Fiyat Performans</h3>
      <p>Çelenk fiyatları kullanılan çiçek sayısına, mevsime ve çelengin boyutuna göre değişir. "Ucuz çelenk" ararken kaliteden ödün vermemek gerekir; zira solgun çiçeklerle dolu bir çelenk, mahcup olmanıza neden olabilir.</p>
    `
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((post) => post.slug === slug);
}
