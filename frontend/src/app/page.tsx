"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Dashboard } from "@/components/Dashboard";
import { GenerateForm, type GenerateParams } from "@/components/GenerateForm";
import { RunningView } from "@/components/RunningView";
import { ResultsView } from "@/components/ResultsView";
import { LeadSheet } from "@/components/LeadSheet";
import { pollRun } from "@/lib/triggerClient";
import type { Lead } from "@/types";

type Tab = "dashboard" | "generate" | "running" | "run";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [params, setParams] = useState<GenerateParams | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [runMeta, setRunMeta] = useState<{ niche: string; geo: string } | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [layout, setLayout] = useState<"table" | "cards">("table");

  async function handleGenerate(values: GenerateParams) {
    setJobError(null);
    setLeads([]);
    setParams(values);
    setRunMeta({ niche: values.niche, geo: values.geography || "Global" });
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
        setLeads((result.output?.leads as Lead[]) ?? []);
        setTab("run");
      } else {
        setJobError(`Job ended with status: ${result.status}`);
        setTab("generate");
      }
    } catch (err) {
      setJobError(String(err));
      setTab("generate");
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const shellTab = tab === "running" ? "generate" : tab;

  return (
    <div className="app" data-theme="crisp">
      <Shell
        tab={shellTab as "dashboard" | "generate" | "run" | "history"}
        leadCount={leads.length}
        onNav={(t) => { setTab(t as Tab); setActiveLead(null); }}
        onSignOut={handleSignOut}
      >
        {tab === "dashboard" && (
          <Dashboard onNav={(t) => setTab(t as Tab)} />
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
            leads={leads}
            layout={layout}
            onLayout={setLayout}
            onOpen={setActiveLead}
            onNew={() => { setTab("generate"); setJobError(null); }}
          />
        )}
      </Shell>

      {activeLead && (
        <LeadSheet lead={activeLead} onClose={() => setActiveLead(null)} />
      )}
    </div>
  );
}
