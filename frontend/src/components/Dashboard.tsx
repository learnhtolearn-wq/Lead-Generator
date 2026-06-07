"use client";
import { Icon } from "./Icons";
import type { HistoryEntry } from "@/types";

interface DashboardProps {
  onNav: (tab: string) => void;
  history: HistoryEntry[];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard({ onNav, history }: DashboardProps) {
  const searchesRun = history.length;
  const totalLeads = history.reduce((s, e) => s + e.leads.length, 0);
  const verifiedEmails = history.reduce((s, e) => s + e.leads.filter((l) => !!l.email).length, 0);
  const avgLeads = searchesRun > 0 ? (totalLeads / searchesRun).toFixed(1) : "—";

  const STATS = [
    { key: "total",    label: "Total leads",      value: totalLeads > 0 ? String(totalLeads) : "—" },
    { key: "searches", label: "Searches run",      value: searchesRun > 0 ? String(searchesRun) : "—" },
    { key: "verified", label: "Verified emails",   value: verifiedEmails > 0 ? String(verifiedEmails) : "—" },
    { key: "rate",     label: "Avg leads / search", value: searchesRun > 0 ? avgLeads : "—" },
  ];

  const recent = history.slice(0, 3);

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">{greeting()}</h1>
          <p className="page-sub">
            {searchesRun > 0
              ? `You've run ${searchesRun} search${searchesRun !== 1 ? "es" : ""} and collected ${totalLeads} lead${totalLeads !== 1 ? "s" : ""}.`
              : "Start a new search or view your last results below."}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onNav("generate")}>
          <Icon name="generate" size={17} />New search
        </button>
      </div>

      <div className="stat-grid">
        {STATS.map((s, i) => (
          <div className="card stat" key={s.key} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-foot">
              <span className={s.value === "—" ? "delta-mut" : "delta-pos"}>
                {s.value === "—" ? "Run a search to see stats" : "from your searches"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {recent.length > 0 ? (
        <div className="card tbl-wrap">
          <div className="tbl-top">
            <span className="tbl-count">Recent searches</span>
            <button
              className="btn btn-ghost"
              style={{ height: 32, padding: "0 12px", fontSize: 13 }}
              onClick={() => onNav("history")}
            >
              View all
            </button>
          </div>
          <table className="ltable">
            <thead>
              <tr>
                <th>Search</th>
                <th>Geography</th>
                <th>Leads</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} onClick={() => onNav("history")}>
                  <td><div className="co-name">{e.niche}</div></td>
                  <td><div className="td-contact">{e.geo || "Global"}</div></td>
                  <td>
                    <span className="badge badge-soft" style={{ height: 19, padding: "0 7px" }}>
                      {e.leads.length}
                    </span>
                  </td>
                  <td><div className="td-contact">{formatDate(e.createdAt)}</div></td>
                  <td style={{ textAlign: "right" }}>
                    <Icon name="chevron-right" size={17} className="row-chev" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card panel-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, textAlign: "center", gap: 16 }}>
          <div className="empty-ic"><Icon name="generate" size={24} /></div>
          <h3 className="head" style={{ margin: 0, fontSize: 18, fontWeight: 640 }}>No searches yet</h3>
          <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto", lineHeight: 1.55 }}>
            Describe your ideal customer and Prospela will search the web, scrape company sites, and return verified contacts ranked by fit.
          </p>
          <button className="btn btn-primary" onClick={() => onNav("generate")}>
            <Icon name="spark" size={16} />Start your first search
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
