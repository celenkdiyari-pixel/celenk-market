# EmailJS Template Düzenleme Rehberi

## Hızlı Başlangıç

EmailJS dashboard'unda template'leri düzenlemek için:
1. https://dashboard.emailjs.com/admin/templates adresine gidin
2. Customer Order Template (template_t6bsxpr) veya Admin Order Template (template_zel5ngx) seçin
3. "Content" sekmesine tıklayın
4. "Edit Content" butonuna tıklayın
5. Subject ve Message alanlarını aşağıdaki içeriklerle değiştirin
6. "Save" butonuna tıklayın

## Kodda Gönderilen Template Parametreleri

### Customer Order Template (template_t6bsxpr)

Kodda gönderilen parametreler:
- `order_number` - Sipariş numarası (örn: ORD-1234567890-ABCD)
- `customer_name` - Müşteri adı soyadı (örn: Ahmet Yılmaz)
- `items` - Ürün listesi (her satır: "- Ürün Adı (Varyant) x2 = 100.00 ₺")
- `subtotal` - Ara toplam (örn: "150.00")
- `shipping_cost` - Kargo ücreti (örn: "25.00")
- `total` - Toplam tutar (örn: "175.00")
- `payment_method` - Ödeme yöntemi (Kapıda Ödeme, Kredi Kartı, Havale/EFT)
- `address` - Adres bilgisi (örn: "Atatürk Cad. No:123, Kadıköy, İstanbul - 34000")
- `phone` - Telefon numarası
- `notes` - Notlar (yoksa "Yok")
- `order_date` - Sipariş tarihi (örn: "11 Aralık 2025, 20:15")
- `to_email` - Alıcı email (EmailJS tarafından otomatik eklenir)
- `subject` - Email konusu (EmailJS tarafından otomatik eklenir)

### Admin Order Template (template_zel5ngx)

Kodda gönderilen parametreler:
- `order_number` - Sipariş numarası
- `customer_name` - Müşteri adı soyadı
- `customer_email` - Müşteri email adresi
- `customer_phone` - Müşteri telefon numarası
- `items` - Ürün listesi
- `subtotal` - Ara toplam
- `shipping_cost` - Kargo ücreti
- `total` - Toplam tutar
- `payment_method` - Ödeme yöntemi
- `address` - Adres bilgisi
- `notes` - Notlar
- `order_date` - Sipariş tarihi
- `to_email` - Alıcı email (EmailJS tarafından otomatik eklenir)
- `subject` - Email konusu (EmailJS tarafından otomatik eklenir)

## EmailJS Template'lerinde Kullanılması Gereken Format

### Subject Alanı
EmailJS template'lerinde Subject alanında şu parametreler kullanılabilir:
- `{{subject}}` - Kodda gönderilen subject değeri
- Veya direkt: `Siparişiniz Alındı - {{order_number}}` (Customer için)
- Veya direkt: `Yeni Sipariş - {{order_number}}` (Admin için)

### Message/Body Alanı
EmailJS template'lerinde Message alanında şu parametreler kullanılabilir:

**Customer Template Örneği (Kopyala-Yapıştır için hazır):**

**Subject:**
```
Siparişiniz Alındı - {{order_number}}
```

**Message (HTML):**
```html
<p>Merhaba {{customer_name}},</p>

<p>Siparişiniz başarıyla alınmıştır!</p>

<h3>Sipariş No: {{order_number}}</h3>
<p><strong>Sipariş Tarihi:</strong> {{order_date}}</p>

<h4>Sipariş Detayları:</h4>
<pre>{{items}}</pre>

<p><strong>Ara Toplam:</strong> {{subtotal}} ₺</p>
<p><strong>Kargo Ücreti:</strong> {{shipping_cost}} ₺</p>
<p><strong>Toplam:</strong> {{total}} ₺</p>

<p><strong>Ödeme Yöntemi:</strong> {{payment_method}}</p>

<h4>Teslimat Adresi:</h4>
<p>{{address}}</p>

<p><strong>Telefon:</strong> {{phone}}</p>
<p><strong>Notlar:</strong> {{notes}}</p>

<p>Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.</p>

<p>Teşekkür ederiz!</p>
<p>Çelenk Diyarı Ekibi</p>
```

