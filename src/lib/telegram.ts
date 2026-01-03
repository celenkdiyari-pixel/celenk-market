
interface TelegramMessage {
    text: string;
    parse_mode?: 'HTML' | 'MarkdownV2';
}

export async function sendTelegramNotification(message: string): Promise<boolean> {
    // Use Next.js global fetch
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('⚠️ Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const payload: TelegramMessage = {
            text: message,
            parse_mode: 'HTML',
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                ...payload,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Telegram API Error:', errorData);
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

    // Format items list with checking if items exists and is array
    const itemsList = Array.isArray(order.items) ? order.items.map((item: any) => {
        return `- ${item.name || item.productName} (x${item.quantity})`;
    }).join('\n') : 'Ürün bilgisi yok';

    const total = (Number(order.total) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

    const statusMap: Record<string, string> = {
        'pending': '⏳ Beklemede',
        'confirmed': '✅ Onaylandı',
        'paid': '💰 Ödendi',
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

    return `
<b>🔔 Yeni Sipariş Alındı!</b>

<b>Sipariş No:</b> <code>${order.orderNumber}</code>
<b>Durum:</b> ${statusEmoji} ${order.status}
<b>Ödeme:</b> ${paymentStatus}

<b>👤 Müşteri:</b> ${customerName}
<b>📞 Telefon:</b> ${order.customer?.phone || '-'}
<b>📍 Şehir:</b> ${order.customer?.address?.city || '-'}

<b>🛒 Ürünler:</b>
${itemsList}

<b>💵 Toplam Tutar:</b> <b>${total} ₺</b>

<a href="https://celenkdiyari.com/admin/orders">Siparişi Görüntüle</a>
    `.trim();
}
