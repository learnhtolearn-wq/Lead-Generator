import { createClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";
import type { Lead } from "../types.js";

if (!globalThis.WebSocket) {
  (globalThis as unknown as Record<string, unknown>).WebSocket = WebSocket;
}

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export interface LeadRow extends Lead {
  run_id: string;
}

export async function saveLeads(runId: string, leads: Lead[]): Promise<void> {
  if (leads.length === 0) return;

  const rows: LeadRow[] = leads.map((lead) => ({ ...lead, run_id: runId }));
  const { error } = await supabase.from("leads").insert(rows);

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}
