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
    coverImage: '/images/categories/açılıştören.jpg', // Placeholder
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
    coverImage: '/images/categories/açılıştören.jpg',
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
    coverImage: '/images/categories/açılıştören.jpg',
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
    coverImage: '/images/categories/açılıştören.jpg',
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
  },
  {
    id: '5',
    slug: 'celenk-uzerine-ne-yazilir-ornek-sozler',
    title: 'Çelenk Üzerine Ne Yazılır? En Anlamlı Çelenk Bant Yazıları',
    excerpt: 'Cenaze, düğün veya açılış çelenkleri için bant yazısı örnekleri. Kurumsal ve kişisel gönderimler için hazır mesaj kalıpları.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-03-12',
    author: 'Editör Ekibi',
    tags: ['Çelenk Yazıları', 'Rehber', 'Mesaj Örnekleri'],
    readTime: '3 dk',
    content: `
      <h2>Çelenk Bandı Neden Önemlidir?</h2>
      <p>Çelenk üzerindeki bant (kuşak), çiçeği gönderen kişinin veya kurumun imzası niteliğindedir. Kısa, net ve okunaklı olması gerekir. Genellikle 3-5 kelimeyi geçmemesi tavsiye edilir.</p>

      <h3>Cenaze Çelengi Yazı Örnekleri</h3>
      <p>Hüzünlü günlerde şatafattan uzak, saygılı ifadeler tercih edilmelidir:</p>
      <ul>
        <li><strong>Standart:</strong> AD SOYAD</li>
        <li><strong>Kurumsal:</strong> ŞİRKET ADI A.Ş. PERSONELİ</li>
        <li><strong>Duygusal:</strong> SENİ UNUTMAYACAĞIZ - AİLESİ</li>
        <li><strong>Saygı:</strong> SAYGI VE RAHMETLE - AD SOYAD</li>
        <li><strong>Dua:</strong> MEKANI CENNET OLSUN</li>
      </ul>

      <h3>Düğün ve Nişan Çelengi Yazı Örnekleri</h3>
      <p>Mutluluk dileklerini iletmek için:</p>
      <ul>
        <li><strong>Klasik:</strong> MUTLULUKLAR DİLERİZ - ŞİRKET ADI</li>
        <li><strong>Samimi:</strong> BİR ÖMÜR MUTLULUKLAR - ARKADAŞIN ADI</li>
        <li><strong>Aileden:</strong> AİLESİ ADINA - AD SOYAD</li>
      </ul>

      <h3>Açılış Çelengi Yazı Örnekleri</h3>
      <ul>
        <li>HAYIRLI OLSUN - FİRMA ADI</li>
        <li>YENİ İŞİNİZDE BAŞARILAR DİLERİZ</li>
        <li>BOL KAZANÇLAR - GÖNDEREN ADI</li>
      </ul>
    `
  },
  {
    id: '6',
    slug: 'ferforje-celenk-nedir-klasik-celenk-farki',
    title: 'Ferforje Çelenk Nedir? Klasik Çelenkten Farkı Ne?',
    excerpt: 'Son yılların trendi ferforje çelenkler hakkında bilmeniz gerekenler. Modern görünümü ve şık duruşuyla neden tercih ediliyor?',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-03-25',
    author: 'Tasarım Ekibi',
    tags: ['Ferforje', 'Lüks Çelenk', 'Düğün Trendleri'],
    readTime: '4 dk',
    content: `
      <h2>Modern ve Zarif: Ferforje Çelenk</h2>
      <p>Geleneksel ayaklı çelenklerin yerini yavaş yavaş daha modern ve estetik bir görünüme sahip olan <strong>ferforje çelenkler</strong> almaya başladı. Peki nedir bu ferforje çelenk?</p>

      <h3>Ferforje Çelenk Özellikleri</h3>
      <p>Ferforje, demirin yüksek ısıda dövülerek işlenmesi sanatıdır. Çiçekçilikte ise metal ayaklar üzerine hazırlanan, daha sanatsal ve hacimli aranjmanları ifade eder.</p>
      <ul>
        <li><strong>Görünüm:</strong> Klasik çelenklere göre daha kibar, modern ve "çiçek yoğunluklu" durur. Plastik veya tahta ayak yerine şık metal iskelet kullanılır.</li>
        <li><strong>Çiçek Çeşitliliği:</strong> Genellikle daha pahalı ve gösterişli çiçekler (orkide, gül, lilyum) kullanılır.</li>
        <li><strong>Kullanım Alanı:</strong> Özellikle lüks düğün salonları, otel davetleri, kokteyller ve prestijli açılışlar için idealdir.</li>
      </ul>

      <h3>Neden Ferforje Tercih Etmelisiniz?</h3>
      <p>Eğer gönderiminizle fark yaratmak, "basmakalıp" bir çelenk yerine sanat eseri gibi duran bir aranjman göndermek istiyorsanız ferforje doğru tercihtir. Özellikle iç mekan organizasyonlarında dekorasyonun bir parçası gibi durur.</p>
    `
  },
  {
    id: '7',
    slug: '2024-celenk-fiyatlari-nelerden-etkilenir',
    title: 'Çelenk Fiyatları Neye Göre Belirlenir?',
    excerpt: 'Çelenk siparişi verirken fiyatı etkileyen faktörler nelerdir? Ekonomik çelenk ile lüks çelenk arasındaki farklar.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-04-02',
    author: 'Piyasa Analiz',
    tags: ['Fiyat Rehberi', 'Ekonomi', 'Çiçek Borsası'],
    readTime: '3 dk',
    content: `
      <h2>Çelenk Fiyatlarını Etkileyen 3 Ana Faktör</h2>
      <p>Çelenk siparişi verirken karşılaştığınız fiyat farklarının haklı sebepleri vardır. İşte fiyatı belirleyen unsurlar:</p>

      <h3>1. Kullanılan Çiçeğin Cinsi ve Sayısı</h3>
      <p>En önemli maliyet kalemidir. Mevsiminde olmayan çiçeklerin kullanımı fiyatı artırır. Örneğin:</p>
      <ul>
        <li><strong>Gerbera/Karanfil:</strong> Daha ekonomik seçeneklerdir.</li>
        <li><strong>Gül/Antoryum/Orkide:</strong> Lüks kategorisindedir ve fiyatı ciddi oranda artırır.</li>
      </ul>
      <p>Ayrıca çelengin "doluluğu" yani kullanılan çiçek adedi de önemlidir (Tek sıralı, çift sıralı vb.).</p>

      <h3>2. Çelengin Boyutu</h3>
      <p>Standart çelenkler genellikle 2-2.5 metre yüksekliğindedir. Ancak özel tasarım, daha geniş veya çift katlı çelenklerde kullanılan yeşillik ve sünger maliyeti, dolayısıyla işçilik artar.</p>

      <h3>3. Lojistik ve Ulaşım</h3>
      <p>İstanbul gibi büyük şehirlerde, teslimatın yapılacağı mesafe fiyatlara yansıyabilir. Ancak <strong>Çelenk Diyarı</strong> olarak biz, İstanbul içi birçok noktaya ücretsiz teslimat avantajı sunuyoruz.</p>
    `
  },
  {
    id: '8',
    slug: 'kurumsal-firma-cicek-gonderimi-adabi',
    title: 'Kurumsal Firmalar İçin Çiçek Gönderim Rehberi',
    excerpt: 'Şirketiniz adına çiçek veya çelenk gönderirken nelere dikkat etmelisiniz? Kurumsal itibarınızı yansıtacak seçimler.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-04-10',
    author: 'Kurumsal İletişim',
    tags: ['Kurumsal', 'İş Dünyası', 'Prestij'],
    readTime: '4 dk',
    content: `
      <h2>Şirket İtibarınızı Çiçekle Yansıtın</h2>
      <p>İş dünyasında tebrik ve taziye gönderimleri, profesyonel ilişkilerin sürdürülmesi için kritiktir. Yanlış bir seçim, şirket imajına zarar verebilir.</p>

      <h3>1. Logo Renklerine Sadık Kalın</h3>
      <p>Açılış törenleri için gönderilecek çelenklerde, şirketinizin kurumsal renklerini (logo renkleri) taşıyan çiçeklerin seçilmesi, markanızın akılda kalıcılığını artırır. Sipariş notunda bunu özellikle belirtmelisiniz.</p>

      <h3>2. Ölçek Önemlidir</h3>
      <p>Eğer çok büyük bir şirketin (Holding vb.) açılışına gönderiyorsanız, "sıradan" küçük bir aranjman göndermek yerine, gösterişli bir ferforje veya büyük boy bir çelenk tercih etmek, firmanızın büyüklüğünü ve olaya verdiği önemi gösterir.</p>

      <h3>3. Faturalandırma ve Süreç</h3>
      <p>Kurumsal siparişlerde fatura süreçleri önemlidir. E-fatura mükellefi olan çiçekçilerle çalışmak muhasebe süreçlerinizi kolaylaştırır. Çelenk Diyarı, tüm kurumsal siparişlerinizde kurum adına fatura düzenleyerek profesyonel çözüm ortağınız olur.</p>
    `
  },
  {
    id: '9',
    slug: 'dugun-celenklerinde-renklerin-dili',
    title: 'Düğün Çelenklerinde Renklerin Dili: Hangi Renk Neyi İfade Eder?',
    excerpt: 'Düğün ve nişan törenlerine çelenk gönderirken renklerin gizli mesajlarını biliyor musunuz? Beyaz, pembe veya kırmızı... İşte anlamları.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-04-18',
    author: 'Sanat Editörü',
    tags: ['Renk Psikolojisi', 'Düğün', 'Çiçek Anlamları'],
    readTime: '3 dk',
    content: `
      <h2>Mutluluğun Rengi Nedir?</h2>
      <p>Çiçeklerin dili evrenseldir. Düğün gibi en mutlu günlerde seçeceğiniz çelengin rengi, iletmek istediğiniz mesajı güçlendirir.</p>

      <h3>Beyaz: Masumiyet ve Yeni Başlangıçlar</h3>
      <p>Düğün çelenklerinin vazgeçilmez rengi beyazdır. Temizliği, saflığı ve yeni bir hayata atılan adımı simgeler. Risk almadan en şık ve asil duruşu sergilemek isteyenlerin tercihidir.</p>

      <h3>Pembe: Neşe ve Romantizm</h3>
      <p>Pembe tonları, özellikle bahar ve yaz düğünlerinde sıkça tercih edilir. Şefkati, nezaketi ve romantizmi temsil eder. Beyaz ile harmanlandığında harika bir uyum yakalar.</p>

      <h3>Kırmızı: Tutku ve Güç</h3>
      <p>Daha iddialı bir seçimdir. Kırmızı güller veya gerberalarla hazırlanan bir çelenk, "Aşkınız daim olsun" mesajını güçlü bir şekilde verir. Genellikle çok yakın dostlar veya aile üyeleri tarafından tercih edilir.</p>
    `
  },
  {
    id: '10',
    slug: 'acil-celenk-siparisi-istanbul',
    title: 'İstanbul Acil Çelenk Siparişi: Son Dakika Kurtarıcısı',
    excerpt: 'Tören saatine çok az mı kaldı? İstanbul trafiğinde hızlı çelenk gönderimi için hayat kurtaran ipuçları ve dikkat edilmesi gerekenler.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-04-25',
    author: 'Operasyon Müdürü',
    tags: ['Acil Sipariş', 'Hızlı Teslimat', 'İstanbul'],
    readTime: '3 dk',
    content: `
      <h2>Zamanla Yarışırken Yanınızdayız</h2>
      <p>Bazen hayatın koşturmacasında önemli bir düğünü veya maalesef aniden gelen bir cenaze haberini son dakika öğrenebilirsiniz. Panik yapmayın, doğru adımlarla törene yetişmek mümkün.</p>

      <h3>1. Stoktan Gönderim (Hazır Modeller)</h3>
      <p>Özel tasarım ferforjeler zaman alır. Ancak standart ayaklı çelenkler genellikle çiçekçilerin stoğunda iskelet olarak hazırdır ve sadece taze çiçeklerle donatılması gerekir. Acil durumlarda "Günün Çelengi" veya "Hazır Modeller" kategorisinden seçim yapmak size 1-2 saat kazandırır.</p>

      <h3>2. Bölgesel Gönderim Ağı</h3>
      <p>Siparişinizin tören yerine en yakın şubeden çıkması hayati önem taşır. Çelenk Diyarı, İstanbul'un kilit noktalarındaki çözüm ortaklarıyla trafiğe takılmadan teslimat yapar.</p>

      <h3>3. Doğru İletişim</h3>
      <p>Acil siparişlerde not kısmına mutlaka "Tören saati X:XX'de, ACİLDİR" notunu düşün veya sipariş sonrası bizi arayarak teyit alın. Ekibimiz rotayı buna göre önceliklendirecektir.</p>
    `
  },
  {
    id: '11',
    slug: 'yapay-cicek-mi-canli-cicek-mi-celenk-secimi',
    title: 'Yapay Çelenk vs Canlı Çelenk: Hangisini Tercih Etmeli?',
    excerpt: 'Çelenk gönderirken yapay çiçek mi yoksa taze canlı çiçek mi seçmelisiniz? İki seçeneğin avantajları ve dezavantajları.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-05-02',
    author: 'Ürün Uzmanı',
    tags: ['Ürün Karşılaştırma', 'Yapay Çiçek', 'Canlı Çiçek'],
    readTime: '4 dk',
    content: `
      <h2>Prestij mi, Kalıcılık mı?</h2>
      <p>Çelenk siparişi verirken en çok sorulan sorulardan biri de çiçeğin türüdür. Her iki seçeneğin de kendine has kullanım alanları vardır.</p>

      <h3>Canlı Çiçekli Çelenkler</h3>
      <p><strong>Avantajları:</strong></p>
      <ul>
        <li><strong>Prestij:</strong> Canlı çiçek her zaman daha lüks, taze ve değerli algılanır.</li>
        <li><strong>Koku:</strong> Doğal çiçek kokusu ortamın havasını değiştirir.</li>
        <li><strong>Geri Dönüşüm:</strong> Doğaldır, tören sonrası doğaya karışır.</li>
      </ul>
      <p><em>Öneri:</em> Cenaze, önemli düğünler ve üst düzey açılışlar için kesinlikle canlı çiçek öneriyoruz.</p>

      <h3>Yapay Çiçekli Çelenkler</h3>
      <p><strong>Avantajları:</strong></p>
      <ul>
        <li><strong>Dayanıklılık:</strong> Hava koşullarından etkilenmez (Yağmur, rüzgar, güneş).</li>
        <li><strong>Süreklilik:</strong> Açılış yapılan mekanda günlerce, hatta haftalarca kapı önünde dekor olarak kalabilir.</li>
      </ul>
      <p><em>Öneri:</em> Eğer amacınız açılış yapılan dükkanın önünde uzun süre kalacak bir "reklam" ise yapay tercih edilebilir. Ancak Çelenk Diyarı olarak biz, kalitemiz gereği ağırlıklı olarak 1. sınıf taze kesme çiçekler kullanmaktayız.</p>
    `
  },
  {
    id: '12',
    slug: 'celenk-gonderme-kulturumuzun-tarihcesi',
    title: 'Zamana Meydan Okuyan Gelenek: Çelenk Kültürü',
    excerpt: 'Çelenk gönderme adeti nereden geliyor? Antik çağlardan günümüze çelenklerin yolculuğu ve kültürel önemi.',
    coverImage: '/images/categories/açılıştören.jpg',
    date: '2024-05-10',
    author: 'Kültür Sanat',
    tags: ['Tarihçe', 'Kültür', 'Gelenek'],
    readTime: '3 dk',
    content: `
      <h2>Zaferden Anmaya: Çelengin Yolculuğu</h2>
      <p>Çelenk formunun (daire), başı ve sonu olmadığı için "sonsuzluğu" simgelediğini biliyor muydunuz?</p>

      <h3>Antik Çağlar</h3>
      <p>Antik Yunan ve Roma'da defne yapraklarından yapılan çelenkler, olimpiyat kazananlarına veya savaştan dönen muzaffer komutanlara takılırdı. Bir zafer ve güç simgesiydi.</p>

      <h3>Viktorya Dönemi</h3>
      <p>Çiçeklerin dili (floriography) bu dönemde gelişti. Çelenkler, duyguların kelimeler olmadan ifade edilmesinin en zarif yolu haline geldi. Cenaze törenlerinde "ruhsal sonsuzluk" anlamında kullanılmaya başlandı.</p>

      <h3>Günümüz Türkiye'si</h3>
      <p>Ülkemizde çelenk kültürü, toplumsal dayanışmanın en görünür halidir. Bir düğünde sıra sıra dizilen çelenkler ailenin sosyal çevresini, bir cenazedeki çelenkler ise merhuma duyulan saygıyı gösterir. Bu gelenek, dijitalleşen dünyada bile önemini yitirmeden devam etmektedir.</p>
    `
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
