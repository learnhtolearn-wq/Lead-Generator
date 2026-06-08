"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Icon } from "@/components/Icons";

type Mode = "signin" | "register" | "forgot" | "sent";

const STATS: [string, string][] = [
  ["12k+", "prospects found"],
  ["87%", "verified emails"],
  ["4.8/5", "user rating"],
];

function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  function clearMessages() { setError(""); setInfo(""); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({})) as {
      success?: boolean; needsConfirmation?: boolean; error?: string;
    };

    if (data.needsConfirmation) {
      setInfo("Check your inbox to confirm your account, then sign in.");
      setMode("signin");
      setLoading(false);
      return;
    }

    if (res.ok && data.success) {
      router.replace(searchParams.get("from") ?? "/");
      return;
    }

    setError(data.error ?? (mode === "register" ? "Registration failed." : "Invalid email or password."));
    setLoading(false);
  }

  async function handleSendReset(e: FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim());
    if (!ok) { setError("Enter a valid email address."); return; }
    clearMessages();
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setLoading(false);
    setMode("sent");
  }

  async function handleGoogleSignIn() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="auth-page auth">
      {/* ── Left panel ── */}
      <div className="auth-aside">
        {/* concentric radar rings */}
        <div className="auth-rings" aria-hidden="true"><i /></div>

        {/* Brand */}
        <div className="brand" style={{ padding: 0, position: "relative", zIndex: 1 }}>
          <div className="brand-mark" style={{ background: "rgba(255,255,255,.16)", color: "#fff", boxShadow: "none" }}>
            <Icon name="spark" size={20} />
          </div>
          <div className="brand-name" style={{ color: "#fff" }}>Prospela</div>
        </div>

        {/* Headline + lede + stats */}
        <div className="auth-aside-body">
          <h2 className="auth-headline">
            Find your next customers,<br />not your next headache.
          </h2>
          <p className="auth-lede">
            Describe who you&apos;re after in plain English. Prospela&apos;s AI surfaces up to 25 verified,
            ranked prospects — with history, sorting and one-click export.
          </p>
          <div className="auth-stats">
            {STATS.map(([v, l]) => (
              <div key={l}>
                <div className="auth-stat-v">{v}</div>
                <div className="auth-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-foot-note">© 2026 Prospela — AI lead generation</div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-main">
        {/* Sign in */}
        {(mode === "signin" || mode === "register") && (
          <div className="auth-card fade-up" key={mode}>
            <h1 style={{ fontFamily: "var(--font-head)", fontWeight: "var(--head-weight)", letterSpacing: "var(--head-tracking)", fontSize: 27, margin: 0, color: "var(--text)" }}>
              {mode === "register" ? "Create account" : "Welcome back 👋"}
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: 6, marginBottom: 0, fontSize: "calc(var(--fs-base) + 0.5px)", lineHeight: 1.5 }}>
              {mode === "register"
                ? "Set up your Prospela account to start generating leads."
                : "Sign in to access your prospects."}
            </p>
            <div style={{ height: 26 }} />

            {/* Google */}
            <button type="button" className="btn btn-google" style={{ width: "100%" }} onClick={handleGoogleSignIn}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9Z"/>
                <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23Z"/>
                <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8Z"/>
                <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4Z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">or with email</div>

            <form className="psp-stack" style={{ gap: 16 }} onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Work email</label>
                <div className="input-wrap">
                  <span className="lead-ic"><Icon name="mail" size={16} /></span>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    style={{ paddingLeft: 38 }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Password</span>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); clearMessages(); setMode("forgot"); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 12.5, color: "var(--accent-ink)", fontWeight: 540, fontFamily: "inherit" }}
                    >
                      Forgot password?
                    </button>
                  )}
                </label>
                <div className="input-wrap">
                  <span className="lead-ic"><Icon name="shield" size={16} /></span>
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min. 8 characters" : "Enter your password"}
                    style={{ paddingLeft: 38, paddingRight: 42 }}
                    required
                    minLength={mode === "register" ? 8 : 1}
                  />
                  <button type="button" className="pw-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    <Icon name={showPassword ? "eye-off" : "eye"} size={17} />
                  </button>
                </div>
              </div>

              {info && (
                <p style={{ color: "var(--pos-ink, #4ade80)", background: "color-mix(in srgb, var(--pos) 12%, var(--surface))", border: "1px solid color-mix(in srgb, var(--pos) 28%, transparent)", borderRadius: "var(--r-md)", padding: "10px 13px", fontSize: "calc(var(--fs-base) - 1px)", margin: 0 }}>
                  {info}
                </p>
              )}
              {error && (
                <p style={{ color: "#f87171", background: "color-mix(in srgb, #ef4444 10%, var(--surface))", border: "1px solid color-mix(in srgb, #ef4444 28%, transparent)", borderRadius: "var(--r-md)", padding: "10px 13px", fontSize: "calc(var(--fs-base) - 1px)", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", height: "var(--ctrl-h)" }}
                type="submit"
                disabled={loading || !email || !password}
              >
                {loading
                  ? (mode === "register" ? "Creating account…" : "Signing in…")
                  : (mode === "register" ? "Create account" : "Sign in")}
                {!loading && <Icon name="arrow-right" size={16} />}
              </button>
            </form>

            <p className="hint" style={{ textAlign: "center", marginTop: 18 }}>
              {mode === "register" ? (
                <>Already have an account?{" "}
                  <button onClick={() => { setMode("signin"); clearMessages(); }} style={{ color: "var(--accent-ink)", fontWeight: 580, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}>
                    Sign in
                  </button>
                </>
              ) : (
                <>No account yet?{" "}
                  <button onClick={() => { setMode("register"); clearMessages(); }} style={{ color: "var(--accent-ink)", fontWeight: 580, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}>
                    Create one
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {/* Forgot password */}
        {mode === "forgot" && (
          <div className="auth-card fade-up" key="forgot">
            <button className="link-back" onClick={() => { clearMessages(); setMode("signin"); }}>
              <Icon name="arrow-right" size={15} style={{ transform: "rotate(180deg)" }} />
              Back to sign in
            </button>
            <h1 style={{ fontFamily: "var(--font-head)", fontWeight: "var(--head-weight)", letterSpacing: "var(--head-tracking)", fontSize: 27, margin: "14px 0 0", color: "var(--text)" }}>
              Reset your password
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: 6, marginBottom: 0, fontSize: "calc(var(--fs-base) + 0.5px)", lineHeight: 1.5 }}>
              Enter the email tied to your account and we&apos;ll send a secure link to choose a new password.
            </p>
            <div style={{ height: 24 }} />
            <form className="psp-stack" style={{ gap: 16 }} onSubmit={handleSendReset}>
              <div className="field">
                <label className="label">Work email</label>
                <div className="input-wrap">
                  <span className="lead-ic"><Icon name="mail" size={16} /></span>
                  <input
                    className="input"
                    type="email"
                    autoFocus
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); if (error) setError(""); }}
                    placeholder="you@company.com"
                    style={error ? { borderColor: "var(--accent)", paddingLeft: 38 } : { paddingLeft: 38 }}
                  />
                </div>
                {error && <span className="hint" style={{ color: "var(--accent)" }}>{error}</span>}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", height: "var(--ctrl-h)" }}
                type="submit"
                disabled={loading}
              >
                <Icon name="mail" size={16} />
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="hint" style={{ textAlign: "center", marginTop: 18 }}>
              Remembered it?{" "}
              <button onClick={() => { clearMessages(); setMode("signin"); }} style={{ color: "var(--accent-ink)", fontWeight: 580, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}>
                Sign in instead
              </button>
            </p>
          </div>
        )}

        {/* Reset link sent */}
        {mode === "sent" && (
          <div className="auth-card fade-up" key="sent" style={{ textAlign: "center" }}>
            <div className="sent-ic"><Icon name="mail" size={26} /></div>
            <h1 style={{ fontFamily: "var(--font-head)", fontWeight: "var(--head-weight)", letterSpacing: "var(--head-tracking)", fontSize: 25, margin: "18px 0 0", color: "var(--text)" }}>
              Check your inbox
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55 }}>
              We sent a password-reset link to
            </p>
            <div className="sent-email">{resetEmail}</div>
            <p className="hint" style={{ marginTop: 14, lineHeight: 1.55 }}>
              The link expires in 30 minutes. If it doesn&apos;t arrive, check spam or resend below.
            </p>
            <div style={{ height: 22 }} />
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => window.open("about:blank", "_blank")}
            >
              <Icon name="external" size={16} />Open email app
            </button>
            <div className="psp-row" style={{ justifyContent: "center", gap: 6, marginTop: 16 }}>
              <span className="hint">Didn&apos;t get it?</span>
              <button
                onClick={() => { setMode("forgot"); clearMessages(); }}
                style={{ color: "var(--accent-ink)", fontWeight: 540, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13 }}
              >
                Resend link
              </button>
              <span className="faint">·</span>
              <button
                onClick={() => { setMode("signin"); clearMessages(); }}
                style={{ color: "var(--accent-ink)", fontWeight: 540, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13 }}
              >
                Back to sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
