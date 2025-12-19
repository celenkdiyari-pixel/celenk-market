import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect /categories to homepage
  if (pathname === '/categories') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Protect Admin Panel
  if (pathname.startsWith('/admin')) {
    // Exception: Login page
    if (pathname === '/admin/login') {
      const hasSession = request.cookies.has('admin_session');
      if (hasSession) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Check auth for all other admin routes
    const hasSession = request.cookies.has('admin_session');
    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Protect API Routes
  if (pathname.startsWith('/api/')) {
    const method = request.method;

    // API: Products
    if (pathname.startsWith('/api/products')) {
      // Public: GET
      if (method === 'GET') return NextResponse.next();

      // Protected: POST, PUT, DELETE
      const hasSession = request.cookies.has('admin_session');
      if (!hasSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // API: Orders
    if (pathname.startsWith('/api/orders')) {
      // Public: POST (Create Order / Guest Checkout)
      if (method === 'POST') return NextResponse.next();

      // Mixed: GET
      if (method === 'GET') {
        // Allow querying specific order by number (Guest Tracking)
        const orderNumber = request.nextUrl.searchParams.get('orderNumber');
        if (orderNumber) return NextResponse.next();

        // Protected: List all orders
        const hasSession = request.cookies.has('admin_session');
        if (!hasSession) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      // Protected: DELETE
      if (method === 'DELETE') {
        const hasSession = request.cookies.has('admin_session');
        if (!hasSession) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    }

    // API: Analytics, Inventory, Users (Admin Only)
    if (pathname.startsWith('/api/analytics') ||
      pathname.startsWith('/api/inventory') ||
      pathname.startsWith('/api/users') ||
      pathname.startsWith('/api/settings')) {

      const hasSession = request.cookies.has('admin_session');
      if (!hasSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/categories',
    '/admin/:path*',
    '/api/:path*'
  ],
};
