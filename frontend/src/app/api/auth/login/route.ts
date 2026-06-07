import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let accessToken: string;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    accessToken = data.session.access_token;
  } catch (err) {
    console.error('[auth/login] supabase.auth.signInWithPassword threw', {
      endpoint: 'supabase.auth.signInWithPassword',
      payload: { email },
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return response;
}
