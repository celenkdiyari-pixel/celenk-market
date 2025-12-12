import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, resetRateLimit, getClientIP } from '@/lib/rate-limit';

// Admin credentials - Must use environment variables (no fallbacks for security)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
};

// Validate admin credentials are set
if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
  console.error('❌ ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables');
}

// Password strength validation
function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Şifre en az 12 karakter olmalıdır');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 attempts per 15 minutes, block for 30 minutes after limit
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`admin-auth:${clientIP}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    });

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json({
        success: false,
        message: rateLimitResult.message || 'Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.',
        rateLimit: {
          resetTime: rateLimitResult.resetTime,
          blocked: rateLimitResult.blocked
        },
        timestamp: new Date().toISOString()
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    }

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı adı ve şifre gereklidir',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Check if admin credentials are configured
    if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
      console.error('❌ Admin credentials not configured');
      return NextResponse.json({
        success: false,
        message: 'Yönetici sistemi yapılandırılmamış',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Reset rate limit on successful login
      resetRateLimit(`admin-auth:${clientIP}`);
      
      // Create session token with better security (includes timestamp and random)
      const sessionId = `${username}:${Date.now()}:${Math.random().toString(36).substring(2, 15)}`;
      const sessionToken = Buffer.from(sessionId).toString('base64');
      
      // Set secure cookie
      const cookieStore = await cookies();
      cookieStore.set('adminSession', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      console.log('✅ Admin login successful:', username);

      return NextResponse.json({
        success: true,
        message: 'Giriş başarılı',
        username: username,
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        },
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    } else {
      console.log('❌ Admin login failed:', username);
      
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ Admin auth error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Giriş işlemi sırasında hata oluştu',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('adminSession');

    if (sessionToken && sessionToken.value) {
      // Verify session token format
      try {
        const decoded = Buffer.from(sessionToken.value, 'base64').toString('utf-8');
        const [username, timestamp] = decoded.split(':');
        
        // Check if session is not older than 24 hours
        const sessionTime = parseInt(timestamp);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (now - sessionTime < maxAge) {
          console.log('✅ Admin session valid for:', username);
          return NextResponse.json({
            success: true,
            authenticated: true,
            username: username,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('❌ Admin session expired');
          // Clear expired session
          cookieStore.delete('adminSession');
        }
      } catch (decodeError) {
        console.log('❌ Invalid session token format');
        cookieStore.delete('adminSession');
      }
    }
    
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: 'Session expired or invalid',
      timestamp: new Date().toISOString()
    }, { status: 401 });
    
  } catch (error) {
    console.error('❌ Admin session check error:', error);
    
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Session check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('adminSession');
    
    console.log('✅ Admin logout successful');
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Admin logout error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Logout failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
