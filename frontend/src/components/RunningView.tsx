"use client";
import { useState, useEffect } from "react";
import { Icon } from "./Icons";
import type { GenerateParams } from "./GenerateForm";

const RUN_STEPS = [
  { key: "query", label: "Building search query", detail: "Analyzing your description and geography" },
  { key: "search", label: "Searching the web", detail: "Finding relevant company pages via Firecrawl" },
  { key: "scrape", label: "Scraping company pages", detail: "Extracting names, emails, and contact data" },
  { key: "dedup", label: "Deduplicating & ranking", detail: "Removing duplicates, scoring by fit" },
  { key: "save", label: "Saving leads", detail: "Storing verified contacts in your workspace" },
];

interface RunningViewProps {
  params: GenerateParams;
}

export function RunningView({ params }: RunningViewProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [pct, setPct] = useState(4);

  useEffect(() => {
    const durations = [1800, 4000, 8000, 2000, 1500];
    let alive = true;
    let acc = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    RUN_STEPS.forEach((_, i) => {
      acc += durations[i];
      timers.push(
        setTimeout(() => {
          if (alive) {
            setStepIdx(i + 1);
            setPct(Math.round(((i + 1) / RUN_STEPS.length) * 92));
          }
        }, acc)
      );
    });
    const grow = setInterval(() => setPct((p) => Math.min(96, p + 0.4)), 200);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      clearInterval(grow);
    };
  }, []);

  const label = params.description.length > 64
    ? params.description.slice(0, 64) + "…"
    : params.description;

  return (
    <div className="fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="run-head">
        <div className="run-orb spin">
          <Icon name="spark" size={22} />
        </div>
        <div>
          <h1 className="page-title" style={{ fontSize: 23 }}>Generating your leads…</h1>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Searching for &ldquo;{label}&rdquo;</p>
        </div>
      </div>

      <div className="card panel-pad">
        <div className="psp-row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 580, fontSize: 14 }}>Working…</span>
          <span className="mono" style={{ fontWeight: 600, color: "var(--accent-ink)" }}>{Math.round(pct)}%</span>
        </div>
        <div className="run-prog">
          <i style={{ width: `${pct}%` }} />
        </div>

        <div className="steps" style={{ marginTop: 14 }}>
          {RUN_STEPS.map((s, i) => {
            const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
            return (
              <div className={`step ${state}`} key={s.key}>
                <div className="step-dot">
                  {state === "done" && <Icon name="check" size={14} />}
                  {state === "active" && <Icon name="settings" size={13} className="step-spin" />}
                  {state === "pending" && <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <div className="grow">
                  <div className="step-label">{s.label}</div>
                  <div className="step-detail">{s.detail}</div>
                </div>
                {state === "active" && <span className="badge badge-soft">running</span>}
                {state === "done" && <Icon name="check-circle" size={16} className="faint" />}
              </div>
            );
          })}
        </div>
      </div>

      <p className="hint" style={{ textAlign: "center", marginTop: 16 }}>
        You can leave this page — we&apos;ll notify you when it&apos;s ready.
      </p>
    </div>
  );
}
