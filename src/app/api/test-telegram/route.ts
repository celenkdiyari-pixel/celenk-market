
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const results = {
        env: {
            hasToken: !!token,
            tokenPrefix: token ? token.substring(0, 5) + '...' : 'MISSING',
            hasChatId: !!chatId,
            chatId: chatId || 'MISSING'
        },
        messageAttempt: null as any
    };

    if (token && chatId) {
        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: '🔔 Vercel Environment Configuration Test\n\nBu mesaj geliyorsa ortam değişkenleri doğru tanımlanmıştır.',
                    parse_mode: 'HTML'
                })
            });
            const data = await res.json();
            results.messageAttempt = {
                ok: res.ok,
                status: res.status,
                result: data
            };
        } catch (e: any) {
            results.messageAttempt = {
                error: e.message
            };
        }
    }

    return NextResponse.json(results);
}
