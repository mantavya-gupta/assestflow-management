import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production.');
  }
  return new TextEncoder().encode(secret || 'dev-only-insecure-secret');
}

const key = getSecretKey();

interface SessionUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function proxy(request: NextRequest) {
  // CSRF-style defense in depth for any state-changing request that hits
  // the Next.js app itself (e.g. future Server Actions). Note: this does
  // NOT cover the auth/dashboard requests, which go directly from the
  // browser to the Express backend on a different port — that traffic is
  // protected by the equivalent check in the backend's own middleware,
  // since it never passes through this file at all.
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse('Forbidden: CSRF check failed', { status: 403 });
        }
      } catch {
        // Invalid origin header — fall through and let the request proceed;
        // it isn't same-origin trusted, but this file only guards Next.js
        // routes, not the real API.
      }
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
      const user = payload.user as SessionUser;

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
    } catch {
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
