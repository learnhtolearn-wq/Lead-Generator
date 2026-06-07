import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as {
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  const supabaseUpdate: Record<string, unknown> = {};
  if (body.email) supabaseUpdate.email = body.email;
  if (body.password) supabaseUpdate.password = body.password;
  if (body.phone !== undefined) supabaseUpdate.phone = body.phone;
  if (body.username !== undefined) supabaseUpdate.data = { username: body.username };

  const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supabaseUpdate),
    });
  } catch (err) {
    console.error('[auth/profile] fetch threw', {
      endpoint,
      payload: supabaseUpdate,
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Profile update service unavailable' }, { status: 503 });
  }

  let data: { msg?: string; message?: string };
  try {
    data = await res.json() as { msg?: string; message?: string };
  } catch (err) {
    console.error('[auth/profile] failed to parse response JSON', {
      endpoint,
      status: res.status,
      timestamp: new Date().toISOString(),
      error: String(err),
    });
    return NextResponse.json({ error: 'Unexpected response from auth service' }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: data.msg ?? data.message ?? 'Update failed' }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
