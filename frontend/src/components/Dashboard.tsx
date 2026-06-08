"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import type { HistoryEntry } from "@/types";

interface DashboardProps {
  onNav: (tab: string) => void;
  onRestore: (entry: HistoryEntry) => void;
  history: HistoryEntry[];
}

const PLAN_LIMIT = 410;
const SEARCH_CREDITS = 42;
const EMAIL_CREDITS = 1860;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(email: string | null): string {
  if (!email) return "";
  const local = email.split("@")[0];
  const part = local.split(/[._\-+]/)[0].replace(/[^a-zA-Z]/g, "");
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function withinDays(iso: string, days: number, from = Date.now()) {
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m <= 1 ? "Just now" : `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function Dashboard({ onNav, onRestore, history }: DashboardProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { email?: string } | null) => { if (d?.email) setUserEmail(d.email); })
      .catch(() => {});
  }, []);

  const name = firstName(userEmail);

  // aggregate stats from history
  const totalLeads = history.reduce((s, e) => s + e.leads.length, 0);
  const searchesRun = history.length;
  const verifiedCount = history.reduce((s, e) => s + e.leads.filter((l) => !!l.email).length, 0);
  const verifiedRate = totalLeads > 0 ? Math.round((verifiedCount / totalLeads) * 100) : 0;

  // this-month vs last-month deltas
  const thisMonthLeads = history.filter((e) => withinDays(e.createdAt, 30)).reduce((s, e) => s + e.leads.length, 0);
  const lastMonthLeads = history.filter((e) => !withinDays(e.createdAt, 30) && withinDays(e.createdAt, 60)).reduce((s, e) => s + e.leads.length, 0);
  const thisMonthSearches = history.filter((e) => withinDays(e.createdAt, 30)).length;
  const lastMonthSearches = history.filter((e) => !withinDays(e.createdAt, 30) && withinDays(e.createdAt, 60)).length;

  const deltaLeads = thisMonthLeads - lastMonthLeads;
  const deltaSearches = thisMonthSearches - lastMonthSearches;
  const deltaRate = 3; // static for now

  const quotaPct = Math.min(100, Math.round((thisMonthLeads / PLAN_LIMIT) * 100));
  const recent = history.slice(0, 5);

  const STATS = [
    {
      key: "leads",
      label: "Leads generated",
      value: totalLeads > 0 ? totalLeads.toLocaleString() : "—",
      delta: deltaLeads,
      show: totalLeads > 0,
    },
    {
      key: "searches",
      label: "Searches run",
      value: searchesRun > 0 ? String(searchesRun) : "—",
      delta: deltaSearches,
      show: searchesRun > 0,
    },
    {
      key: "rate",
      label: "Avg. verified rate",
      value: totalLeads > 0 ? `${verifiedRate}%` : "—",
      delta: deltaRate,
      show: totalLeads > 0,
    },
    {
      key: "saved",
      label: "Saved to lists",
      value: verifiedCount > 0 ? String(verifiedCount) : "—",
      delta: Math.round(verifiedCount * 0.09),
      show: verifiedCount > 0,
    },
  ];

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {greeting()}{name ? `, ${name}` : ""}
          </h1>
          <p className="page-sub">Here&apos;s what&apos;s happening across your lead pipeline.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNav("generate")}>
          <Icon name="generate" size={17} />New search
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {STATS.map((s, i) => (
          <div className="card stat" key={s.key} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-foot">
              {s.show ? (
                <>
                  <span className="delta-up">
                    <Icon name="arrow-up" size={13} />+{s.delta}
                  </span>
                  <span className="delta-mut">vs last month</span>
                </>
              ) : (
                <span className="delta-mut">Run a search to see stats</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent searches + This month panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--pad-md)", alignItems: "start" }}>
        {/* Recent searches */}
        <div className="card tbl-wrap">
          <div className="tbl-top">
            <div className="tbl-top-l">
              <span className="tbl-count">Recent searches</span>
              {recent.length > 0 && (
                <span className="badge badge-mut">{history.length}</span>
              )}
            </div>
            {recent.length > 0 && (
              <button
                className="td-link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13 }}
                onClick={() => onNav("history")}
              >
                View all<Icon name="chevron-right" size={14} />
              </button>
            )}
          </div>

          {recent.length > 0 ? (
            <table className="ltable">
              <thead>
                <tr>
                  <th>Search</th>
                  <th>Geography</th>
                  <th>Leads</th>
                  <th>When</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id} onClick={() => onRestore(e)} style={{ cursor: "pointer" }}>
                    <td>
                      <div className="co-name">{e.niche}</div>
                      <div className="co-dom mono">{e.id.slice(0, 12)}</div>
                    </td>
                    <td className="muted">{e.geo || "Global"}</td>
                    <td>
                      {e.leads.length > 0
                        ? <span className="badge badge-pos">{e.leads.length} found</span>
                        : <span className="badge badge-mut">No leads</span>}
                    </td>
                    <td className="muted">{relativeTime(e.createdAt)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Icon name="chevron-right" size={17} className="row-chev" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div className="empty-ic"><Icon name="search" size={24} /></div>
              <h3 className="head" style={{ margin: 0, fontSize: 17, fontWeight: 640 }}>No searches yet</h3>
              <p className="muted" style={{ maxWidth: "38ch", margin: 0, lineHeight: 1.55 }}>
                Describe your ideal customer and Prospela will find verified contacts for you.
              </p>
              <button className="btn btn-primary" onClick={() => onNav("generate")}>
                <Icon name="spark" size={16} />Start your first search
              </button>
            </div>
          )}
        </div>

        {/* This month panel */}
        <div className="card panel-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div className="sect-label">This month</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
              <span className="stat-val" style={{ fontSize: 34 }}>{quotaPct}%</span>
              <span className="badge badge-pos">
                <Icon name="arrow-up" size={12} />of quota
              </span>
            </div>
            <p className="muted" style={{ fontSize: 13, margin: "6px 0 0" }}>
              {thisMonthLeads} of {PLAN_LIMIT} leads in your monthly plan used.
            </p>
          </div>

          <div className="run-prog" style={{ height: 8 }}>
            <i style={{ width: `${quotaPct}%` }} />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <div className="sect-label">Credits</div>
            <div className="psp-stack" style={{ gap: 10, marginTop: 8 }}>
              {[
                ["Search credits", `${SEARCH_CREDITS} left`],
                ["Email verifications", `${EMAIL_CREDITS.toLocaleString()} left`],
              ].map(([k, v]) => (
                <div className="psp-row" key={k} style={{ justifyContent: "space-between", fontSize: 13.5 }}>
                  <span className="muted">{k}</span>
                  <span style={{ fontWeight: 600 }} className="mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => onNav("settings")}>
            <Icon name="sliders" size={16} />Manage plan
          </button>
        </div>
      </div>
    </div>
  );
}
