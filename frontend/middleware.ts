import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const PUBLIC_PREFIXES = ['/login', '/api/auth', '/_next', '/favicon.ico'];

function expectedToken(password: string): string {
  return createHmac('sha256', password).update('authenticated').digest('hex');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const password = process.env.APP_PASSWORD;
  if (!password) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (token === expectedToken(password)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
