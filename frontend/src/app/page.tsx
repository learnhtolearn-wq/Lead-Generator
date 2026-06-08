"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { Dashboard } from "@/components/Dashboard";
import { GenerateForm, type GenerateParams } from "@/components/GenerateForm";
import { RunningView } from "@/components/RunningView";
import { ResultsView } from "@/components/ResultsView";
import { HistoryView } from "@/components/HistoryView";
import { SettingsView } from "@/components/SettingsView";
import { LeadSheet } from "@/components/LeadSheet";
import { pollRun } from "@/lib/triggerClient";
import type { Lead, HistoryEntry } from "@/types";

const HISTORY_KEY = "prospela_history";

type Tab = "dashboard" | "generate" | "running" | "run" | "history" | "settings";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [params, setParams] = useState<GenerateParams | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [runMeta, setRunMeta] = useState<{ niche: string; geo: string; runId?: string } | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [layout, setLayout] = useState<"table" | "cards">("table");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadHistory() {
      // 1. Load from localStorage
      let local: HistoryEntry[] = [];
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (raw) local = JSON.parse(raw) as HistoryEntry[];
      } catch { /* corrupted — ignore */ }

      // 2. Fetch from Supabase via API
      let remote: HistoryEntry[] = [];
      try {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const json = await res.json() as { entries: HistoryEntry[] };
          remote = json.entries ?? [];
        }
      } catch { /* offline or error — use local only */ }

      if (remote.length === 0) {
        setHistory(local);
        return;
      }

      // 3. Collect run_ids already covered by localStorage entries
      const localRunIds = new Set<string>();
      for (const e of local) {
        for (const l of e.leads) {
          if (l.run_id) localRunIds.add(l.run_id);
        }
        // also treat the entry id itself as a run_id key
        localRunIds.add(e.id);
      }

      // 4. Add remote entries not already in local; preserve niche/geo from local where they match
      const localByRunId = new Map<string, HistoryEntry>();
      for (const e of local) {
        for (const l of e.leads) {
          if (l.run_id) localByRunId.set(l.run_id, e);
        }
      }

      const merged: HistoryEntry[] = [...local];
      for (const re of remote) {
        if (localRunIds.has(re.id)) {
          // Already in local — patch the niche/geo from local entry if we have it
          const match = localByRunId.get(re.id);
          if (match) {
            re.niche = match.niche;
            re.geo = match.geo;
          }
          continue;
        }
        // New run not in local: derive a label from the leads
        re.niche = re.leads[0]?.company_name
          ? `${re.leads.length} leads`
          : `Search (${re.leads.length})`;
        re.geo = re.leads.find(l => l.location)?.location ?? "—";
        merged.push(re);
        localRunIds.add(re.id);
      }

      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 5. Persist merged list so subsequent loads are instant
      setHistory(merged);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(merged)); } catch { /* quota */ }
    }

    loadHistory();
  }, []);

  function saveHistory(entries: HistoryEntry[]) {
    setHistory(entries);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch { /* quota exceeded */ }
  }

  async function handleGenerate(values: GenerateParams) {
    setJobError(null);
    setLeads([]);
    setParams(values);
    const meta = { niche: values.niche, geo: values.geography || "Global", runId: undefined as string | undefined };
    setRunMeta(meta);
    setTab("running");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: values.description,
          niche: values.niche,
          geography: values.geography,
        }),
      });

      const data = (await res.json()) as { runId?: string; error?: string };

      if (!res.ok) {
        setJobError(data.error ?? "Failed to start the job.");
        setTab("generate");
        return;
      }

      meta.runId = data.runId;
      const result = await pollRun(data.runId!, () => {});

      if (result.status === "COMPLETED") {
        const newLeads = (result.output?.leads as Lead[]) ?? [];
        setLeads(newLeads);
        setTab("run");

        const entry: HistoryEntry = {
          id: Date.now().toString(),
          niche: meta.niche,
          geo: meta.geo,
          leads: newLeads,
          createdAt: new Date().toISOString(),
        };
        saveHistory([entry, ...history].slice(0, 50));
      } else {
        setJobError(`Job ended with status: ${result.status}`);
        setTab("generate");
      }
    } catch (err) {
      setJobError(String(err));
      setTab("generate");
    }
  }

  function handleRestore(entry: HistoryEntry) {
    setLeads(entry.leads);
    setRunMeta({ niche: entry.niche, geo: entry.geo, runId: entry.id });
    setActiveLead(null);
    setSearchQuery("");
    setTab("run");
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const shellTab = tab === "running" ? "generate" : tab;

  const q = searchQuery.trim().toLowerCase();
  const displayedLeads = q
    ? leads.filter((l) =>
        (l.company_name ?? "").toLowerCase().includes(q) ||
        (l.contact_name ?? "").toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.website_url ?? "").toLowerCase().includes(q)
      )
    : leads;

  return (
    <div className="app" data-theme="carbon">
      <Shell
        tab={shellTab as "dashboard" | "generate" | "run" | "history" | "settings"}
        leadCount={leads.length}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onNav={(t) => { setTab(t as Tab); setActiveLead(null); setSearchQuery(""); }}
        onSignOut={handleSignOut}
      >
        {tab === "dashboard" && (
          <Dashboard onNav={(t) => setTab(t as Tab)} onRestore={handleRestore} history={history} />
        )}
        {tab === "generate" && (
          <GenerateForm onRun={handleGenerate} error={jobError} />
        )}
        {tab === "running" && params && (
          <RunningView params={params} />
        )}
        {tab === "run" && (
          <ResultsView
            run={runMeta}
            leads={displayedLeads}
            layout={layout}
            onLayout={setLayout}
            onOpen={setActiveLead}
            onNew={() => { setTab("generate"); setJobError(null); }}
          />
        )}
        {tab === "history" && (
          <HistoryView
            history={history}
            onRestore={handleRestore}
            onClear={() => saveHistory([])}
            onNew={() => { setTab("generate"); setJobError(null); }}
          />
        )}
        {tab === "settings" && (
          <SettingsView onSignOut={handleSignOut} />
        )}
      </Shell>

      {activeLead && (
        <LeadSheet lead={activeLead} onClose={() => setActiveLead(null)} />
      )}
    </div>
  );
}
