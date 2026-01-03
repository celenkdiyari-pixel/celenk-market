
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    return NextResponse.json({
        status: 'Control Page',
        verdict: (token && chatId) ? 'PASSED: Environment Variables Found' : 'FAILED: Environment Variables Missing',
        details: {
            has_token: !!token, // True/False only
            has_chat_id: !!chatId // True/False only
        },
        timestamp: new Date().toISOString()
    });
}
