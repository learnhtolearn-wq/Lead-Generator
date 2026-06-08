import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PREFIXES = ['/login', '/auth/callback', '/api/auth', '/_next', '/favicon.ico', '/blocked'];

// Private beta — only these emails can access the app
const ALLOWED_EMAILS = ['learnhtolearn@gmail.com'];

function emailFromJWT(token: string): string | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(b64)) as { email?: string };
    return decoded.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const email = emailFromJWT(token);
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Access restricted to invited users.' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
