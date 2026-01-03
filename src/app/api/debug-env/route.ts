
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    let apiTestResult = 'Skipped (credentials missing)';

    if (token && chatId) {
        try {
            const timeoutController = new AbortController();
            const timeoutId = setTimeout(() => timeoutController.abort(), 5000); // 5 sec timeout

            const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
                method: 'GET',
                signal: timeoutController.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();
            apiTestResult = data.ok ? `Success (Bot: ${data.result.username})` : `Failed (${JSON.stringify(data)})`;
        } catch (e: any) {
            apiTestResult = `Error: ${e.message}`;
        }
    }

    return NextResponse.json({
        env_check: {
            has_token: !!token,
            token_preview: token ? `${token.substring(0, 4)}...` : null,
            has_chat_id: !!chatId,
            chat_id_val: chatId,
            node_env: process.env.NODE_ENV
        },
        telegram_api_test: apiTestResult,
        timestamp: new Date().toISOString()
    });
}
