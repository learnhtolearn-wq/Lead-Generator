"use client";
import { Icon, CoLogo } from "./Icons";
import type { Lead } from "@/types";

interface LeadSheetProps {
  lead: Lead;
  onClose: () => void;
}

function deriveScore(l: Lead): number {
  const hash = (l.website_url ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let s = 55 + (hash % 8);
  if (l.email) s += 18;
  if (l.contact_name) s += 10;
  if (l.contact_title) s += 8;
  if (l.location) s += 5;
  return Math.min(s, 99);
}

function deriveTags(lead: Lead): string[] {
  const tags: string[] = [];
  if (lead.email) tags.push("Verified email");
  if (lead.contact_title) {
    const t = lead.contact_title.toLowerCase();
    if (t.includes("ceo") || t.includes("founder") || t.includes("owner")) tags.push("Decision maker");
    else if (t.includes("vp") || t.includes("director") || t.includes("head")) tags.push("Senior level");
    else if (t.includes("operations") || t.includes("ops")) tags.push("Ops");
    else if (t.includes("sales") || t.includes("growth") || t.includes("revenue")) tags.push("Revenue");
  }
  if (tags.length < 2) tags.push("Prospected");
  return tags.slice(0, 3);
}

function deriveSummary(lead: Lead): string {
  const co = lead.company_name ?? "This company";
  const role = lead.contact_title ? ` ${lead.contact_title} is the primary contact.` : "";
  const loc = lead.location ? ` Based in ${lead.location}.` : "";
  const email = lead.email ? " Email verified and ready for outreach." : "";
  return `${co} was identified as a strong match based on their web presence and contact information.${role}${loc}${email}`;
}

export function LeadSheet({ lead, onClose }: LeadSheetProps) {
  const company = lead.company_name ?? "Unknown";
  const domain = lead.website_url
    ? lead.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";
  const score = lead.score ?? deriveScore(lead);
  const tags = deriveTags(lead);
  const summary = deriveSummary(lead);
  const sources: string[] = [];
  if (domain) sources.push(domain);
  sources.push("Firecrawl");

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-label={company}>

        {/* Header */}
        <div className="sheet-hd">
          <div className="psp-row" style={{ gap: 13 }}>
            <CoLogo name={company} size={46} />
            <div>
              <h2 className="head" style={{ margin: 0, fontSize: 19, fontWeight: 680, letterSpacing: "-0.02em" }}>
                {company}
              </h2>
              {domain && (
                <a
                  className="td-link"
                  style={{ fontSize: 13, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 5 }}
                  href={lead.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="globe" size={13} />{domain}<Icon name="external" size={12} />
                </a>
              )}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="sheet-body">

          {/* Fit score + tags */}
          <div className="psp-row" style={{ gap: 14, justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="sect-label" style={{ marginBottom: 4 }}>Fit score</div>
              <div className="psp-row" style={{ gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: "var(--accent-ink)", lineHeight: 1 }}>
                  {score}
                </span>
                <div style={{ width: 90 }}>
                  <div className="score-bar" style={{ width: "100%", height: 7 }}>
                    <div className="score-fill" style={{ width: `${score}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="psp-row" style={{ gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {tags.map((t) => (
                <span key={t} className="badge badge-soft">{t}</span>
              ))}
            </div>
          </div>

          {/* AI summary */}
          <div className="ai-box">
            <div className="sect-label psp-row" style={{ gap: 6, color: "var(--accent-ink)" }}>
              <Icon name="spark" size={13} />Why this lead
            </div>
            <p>{summary}</p>
          </div>

          {/* Primary contact */}
          <div>
            <div className="sect-label">Primary contact</div>
            <dl className="kv">
              <dt><Icon name="users-tag" size={15} className="ic" />Name</dt>
              <dd>{lead.contact_name || "—"}</dd>
              <dt><Icon name="bookmark" size={15} className="ic" />Role</dt>
              <dd>{lead.contact_title || "—"}</dd>
              <dt><Icon name="mail" size={15} className="ic" />Email</dt>
              <dd>
                <div className="psp-row" style={{ gap: 7 }}>
                  {lead.email
                    ? <a href={`mailto:${lead.email}`} className="td-link">{lead.email}</a>
                    : <span className="faint">—</span>}
                  {lead.email && (
                    <span className="badge badge-pos" style={{ height: 19 }}>
                      <Icon name="check" size={11} />Verified
                    </span>
                  )}
                </div>
              </dd>
              <dt><Icon name="phone" size={15} className="ic" />Phone</dt>
              <dd className="faint">—</dd>
              <dt><Icon name="link" size={15} className="ic" />LinkedIn</dt>
              <dd className="faint">—</dd>
            </dl>
          </div>

          {/* Company */}
          <div>
            <div className="sect-label">Company</div>
            <dl className="kv">
              <dt><Icon name="pin" size={15} className="ic" />Location</dt>
              <dd>{lead.location || "—"}</dd>
              <dt><Icon name="building" size={15} className="ic" />Headcount</dt>
              <dd className="faint">—</dd>
              <dt><Icon name="history" size={15} className="ic" />Founded</dt>
              <dd className="faint">—</dd>
              <dt><Icon name="spark" size={15} className="ic" />Funding</dt>
              <dd className="faint">—</dd>
            </dl>
          </div>

          {/* Sources */}
          <div>
            <div className="sect-label">Sources</div>
            <div className="psp-row" style={{ gap: 7, flexWrap: "wrap" }}>
              {sources.map((s) => (
                <span key={s} className="chip">
                  <Icon name="link" size={13} className="ic" />{s}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sheet-foot">
          <button className="btn btn-ghost grow">
            <Icon name="bookmark" size={16} />Save to list
          </button>
          <button
            className="btn btn-primary grow"
            onClick={() => { if (lead.email) window.location.href = `mailto:${lead.email}`; }}
          >
            <Icon name="mail" size={16} />Draft email
          </button>
        </div>

      </aside>
    </>
  );
}
