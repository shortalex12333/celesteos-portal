import { useState } from "react";
import type { ImportSession } from "../../types/import";
import type { ImportApi } from "../../lib/importApi";

interface Props {
  session: ImportSession;
  api?: ImportApi;
  onUpdate?: (s: ImportSession) => void;
}

export default function RollbackScreen({ session, api, onUpdate }: Props) {
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedAt = session.completed_at
    ? new Date(session.completed_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "unknown date";

  const totalDeleted = session.records_created
    ? Object.values(session.records_created).reduce((s, n) => s + n, 0)
    : 0;

  if (session.status === "rolled_back") {
    return (
      <div className="panel-premium fade-in">
        <div className="glass-hdr">
          <span className="glass-hdr-title">Rolled back</span>
        </div>
        <div style={{ padding: "28px 24px" }}>
          <p style={{ fontSize: "13px", color: "var(--txt2)", margin: 0 }}>
            All {totalDeleted} imported records have been reversed. No vessel data was affected.
          </p>
        </div>
      </div>
    );
  }

  async function handleRollback() {
    if (!api) return;
    setRolling(true);
    setError(null);
    try {
      await api.rollback(session.id);
      const updated = await api.getSession(session.id);
      onUpdate?.(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Rollback failed. No changes were made."
      );
      setRolling(false);
    }
  }

  return (
    <div className="panel-premium fade-in">
      <div className="glass-hdr">
        <span className="glass-hdr-title" style={{ color: "var(--red)" }}>Rollback</span>
        <span className="glass-hdr-meta">{totalDeleted} records will be removed</span>
      </div>
      <div style={{ padding: "24px" }}>
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--txt)",
          marginBottom: "8px",
        }}
      >
        Rollback import
      </h2>
      <p style={{ fontSize: "13px", color: "var(--txt)", margin: "0 0 4px" }}>
        This will reverse all {totalDeleted} records imported on{" "}
        <span style={{ fontFamily: "var(--font-mono)" }}>{completedAt}</span>.
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "var(--red)",
          margin: "0 0 20px",
        }}
      >
        This action cannot be undone.
      </p>

      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--red)",
            marginBottom: "12px",
          }}
        >
          {error}
        </p>
      )}

      <button
        className="btn-brand"
        style={{ background: "var(--red)", marginBottom: "12px" }}
        onClick={handleRollback}
        disabled={rolling || !api}
        aria-disabled={rolling || !api}
      >
        {rolling ? "Rolling back..." : "Confirm rollback"}
      </button>

      <div style={{ textAlign: "center" }}>
        <a
          href={`/import/${session.id}`}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--mark)",
            textDecoration: "none",
          }}
        >
          Cancel
        </a>
      </div>
      </div>
    </div>
  );
}
