"use client";
import React from "react";

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size = 18, stroke = 1.6, style, className }: IconProps) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, style, className, "aria-hidden": true,
  };
  switch (name) {
    case "spark":
      return <svg {...p} fill="currentColor" stroke="none"><path d="M12 2c.4 3.6 1.8 5 5.4 5.4C13.8 7.8 12.4 9.2 12 12c-.4-2.8-1.8-4.2-5.4-4.6C10.2 7 11.6 5.6 12 2Z"/><path d="M19 12c.2 2 1 2.8 3 3-2 .2-2.8 1-3 3-.2-2-1-2.8-3-3 2-.2 2.8-1 3-3Z"/><path d="M6 14c.2 1.6.8 2.2 2.4 2.4C6.8 16.6 6.2 17.2 6 18.8c-.2-1.6-.8-2.2-2.4-2.4C5.2 16.2 5.8 15.6 6 14Z"/></svg>;
    case "dashboard":
      return <svg {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
    case "generate":
      return <svg {...p}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.2"/></svg>;
    case "leads":
      return <svg {...p}><path d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19"/><circle cx="10" cy="8" r="3.2"/><path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15 5.2a3.2 3.2 0 0 1 0 6"/></svg>;
    case "history":
      return <svg {...p}><path d="M3.5 9a9 9 0 1 1-1 4"/><path d="M3.5 4.5V9H8"/><path d="M12 8v4.5l3 2"/></svg>;
    case "settings":
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H4a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 5.2 6.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V2a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V8a1.6 1.6 0 0 0 1.5 1H22a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>;
    case "search":
      return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>;
    case "mail":
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>;
    case "globe":
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg>;
    case "building":
      return <svg {...p}><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>;
    case "pin":
      return <svg {...p}><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z"/><circle cx="12" cy="11" r="2.3"/></svg>;
    case "phone":
      return <svg {...p}><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L19 16l4 1.5V20a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4"/></svg>;
    case "check":
      return <svg {...p}><path d="m4.5 12.5 4.5 4.5 10.5-11"/></svg>;
    case "check-circle":
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
    case "chevron-right":
      return <svg {...p}><path d="m9 5 7 7-7 7"/></svg>;
    case "chevron-down":
      return <svg {...p}><path d="m5 9 7 7 7-7"/></svg>;
    case "arrow-right":
      return <svg {...p}><path d="M4 12h15M13 6l6 6-6 6"/></svg>;
    case "arrow-up":
      return <svg {...p}><path d="M12 19V5M6 11l6-6 6 6"/></svg>;
    case "plus":
      return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case "filter":
      return <svg {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case "download":
      return <svg {...p}><path d="M12 3v12M7 11l5 4 5-4M5 21h14"/></svg>;
    case "table":
      return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14.5h18M9 9v11"/></svg>;
    case "grid":
      return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "external":
      return <svg {...p}><path d="M14 4h6v6M20 4l-8 8M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>;
    case "bookmark":
      return <svg {...p}><path d="M6 4h12v16l-6-4-6 4Z"/></svg>;
    case "bell":
      return <svg {...p}><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M10 20a2 2 0 0 0 4 0"/></svg>;
    case "x":
      return <svg {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case "users-tag":
      return <svg {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="18" cy="7" r="1"/></svg>;
    case "sliders":
      return <svg {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>;
    case "link":
      return <svg {...p}><path d="M9 12h6"/><path d="M10 8H7a4 4 0 0 0 0 8h3M14 8h3a4 4 0 0 1 0 8h-3"/></svg>;
    case "shield":
      return <svg {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "tag":
      return <svg {...p}><path d="M12 2H7a2 2 0 0 0-2 2v5l8 8 7-7-8-8Z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>;
    case "zap":
      return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

const LOGO_COLORS = ["#5B6CFF","#0EA5A0","#E0833B","#C2497A","#3B82C4","#7A57C9","#2BA86B","#D4554E","#5A7A4E","#9A6BD0","#487BBE","#C68A2E"];

export function getCoLogo(name: string): { bg: string; initials: string } {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const words = name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const initials = ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? words[0]?.[1] ?? "")).toUpperCase();
  return { bg: LOGO_COLORS[h % LOGO_COLORS.length], initials };
}

export function CoLogo({ name, size = 34 }: { name: string; size?: number }) {
  const { bg, initials } = getCoLogo(name);
  return (
    <div className="co-logo" style={{ width: size, height: size, background: bg }}>
      {initials}
    </div>
  );
}
