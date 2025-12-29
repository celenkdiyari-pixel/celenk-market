# SİSTEM ANALİZİ VE TEKNİK DENETİM RAPORU

**Hazırlayan:** Senior Software Auditor, System Analyst & QA Lead
**Proje:** Çelenk Diyarı (E-ticaret Platformu)
**Durum:** Kritik Analiz & Risk Tespiti
**Tarih:** 29 Aralık 2025

---

## 📋 ANALİZ ÖZETİ

Bu rapor, Çelenk Diyarı projesinin mimari bütünlüğü, veri akışı, ödeme entegrasyonları ve sistem stabilitesi üzerine yapılan derinlemesine teknik inceleme sonucunda hazırlanmıştır. Raporun amacı, "happy path" (sorunsuz akış) dışında kalan, sistemin sessizce başarısız olabileceği veya ölçeklenme sırasında darboğaz yaratacağı noktaları raporlamaktır.

HİÇBİR KOD DÜZELTMESİ YAPILMAMIŞTIR, SADECE TESPİTLER SUNULMUŞTUR.

---

## 1️⃣ GENEL MİMARİ TUTARLILIK

### 🔴 Veritabanı Erişim Stratejisi Tekrarı ve Kaynak Tüketimi
- **📍 Nerede:** `src/app/api/orders/route.ts`, `src/app/api/payments/paytr/callback/route.ts`
- **⚠️ Risk Seviyesi:** Medium
- **🧠 Neden riskli:** `getDbStrategy` fonksiyonu her API çağrısında `firebase-admin` modülünü dinamik olarak import etmeye çalışıyor. Bu durum, özellikle yüksek trafikli anlarda "Cold Start" sürelerini uzatır ve gereksiz CPU/Memory yükü oluşturur.
- **🔗 Etkilediği diğer alanlar:** API performans hızı, kullanıcı ödeme deneyimi.

### 🔴 Dağınık İş Mantığı (Logic Fragmentation)
- **📍 Nerede:** `src/app/cart/page.tsx` ve `src/app/api/orders/route.ts`
- **⚠️ Risk Seviyesi:** Medium
- **🧠 Neden riskli:** Sipariş numarası üretme mantığı hem Frontend tarafında (`Math.random()`) hem de Backend tarafında (`POST` endpoint) ayrı ayrı tanımlanmış. İleride numara formatı değişirse iki tarafın senkronizasyonu kopacaktır.
- **🔗 Etkilediği diğer alanlar:** Sipariş takibi, veritabanı tutarlılığı.

---

## 2️⃣ FRONTEND UYUMLULUK ANALİZİ

### 🔴 Kritik Kayıt Kaybı Riski (State Loss)
- **📍 Nerede:** `src/app/cart/page.tsx` (PayTR Iframe Flow)
- **⚠️ Risk Seviyesi:** High
- **🧠 Neden riskli:** PayTR ödeme sayfasına geçildiğinde sepet verileri sadece `CartContext` (bellek) üzerinde tutuluyor. Eğer kullanıcı ödeme sayfasındayken sayfayı yenilerse veya tarayıcı sekmeyi kaparsa, sipariş bilgileri kalıcı bir taslağa dönüşmediği için kullanıcı verileri kaybolur.
- **🔗 Etkilediği diğer alanlar:** Dönüşüm oranları (Conversion Rate), müşteri memnuniyeti.

### 🔴 Sipariş Numarası Çakışma Riski (Collision Risk)
- **📍 Nerede:** `generateOrderNumber` fonksiyonu
- **⚠️ Risk Seviyesi:** High
- **🧠 Neden riskli:** Sipariş numaraları 4 haneli rastgele sayılarla (`1000-9999`) üretiliyor. Toplamda sadece 9000 olasılık var. Bir günde veya kısa sürede gelen siparişlerde numara çakışması kaçınılmazdır. Bu durum Firestore'da yanlış siparişin üzerine yazılmasına yol açabilir.
- **🔗 Etkilediği diğer alanlar:** Firestore veri tabanı, Admin paneli, sipariş sorgulama.

---

## 3️⃣ ADMIN PANEL ↔ SİTE UYUMU

