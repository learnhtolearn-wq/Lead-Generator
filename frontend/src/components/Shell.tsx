"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";

type Tab = "dashboard" | "generate" | "run" | "history" | "settings";

const NAV: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "generate", label: "New search", icon: "generate" },
  { key: "run", label: "Leads", icon: "leads" },
  { key: "history", label: "History", icon: "history" },
];

interface ShellProps {
  tab: Tab;
  leadCount?: number;
  searchQuery: string;
  onSearch: (q: string) => void;
  onNav: (t: Tab) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

function useCurrentUser() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { email?: string } | null) => { if (d?.email) setEmail(d.email); })
      .catch(() => {});
  }, []);
  return email;
}

function avatarInitials(email: string | null): string {
  if (!email) return "…";
  const local = email.split("@")[0];
  const parts = local.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (local.slice(0, 2)).toUpperCase();
}

export function Shell({ tab, leadCount, searchQuery, onSearch, onNav, onSignOut, children }: ShellProps) {
  const userEmail = useCurrentUser();
  const initials = avatarInitials(userEmail);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="spark" size={20} /></div>
          <div>
            <div className="brand-name">Prospela</div>
            <div className="brand-sub">Lead engine</div>
          </div>
        </div>

        <div className="side-sect">Workspace</div>
        {NAV.map((n) => (
          <div
            key={n.key}
            className={"side-item" + (tab === n.key ? " on" : "")}
            onClick={() => onNav(n.key)}
          >
            <Icon name={n.icon} size={18} className="ic" />
            <span>{n.label}</span>
            {n.key === "run" && leadCount !== undefined && leadCount > 0 && (
              <span className="badge badge-soft" style={{ marginLeft: "auto", height: 19, padding: "0 7px" }}>
                {leadCount}
              </span>
            )}
          </div>
        ))}

        <div className="side-sect">Account</div>
        <div
          className={"side-item" + (tab === "settings" ? " on" : "")}
          onClick={() => onNav("settings")}
        >
          <Icon name="settings" size={18} className="ic" /><span>Settings</span>
        </div>

        <div className="side-spacer" />

        <div className="side-user" onClick={onSignOut} title="Sign out">
          <div className="avatar" style={{ background: "linear-gradient(135deg,#6366F1,#A855F7)" }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--side-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail ?? "…"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--side-muted)" }}>Sign out</div>
          </div>
          <Icon name="external" size={15} style={{ color: "var(--side-muted)" }} />
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <Topbar
          crumb={CRUMBS[tab] ?? "Dashboard"}
          searchQuery={searchQuery}
          onSearch={onSearch}
          onNew={() => onNav("generate")}
        />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

const CRUMBS: Record<string, string> = {
  dashboard: "Dashboard",
  generate: "New search",
  running: "New search",
  run: "Leads",
  history: "History",
  settings: "Settings",
};

function Topbar({ crumb, searchQuery, onSearch, onNew }: {
  crumb: string;
  searchQuery: string;
  onSearch: (q: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="topbar">
      <div className="crumbs">
        <span>Prospela</span>
        <Icon name="chevron-right" size={14} />
        <span className="now">{crumb}</span>
      </div>
      <div className="topbar-actions">
        <div className="input-wrap" style={{ width: 240 }}>
          <span className="lead-ic"><Icon name="search" size={16} /></span>
          <input
            className="input"
            placeholder="Search leads, companies…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="icon-btn" aria-label="Notifications">
          <Icon name="bell" size={17} />
        </button>
        <button className="btn btn-primary" onClick={onNew}>
          <Icon name="plus" size={16} />New search
        </button>
      </div>
    </div>
  );
}
