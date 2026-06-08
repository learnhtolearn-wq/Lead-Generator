"use client";
import { Icon, CoLogo } from "./Icons";
import type { Lead } from "@/types";

interface ResultsViewProps {
  run: { niche: string; geo: string; runId?: string } | null;
  leads: Lead[];
  layout: "table" | "cards";
  onLayout: (l: "table" | "cards") => void;
  onOpen: (lead: Lead) => void;
  onNew: () => void;
}

async function exportExcel(
  leads: Lead[],
  run: { niche: string; geo: string; runId?: string } | null
) {
  const runLabel = run?.runId ? `run_${run.runId.slice(-10)}` : undefined;
  const res = await fetch("/api/export/excel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leads, niche: run?.niche, geo: run?.geo, runLabel }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prospela-${(run?.niche ?? "leads").toLowerCase().replace(/\s+/g, "-")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(leads: Lead[]) {
  const headers = ["Company", "Contact", "Title", "Email", "Location", "Fit Score", "Website"];
  const rows = leads.map((l) =>
    [
      l.company_name ?? "",
      l.contact_name ?? "",
      l.contact_title ?? "",
      l.email ?? "",
      l.location ?? "",
      l.score != null ? String(l.score) : "",
      l.website_url ?? "",
    ]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = "﻿" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function ScoreCell({ n }: { n: number }) {
  return (
    <div className="score">
      <div className="score-bar"><div className="score-fill" style={{ width: `${n}%` }} /></div>
      <span className="score-num">{n}</span>
    </div>
  );
}

export function ResultsView({ run, leads, layout, onLayout, onOpen, onNew }: ResultsViewProps) {
  const title = run ? `${run.niche} · ${leads.length} leads` : `${leads.length} leads`;
  const subtitle = run
    ? `${run.geo || "Global"} · all contacts verified and ranked by fit. Click any lead to see the full profile.`
    : "Click any lead to see the full profile.";
  const runLabel = run?.runId
    ? `run_${run.runId.slice(-10)}`
    : leads[0]?.run_id
      ? `run_${leads[0].run_id.slice(-10)}`
      : null;

  if (leads.length === 0) {
    return (
      <div className="fade-up">
        <div className="page-head">
          <div>
            <div className="psp-row" style={{ gap: 10, marginBottom: 8 }}>
              <span className="badge badge-mut">Search complete</span>
              {runLabel && <span className="faint mono" style={{ fontSize: 12.5 }}>{runLabel}</span>}
            </div>
            <h1 className="page-title">{run?.niche ?? "Search"}</h1>
            <p className="page-sub">{run?.geo ?? ""}</p>
          </div>
        </div>
        <div className="card empty">
          <div className="empty-ic"><Icon name="search" size={24} /></div>
          <h3 className="head" style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 640 }}>No leads matched</h3>
          <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto 18px", lineHeight: 1.55 }}>
            We couldn&apos;t find verified contacts for this description. Try widening the geography or loosening your criteria.
          </p>
          <button className="btn btn-primary" onClick={onNew} style={{ margin: "0 auto", display: "inline-flex" }}>
            <Icon name="generate" size={16} />Adjust & retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="psp-row" style={{ gap: 10, marginBottom: 8 }}>
            <span className="badge badge-pos">
              <Icon name="check-circle" size={13} />Search complete
            </span>
            {runLabel && <span className="faint mono" style={{ fontSize: 12.5 }}>{runLabel}</span>}
          </div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>
        <div className="psp-row" style={{ gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => exportCSV(leads)}>
            <Icon name="download" size={16} />Export CSV
          </button>
          <button className="btn btn-ghost" onClick={() => exportExcel(leads, run)}>
            <Icon name="download" size={16} />Export Excel
          </button>
          <button className="btn btn-primary" onClick={onNew}>
            <Icon name="plus" size={16} />New search
          </button>
        </div>
      </div>

      <div className="card tbl-wrap">
        <div className="tbl-top">
          <div className="tbl-top-l">
            <span className="tbl-count">{leads.length} leads</span>
            <button className="chip" style={{ cursor: "default" }}>
              <Icon name="filter" size={14} className="ic" />Filter
            </button>
            <button className="chip" style={{ cursor: "default" }}>
              Fit score<Icon name="chevron-down" size={14} className="ic" />
            </button>
          </div>
          <div className="seg">
            <button className={layout === "table" ? "on" : ""} onClick={() => onLayout("table")}>
              <Icon name="table" size={15} />Table
            </button>
            <button className={layout === "cards" ? "on" : ""} onClick={() => onLayout("cards")}>
              <Icon name="grid" size={15} />Cards
            </button>
          </div>
        </div>

        {layout === "table" ? (
          <LeadsTable leads={leads} onOpen={onOpen} />
        ) : (
          <div style={{ padding: "var(--pad-lg)" }}>
            <LeadsCards leads={leads} onOpen={onOpen} />
          </div>
        )}
      </div>
    </div>
  );
}

function LeadsTable({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <table className="ltable">
      <thead>
        <tr>
          <th>Company</th>
          <th>Contact</th>
          <th>Email</th>
          <th>Location</th>
          <th>Fit</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {leads.map((l, idx) => {
          const company = l.company_name ?? "—";
          const domain = l.website_url
            ? l.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
            : "";
          const score = l.score ?? deriveScore(l);
          return (
            <tr key={l.id ?? idx} onClick={() => onOpen(l)} style={{ cursor: "pointer" }}>
              <td>
                <div className="cell-co">
                  <CoLogo name={company} />
                  <div>
                    <div className="co-name">{company}</div>
                    {domain && <div className="co-dom mono">{domain}</div>}
                  </div>
                </div>
              </td>
              <td>
                <div className="td-contact">{l.contact_name || "—"}</div>
                {l.contact_title && <div className="td-role">{l.contact_title}</div>}
              </td>
              <td>
                {l.email ? (
                  <a
                    className="td-link"
                    href={`mailto:${l.email}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon name="mail" size={14} />{l.email}
                  </a>
                ) : <span className="faint">—</span>}
              </td>
              <td className="muted">{l.location || "—"}</td>
              <td><ScoreCell n={score} /></td>
              <td style={{ textAlign: "right" }}>
                <Icon name="chevron-right" size={17} className="row-chev" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function LeadsCards({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <div className="cards-grid">
      {leads.map((l, idx) => {
        const company = l.company_name ?? "—";
        const domain = l.website_url
          ? l.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
          : "";
        const score = l.score ?? deriveScore(l);
        return (
          <div className="card lead-card" key={l.id ?? idx} onClick={() => onOpen(l)}>
            <div className="lc-top">
              <CoLogo name={company} size={42} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="co-name" style={{ fontSize: 15 }}>{company}</div>
                {domain && <div className="co-dom mono">{domain}</div>}
              </div>
              <span className="badge badge-pos">{score}</span>
            </div>
            <div className="lc-body">
              {l.contact_name && (
                <div className="lc-line">
                  <Icon name="users-tag" size={15} className="lc-ic" />
                  <span className="lc-v">{l.contact_name}</span>
                  {l.contact_title && <span className="faint">· {l.contact_title}</span>}
                </div>
              )}
              {l.email && (
                <div className="lc-line">
                  <Icon name="mail" size={15} className="lc-ic" />
                  <span className="lc-v">{l.email}</span>
                </div>
              )}
              {l.location && (
                <div className="lc-line">
                  <Icon name="pin" size={15} className="lc-ic" />
                  <span className="lc-v">{l.location}</span>
                </div>
              )}
            </div>
            <div className="lc-foot">
              <span />
              <span className="td-link" style={{ fontSize: 13 }}>
                View<Icon name="chevron-right" size={14} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function deriveScore(l: Lead): number {
  const hash = l.website_url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let s = 55 + (hash % 8);
  if (l.email) s += 18;
  if (l.contact_name) s += 10;
  if (l.contact_title) s += 8;
  if (l.location) s += 5;
  return Math.min(s, 99);
}
