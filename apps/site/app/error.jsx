'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Something went wrong</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{String(error?.message || "Unknown error")}</pre>
      {typeof reset === "function" && (
        <button
          style={{ marginTop: 12, border: "1px solid #e5e7eb", padding: "6px 10px", borderRadius: 8 }}
          onClick={() => reset()}
        >
          Try again
        </button>
      )}
    </div>
  );
}
