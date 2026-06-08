export default function BlockedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e0e10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "#d23f33",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          P
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 680,
              color: "#f4f4f5",
              letterSpacing: "-0.02em",
            }}
          >
            Access restricted
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#71717a",
              lineHeight: 1.6,
              maxWidth: "36ch",
            }}
          >
            Prospela is currently in private beta. Your account isn&apos;t on
            the access list yet.
          </p>
        </div>

        <div
          style={{
            background: "#18181a",
            border: "1px solid #27272a",
            borderRadius: 12,
            padding: "16px 20px",
            width: "100%",
            fontSize: 14,
            color: "#a1a1aa",
            lineHeight: 1.6,
          }}
        >
          Want early access? Contact{" "}
          <a
            href="mailto:learnhtolearn@gmail.com"
            style={{ color: "#d23f33", textDecoration: "none" }}
          >
            learnhtolearn@gmail.com
          </a>{" "}
          to request an invite.
        </div>

        <a
          href="/login"
          style={{
            fontSize: 13,
            color: "#52525b",
            textDecoration: "none",
            marginTop: 4,
          }}
        >
          ← Back to login
        </a>
      </div>
    </div>
  );
}
