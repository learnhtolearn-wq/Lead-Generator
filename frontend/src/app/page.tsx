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
  const [runMeta, setRunMeta] = useState<{ niche: string; geo: string } | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [layout, setLayout] = useState<"table" | "cards">("table");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      // corrupted storage — start fresh
    }
  }, []);

  function saveHistory(entries: HistoryEntry[]) {
    setHistory(entries);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch { /* quota exceeded */ }
  }

  async function handleGenerate(values: GenerateParams) {
    setJobError(null);
    setLeads([]);
    setParams(values);
    const meta = { niche: values.niche, geo: values.geography || "Global" };
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
    setRunMeta({ niche: entry.niche, geo: entry.geo });
    setActiveLead(null);
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
          <Dashboard onNav={(t) => setTab(t as Tab)} history={history} />
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
