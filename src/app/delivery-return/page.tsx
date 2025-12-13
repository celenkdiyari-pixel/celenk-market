export default function DeliveryReturnPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Teslimat ve İade Politikası</h1>
            <div className="prose max-w-none">

                <h2 className="text-xl font-bold mt-4">1. Teslimat Koşulları</h2>
                <p>Siparişleriniz, ödeme onayının alınmasından sonra işleme alınır. İstanbul içi siparişlerinizde, sipariş verdiğiniz gün içinde veya seçtiğiniz tarih ve saat aralığında teslimat gerçekleştirilir. Yoğunluk durumuna göre teslimat saati değişiklik gösterebilir.</p>
                <p>Teslimat, alıcının adresine yapılır. Alıcının adreste bulunamaması durumunda, siparişiniz alıcıya en yakın komşuya, site güvenliğine veya resepsiyona bırakılabilir. Bu durumda teslimat gerçekleşmiş sayılır.</p>

                <h2 className="text-xl font-bold mt-4">2. Teslimat Ücretleri</h2>
                <p>Belirli bölgeler için teslimat ücretsizdir. Teslimat ücreti alınacak bölgeler ve tutarları sipariş aşamasında net olarak belirtilir.</p>

                <h2 className="text-xl font-bold mt-4">3. İade ve İptal Koşulları</h2>
                <p><strong>İptal:</strong> Siparişiniz yola çıkmadan önce, bizimle iletişime geçerek iptal talebinde bulunabilirsiniz. Hazırlanmış veya yola çıkmış siparişlerde iptal işlemi yapılamamaktadır.</p>
                <p><strong>İade:</strong> Satılan ürünlerin (canlı çiçek, çelenk vb.) niteliği gereği, çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler olması sebebiyle, ürün ayıplı veya hasarlı gelmediği sürece iade kabul edilmemektedir.</p>
                <p>Ürün teslim alındığında kontrol edilmelidir. Eğer üründe bir solma, kırılma veya bozulma varsa, teslimat anında tutanak tutdurulmalı veya fotoğrafı çekilerek derhal tarafımıza bildirilmelidir. Haklı iade taleplerinde ürün yenisiyle değiştirilir veya ücret iadesi yapılır.</p>
            </div>
        </div>
    );
}
