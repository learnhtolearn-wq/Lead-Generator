"use client";
import { Icon, CoLogo } from "./Icons";
import type { Lead } from "@/types";

interface LeadSheetProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadSheet({ lead, onClose }: LeadSheetProps) {
  const company = lead.company_name ?? "Unknown";
  const domain = lead.website_url
    ? lead.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet" role="dialog" aria-label={company}>
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
          {/* Contact */}
          <div>
            <div className="sect-label">Primary contact</div>
            <dl className="kv">
              {lead.contact_name && (
                <>
                  <dt><Icon name="users-tag" size={15} />Name</dt>
                  <dd>{lead.contact_name}</dd>
                </>
              )}
              {lead.email && (
                <>
                  <dt><Icon name="mail" size={15} />Email</dt>
                  <dd>
                    <div className="psp-row" style={{ gap: 7 }}>
                      <a href={`mailto:${lead.email}`} className="td-link">{lead.email}</a>
                      <span className="badge badge-pos" style={{ height: 19 }}>
                        <Icon name="check" size={11} />Verified
                      </span>
                    </div>
                  </dd>
                </>
              )}
              {lead.website_url && (
                <>
                  <dt><Icon name="globe" size={15} />Website</dt>
                  <dd>
                    <a className="td-link" href={lead.website_url} target="_blank" rel="noopener noreferrer">
                      {domain}
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </div>

          {/* Company */}
          <div>
            <div className="sect-label">Company</div>
            <dl className="kv">
              <dt><Icon name="building" size={15} />Name</dt>
              <dd>{company}</dd>
              {domain && (
                <>
                  <dt><Icon name="link" size={15} />Domain</dt>
                  <dd className="mono" style={{ fontSize: "calc(var(--fs-base) - 1px)" }}>{domain}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Source */}
          {lead.website_url && (
            <div>
              <div className="sect-label">Source</div>
              <div className="psp-row" style={{ gap: 7, flexWrap: "wrap" }}>
                <span className="chip">
                  <Icon name="link" size={13} style={{ color: "var(--text-faint)" }} />
                  {domain}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="sheet-foot">
          <button className="btn btn-ghost grow">
            <Icon name="bookmark" size={16} />Save to list
          </button>
          <a
            className="btn btn-primary grow"
            href={`mailto:${lead.email ?? ""}`}
            style={{ textDecoration: "none", justifyContent: "center" }}
          >
            <Icon name="mail" size={16} />Email contact
          </a>
        </div>
      </aside>
    </>
  );
}
