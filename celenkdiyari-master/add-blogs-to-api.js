// Blog yazılarını API'ye ekleme scripti
const fetch = require('node-fetch');

const blogPosts = [
  {
    title: "Açılış ve Tören Çelenkleri: Profesyonel İmaj İçin Doğru Seçim",
    content: `Açılış ve tören çelenkleri, işletmelerin ve organizasyonların profesyonel imajını yansıtan önemli detaylardır. Doğru seçilmiş bir çelenk, açılış töreninizin başarısını artırır ve misafirlerinizde kalıcı bir izlenim bırakır.

## Açılış Çelenklerinin Önemi

Açılış çelenkleri, işletmenizin açılış gününde kullanılan özel tasarım çelenklerdir. Bu çelenkler, işletmenizin marka kimliğini yansıtır ve profesyonel bir görünüm sağlar. Açılış çelenkleri genellikle şirket renklerine uygun olarak tasarlanır ve işletmenizin logosu veya ismi ile kişiselleştirilebilir.

## Tören Çelenklerinin Kullanım Alanları

Tören çelenkleri, çeşitli özel günlerde kullanılabilir:
- İş yeri açılışları
- Şube açılışları
- Fuar ve sergi açılışları
- Ödül törenleri
- Anma törenleri
- Kurumsal etkinlikler

## Çelenk Seçiminde Dikkat Edilmesi Gerekenler

### 1. Renk Seçimi
Çelenk renkleri, işletmenizin marka renklerine uygun olmalıdır. Yeşil yapraklar, beyaz ve kırmızı çiçekler klasik bir kombinasyon oluşturur. Ancak modern işletmeler için daha canlı renkler de tercih edilebilir.

### 2. Boyut ve Tasarım
Çelenk boyutu, açılış yapılacak mekanın büyüklüğüne göre belirlenmelidir. Büyük mekanlar için daha büyük çelenkler, küçük mekanlar için daha kompakt tasarımlar tercih edilmelidir.

### 3. Kişiselleştirme
Çelenk üzerine işletme adı, logo veya özel mesaj eklenebilir. Bu, çelenğin daha profesyonel görünmesini sağlar.

### 4. Tazelik ve Kalite
Açılış gününde çelenklerin taze ve canlı görünmesi çok önemlidir. Profesyonel bir çelenk firması ile çalışarak en taze çiçeklerle hazırlanmış çelenkler temin edebilirsiniz.

## Açılış Çelenklerinin Bakımı

Açılış çelenklerinin uzun süre canlı kalması için:
- Çelenkleri doğrudan güneş ışığından uzak tutun
- Düzenli olarak su verin
- Serin bir ortamda saklayın
- Açılış gününden önce teslim alın

## Profesyonel Çelenk Hizmeti

Çelenk Diyarı olarak, açılış ve tören çelenkleriniz için profesyonel hizmet sunuyoruz. Deneyimli ekibimiz, işletmenizin ihtiyaçlarına uygun özel tasarım çelenkler hazırlar. İstanbul ve tüm Türkiye'ye hızlı teslimat garantisi ile açılış çelenklerinizi zamanında teslim ediyoruz.

Açılış çelenkleriniz için bizimle iletişime geçin ve profesyonel çelenk hizmetimizden yararlanın.`,
    excerpt: "Açılış ve tören çelenkleri, işletmelerin profesyonel imajını yansıtan önemli detaylardır. Doğru seçilmiş bir çelenk, açılış töreninizin başarısını artırır.",
    category: "Açılış & Tören",
    tags: ["açılış çelenkleri", "tören çelenkleri", "iş yeri açılışı", "profesyonel çelenk", "kurumsal çelenk", "etkinlik"],
    seoTitle: "Açılış ve Tören Çelenkleri | Profesyonel Çelenk Hizmeti",
    seoDescription: "Açılış ve tören çelenkleri için profesyonel hizmet. İş yeri açılışları, şube açılışları ve özel törenler için özel tasarım çelenkler. Hızlı teslimat garantisi.",
    status: "published",
    featured: true,
    author: "Çelenk Diyarı"
  },
  {
    title: "Cenaze Çelenkleri: Saygı ve Hüzün İfadesi",
    content: `Cenaze çelenkleri, sevdiklerimizi son yolculuklarına uğurlarken saygı ve sevgimizi ifade etmenin en anlamlı yollarından biridir. Doğru seçilmiş bir cenaze çelenği, vefat eden kişiye duyduğumuz saygıyı ve sevgiyi en güzel şekilde yansıtır.

## Cenaze Çelenklerinin Anlamı

Cenaze çelenkleri, Türk kültüründe önemli bir yere sahiptir. Bu çelenkler, vefat eden kişiye duyulan saygıyı, sevgiyi ve hüznü ifade eder. Cenaze çelenkleri genellikle beyaz, krem ve yeşil tonlarında hazırlanır ve hüzünlü bir atmosfer yaratır.

## Cenaze Çelenk Çeşitleri

### 1. Klasik Cenaze Çelenkleri
Klasik cenaze çelenkleri, geleneksel tasarım ve renklerle hazırlanır. Beyaz karanfiller, yeşil yapraklar ve krem renkli çiçekler kullanılır.

### 2. Modern Cenaze Çelenkleri
Modern cenaze çelenkleri, daha çağdaş tasarımlarla hazırlanır. Minimalist yaklaşım ve zarif çiçek seçimleri ile öne çıkar.

### 3. Kişiselleştirilmiş Çelenkler
Vefat eden kişinin sevdiği çiçekler veya renkler kullanılarak kişiselleştirilmiş çelenkler hazırlanabilir.

## Cenaze Çelenklerinde Renk Seçimi

Cenaze çelenklerinde genellikle şu renkler tercih edilir:
- **Beyaz**: Saflık, temizlik ve huzur ifade eder
- **Krem**: Saygı ve zarafet ifade eder
- **Yeşil**: Umut ve yaşam ifade eder
- **Mor**: Hüzün ve saygı ifade eder

## Cenaze Çelenklerinde Mesaj

Cenaze çelenklerine genellikle şu tür mesajlar yazılır:
- "Ruhuna Fatiha"
- "Mekanın Cennet Olsun"
- "Allah Rahmet Eylesin"
- "Başınız Sağ Olsun"
- Kişisel anılar ve duygular

## Cenaze Çelenklerinin Teslimi

Cenaze çelenkleri, genellikle cenaze töreninden önce veya cenaze gününde teslim edilir. Hızlı ve zamanında teslimat çok önemlidir. Çelenk Diyarı olarak, cenaze çelenklerinizi zamanında ve özenle teslim ediyoruz.

## Cenaze Çelenklerinin Bakımı

Cenaze çelenklerinin taze ve canlı görünmesi için:
- Çelenkleri serin bir ortamda saklayın
- Düzenli olarak su verin
- Doğrudan güneş ışığından uzak tutun

## Profesyonel Cenaze Çelenk Hizmeti

Çelenk Diyarı olarak, cenaze çelenkleriniz için hassas ve özenli bir hizmet sunuyoruz. Deneyimli ekibimiz, saygı ve hüznünüzü en güzel şekilde yansıtan çelenkler hazırlar. İstanbul ve tüm Türkiye'ye hızlı teslimat garantisi ile cenaze çelenklerinizi zamanında teslim ediyoruz.

Cenaze çelenkleriniz için bizimle iletişime geçin ve saygı dolu çelenk hizmetimizden yararlanın.`,
    excerpt: "Cenaze çelenkleri, sevdiklerimizi son yolculuklarına uğurlarken saygı ve sevgimizi ifade etmenin en anlamlı yollarından biridir.",
    category: "Cenaze Çelenkleri",
    tags: ["cenaze çelenkleri", "başsağlığı çelenkleri", "taziye çelenkleri", "cenaze çiçekleri", "saygı çelenkleri"],
    seoTitle: "Cenaze Çelenkleri | Başsağlığı Çelenkleri | Çelenk Diyarı",
    seoDescription: "Cenaze çelenkleri ve başsağlığı çelenkleri için profesyonel hizmet. Saygı ve hüznünüzü en güzel şekilde yansıtan çelenkler. Hızlı teslimat.",
    status: "published",
    featured: true,
    author: "Çelenk Diyarı"
  },
  {
    title: "Ferforje Çelenkleri: Zarif ve Dayanıklı Tasarım",
    content: `Ferforje çelenkleri, geleneksel çelenklerden farklı olarak metal işçiliği ile hazırlanan özel tasarım çelenklerdir. Bu çelenkler, hem estetik görünümleri hem de dayanıklı yapıları ile öne çıkar.

## Ferforje Çelenklerinin Özellikleri

Ferforje çelenkleri, demir veya çelik malzemeden yapılan ve üzerine çiçekler yerleştirilen özel tasarım çelenklerdir. Bu çelenkler:
- Uzun ömürlüdür
- Dayanıklıdır
- Estetik görünüme sahiptir
- Özel tasarım yapılabilir
- Tekrar kullanılabilir

## Ferforje Çelenklerinin Kullanım Alanları

Ferforje çelenkleri çeşitli alanlarda kullanılabilir:
- Açılış törenleri
- Düğün ve nişan törenleri
- Özel etkinlikler
- Kurumsal organizasyonlar
- Kalıcı dekorasyon amaçlı kullanım

## Ferforje Çelenk Tasarımları

### 1. Klasik Ferforje Çelenkler
Klasik ferforje çelenkler, geleneksel desenlerle hazırlanır. Zarif kıvrımlar ve özenli işçilik ile öne çıkar.

### 2. Modern Ferforje Çelenkler
Modern ferforje çelenkler, çağdaş tasarım anlayışı ile hazırlanır. Minimalist yaklaşım ve geometrik desenler kullanılır.

### 3. Kişiselleştirilmiş Ferforje Çelenkler
İstediğiniz tasarım ve boyutta ferforje çelenkler hazırlanabilir. Logo veya özel desenler eklenebilir.

## Ferforje Çelenklerinde Çiçek Seçimi

Ferforje çelenklerde genellikle şu çiçekler kullanılır:
- Güller (kırmızı, beyaz, pembe)
- Karanfiller
- Lale
- Zambak
- Orkide

## Ferforje Çelenklerinin Bakımı

Ferforje çelenklerinin uzun ömürlü olması için:
- Düzenli olarak temizleyin
- Paslanmayı önlemek için koruyucu kaplama yapın
- Çiçekleri düzenli olarak değiştirin
- Nemli ortamlardan uzak tutun

## Ferforje Çelenklerinin Avantajları

1. **Dayanıklılık**: Metal yapısı sayesinde uzun yıllar kullanılabilir
2. **Estetik**: Zarif tasarımı ile her ortama uyum sağlar
3. **Özelleştirme**: İstediğiniz tasarım ve boyutta yapılabilir
4. **Ekonomik**: Tekrar kullanılabilir olduğu için ekonomiktir
5. **Profesyonel Görünüm**: Kurumsal etkinlikler için idealdir

## Profesyonel Ferforje Çelenk Hizmeti

Çelenk Diyarı olarak, ferforje çelenkleriniz için profesyonel hizmet sunuyoruz. Deneyimli ustalarımız, özel tasarım ferforje çelenkler hazırlar. İstanbul ve tüm Türkiye'ye ferforje çelenk teslimatı yapıyoruz.

Ferforje çelenkleriniz için bizimle iletişime geçin ve zarif tasarım çelenklerimizden yararlanın.`,
    excerpt: "Ferforje çelenkleri, metal işçiliği ile hazırlanan özel tasarım çelenklerdir. Hem estetik görünümleri hem de dayanıklı yapıları ile öne çıkar.",
    category: "Ferforjeler",
    tags: ["ferforje çelenkleri", "metal çelenkler", "demir çelenkler", "özel tasarım çelenkler", "dayanıklı çelenkler", "dekorasyon"],
    seoTitle: "Ferforje Çelenkleri | Metal Çelenkler | Özel Tasarım Çelenkler",
    seoDescription: "Ferforje çelenkleri ve metal çelenkler için profesyonel hizmet. Zarif tasarım, dayanıklı yapı. Özel tasarım ferforje çelenkler. Hızlı teslimat.",
    status: "published",
    featured: false,
    author: "Çelenk Diyarı"
  },
  {
    title: "Fuar ve Stand Çelenkleri: Etkinliğinizi Öne Çıkarın",
    content: `Fuar ve stand çelenkleri, işletmenizin fuar veya sergi standında dikkat çekmenizi sağlayan önemli dekorasyon öğeleridir. Doğru seçilmiş çelenkler, standınızın profesyonel görünümünü artırır ve ziyaretçilerin dikkatini çeker.

## Fuar Çelenklerinin Önemi

Fuar çelenkleri, işletmenizin fuar standında kullanılan özel tasarım çelenklerdir. Bu çelenkler:
- Standınızın görsel çekiciliğini artırır
- Profesyonel bir imaj yaratır
- Marka kimliğinizi yansıtır
- Ziyaretçilerin dikkatini çeker
- Olumlu bir atmosfer yaratır

## Stand Çelenklerinin Kullanımı

Stand çelenkleri, fuar veya sergi standlarında çeşitli şekillerde kullanılabilir:
- Stand girişinde karşılama çelenkleri
- Stand içi dekorasyon çelenkleri
- Masalar üzerinde küçük çelenkler
- Duvar dekorasyonu için çelenkler
- Marka renklerine uygun çelenkler

## Fuar Çelenk Tasarımları

### 1. Karşılama Çelenkleri
Fuar standının girişinde kullanılan büyük çelenklerdir. Ziyaretçileri karşılar ve hoş bir ilk izlenim yaratır.

### 2. Dekorasyon Çelenkleri
Stand içinde kullanılan dekoratif çelenklerdir. Standın genel görünümünü zenginleştirir.

### 3. Masalık Çelenkler
Stand masaları üzerinde kullanılan küçük çelenklerdir. Zarif bir görünüm sağlar.

## Fuar Çelenklerinde Renk Seçimi

Fuar çelenklerinde genellikle şu renkler tercih edilir:
- **Marka Renkleri**: İşletmenizin marka renklerine uygun çelenkler
- **Canlı Renkler**: Dikkat çekici canlı renkler
- **Klasik Renkler**: Profesyonel görünüm için klasik renkler
- **Tema Renkleri**: Fuar temasına uygun renkler

## Fuar Çelenklerinin Bakımı

Fuar süresince çelenklerin taze kalması için:
- Düzenli olarak su verin
- Serin bir ortamda saklayın
- Doğrudan güneş ışığından uzak tutun
- Gerekirse çiçekleri yenileyin

## Fuar Çelenklerinin Avantajları

1. **Dikkat Çekicilik**: Standınızın dikkat çekmesini sağlar
2. **Profesyonel Görünüm**: Kurumsal bir imaj yaratır
3. **Marka Kimliği**: Marka renklerinizi yansıtır
4. **Pozitif Atmosfer**: Olumlu bir ortam yaratır
5. **Ziyaretçi Etkileşimi**: Ziyaretçilerin standınıza ilgisini artırır

## Profesyonel Fuar Çelenk Hizmeti

Çelenk Diyarı olarak, fuar ve stand çelenkleriniz için profesyonel hizmet sunuyoruz. Deneyimli ekibimiz, fuar standınıza uygun özel tasarım çelenkler hazırlar. İstanbul ve tüm Türkiye'ye fuar çelenk teslimatı yapıyoruz.

Fuar çelenkleriniz için bizimle iletişime geçin ve etkinliğinizi öne çıkarın.`,
    excerpt: "Fuar ve stand çelenkleri, işletmenizin fuar standında dikkat çekmenizi sağlayan önemli dekorasyon öğeleridir. Profesyonel görünüm ve dikkat çekicilik sağlar.",
    category: "Fuar & Stand",
    tags: ["fuar çelenkleri", "stand çelenkleri", "sergi çelenkleri", "fuar dekorasyonu", "etkinlik çelenkleri", "etkinlik"],
    seoTitle: "Fuar ve Stand Çelenkleri | Fuar Dekorasyonu | Çelenk Diyarı",
    seoDescription: "Fuar ve stand çelenkleri için profesyonel hizmet. Fuar dekorasyonu, stand çelenkleri. Marka kimliğinize uygun özel tasarım çelenkler. Hızlı teslimat.",
    status: "published",
    featured: false,
    author: "Çelenk Diyarı"
  },
  {
    title: "Ofis ve Saksı Bitkileri: Çalışma Ortamınızı Yeşillendirin",
    content: `Ofis ve saksı bitkileri, çalışma ortamınızı yeşillendirerek hem estetik bir görünüm hem de sağlıklı bir atmosfer yaratır. Doğru seçilmiş bitkiler, ofis ortamınızı daha canlı ve verimli hale getirir.

## Ofis Bitkilerinin Faydaları

Ofis bitkileri, çalışma ortamınıza birçok fayda sağlar:
- **Hava Kalitesi**: Havayı temizler ve oksijen üretir
- **Stres Azaltma**: Çalışanların stres seviyesini düşürür
- **Verimlilik Artışı**: Çalışma verimliliğini artırır
- **Estetik Görünüm**: Ofis ortamını güzelleştirir
- **Pozitif Atmosfer**: Olumlu bir çalışma ortamı yaratır

## Ofis İçin Uygun Bitki Türleri

### 1. Düşük Bakım Gerektiren Bitkiler
- **Kaktüs**: Az su ister, güneş sever
- **Sukulent**: Bakımı kolay, dekoratif
- **Sansevieria**: Hava temizleyici, dayanıklı
- **Pothos**: Hızlı büyür, kolay bakım

### 2. Hava Temizleyici Bitkiler
- **Aloe Vera**: Havayı temizler, şifalı
- **Spathiphyllum**: Güçlü hava temizleyici
- **Dracaena**: Formaldehit temizler
- **Ficus**: Büyük yapraklı, etkili temizleyici

### 3. Dekoratif Bitkiler
- **Orkide**: Zarif ve şık görünüm
- **Bromeliad**: Tropikal görünüm
- **Calathea**: Renkli yapraklar
- **Monstera**: Büyük yapraklı, modern

## Saksı Bitkilerinin Seçimi

Saksı bitkileri seçerken dikkat edilmesi gerekenler:
- **Ofis Işığı**: Ofis ışık koşullarına uygun bitkiler seçin
- **Bakım Kolaylığı**: Az bakım gerektiren bitkiler tercih edin
- **Boyut**: Ofis alanınıza uygun boyutta bitkiler seçin
- **Toksik Olmayan**: Ofis ortamında güvenli bitkiler seçin

## Ofis Bitkilerinin Bakımı

Ofis bitkilerinin sağlıklı kalması için:
- Düzenli sulama yapın
- Yeterli ışık almasını sağlayın
- Yaprakları düzenli temizleyin
- Gerekirse gübre verin
- Hastalık ve zararlılara dikkat edin

## Ofis Bitkilerinin Yerleştirilmesi

Ofis bitkilerini yerleştirirken:
- Masalar üzerinde küçük bitkiler
- Köşelerde büyük bitkiler
- Pencereler yanında ışık seven bitkiler
- Toplantı odalarında dekoratif bitkiler
- Resepsiyon alanında karşılama bitkileri

## Saksı Seçimi

Saksı seçerken:
- Ofis dekorasyonuna uygun renk ve tasarım
- Drenaj delikli saksılar
- Uygun boyut seçimi
- Modern ve şık görünüm

## Profesyonel Ofis Bitkisi Hizmeti

Çelenk Diyarı olarak, ofis ve saksı bitkileriniz için profesyonel hizmet sunuyoruz. Deneyimli ekibimiz, ofis ortamınıza uygun bitkiler seçer ve düzenli bakım hizmeti sağlar. İstanbul ve tüm Türkiye'ye ofis bitkisi teslimatı yapıyoruz.

Ofis bitkileriniz için bizimle iletişime geçin ve çalışma ortamınızı yeşillendirin.`,
    excerpt: "Ofis ve saksı bitkileri, çalışma ortamınızı yeşillendirerek hem estetik bir görünüm hem de sağlıklı bir atmosfer yaratır.",
    category: "Ofis & Saksı Bitkileri",
    tags: ["ofis bitkileri", "saksı bitkileri", "iç mekan bitkileri", "ofis dekorasyonu", "hava temizleyici bitkiler", "bahçıvanlık"],
    seoTitle: "Ofis ve Saksı Bitkileri | İç Mekan Bitkileri | Çelenk Diyarı",
    seoDescription: "Ofis ve saksı bitkileri için profesyonel hizmet. Hava temizleyici bitkiler, ofis dekorasyonu. Bakım kolaylığı ve estetik görünüm. Hızlı teslimat.",
    status: "published",
    featured: false,
    author: "Çelenk Diyarı"
  },
  {
    title: "Söz ve Nişan Çelenkleri: Aşkınızı Çiçeklerle İfade Edin",
    content: `Söz ve nişan çelenkleri, hayatınızın en özel anlarını çiçeklerle taçlandırmanın en güzel yoludur. Bu özel günlerde sevdiklerinize duyduğunuz aşkı ve mutluluğu en güzel şekilde ifade eden çelenkler, unutulmaz anılar yaratır.

## Söz ve Nişan Çelenklerinin Anlamı

Söz ve nişan çelenkleri, evlilik yolculuğunun ilk adımlarını kutlamak için kullanılan özel tasarım çelenklerdir. Bu çelenkler:
- Aşkı ve mutluluğu ifade eder
- Özel günün anlamını vurgular
- Dekoratif bir görünüm sağlar
- Anıları ölümsüzleştirir
- Sevdiklerinizi mutlu eder

## Söz Çelenkleri

Söz çelenkleri, nişan öncesi söz törenlerinde kullanılan çelenklerdir. Genellikle:
- Pembe ve kırmızı tonlarında hazırlanır
- Kalp şeklinde tasarlanabilir
- Kişiselleştirilebilir
- Romantik bir görünüm sağlar

## Nişan Çelenkleri

Nişan çelenkleri, nişan törenlerinde kullanılan özel çelenklerdir. Genellikle:
- Beyaz ve krem tonlarında hazırlanır
- Zarif ve şık tasarımlar
- Nişan yüzüğü ile uyumlu
- Tören dekorasyonuna uygun

## Söz ve Nişan Çelenklerinde Renk Seçimi

Söz ve nişan çelenklerinde genellikle şu renkler tercih edilir:
- **Pembe**: Aşk ve romantizm ifade eder
- **Kırmızı**: Tutkulu aşk ifade eder
- **Beyaz**: Saflık ve temizlik ifade eder
- **Krem**: Zarafet ve şıklık ifade eder
- **Mor**: Asalet ve lüks ifade eder

## Söz ve Nişan Çelenk Tasarımları

### 1. Klasik Tasarımlar
Klasik söz ve nişan çelenkleri, geleneksel çiçek düzenlemeleri ile hazırlanır. Zarif ve şık görünüm sağlar.

### 2. Modern Tasarımlar
Modern söz ve nişan çelenkleri, çağdaş çiçek düzenlemeleri ile hazırlanır. Minimalist ve şık tasarımlar öne çıkar.

### 3. Kişiselleştirilmiş Tasarımlar
Çiftin zevklerine ve tercihlerine göre özel tasarım çelenkler hazırlanabilir.

## Söz ve Nişan Çelenklerinde Çiçek Seçimi

Söz ve nişan çelenklerinde genellikle şu çiçekler kullanılır:
- **Güller**: Aşk ve romantizm sembolü
- **Orkide**: Zarafet ve şıklık
- **Lale**: Aşk ve mutluluk
- **Zambak**: Saflık ve temizlik
- **Karanfil**: Aşk ve bağlılık

## Söz ve Nişan Çelenklerinin Kullanımı

Söz ve nişan çelenkleri çeşitli şekillerde kullanılabilir:
- Tören masası dekorasyonu
- Giriş karşılama çelenkleri
- Duvar dekorasyonu
- Kişisel hediye çelenkleri
- Fotoğraf çekimi için çelenkler

## Profesyonel Söz ve Nişan Çelenk Hizmeti

Çelenk Diyarı olarak, söz ve nişan çelenkleriniz için özel hizmet sunuyoruz. Deneyimli ekibimiz, hayatınızın en özel anlarını çiçeklerle taçlandıran çelenkler hazırlar. İstanbul ve tüm Türkiye'ye söz ve nişan çelenk teslimatı yapıyoruz.

Söz ve nişan çelenkleriniz için bizimle iletişime geçin ve aşkınızı çiçeklerle ifade edin.`,
    excerpt: "Söz ve nişan çelenkleri, hayatınızın en özel anlarını çiçeklerle taçlandırmanın en güzel yoludur. Aşkınızı ve mutluluğunuzu en güzel şekilde ifade eder.",
    category: "Söz & Nişan",
    tags: ["söz çelenkleri", "nişan çelenkleri", "düğün çelenkleri", "romantik çelenkler", "özel gün çelenkleri", "etkinlik"],
    seoTitle: "Söz ve Nişan Çelenkleri | Düğün Çelenkleri | Çelenk Diyarı",
    seoDescription: "Söz ve nişan çelenkleri için özel hizmet. Romantik çelenkler, düğün çelenkleri. Özel günleriniz için özel tasarım çelenkler. Hızlı teslimat.",
    status: "published",
    featured: true,
    author: "Çelenk Diyarı"
  },
  {
    title: "Çiçek Bakımı: Çelenklerinizin Uzun Süre Taze Kalması İçin İpuçları",
    content: `Çelenklerinizin uzun süre taze ve güzel kalması için doğru bakım çok önemlidir. Bu yazıda çelenk bakımı hakkında bilmeniz gerekenleri bulacaksınız.

## Çelenk Bakımının Önemi

Doğru bakım ile:
- Çelenkleriniz daha uzun süre taze kalır
- Görünümleri bozulmaz
- Değerleri korunur
- Etkileri artar

## Çelenk Bakım İpuçları

### 1. Su ve Nem
- Düzenli su verme
- Uygun nem seviyesi
- Fazla sudan kaçınma
- Temiz su kullanma

### 2. Sıcaklık Kontrolü
- Direkt güneş ışığından uzak tutma
- Aşırı sıcak ortamlardan kaçınma
- Uygun sıcaklık aralığı (18-22°C)
- Hava akışı sağlama

### 3. Temizlik
- Düzenli toz alma
- Solmuş çiçekleri temizleme
- Yaprak bakımı
- Genel görünüm kontrolü

### 4. Konumlandırma
- Uygun yükseklik
- Görünür konum
- Güvenli yerleşim
- Erişilebilir alan

## Çelenk Bakım Hataları

1. **Fazla Sulama**: Çürümeye neden olur
2. **Yetersiz Su**: Solmaya neden olur
3. **Direkt Güneş**: Hızlı solmaya neden olur
4. **Aşırı Sıcak**: Çiçeklerin bozulmasına neden olur

## Profesyonel Bakım Hizmeti

Çelenk Diyarı olarak, profesyonel bakım hizmeti sunuyoruz:
- Düzenli bakım ziyaretleri
- Uzman bakım tavsiyeleri
- Acil müdahale hizmeti
- Bakım paketleri

## Sonuç

Doğru bakım ile çelenkleriniz uzun süre taze ve güzel kalır. Çelenk Diyarı olarak, çelenk bakımı konusunda size yardımcı oluyoruz.`,
    excerpt: "Çelenklerinizin uzun süre taze ve güzel kalması için doğru bakım çok önemlidir. Bu yazıda çelenk bakımı hakkında bilmeniz gerekenleri bulacaksınız.",
    category: "Çiçek Bakımı",
    tags: ["çelenk bakımı", "çiçek bakımı", "çelenk", "bakım ipuçları", "çelenk nasıl bakılır"],
    seoTitle: "Çelenk Bakımı: Taze ve Güzel Kalması İçin İpuçları | Çelenk Diyarı",
    seoDescription: "Çelenk bakımı hakkında bilgi. Çelenklerin taze kalması için bakım ipuçları ve öneriler. Profesyonel çelenk bakım hizmeti.",
    status: "published",
    featured: false,
    author: "Çelenk Diyarı"
  },
  {
    title: "Ev Dekorasyonunda Çelenkler: Modern ve Şık Tasarım Fikirleri",
    content: `Çelenkler, ev dekorasyonunda hem estetik hem de anlamlı bir yer tutar. Doğru seçilmiş çelenkler, evinizin atmosferini zenginleştirir ve yaşam alanınıza doğal bir dokunuş katar.

## Ev Dekorasyonunda Çelenk Kullanımı

Çelenkler ev dekorasyonunda:
- Doğal bir görünüm sağlar
- Hava kalitesini iyileştirir
- Renk ve canlılık katar
- Odaları ferahlatır
- Dekoratif bir unsur olarak kullanılır

## Çelenk Dekorasyon Fikirleri

### 1. Giriş Holü
Giriş holünde büyük bir çelenk, misafirlerinizi karşılar ve hoş bir ilk izlenim yaratır.

### 2. Oturma Odası
Oturma odasında zarif çelenkler, rahatlatıcı bir atmosfer yaratır.

### 3. Yemek Odası
Yemek masası üzerinde küçük çelenkler, sofraya şıklık katar.

### 4. Yatak Odası
Yatak odasında sakin renkli çelenkler, huzurlu bir ortam yaratır.

## Çelenk Seçimi İpuçları

- Oda büyüklüğüne uygun çelenk seçin
- Renk paletine uyumlu çelenkler tercih edin
- Bakım kolaylığı için dayanıklı çiçekler seçin
- Mevsimsel çelenkler kullanın

## Profesyonel Dekorasyon Hizmeti

Çelenk Diyarı olarak, ev dekorasyonunuz için profesyonel çelenk hizmeti sunuyoruz. Deneyimli ekibimiz, evinizin stiline uygun çelenkler seçer ve düzenli bakım hizmeti sağlar.

Ev dekorasyonunuz için bizimle iletişime geçin ve yaşam alanınızı çelenklerle zenginleştirin.`,
    excerpt: "Çelenkler, ev dekorasyonunda hem estetik hem de anlamlı bir yer tutar. Doğru seçilmiş çelenkler, evinizin atmosferini zenginleştirir.",
    category: "Dekorasyon",
    tags: ["ev dekorasyonu", "çelenk dekorasyonu", "iç mekan dekorasyonu", "dekorasyon", "çelenk"],
    seoTitle: "Ev Dekorasyonunda Çelenkler: Modern ve Şık Tasarım Fikirleri | Çelenk Diyarı",
    seoDescription: "Ev dekorasyonunda çelenk kullanımı ve tasarım fikirleri. Modern ve şık dekorasyon için çelenk seçimi. Profesyonel dekorasyon hizmeti.",
    status: "published",
    featured: false,
    author: "Çelenk Diyarı"
  },
  {
    title: "Özel Etkinliklerde Çelenk Kullanımı: Unutulmaz Anlar İçin",
    content: `Özel etkinliklerde çelenkler, atmosferi zenginleştiren ve anlam katan önemli dekorasyon öğeleridir. Doğum günleri, yıldönümleri, mezuniyet törenleri ve diğer özel günlerde çelenkler, etkinliğinizi unutulmaz kılar.

## Etkinlik Çelenklerinin Önemi

Özel etkinliklerde çelenkler:
- Etkinliğin atmosferini zenginleştirir
- Misafirlerinizi karşılar ve hoş bir izlenim yaratır
- Tema ve renk paletine uyum sağlar
- Fotoğraf çekimleri için mükemmel bir arka plan oluşturur
- Özel günün anlamını vurgular

## Etkinlik Türlerine Göre Çelenk Seçimi

### 1. Doğum Günü Etkinlikleri
Doğum günü çelenkleri, renkli ve neşeli olmalıdır. Canlı renkler, balonlar ve dekoratif öğelerle zenginleştirilebilir.

### 2. Yıldönümü Törenleri
Yıldönümü çelenkleri, romantik ve zarif olmalıdır. Gül, orkide ve lale gibi çiçekler tercih edilir.

### 3. Mezuniyet Törenleri
Mezuniyet çelenkleri, başarıyı ve gururu yansıtmalıdır. Altın ve beyaz tonlarında çelenkler popülerdir.

### 4. Kurumsal Etkinlikler
Kurumsal etkinliklerde çelenkler, profesyonel ve şık olmalıdır. Marka renklerine uygun çelenkler tercih edilir.

### 5. Düğün ve Nişan Törenleri
Düğün çelenkleri, zarif ve romantik olmalıdır. Beyaz, krem ve pastel tonlarında çelenkler kullanılır.

## Etkinlik Çelenklerinde Renk Seçimi

Etkinlik çelenklerinde renk seçimi çok önemlidir:
- **Canlı Renkler**: Neşeli ve enerjik etkinlikler için
- **Pastel Tonlar**: Zarif ve romantik etkinlikler için
- **Klasik Renkler**: Profesyonel ve resmi etkinlikler için
- **Tema Renkleri**: Etkinlik temasına uygun renkler

## Etkinlik Çelenklerinin Yerleştirilmesi

Etkinlik çelenklerini yerleştirirken:
- Giriş kapısında karşılama çelenkleri
- Tören masası dekorasyonu
- Duvar dekorasyonu
- Fotoğraf çekim alanları
- Misafir masaları üzerinde küçük çelenkler

## Etkinlik Çelenklerinin Bakımı

Etkinlik süresince çelenklerin taze kalması için:
- Düzenli olarak su verin
- Serin bir ortamda saklayın
- Doğrudan güneş ışığından uzak tutun
- Etkinlik öncesi teslim alın

## Etkinlik Çelenklerinin Avantajları

1. **Atmosfer Yaratma**: Etkinliğin atmosferini zenginleştirir
2. **Görsel Çekicilik**: Etkinliğin görsel çekiciliğini artırır
3. **Fotoğraf Çekimi**: Mükemmel fotoğraf arka planları oluşturur
4. **Misafir Karşılama**: Misafirlerinizi hoş bir şekilde karşılar
5. **Anlam Katma**: Özel günün anlamını vurgular

## Profesyonel Etkinlik Çelenk Hizmeti

Çelenk Diyarı olarak, özel etkinlikleriniz için profesyonel çelenk hizmeti sunuyoruz. Deneyimli ekibimiz, etkinliğinizin temasına ve stiline uygun özel tasarım çelenkler hazırlar. İstanbul ve tüm Türkiye'ye etkinlik çelenk teslimatı yapıyoruz.

Özel etkinlikleriniz için bizimle iletişime geçin ve unutulmaz anlar yaratın.`,
    excerpt: "Özel etkinliklerde çelenkler, atmosferi zenginleştiren ve anlam katan önemli dekorasyon öğeleridir. Doğum günleri, yıldönümleri ve diğer özel günlerde çelenkler, etkinliğinizi unutulmaz kılar.",
    category: "Etkinlik",
    tags: ["etkinlik çelenkleri", "özel gün çelenkleri", "doğum günü çelenkleri", "yıldönümü çelenkleri", "mezuniyet çelenkleri", "etkinlik dekorasyonu"],
    seoTitle: "Özel Etkinliklerde Çelenk Kullanımı | Etkinlik Çelenkleri | Çelenk Diyarı",
    seoDescription: "Özel etkinliklerde çelenk kullanımı ve tasarım fikirleri. Doğum günü, yıldönümü, mezuniyet çelenkleri. Profesyonel etkinlik çelenk hizmeti. Hızlı teslimat.",
    status: "published",
    featured: false,
    author: "Çelenk Diyarı"
  }
];

