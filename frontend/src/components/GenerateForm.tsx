"use client";
import { useState } from "react";
import { Icon } from "./Icons";

const EXAMPLES = [
  "Restaurant-tech startups in the US, Series A or later",
  "Boutique fitness studios in the Pacific Northwest",
  "Dental practices in California hiring office managers",
];

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Germany", "Australia", "Anywhere"];

export interface GenerateParams {
  description: string;
  niche: string;
  geography: string;
}

interface GenerateFormProps {
  onRun: (params: GenerateParams) => void;
  error?: string | null;
}

export function GenerateForm({ onRun, error }: GenerateFormProps) {
  const [desc, setDesc] = useState(
    "Restaurant-technology software companies in the US — POS, kitchen, inventory or reservations — that recently raised seed or Series A funding."
  );
  const [niche, setNiche] = useState("Restaurant tech");
  const [country, setCountry] = useState("United States");
  const [count, setCount] = useState(10);
  const [verify, setVerify] = useState(true);

  function handleSubmit() {
    if (!desc.trim() || !niche.trim()) return;
    onRun({ description: desc.trim(), niche: niche.trim(), geography: country === "Anywhere" ? "" : country });
  }

  return (
    <div className="fade-up" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="page-head" style={{ display: "block" }}>
        <span className="badge badge-soft" style={{ marginBottom: 14 }}>
          <Icon name="spark" size={13} />AI-powered search
        </span>
        <h1 className="page-title">Describe your ideal customer</h1>
        <p className="page-sub">
          Write it like you&apos;d brief a teammate. We&apos;ll search the web, scrape company sites, and return verified decision-maker contacts ranked by fit.
        </p>
      </div>

      <div className="card panel-pad" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {error && (
          <div style={{ background: "color-mix(in srgb,#ef4444 10%,var(--surface))", border: "1px solid color-mix(in srgb,#ef4444 30%,transparent)", borderRadius: "var(--r-md)", padding: "12px 14px", color: "#b91c1c", fontSize: "calc(var(--fs-base) - 1px)" }}>
            {error}
          </div>
        )}

        <div className="field">
          <label className="label">Who are you looking for?<span className="req">*</span></label>
          <textarea
            className="textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. B2B SaaS companies selling to restaurants…"
          />
          <div className="psp-row" style={{ gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            <span className="hint" style={{ marginRight: 2 }}>Try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} className="chip" onClick={() => setDesc(ex)} style={{ cursor: "pointer", background: "none", border: "1px solid var(--border)", fontSize: 12 }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div className="field">
            <label className="label">Geography</label>
            <div className="input-wrap">
              <span className="lead-ic"><Icon name="globe" size={16} /></span>
              <select
                className="input has-trail"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ paddingLeft: 38, appearance: "none", cursor: "pointer" }}
              >
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <span className="trail-ic"><Icon name="chevron-down" size={15} /></span>
            </div>
          </div>
          <div className="field">
            <label className="label">Industry / niche<span className="req">*</span></label>
            <div className="input-wrap">
              <span className="lead-ic"><Icon name="tag" size={16} /></span>
              <input
                className="input"
                style={{ paddingLeft: 38 }}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Restaurant tech, SaaS, Fintech…"
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label className="label psp-row" style={{ justifyContent: "space-between" }}>
            <span>Number of leads</span>
            <span className="mono" style={{ fontWeight: 600, color: "var(--accent-ink)" }}>{count}</span>
          </label>
          <input
            type="range" min="4" max="25" value={count}
            onChange={(e) => setCount(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
          <div className="psp-row" style={{ justifyContent: "space-between" }}>
            <span className="hint">Faster · fewer credits</span>
            <span className="hint">Broader reach</span>
          </div>
        </div>

        <div className="psp-row" style={{ justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
          <div className="psp-row" style={{ gap: 12 }}>
            <span style={{ color: "var(--accent-ink)" }}><Icon name="shield" size={20} /></span>
            <div>
              <div style={{ fontWeight: 580, fontSize: 14 }}>Verify email deliverability</div>
              <div className="hint">Runs MX + SMTP checks before adding a lead. Recommended.</div>
            </div>
          </div>
          <button
            className={"tgl" + (verify ? " on" : "")}
            onClick={() => setVerify(!verify)}
            aria-label="Verify emails"
            type="button"
          >
            <i />
          </button>
        </div>

        <div className="psp-row" style={{ justifyContent: "space-between", gap: 14, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
          <span className="hint psp-row" style={{ gap: 6 }}>
            <Icon name="spark" size={14} />Est. ~{Math.ceil(count * 0.4)} credits · ~{Math.max(1, Math.round(count / 8))} min
          </span>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!desc.trim() || !niche.trim()}
            style={{ height: "var(--ctrl-h)", padding: "0 22px" }}
          >
            <Icon name="generate" size={17} />Generate leads
          </button>
        </div>
      </div>
    </div>
  );
}
