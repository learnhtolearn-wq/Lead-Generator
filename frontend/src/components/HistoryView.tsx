"use client";
import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";
import type { HistoryEntry } from "@/types";

type SortOrder = "createdAt" | "alphabetical";

interface HistoryViewProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
  onNew: () => void;
}

export function HistoryView({ history, onRestore, onClear, onNew }: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("createdAt");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filtered = history.filter((e) =>
    !q ||
    e.niche.toLowerCase().includes(q) ||
    (e.geo ?? "").toLowerCase().includes(q)
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "alphabetical") return a.niche.localeCompare(b.niche);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (history.length === 0) {
    return (
      <div className="fade-up">
        <div className="page-head">
          <div>
            <h1 className="page-title">History</h1>
            <p className="page-sub">Your past searches will appear here.</p>
          </div>
        </div>
        <div className="card empty">
          <div className="empty-ic"><Icon name="history" size={24} /></div>
          <h3 className="head" style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 640 }}>No searches yet</h3>
          <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto 18px", lineHeight: 1.55 }}>
            Run your first search and it will show up here.
          </p>
          <button className="btn btn-primary" onClick={onNew} style={{ margin: "0 auto", display: "inline-flex" }}>
            <Icon name="generate" size={16} />New search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-sub">{history.length} past search{history.length !== 1 ? "es" : ""}</p>
        </div>
        <div className="psp-row" style={{ gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClear}>Clear history</button>
          <button className="btn btn-primary" onClick={onNew}><Icon name="plus" size={16} />New search</button>
        </div>
      </div>

      {/* Search + sort toolbar */}
      <div className="psp-row" style={{ gap: 8, marginBottom: 14 }}>
        <div className="input-wrap" style={{ flex: 1, maxWidth: 340 }}>
          <span className="lead-ic"><Icon name="search" size={15} /></span>
          <input
            className="input"
            placeholder="Search leads…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} style={{ position: "relative" }}>
          <button
            className="btn btn-ghost"
            style={{ gap: 6 }}
            onClick={() => setSortOpen((v) => !v)}
          >
            <Icon name="chevron-right" size={14} style={{ transform: "rotate(90deg)" }} />
            {sort === "alphabetical" ? "A → Z" : "Newest first"}
          </button>
          {sortOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50,
              background: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-md)", boxShadow: "var(--card-hover-shadow)",
              minWidth: 170, overflow: "hidden",
            }}>
              {(["createdAt", "alphabetical"] as SortOrder[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSort(opt); setSortOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 14px", background: "none",
                    border: "none", cursor: "pointer", textAlign: "left",
                    fontSize: 13.5, fontFamily: "inherit",
                    color: sort === opt ? "var(--accent)" : "var(--text)",
                    fontWeight: sort === opt ? 600 : 400,
                  }}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: sort === opt ? "var(--accent)" : "transparent",
                    border: `1.5px solid ${sort === opt ? "var(--accent)" : "var(--border-strong)"}`,
                  }} />
                  {opt === "createdAt" ? "Created at" : "Alphabetical"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card tbl-wrap">
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
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-faint)", padding: "32px 0", fontSize: 13.5 }}>
                  No results for &ldquo;{searchQuery}&rdquo;
                </td>
              </tr>
            ) : sorted.map((entry) => (
              <tr key={entry.id} onClick={() => onRestore(entry)}>
                <td><div className="co-name">{entry.niche}</div></td>
                <td><div className="td-contact">{entry.geo || "Global"}</div></td>
                <td>
                  <span className="badge badge-soft" style={{ height: 19, padding: "0 7px" }}>
                    {entry.leads.length}
                  </span>
                </td>
                <td><div className="td-contact">{formatDate(entry.createdAt)}</div></td>
                <td style={{ textAlign: "right" }}>
                  <Icon name="chevron-right" size={17} className="row-chev" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
