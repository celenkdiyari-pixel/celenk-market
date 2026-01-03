interface TelegramMessage {
    text?: string;
    caption?: string;
    photo?: string;
    parse_mode?: 'HTML' | 'MarkdownV2';
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
        const method = isPhoto ? 'sendPhoto' : 'sendMessage';
        const url = `https://api.telegram.org/bot${token}/${method}`;

        const payload: any = {
            chat_id: chatId,
            parse_mode: 'HTML',
        };

        if (isPhoto) {
            payload.photo = imageUrl;
            payload.caption = message;
            // Truncate caption if too long (Telegram limit 1024)
            if (payload.caption.length > 1024) {
                payload.caption = payload.caption.substring(0, 1021) + '...';
            }
        } else {
            payload.text = message;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ Telegram ${method} Error:`, errorData);

            // Fallback: If sending photo fails (e.g. invalid URL), try sending just text
            if (isPhoto) {
                console.log('🔄 Retrying with text only...');
                return sendTelegramNotification(message);
            }
            return false;
        }

        console.log(`✅ Telegram ${method} sent successfully.`);
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

<b>🛒 Ürünler:</b>
${itemsList}
${note}${wreathText}

<b>💵 Toplam Tutar:</b> <b>${total} ₺</b>

<a href="https://celenkdiyari.com/admin/orders">Siparişi Görüntüle</a>
    `.trim();
}

// Helper to extract the main image from order
export function getOrderImage(order: any): string | undefined {
    if (Array.isArray(order.items) && order.items.length > 0) {
        const firstItem = order.items[0];
        // Check for common image properties
        const img = firstItem.image || (firstItem.images && firstItem.images[0]);
        if (img && (img.startsWith('http') || img.startsWith('https'))) {
            return img;
        }
    }
    return undefined;
}
