interface TelegramMessage {
    text?: string;
    caption?: string;
    photo?: string;
    parse_mode?: 'HTML' | 'MarkdownV2';
}


// Helper to extract the main image from order
export function getOrderImage(order: any): string | undefined {
    if (Array.isArray(order.items) && order.items.length > 0) {
        const firstItem = order.items[0];
        // Check for common image properties
        const img = firstItem.image || (firstItem.images && firstItem.images[0]);
        // Allow HTTP URLs or Base64 Data URIs
        if (img && (img.startsWith('http') || img.startsWith('https') || img.startsWith('data:image'))) {
            return img;
        }
    }
    return undefined;
}

export async function sendTelegramNotification(message: string, imageUrl?: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('⚠️ Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.');
        return false;
    }

    try {
        const isPhoto = !!imageUrl;
        const isBase64 = isPhoto && imageUrl?.startsWith('data:');

        const url = `https://api.telegram.org/bot${token}/${isPhoto ? 'sendPhoto' : 'sendMessage'}`;

        let body: any;
        let headers: any = {};

        if (isBase64) {
            // Handle Base64 Image (Multipart)
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('caption', message.length > 1024 ? message.substring(0, 1021) + '...' : message);
            formData.append('parse_mode', 'HTML');

            // Convert Base64 to Blob
            const base64Data = imageUrl!.split(',')[1];
            const mimeType = imageUrl!.split(';')[0].split(':')[1];
            const binaryStr = atob(base64Data);
            const len = binaryStr.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mimeType });
            formData.append('photo', blob, 'order_image.jpg');

            body = formData;
            // Fetch handles boundaries for FormData automatically, so no custom Content-Type header needed
        } else {
            // Handle URL or Text (JSON)
            headers['Content-Type'] = 'application/json';
            const payload: any = {
                chat_id: chatId,
                parse_mode: 'HTML',
            };

            if (isPhoto) {
                payload.photo = imageUrl;
                payload.caption = message;
                if (payload.caption.length > 1024) {
                    payload.caption = payload.caption.substring(0, 1021) + '...';
                }
            } else {
                payload.text = message;
            }
            body = JSON.stringify(payload);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ Telegram Error (${isPhoto ? 'Photo' : 'Message'}):`, errorData);

            // Retry with text only if photo failed
            if (isPhoto) {
                console.log('🔄 Retrying with text only...');
                return sendTelegramNotification(message);
            }
            return false;
        }

        console.log('✅ Telegram notification sent successfully.');
        return true;
    } catch (error) {
        console.error('❌ Failed to send Telegram notification:', error);
        return false;
    }
}

export function formatOrderMessage(order: any): string {
    const customerName = order.customer?.firstName && order.customer?.lastName
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : order.customer?.name || 'Müşteri';

    const recipientName = order.recipient?.name ? `(Alıcı: ${order.recipient.name})` : '';

    const itemsList = Array.isArray(order.items) ? order.items.map((item: any) => {
        return `- ${item.name || item.productName} (x${item.quantity}) - ${(item.price || 0).toFixed(2)} ₺`;
    }).join('\n') : 'Ürün bilgisi yok';

    const total = (Number(order.total) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

    const statusMap: Record<string, string> = {
        'pending': '⏳ Beklemede',
        'confirmed': '✅ Onaylandı',
        'paid': '💰 Ödendi',
        'preparing': '🛠 Hazırlanıyor',
        'shipped': '🚚 Kargoda',
        'delivered': '🏁 Teslim Edildi',
        'cancelled': '❌ İptal'
    };

    const statusEmoji = statusMap[order.status] || '📦';

    let paymentStatus = 'Bilinmiyor';
    if (order.paymentStatus === 'paid') paymentStatus = 'Kredi Kartı (Ödendi)';
    else if (order.paymentMethod === 'transfer') paymentStatus = 'Havale/EFT (Teyit Bekliyor)';
    else if (order.paymentMethod === 'cash') paymentStatus = 'Kapıda Ödeme';
    else paymentStatus = order.paymentMethod || 'Diğer';

    const address = order.customer?.address || {};
    const fullAddress = `${address.street || ''} ${address.district || ''}/${address.city || ''}`.trim();

    const note = order.notes ? `\n\n<b>📝 Sipariş Notu:</b>\n<i>${order.notes}</i>` : '';
    const wreathText = order.wreath_text ? `\n\n<b>🎀 Çelenk Yazısı:</b>\n<i>${order.wreath_text}</i>` : '';

    return `
<b>🔔 Yeni Sipariş Alındı!</b>

<b>Sipariş No:</b> <code>${order.orderNumber}</code>
<b>Durum:</b> ${statusEmoji} ${order.status}
<b>Ödeme:</b> ${paymentStatus}

<b>👤 Müşteri:</b> ${customerName} ${recipientName}
<b>📞 Telefon:</b> ${order.customer?.phone || '-'}
<b>📍 Adres:</b> ${fullAddress || '-'}
<b>📅 Teslimat Zamanı:</b> ${order.delivery_date || '-'} / ${order.delivery_time || '-'}

<b>🛒 Ürünler:</b>
${itemsList}
${note}${wreathText}

<b>💵 Toplam Tutar:</b> <b>${total} ₺</b>

<a href="https://celenkdiyari.com/admin/orders">Siparişi Görüntüle</a>
    `.trim();
}

// End of file
