"use client";
import { Icon } from "./Icons";

const STATS = [
  { key: "total", label: "Total leads", value: "—", delta: "—" },
  { key: "searches", label: "Searches run", value: "—", delta: "—" },
  { key: "verified", label: "Verified emails", value: "—", delta: "—" },
  { key: "rate", label: "Avg fit score", value: "—", delta: "—" },
];

interface DashboardProps {
  onNav: (tab: string) => void;
}

export function Dashboard({ onNav }: DashboardProps) {
  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Good afternoon</h1>
          <p className="page-sub">Start a new search or view your last results below.</p>
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
              <span className="delta-mut">Run a search to see stats</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card panel-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, textAlign: "center", gap: 16 }}>
        <div className="empty-ic">
          <Icon name="generate" size={24} />
        </div>
        <h3 className="head" style={{ margin: 0, fontSize: 18, fontWeight: 640 }}>No searches yet</h3>
        <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto", lineHeight: 1.55 }}>
          Describe your ideal customer and Prospela will search the web, scrape company sites, and return verified contacts ranked by fit.
        </p>
        <button className="btn btn-primary" onClick={() => onNav("generate")}>
          <Icon name="spark" size={16} />Start your first search
        </button>
      </div>
    </div>
  );
}
