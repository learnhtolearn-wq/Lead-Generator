"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Icon } from "@/components/Icons";

type Mode = "login" | "register";

function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({})) as {
      success?: boolean;
      needsConfirmation?: boolean;
      error?: string;
    };

    if (data.needsConfirmation) {
      setInfo("Check your inbox to confirm your account, then sign in.");
      setMode("login");
      setLoading(false);
      return;
    }

    if (res.ok && data.success) {
      router.replace(searchParams.get("from") ?? "/");
      return;
    }

    setError(data.error ?? (mode === "login" ? "Invalid credentials." : "Registration failed."));
    setLoading(false);
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

  const isRegister = mode === "register";

  return (
    <div className="auth-page auth">
      {/* ── Left aside ── */}
      <div className="auth-aside">
        <div className="brand" style={{ padding: 0, position: "relative", zIndex: 1 }}>
          <div className="brand-mark" style={{ background: "rgba(255,255,255,.22)", boxShadow: "none" }}>
            <Icon name="spark" size={20} />
          </div>
          <div className="brand-name" style={{ color: "#fff" }}>Prospela</div>
        </div>

        <div className="auth-headline" style={{ position: "relative", zIndex: 1 }}>
          <h2 className="auth-quote">
            Find your next clients, not your next headaches.
          </h2>
          <p className="auth-tagline">
            Describe your ideal buyer in plain English. Our AI handles the rest.
          </p>
        </div>

        <div className="auth-stats" style={{ position: "relative", zIndex: 1 }}>
          {[
            { val: "12k+", lbl: "Leads generated" },
            { val: "87%",  lbl: "Match accuracy" },
            { val: "4.8",  lbl: "User rating" },
          ].map(({ val, lbl }) => (
            <div className="auth-stat" key={lbl}>
              <span className="auth-stat-val">{val}</span>
              <span className="auth-stat-lbl">{lbl}</span>
            </div>
          ))}
        </div>

        <div className="auth-feat" style={{ position: "relative", zIndex: 1 }}>
          {[
            "Describe your buyer in plain English",
            "AI scrapes & verifies real contacts",
            "Up to 10× pipeline in minutes, not weeks",
          ].map((t) => (
            <div className="feat-row" key={t}>
              <span className="tick"><Icon name="check" size={12} /></span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-main">
        <div className="auth-card fade-up">
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: "var(--head-weight)",
              letterSpacing: "var(--head-tracking)",
              fontSize: 27,
              margin: 0,
              color: "var(--text)",
            }}
          >
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, marginBottom: 0, fontSize: "calc(var(--fs-base) + 0.5px)", lineHeight: 1.5 }}>
            {isRegister
              ? "Set up your Prospela account to start generating leads."
              : "Sign in to generate and manage your B2B leads."}
          </p>

          <div style={{ height: 28 }} />

          <button
            type="button"
            className="btn btn-google"
            style={{ width: "100%", height: "var(--ctrl-h)" }}
            onClick={handleGoogleSignIn}
          >
            <Icon name="google" size={18} />
            Continue with Google
          </button>

          <div className="auth-divider" style={{ margin: "16px 0" }}>or</div>

          <form className="psp-stack" style={{ gap: 16 }} onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Email address</label>
              <div className="input-wrap">
                <span className="lead-ic" style={{ pointerEvents: "none" }}>
                  <Icon name="mail" size={16} />
                </span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div className="input-wrap">
                <span className="lead-ic" style={{ pointerEvents: "none" }}>
                  <Icon name="lock" size={16} />
                </span>
                <input
                  className="input has-trail"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Min. 8 characters" : "Enter your password"}
                  required
                  minLength={isRegister ? 8 : 1}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, background: "none", border: "none",
                    cursor: "pointer", padding: 0, color: "var(--text-faint)",
                    display: "flex", alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
            </div>

            {info && (
              <p style={{ color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 13px", fontSize: "calc(var(--fs-base) - 1px)", margin: 0 }}>
                {info}
              </p>
            )}

            {error && (
              <p style={{ color: "#b91c1c", fontSize: "calc(var(--fs-base) - 1px)", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", height: "var(--ctrl-h)", marginTop: 4 }}
              type="submit"
              disabled={loading || !email || !password}
            >
              {loading
                ? isRegister ? "Creating account…" : "Signing in…"
                : isRegister ? "Create account" : "Sign in"}
              {!loading && <Icon name="arrow-right" size={16} />}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: "calc(var(--fs-base) - 1px)", color: "var(--text-muted)" }}>
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                  style={{ color: "var(--accent-ink)", fontWeight: 580, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); setInfo(""); }}
                  style={{ color: "var(--accent-ink)", fontWeight: 580, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>
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
