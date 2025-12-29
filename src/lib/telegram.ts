
/**
 * Sends a notification message to a Telegram chat.
 * Requires environment variables:
 * - TELEGRAM_BOT_TOKEN: The token from @BotFather
 * - TELEGRAM_CHAT_ID: Your personal chat ID or a group chat ID
 */
export async function sendTelegramMessage(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('⚠️ Telegram configuration missing (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID). Message not sent.');
        return { success: false, error: 'Config missing' };
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();

        if (result.ok) {
            console.log('✅ Telegram message sent successfully');
            return { success: true };
        } else {
            console.error('❌ Telegram API Error:', result);
            return { success: false, error: result.description };
        }
    } catch (error) {
        console.error('❌ Telegram Sending error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