### 🔴 Kategori Tanım Uyuşmazlığı (Slug vs Title)
- **📍 Nerede:** `src/lib/get-products.ts` ve `src/lib/constants.ts`
- **⚠️ Risk Seviyesi:** Medium
- **🧠 Neden riskli:** Admin panelinde ürünler "Açılış & Tören" gibi tam başlıklarla kaydedilirken, site tarafında bazı yerlerde sluglar (`acilis-toren`) üzerinden sorgulama yapılıyor. Mimari olarak "Source of Truth" (Gerçeklik Kaynağı) belirsiz.
- **🔗 Etkilediği diğer alanlar:** SEO, ürün filtreleme.

---

## 4️⃣ İŞ AKIŞLARI (ORDER WORKFLOW)

### 🔴 Ödeme Onayı ve Sipariş Oluşturma - Atomiklik Eksikliği
- **📍 Nerede:** `src/app/api/payments/paytr/callback/route.ts`
- **⚠️ Risk Seviyesi:** High
- **🧠 Neden riskli:** PayTR callback geldiğinde db yazma işlemi sırasında hata oluşursa PayTR'a "OK" dönülüyor ama sipariş kaydedilmemiş oluyor. Para çekilir ama sipariş Admin panelinde gözükmez. "Successful checkout, missing order" senaryosuna çok açık.
- **🔗 Etkilediği diğer alanlar:** Finansal mutabakat, müşteri mağduriyeti.

---

## 5️⃣ FIRESTORE / DATABASE RİSKLERİ

### 🔴 Kontrolsüz Filtreleme ve İndeks Maliyetleri
- **📍 Nerede:** `getProductsByCategory` içindeki çoklu `where` sorguları.
- **⚠️ Risk Seviyesi:** Medium
- **🧠 Neden riskli:** Ürünleri hem ana kategori hem de alt kategorilerde aramak için aynı anda iki farklı query çalıştırılıyor. Bu durum veritabanı okuma sayısını (read quota) ikiye katlar.
- **🔗 Etkilediği diğer alanlar:** Firebase bütçesi, sayfa yükleme hızı.

---

## 6️⃣ ENTEGRASYON ANALİZİ

### 🔴 Mail Tetikleme Mekanizmasında "Double-Hop" Riski
- **📍 Nerede:** `callback/route.ts` (Line 203)
- **⚠️ Risk Seviyesi:** Low
- **🧠 Neden riskli:** Callback fonksiyonu içerisinden kendi `/api/email` endpoint'ine `fetch` atılıyor. Mail gönderimi başarısız olduğunda sistem sessizce fail ediyor (Silent Failure).
- **🔗 Etkilediği diğer alanlar:** Operasyonel takip, müşteri bilgilendirme.

---

## 7️⃣ EDGE CASE & KULLANICI DAVRANIŞI

### 🔴 Mükerrer Sipariş (Idempotency) Sorunu
- **📍 Nerede:** `src/app/cart/page.tsx` -> `handleSubmitOrder`
- **⚠️ Risk Seviyesi:** Medium
- **🧠 Neden riskli:** Kullanıcı "Siparişi Tamamla" butonuna hızlıca iki kez basarsa veya request bitmeden sayfayı yenilerse mükerrer sipariş oluşur. Kontrol mekanizması bulunmamaktadır.
- **🔗 Etkilediği diğer alanlar:** Stok yönetimi, sipariş listesi kirliliği.

---

## 🏁 SONUÇ VE GENEL DEĞERLENDİRME

### A) En Kritik 5 Sistemsel Problem
1. **Sipariş Numarası Zayıflığı:** 4 hane çakışma riski çok yüksek.
2. **Atomik İşlem Eksikliği:** Ödeme başarısı ile sipariş kaydının kopukluğu.
3. **State Yönetimi:** Iframe geçişlerinde veri korumasızlığı.
4. **Admin SDK Bağımlılığı:** Her istekte dinamik import maliyeti.
5. **Hata Yönetimi:** Kritik adımlarda catch-all olmayan loglama yapısı.

### B) En Çok Zincirleme Hata Üreten Noktalar
- `orderNumber` üretimi ve PayTR callback süreci.

### C) “Şu an çalışıyor gibi ama riskli” Alanlar
- **Email API:** İç içe `fetch` çağrıları.
- **PayTRMerchantOID:** Alfasayısal temizlik sırasında referans kaybı riski.

### D) Genel Stabilite Değerlendirmesi: **%65**
### E) Projenin Teknik Borç Seviyesi: **Yüksek**

---
*Bu rapor sistemin mevcut durumunu yansıtmakta olup, geliştirme ekipleri için bir iyileştirme yol haritası niteliğindedir.*
