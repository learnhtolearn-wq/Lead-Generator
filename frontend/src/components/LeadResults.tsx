"use client";

import { useState, useEffect, useRef } from "react";
import { pollRun } from "@/lib/triggerClient";
import type { Lead } from "@/types";

interface LeadResultsProps {
  runId: string | null;
}

type PollStatus = "idle" | "QUEUED" | "EXECUTING" | "COMPLETED" | "FAILED" | "CANCELED" | "CRASHED" | "TIMED_OUT";

const STATUS_LABELS: Record<string, string> = {
  QUEUED: "Job queued, waiting to start…",
  EXECUTING: "Searching and scraping leads…",
  COMPLETED: "Done!",
  FAILED: "Lead generation failed.",
  CANCELED: "Job was canceled.",
  CRASHED: "Job crashed unexpectedly.",
  TIMED_OUT: "Job timed out.",
};

export function LeadResults({ runId }: LeadResultsProps) {
  const [status, setStatus] = useState<PollStatus>("idle");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!runId || pollingRef.current) return;
    pollingRef.current = true;
    setStatus("QUEUED");
    setLeads([]);
    setError(null);

    pollRun(runId, (s) => setStatus(s as PollStatus))
      .then((run) => {
        if (run.status === "COMPLETED") {
          const output = run.output as { leads: Lead[] };
          setLeads(output?.leads ?? []);
        } else {
          setError(`Job ended with status: ${run.status}`);
        }
      })
      .catch((err: Error) => setError(`Polling error: ${err.message}`))
      .finally(() => { pollingRef.current = false; });
  }, [runId]);

  if (!runId) return null;

  const isTerminal = ["COMPLETED", "FAILED", "CANCELED", "CRASHED", "TIMED_OUT"].includes(status);
  const isRunning = !isTerminal;

  return (
    <div className="mt-8">
      <div className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm mb-6 ${
        status === "COMPLETED"
          ? "bg-green-50 text-green-800"
          : status === "FAILED" || status === "CRASHED" || status === "TIMED_OUT"
          ? "bg-red-50 text-red-800"
          : "bg-blue-50 text-blue-800"
      }`}>
        {isRunning && (
          <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span>{STATUS_LABELS[status] ?? status}{isRunning && " (polling every 3s)"}</span>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {status === "COMPLETED" && leads.length === 0 && (
        <p className="text-sm text-gray-500">
          No leads found for this search. Try broadening your niche or removing the geography filter.
        </p>
      )}

      {leads.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Company</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Website</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {leads.map((lead, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.company_name}</td>
                  <td className="px-4 py-3 text-gray-700">{lead.contact_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {lead.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
