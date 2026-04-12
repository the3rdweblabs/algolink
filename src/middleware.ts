// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

const PROTECTED_ROUTES = ['/dashboard', '/settings', '/linkWallet'];
const AUTH_ROUTE_PREFIX = '/auth/authenticate'; // The new unified auth page

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (session) {
    // If user is authenticated and visits root or auth page, redirect to dashboard
    if (pathname === '/' || pathname.startsWith(AUTH_ROUTE_PREFIX)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // The email verification is now part of the OTP login, so isVerified should always be true for a session.
    // The explicit check for !session.isVerified before accessing /linkWallet is less critical but can be kept.
    // For simplicity, if a session exists, we assume email is verified through OTP.
  } else {
    // If user is not authenticated and trying to access protected routes, redirect to login
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL(AUTH_ROUTE_PREFIX, request.url);
      loginUrl.searchParams.set('redirect', pathname); // Optionally pass redirect path
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/settings/:path*',
    '/linkWallet/:path*',
    '/auth/authenticate/:path*',
  ],
};
