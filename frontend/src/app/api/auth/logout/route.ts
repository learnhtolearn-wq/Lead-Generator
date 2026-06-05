import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ success: true });
  res.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  return res;
}
