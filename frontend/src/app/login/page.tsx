"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icons";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace(searchParams.get("from") ?? "/");
    } else {
      setError("Incorrect password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth">
      {/* Left aside */}
      <div className="auth-aside">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-mark">
            <Icon name="spark" size={20} />
          </div>
          <div className="brand-name" style={{ color: "var(--side-text)" }}>Prospela</div>
        </div>

        <div className="auth-feat">
          {[
            "Describe your buyer in plain English",
            "AI scrapes & verifies real contacts",
            "Up to 10× pipeline in minutes, not weeks",
          ].map((t) => (
            <div className="feat-row" key={t}>
              <span className="tick"><Icon name="check" size={13} /></span>
              <span>{t}</span>
            </div>
          ))}
        </div>

        <blockquote className="auth-quote">
          &ldquo;We replaced a list-buying budget with a single text box.&rdquo;
        </blockquote>
        <div className="auth-by">Dana Okonkwo · Head of Growth, Tablefin</div>
      </div>

      {/* Right form */}
      <div className="auth-main">
        <div className="auth-card fade-up">
          <h1
            className="page-title"
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: "var(--head-weight)",
              letterSpacing: "var(--head-tracking)",
              fontSize: 27,
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, marginBottom: 0, fontSize: "calc(var(--fs-base) + 0.5px)", lineHeight: 1.5 }}>
            Sign in to generate and manage your B2B leads.
          </p>

          <div style={{ height: 26 }} />

          <form
            className="psp-stack"
            style={{ gap: 16 }}
            onSubmit={handleSubmit}
          >
            <div className="field">
              <label className="label">Access password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
                required
              />
            </div>

            {error && (
              <p style={{ color: "#b91c1c", fontSize: "calc(var(--fs-base) - 1px)", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", height: "var(--ctrl-h)" }}
              type="submit"
              disabled={loading || !password}
            >
              {loading ? "Checking…" : "Sign in"}
              {!loading && <Icon name="arrow-right" size={16} />}
            </button>
          </form>
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
