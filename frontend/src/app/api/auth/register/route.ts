import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let accessToken: string | null = null;
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Supabase requires email confirmation by default — user must disable it in Dashboard
    if (!data.session) {
      return NextResponse.json(
        { needsConfirmation: true, error: 'Check your email to confirm your account, then sign in.' },
        { status: 200 }
      );
    }
    accessToken = data.session.access_token;
  } catch (err) {
    console.error('[auth/register] supabase.auth.signUp threw', {
      endpoint: 'supabase.auth.signUp',
      payload: { email },
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', accessToken!, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return response;
}