// Production API URL
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.celenkdiyari.com';

async function addBlogPosts() {
  console.log('📝 Blog yazıları API\'ye ekleniyor...\n');
  console.log(`API URL: ${API_URL}/api/blog\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i];
    
    try {
      // Slug oluştur
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      const postData = {
        ...post,
        slug,
        author: post.author || 'Çelenk Diyarı',
        readingTime: Math.ceil(post.content.split(' ').length / 200),
        wordCount: post.content.split(' ').length
      };
      
      const response = await fetch(`${API_URL}/api/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const data = await response.json();
        successCount++;
        console.log(`✅ [${i + 1}/${blogPosts.length}] ${post.title}`);
        console.log(`   Kategori: ${post.category}`);
        console.log(`   Slug: ${slug}\n`);
      } else {
        const error = await response.text();
        errorCount++;
        console.error(`❌ [${i + 1}/${blogPosts.length}] Hata: ${post.title}`);
        console.error(`   Status: ${response.status}`);
        console.error(`   ${error}\n`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/${blogPosts.length}] Hata: ${post.title}`);
      console.error(`   ${error.message}\n`);
    }
    
    // API'yi yormamak için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 İşlem tamamlandı!');
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Hatalı: ${errorCount}`);
  console.log(`📊 Toplam: ${blogPosts.length}`);
}

// Script'i çalıştır
addBlogPosts().catch(console.error);

