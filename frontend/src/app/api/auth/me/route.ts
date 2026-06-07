import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    user = data.user;
  } catch (err) {
    console.error('[auth/me] supabase.auth.getUser threw', {
      endpoint: 'supabase.auth.getUser',
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email ?? '',
    username: user.user_metadata?.username ?? user.user_metadata?.display_name ?? '',
    phone: user.phone ?? user.user_metadata?.phone ?? '',
  });
}