**Message (Düz Metin - Alternatif):**
```
Merhaba {{customer_name}},

Siparişiniz başarıyla alınmıştır!

Sipariş No: {{order_number}}
Sipariş Tarihi: {{order_date}}

Sipariş Detayları:
{{items}}

Ara Toplam: {{subtotal}} ₺
Kargo Ücreti: {{shipping_cost}} ₺
Toplam: {{total}} ₺

Ödeme Yöntemi: {{payment_method}}

Teslimat Adresi:
{{address}}

Telefon: {{phone}}
Notlar: {{notes}}

Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.

Teşekkür ederiz!
Çelenk Diyarı Ekibi
```

**Admin Template Örneği (Kopyala-Yapıştır için hazır):**

**Subject:**
```
Yeni Sipariş - {{order_number}}
```

**Message (HTML):**
```html
<p>Merhaba Admin,</p>

<p>Yeni bir sipariş alındı! Detaylar aşağıdadır:</p>

<h3>Sipariş Numarası: {{order_number}}</h3>
<p><strong>Sipariş Tarihi:</strong> {{order_date}}</p>

<h4>Müşteri Bilgileri:</h4>
<p><strong>Adı Soyadı:</strong> {{customer_name}}</p>
<p><strong>E-posta:</strong> {{customer_email}}</p>
<p><strong>Telefon:</strong> {{customer_phone}}</p>
<p><strong>Adres:</strong> {{address}}</p>
<p><strong>Notlar:</strong> {{notes}}</p>

<h4>Sipariş Detayları:</h4>
<pre>{{items}}</pre>

<p><strong>Ara Toplam:</strong> {{subtotal}} ₺</p>
<p><strong>Kargo Ücreti:</strong> {{shipping_cost}} ₺</p>
<p><strong>Toplam Tutar:</strong> {{total}} ₺</p>

<p><strong>Ödeme Yöntemi:</strong> {{payment_method}}</p>

<p>Lütfen siparişi kontrol edip gerekli işlemleri yapın.</p>

<p>Teşekkürler,</p>
<p>Çelenk Diyarı Sistemi</p>
```

**Message (Düz Metin - Alternatif):**
```
Yeni Sipariş Bildirimi

Sipariş No: {{order_number}}
Sipariş Tarihi: {{order_date}}

Müşteri Bilgileri:
Ad Soyad: {{customer_name}}
Email: {{customer_email}}
Telefon: {{customer_phone}}

Sipariş Detayları:
{{items}}

Ara Toplam: {{subtotal}} ₺
Kargo Ücreti: {{shipping_cost}} ₺
Toplam: {{total}} ₺

Ödeme Yöntemi: {{payment_method}}

Teslimat Adresi:
{{address}}

Notlar: {{notes}}

Lütfen siparişi kontrol edip gerekli işlemleri yapın.

Teşekkürler,
Çelenk Diyarı Sistemi
```

## Önemli Notlar

1. **Template ID'leri:**
   - Customer Template: `template_t6bsxpr`
   - Admin Template: `template_zel5ngx`

2. **Parametre İsimleri:**
   - Tüm parametre isimleri küçük harf ve alt çizgi ile ayrılmış (snake_case)
   - EmailJS'de `{{param_name}}` formatında kullanılır

3. **Subject ve to_email:**
   - Bu parametreler EmailJS API'sine otomatik olarak eklenir
   - Template'lerde `{{subject}}` ve `{{to_email}}` olarak kullanılabilir

4. **Template Düzenleme:**
   - EmailJS dashboard'unda template'leri düzenlerken Content tab'ında Subject ve Message alanlarını doldur
   - Template'lerde `{{param_name}}` formatında parametreleri kullan

## Uyumluluk Kontrolü

✅ **Kod Tarafı Hazır:**
- Template ID'leri doğru
- Parametreler doğru formatta gönderiliyor
- Email gönderme sistemi çalışıyor

⚠️ **Template Tarafı Kontrol Edilmeli:**
- EmailJS template'lerinde Subject alanında `{{subject}}` veya direkt format kullanılmalı
- Message alanında yukarıdaki parametreler kullanılmalı
- Template'ler sipariş maili formatına göre düzenlenmeli

