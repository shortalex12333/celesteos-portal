import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, ArrowLeft } from "lucide-react";
import type { ImportSession, DomainSummary } from "../../types/import";
import type { ImportApi } from "../../lib/importApi";

interface Props {
  session: ImportSession;
  api: ImportApi;
  onUpdate: (s: ImportSession) => void;
}

const DOMAIN_LABELS: Record<string, string> = {
  equipment: "Equipment",
  work_orders: "Work orders",
  faults: "Faults",
  parts: "Parts",
  vessel_certificates: "Vessel certificates",
  crew_certificates: "Crew certificates",
};

export default function PreviewScreen({ session, api, onUpdate }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = session.preview_summary;
  if (!preview) {
    return (
      <div className="card-brand" style={{ padding: "28px" }}>
        <p style={{ color: "var(--txt2)", fontSize: "13px", margin: 0 }}>
          Generating preview...
        </p>
      </div>
    );
  }

  function toggleDomain(domain: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  async function handleCommit() {
    setCommitting(true);
    setError(null);
    try {
      await api.commit(session.id);
      const updated = await api.getSession(session.id);
      onUpdate(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Commit failed. No changes were made."
      );
      setCommitting(false);
    }
  }

  async function handleCancel() {
    // Navigate back — for MVP, just reload
    window.location.href = "/import";
  }

  const domains = Object.entries(preview.domains) as [string, DomainSummary][];

  return (
    <div className="panel-premium fade-in">
      {/* Glass header */}
      <div className="glass-hdr">
        <span className="glass-hdr-title">Preview</span>
        <span className="glass-hdr-meta">
          {preview.total_records} records · {domains.length} domain{domains.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ padding: "20px 24px 0" }}>
        <p style={{ fontSize: "13px", color: "var(--txt2)", margin: 0 }}>
          Review the data below. Nothing is written until you confirm.
        </p>
      </div>

      {/* Domain sections */}
      <div style={{ padding: "16px 0" }}>
        {domains.map(([domain, summary]) => {
          const isExpanded = expanded.has(domain);
          const first10 = preview.first_10[domain] || [];
          const label = DOMAIN_LABELS[domain] || domain;

          return (
            <div key={domain}>
              {/* Domain header */}
              <button
                type="button"
                onClick={() => toggleDomain(domain)}
                aria-expanded={isExpanded}
                aria-label={`${label}: ${summary.total} records`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 28px",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid var(--border-sub)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--txt)",
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={14} style={{ color: "var(--txt-ghost)" }} />
                ) : (
                  <ChevronRight size={14} style={{ color: "var(--txt-ghost)" }} />
                )}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    color: "var(--txt3)",
                    flex: 1,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--txt3)",
                  }}
                >
                  {summary.total} records
                </span>
                {summary.duplicates > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--amber)",
                    }}
                  >
                    {summary.duplicates} duplicates
                  </span>
                )}
                {summary.warnings_count > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--amber)",
                    }}
                  >
                    {summary.warnings_count} warning{summary.warnings_count !== 1 ? "s" : ""}
                  </span>
                )}
              </button>

              {/* Expanded rows */}
              {isExpanded && first10.length > 0 && (
                <div style={{ padding: "0 28px 8px 50px" }}>
                  {first10.map((row, i) => {
                    const values = Object.entries(row)
                      .slice(0, 4)
                      .map(([, v]) => String(v ?? "—"));
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "6px 0",
                          fontSize: "12px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--txt3)",
                          borderBottom:
                            i < first10.length - 1
                              ? "1px solid var(--border-faint)"
                              : "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {values.join("  ·  ")}
                      </div>
                    );
                  })}
                  {summary.total > 10 && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--txt-ghost)",
                        margin: "6px 0 0",
                      }}
                    >
                      ... and {summary.total - 10} more
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {preview.warnings.length > 0 && (
        <div
          style={{
            margin: "0 28px 16px",
            padding: "10px 12px",
            borderRadius: "6px",
            background: "var(--amber-bg)",
            border: "1px solid var(--amber-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            <AlertTriangle size={13} style={{ color: "var(--amber)" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--amber)",
              }}
            >
              {preview.warnings.length} warning
              {preview.warnings.length !== 1 ? "s" : ""}
            </span>
          </div>
          {preview.warnings.map((w, i) => (
            <p
              key={i}
              style={{
                fontSize: "12px",
                color: "var(--txt2)",
                margin: i > 0 ? "4px 0 0" : 0,
              }}
            >
              {w.domain && (
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--txt3)" }}>
                  {w.domain}
                  {w.row != null ? ` row ${w.row}` : ""}
                  {w.field ? `, ${w.field}` : ""}:{" "}
                </span>
              )}
              {w.message}
            </p>
          ))}
        </div>
      )}

      {/* Error with retry */}
      {error && (
        <div style={{ padding: "0 24px 16px" }}>
          <p style={{ fontSize: "12px", color: "var(--red)", margin: "0 0 8px" }}>
            {error}
          </p>
          <button
            onClick={() => { setError(null); setCommitting(false); }}
            style={{
              background: "none",
              border: "none",
              fontSize: "12px",
              color: "var(--mark)",
              cursor: "pointer",
              padding: 0,
              fontFamily: "var(--font-sans)",
            }}
          >
            Dismiss and retry
          </button>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          padding: "0 24px 24px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--txt3)",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--font-sans)",
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="btn-brand"
          onClick={handleCommit}
          disabled={!preview.can_commit || committing}
          style={{ flex: 1 }}
          title={
            !preview.can_commit
              ? "Cannot commit — resolve errors first"
              : undefined
          }
        >
          {committing ? "Committing..." : "Commit import"}
        </button>
      </div>

    </div>
  );
}
