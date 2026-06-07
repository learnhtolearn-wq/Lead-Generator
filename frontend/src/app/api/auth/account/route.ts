import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Get user ID from the access token
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let userId: string;
  try {
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    userId = user.id;
  } catch (err) {
    console.error('[auth/account] anonClient.auth.getUser threw', {
      endpoint: 'supabase.auth.getUser',
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }

  // Delete requires service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'Account deletion is not configured on this server.' }, { status: 501 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[auth/account] admin.auth.admin.deleteUser returned error', {
        endpoint: 'supabase.admin.deleteUser',
        payload: { userId },
        timestamp: new Date().toISOString(),
        error: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (err) {
    console.error('[auth/account] admin.auth.admin.deleteUser threw', {
      endpoint: 'supabase.admin.deleteUser',
      payload: { userId },
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth_token');
  return response;
}
