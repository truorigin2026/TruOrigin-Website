"use client";

// Root-level safety net: if anything throws during render anywhere in the
// app and no closer error.tsx catches it, this replaces the entire page
// (including <html>/<body>, since it sits above the root layout) instead
// of leaving a blank/stuck white screen that only a manual reload fixes.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
            background: "#f7faf8",
            color: "#123a25",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: "14px", color: "#5e6d63", margin: 0, maxWidth: "420px" }}>
            This page ran into an unexpected error. Try again, or refresh the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "8px",
              padding: "10px 22px",
              borderRadius: "999px",
              border: "none",
              background: "#1a7a44",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
