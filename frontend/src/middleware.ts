import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'secret';
const key = new TextEncoder().encode(secretKey);

// Basic in-memory rate limiting (per edge isolate)
const ipRateLimit = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // Allow 10 requests per minute for login

  const record = ipRateLimit.get(ip);
  if (!record || (now - record.timestamp > windowMs)) {
    ipRateLimit.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  // CSRF Protection for state-changing requests (like POST to Server Actions)
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse('Forbidden: CSRF check failed', { status: 403 });
        }
      } catch (e) {
        // Invalid origin
      }
    }
  }

  // Rate Limiting for the login route
  if (request.nextUrl.pathname === '/login' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  const session = request.cookies.get('session')?.value;

  // Protected routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAssetManagerRoute = request.nextUrl.pathname.startsWith('/assets/register');

  if (!session && (isDashboardRoute || isAdminRoute || isAssetManagerRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
      const user = payload.user as any;

      // Role-based access control
      if (isAdminRoute && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (isAssetManagerRoute && user.role !== 'ADMIN' && user.role !== 'ASSET_MANAGER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // If already logged in, redirect away from login page
      if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (err) {
      // Invalid token
      if (isDashboardRoute || isAdminRoute || isAssetManagerRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|grid.svg).*)'],
};
