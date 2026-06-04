"use client";

import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { LeadResults } from "@/components/LeadResults";
import type { GenerateFormValues } from "@/types";

export default function HomePage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  async function handleGenerate(values: GenerateFormValues) {
    setIsLoading(true);
    setTriggerError(null);
    setRunId(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { runId?: string; error?: string };

      if (!response.ok) {
        setTriggerError(data.error ?? "Unknown error starting the job.");
        return;
      }

      setRunId(data.runId ?? null);
    } catch (err) {
      setTriggerError("Network error — could not reach the API.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Lead Generator</h1>
          <p className="mt-2 text-gray-600">
            Describe your business and target leads — we'll find up to 10 B2B contacts using AI-powered web scraping.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <LeadForm onSubmit={handleGenerate} isLoading={isLoading} />
          {triggerError && <p className="mt-3 text-sm text-red-600">{triggerError}</p>}
        </div>

        <LeadResults runId={runId} />
      </div>
    </main>
  );
}
