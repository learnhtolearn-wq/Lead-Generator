import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { HistoryEntry, Lead } from "@/types";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let supabase;
  try {
    // Use service role key if available (bypasses RLS), fall back to anon key
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
  } catch (err) {
    return NextResponse.json({ error: "Supabase init failed" }, { status: 500 });
  }

  let rows: Lead[];
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    rows = (data ?? []) as Lead[];
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  // Group leads by run_id
  const runMap = new Map<string, { leads: Lead[]; createdAt: string }>();
  for (const lead of rows) {
    const rid = lead.run_id ?? "unknown";
    if (!runMap.has(rid)) {
      runMap.set(rid, { leads: [], createdAt: lead.created_at ?? new Date().toISOString() });
    }
    runMap.get(rid)!.leads.push(lead);
  }

  const entries: HistoryEntry[] = Array.from(runMap.entries()).map(([runId, { leads, createdAt }]) => ({
    id: runId,
    niche: "",   // not stored in DB — caller merges with localStorage label
    geo: "",
    leads,
    createdAt,
  }));

  // newest first
  entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ entries });
}
