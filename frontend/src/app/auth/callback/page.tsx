"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.access_token) {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session.access_token }),
          });
          router.replace("/");
        } else if (event === "SIGNED_OUT") {
          router.replace("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div
      className="auth-page"
      style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}
    >
      <div style={{ textAlign: "center" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid var(--border)", borderTopColor: "var(--accent)",
            animation: "spin .75s linear infinite", margin: "0 auto 14px",
          }}
        />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Signing you in…</p>
      </div>
    </div>
  );
}
