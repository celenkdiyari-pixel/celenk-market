import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        // Get password from env or default
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

        if (password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true });

            // Set secure session cookie
            // In production, ensure Secure attribute is set (requires HTTPS)
            // For now, HttpOnly and SameSite=Strict are key
            const isProduction = process.env.NODE_ENV === 'production';

            response.cookies.set({
                name: 'admin_session',
                value: 'authenticated',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day
                sameSite: 'strict',
                secure: isProduction,
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
