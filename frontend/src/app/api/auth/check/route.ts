import { NextResponse } from 'next/server';

// Always returns hasUsers: true so the login form defaults to sign-in.
// On first use, signup will work via Supabase Auth — no custom users table needed.
export async function GET() {
  return NextResponse.json({ hasUsers: true });
}
