"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icons";

interface User {
  id: string;
  email: string;
  username: string;
  phone: string;
}

type Section = null | "username" | "email" | "phone" | "password";

interface Feedback { ok: boolean; msg: string }

export function SettingsView({ onSignOut }: { onSignOut: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Section>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=hidden 1=confirm 2=deleting
  const [emailRevealed, setEmailRevealed] = useState(false);

  const [usernameVal, setUsernameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: User) => { setUser(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing) setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [editing]);

  function startEdit(section: Section) {
    setFeedback(null);
    setEditing(section);
    if (section === "username") setUsernameVal(user?.username ?? "");
    if (section === "email") setEmailVal(user?.email ?? "");
    if (section === "phone") setPhoneVal(user?.phone ?? "");
    if (section === "password") { setNewPw(""); setConfirmPw(""); }
  }

  function cancelEdit() { setEditing(null); setFeedback(null); }

  async function save(updates: Record<string, string>, successMsg: string) {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setFeedback({ ok: false, msg: data.error ?? "Update failed." });
      } else {
        setFeedback({ ok: true, msg: successMsg });
        if (updates.username !== undefined) setUser((u) => u ? { ...u, username: updates.username } : u);
        if (updates.email !== undefined) setUser((u) => u ? { ...u, email: updates.email } : u);
        if (updates.phone !== undefined) setUser((u) => u ? { ...u, phone: updates.phone } : u);
        setEditing(null);
      }
    } catch {
      setFeedback({ ok: false, msg: "Network error." });
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleteStep(2);
    const res = await fetch("/api/auth/account", { method: "DELETE" });
    if (res.ok) {
      onSignOut();
    } else {
      const data = await res.json() as { error?: string };
      setFeedback({ ok: false, msg: data.error ?? "Delete failed." });
      setDeleteStep(0);
    }
  }

  if (loading) {
    return (
      <div className="fade-up">
        <div className="page-head"><div><h1 className="page-title">Settings</h1></div></div>
        <div style={{ color: "var(--muted)", fontSize: 14, padding: "40px 0" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 600 }}>
      <div className="page-head" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your account and preferences.</p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13.5,
            background: feedback.ok ? "var(--pos-bg, #f0fdf4)" : "var(--neg-bg, #fef2f2)",
            color: feedback.ok ? "var(--pos, #16a34a)" : "var(--neg, #dc2626)",
            border: `1px solid ${feedback.ok ? "var(--pos-border, #bbf7d0)" : "var(--neg-border, #fecaca)"}`,
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Account Info */}
      <div className="card panel-pad" style={{ marginBottom: 16 }}>
        <SectionHead>Account info</SectionHead>

        <FieldRow
          label="Username"
          value={user?.username || "—"}
          onEdit={() => startEdit("username")}
          isEditing={editing === "username"}
        >
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <input
                ref={firstInputRef}
                className="input"
                value={usernameVal}
                onChange={(e) => setUsernameVal(e.target.value)}
                placeholder="Your username"
                onKeyDown={(e) => { if (e.key === "Enter") save({ username: usernameVal }, "Username updated."); if (e.key === "Escape") cancelEdit(); }}
              />
            </div>
            <SaveCancel saving={saving} onSave={() => save({ username: usernameVal }, "Username updated.")} onCancel={cancelEdit} />
          </div>
        </FieldRow>

        <FieldRow
          label="Email"
          value={emailRevealed ? (user?.email ?? "") : maskEmail(user?.email ?? "")}
          valueExtra={
            !editing && (
              <button
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, color: "var(--accent, #6366f1)", fontWeight: 500 }}
                onClick={() => setEmailRevealed((v) => !v)}
              >
                {emailRevealed ? "Hide" : "Reveal"}
              </button>
            )
          }
          onEdit={() => startEdit("email")}
          isEditing={editing === "email"}
        >
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <input
                ref={firstInputRef}
                className="input"
                type="email"
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="new@email.com"
                onKeyDown={(e) => { if (e.key === "Enter") save({ email: emailVal }, "Confirmation email sent. Check your inbox."); if (e.key === "Escape") cancelEdit(); }}
              />
            </div>
            <SaveCancel saving={saving} onSave={() => save({ email: emailVal }, "Confirmation email sent. Check your inbox.")} onCancel={cancelEdit} />
          </div>
        </FieldRow>

        <FieldRow
          label="Phone number"
          value={user?.phone || "No phone number added yet."}
          valueStyle={!user?.phone ? { color: "var(--muted)" } : undefined}
          editLabel={user?.phone ? "Edit" : "Add"}
          onEdit={() => startEdit("phone")}
          isEditing={editing === "phone"}
          last
        >
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <input
                ref={firstInputRef}
                className="input"
                type="tel"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                placeholder="+1 555 000 0000"
                onKeyDown={(e) => { if (e.key === "Enter") save({ phone: phoneVal }, "Phone number saved."); if (e.key === "Escape") cancelEdit(); }}
              />
            </div>
            <SaveCancel saving={saving} onSave={() => save({ phone: phoneVal }, "Phone number saved.")} onCancel={cancelEdit} />
          </div>
        </FieldRow>
      </div>

      {/* Password & Security */}
      <div className="card panel-pad" style={{ marginBottom: 16 }}>
        <SectionHead>Password &amp; security</SectionHead>

        <FieldRow
          label="Password"
          value="••••••••"
          onEdit={() => startEdit("password")}
          isEditing={editing === "password"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <div className="input-wrap">
              <input
                ref={firstInputRef}
                className="input"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div className="input-wrap">
              <input
                className="input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
              />
            </div>
            {newPw && confirmPw && newPw !== confirmPw && (
              <div style={{ fontSize: 12.5, color: "var(--neg, #dc2626)" }}>Passwords do not match.</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <SaveCancel
                saving={saving}
                disabled={!newPw || newPw !== confirmPw || newPw.length < 8}
                onSave={() => save({ password: newPw }, "Password updated.")}
                onCancel={cancelEdit}
              />
            </div>
          </div>
        </FieldRow>

        <FieldRow
          label="Multi-factor authentication"
          value=""
          editLabel="Set up ›"
          editDisabled
          onEdit={() => {}}
          isEditing={false}
        >
          <></>
        </FieldRow>

        <FieldRow
          label="Logged-in devices"
          value="1 device"
          editLabel="›"
          editDisabled
          onEdit={() => {}}
          isEditing={false}
          last
        >
          <></>
        </FieldRow>
      </div>

      {/* Danger zone */}
      <div className="card panel-pad" style={{ border: "1px solid var(--neg-border, #fecaca)" }}>
        <SectionHead>Danger zone</SectionHead>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid var(--border, #f1f5f9)" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Disable your account</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>Temporarily disable your account.</div>
          </div>
          <button className="btn btn-ghost" style={{ color: "var(--neg, #dc2626)", borderColor: "var(--neg, #dc2626)", flexShrink: 0, marginLeft: 24 }} onClick={onSignOut}>
            Disable Account
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Close your account</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>Permanently close your account.</div>
          </div>
          <div style={{ flexShrink: 0, marginLeft: 24 }}>
            {deleteStep === 0 && (
              <button
                className="btn"
                style={{ background: "var(--neg, #dc2626)", color: "#fff", border: "none" }}
                onClick={() => setDeleteStep(1)}
              >
                Delete Account
              </button>
            )}
            {deleteStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{ fontSize: 13, color: "var(--neg, #dc2626)", fontWeight: 600 }}>Are you sure? This cannot be undone.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setDeleteStep(0)}>Cancel</button>
                  <button
                    className="btn"
                    style={{ background: "var(--neg, #dc2626)", color: "#fff", border: "none" }}
                    onClick={handleDelete}
                  >
                    Yes, delete permanently
                  </button>
                </div>
              </div>
            )}
            {deleteStep === 2 && (
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Deleting…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 640, fontSize: 12.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>
      {children}
    </div>
  );
}

function FieldRow({
  label, value, valueStyle, valueExtra, editLabel = "Edit", editDisabled = false,
  onEdit, isEditing, last = false, children,
}: {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
  valueExtra?: React.ReactNode;
  editLabel?: string;
  editDisabled?: boolean;
  onEdit: () => void;
  isEditing: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "14px 0", borderBottom: last ? "none" : "1px solid var(--border, #f1f5f9)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isEditing && value && (
            <span style={{ fontSize: 13.5, color: "var(--muted)", ...valueStyle }}>{value}</span>
          )}
          {!isEditing && valueExtra}
          {!isEditing && (
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 12px", fontSize: 13, opacity: editDisabled ? 0.45 : 1, cursor: editDisabled ? "default" : "pointer" }}
              onClick={editDisabled ? undefined : onEdit}
            >
              {editLabel}
            </button>
          )}
          {isEditing && (
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Editing…</span>
          )}
        </div>
      </div>
      {isEditing && children}
    </div>
  );
}

function SaveCancel({ saving, disabled = false, onSave, onCancel }: {
  saving: boolean;
  disabled?: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <button
        className="btn btn-primary"
        onClick={onSave}
        disabled={saving || disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>
        Cancel
      </button>
    </>
  );
}

function maskEmail(email: string) {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  return "•".repeat(Math.min(at, 16)) + email.slice(at);
}
