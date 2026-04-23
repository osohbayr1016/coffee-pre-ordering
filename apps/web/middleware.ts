import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export default auth((request) => {
  const { nextUrl } = request;
  const isDashboard = nextUrl.pathname.startsWith('/dashboard');
  
  // Dashboard Auth (Custom JWT via HttpOnly cookie)
  if (isDashboard) {
    const token = request.cookies.get('bonum_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Customer Auth (Next-Auth Google)
  // We want to protect /[slug] (menu) and /[slug]/order (checkout)
  // But keep / (map) and /login public
  const isRoot = nextUrl.pathname === '/';
  const isLoginOrAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/api/auth');
  
  if (!isRoot && !isLoginOrAuth && !isDashboard && !request.auth) {
    const signInUrl = new URL('/api/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
