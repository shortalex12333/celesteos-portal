import { Check, ExternalLink } from "lucide-react";
import type { ImportSession } from "../../types/import";
import type { ImportApi } from "../../lib/importApi";

interface Props {
  session: ImportSession;
  api?: ImportApi;
  onUpdate?: (s: ImportSession) => void;
}

const DOMAIN_LABELS: Record<string, string> = {
  equipment: "Equipment",
  work_orders: "Work orders",
  faults: "Faults",
  parts: "Parts",
  vessel_certificates: "Vessel certificates",
  crew_certificates: "Crew certificates",
};

export default function CommitScreen({ session, api, onUpdate }: Props) {
  const isImporting = session.status === "importing";
  const records = session.records_created;

  const totalRecords = records
    ? Object.values(records).reduce((sum, n) => sum + n, 0)
    : 0;

  if (isImporting) {
    return (
      <div className="panel-premium fade-in">
        <div className="glass-hdr">
          <span className="glass-hdr-title">Importing</span>
          <span className="glass-hdr-meta">Writing records...</span>
        </div>
        <div style={{ padding: "32px 24px" }} aria-live="polite">
          {/* Parallel processing tracks */}
          {["Writing equipment records", "Writing work orders", "Updating search index"].map(
            (label, i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom:
                    i < 2 ? "1px solid var(--border-faint)" : "none",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      i === 0
                        ? "var(--teal-bg)"
                        : "transparent",
                    border:
                      i === 0
                        ? "1.5px solid var(--mark)"
                        : "1.5px solid var(--border-sub)",
                    flexShrink: 0,
                  }}
                >
                  {i === 0 ? (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--mark)",
                        animation: "pulse-dot 1.5s ease-in-out infinite",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "var(--txt-ghost)",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color:
                      i === 0 ? "var(--txt)" : "var(--txt-ghost)",
                  }}
                >
                  {label}
                </span>
              </div>
            )
          )}

          {/* Shimmer bars */}
          <div style={{ marginTop: "20px" }}>
            <div className="shimmer-row" style={{ width: "100%", marginBottom: "6px" }} />
            <div className="shimmer-row" style={{ width: "75%", marginBottom: "6px" }} />
            <div className="shimmer-row" style={{ width: "50%" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Completed ──
  return (
    <div className="panel-premium fade-in">
      <div className="glass-hdr">
        <span className="glass-hdr-title">Complete</span>
        <span className="glass-hdr-meta mono">
          {totalRecords} records imported
        </span>
      </div>

      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        {/* Animated checkmark */}
        <div className="check-circle">
          <Check size={24} strokeWidth={3} />
        </div>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--txt)",
            margin: "0 0 4px",
          }}
        >
          Import complete
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--txt2)",
            margin: "0 0 24px",
          }}
        >
          {totalRecords} record{totalRecords !== 1 ? "s" : ""} imported
          across{" "}
          {records ? Object.keys(records).filter((k) => records[k] > 0).length : 0}{" "}
          domains.
        </p>

        {/* Domain breakdown */}
        {records && (
          <div
            style={{
              textAlign: "left",
              marginBottom: "24px",
              padding: "16px",
              borderRadius: "6px",
              background: "var(--surface-base)",
              border: "1px solid var(--border-faint)",
            }}
          >
            {Object.entries(records).map(([domain, count]) => {
              if (count === 0) return null;
              return (
                <div key={domain} className="summary-row">
                  <span className="summary-domain">
                    {DOMAIN_LABELS[domain] || domain}
                  </span>
                  <span className="summary-count">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        <p
          style={{
            fontSize: "12px",
            color: "var(--txt-ghost)",
            margin: "0 0 4px",
          }}
        >
          Records are being indexed. Searchable within a few minutes.
        </p>

        {session.rollback_available_until && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--txt3)",
              margin: "0 0 24px",
            }}
          >
            Rollback available until{" "}
            <span className="mono">
              {new Date(session.rollback_available_until).toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "short", year: "numeric" }
              )}
            </span>
          </p>
        )}

        {/* CTA: Open CelesteOS */}
        <a
          href="https://app.celeste7.ai"
          className="btn-brand"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textDecoration: "none",
            marginBottom: "12px",
            boxShadow: "0 0 20px rgba(58,124,157,0.2)",
          }}
        >
          Open CelesteOS
          <ExternalLink size={14} />
        </a>

        <a
          href={`/import/${session.id}?rollback=true`}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--mark)",
            textDecoration: "none",
          }}
        >
          Rollback this import
        </a>
      </div>
    </div>
  );
}
