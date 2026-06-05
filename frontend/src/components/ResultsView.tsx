"use client";
import { Icon, CoLogo } from "./Icons";
import type { Lead } from "@/types";

interface ResultsViewProps {
  run: { niche: string; geo: string } | null;
  leads: Lead[];
  layout: "table" | "cards";
  onLayout: (l: "table" | "cards") => void;
  onOpen: (lead: Lead) => void;
  onNew: () => void;
}

export function ResultsView({ run, leads, layout, onLayout, onOpen, onNew }: ResultsViewProps) {
  const title = run ? `${run.niche} · ${leads.length} leads` : `${leads.length} leads`;
  const subtitle = run
    ? `${run.geo || "Global"} · all contacts extracted from the web. Click any lead to see the full profile.`
    : "Click any lead to see the full profile.";

  if (leads.length === 0) {
    return (
      <div className="fade-up">
        <div className="page-head">
          <div>
            <span className="badge badge-mut" style={{ marginBottom: 8, display: "inline-flex" }}>
              Search complete
            </span>
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
          </div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>
        <div className="psp-row" style={{ gap: 10 }}>
          <button className="btn btn-ghost"><Icon name="download" size={16} />Export CSV</button>
          <button className="btn btn-primary" onClick={onNew}><Icon name="plus" size={16} />New search</button>
        </div>
      </div>

      <div className="card tbl-wrap">
        <div className="tbl-top">
          <div className="tbl-top-l">
            <span className="tbl-count">{leads.length} leads</span>
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
          <th></th>
        </tr>
      </thead>
      <tbody>
        {leads.map((l, idx) => {
          const company = l.company_name ?? "—";
          const domain = l.website_url
            ? l.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
            : "";
          return (
            <tr key={l.id ?? idx} onClick={() => onOpen(l)}>
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
        return (
          <div className="card lead-card" key={l.id ?? idx} onClick={() => onOpen(l)}>
            <div className="lc-top">
              <CoLogo name={company} size={42} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="co-name" style={{ fontSize: 15 }}>{company}</div>
                {domain && <div className="co-dom mono">{domain}</div>}
              </div>
            </div>
            <div className="lc-body">
              {l.contact_name && (
                <div className="lc-line">
                  <Icon name="users-tag" size={15} className="lc-ic" />
                  <span className="lc-v">{l.contact_name}</span>
                </div>
              )}
              {l.email && (
                <div className="lc-line">
                  <Icon name="mail" size={15} className="lc-ic" />
                  <span className="lc-v">{l.email}</span>
                </div>
              )}
              {domain && (
                <div className="lc-line">
                  <Icon name="globe" size={15} className="lc-ic" />
                  <span className="lc-v">{domain}</span>
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
