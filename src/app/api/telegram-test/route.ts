
import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        // Mask the token for safety in response
        const maskedToken = token ? `${token.substring(0, 5)}...` : 'NOT_SET';
        const maskedChatId = chatId ? `${chatId.substring(0, 3)}...` : 'NOT_SET';

        if (!token || !chatId) {
            return NextResponse.json({
                success: false,
                message: 'Environment variables missing',
                env: {
                    TELEGRAM_BOT_TOKEN: maskedToken,
                    TELEGRAM_CHAT_ID: maskedChatId
                }
            }, { status: 400 });
        }

        const message = "🔔 <b>Test Bildirimi</b>\n\nBu bir test mesajıdır. Telegram entegrasyonu çalışıyor.";

        console.log('Testing Telegram with:', { maskedToken, maskedChatId });

        const result = await sendTelegramNotification(message);

        if (result) {
            return NextResponse.json({
                success: true,
                message: 'Notification sent successfully',
                env: {
                    TELEGRAM_BOT_TOKEN: maskedToken,
                    TELEGRAM_CHAT_ID: maskedChatId
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to send notification. Check server logs.',
                env: {
                    TELEGRAM_BOT_TOKEN: maskedToken,
                    TELEGRAM_CHAT_ID: maskedChatId
                }
            }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Unexpected error',
            error: error.message
        }, { status: 500 });
    }
}
