import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type {
  ImportSession,
  ColumnMapping,
  ColumnMap,
  DetectedFile,
} from "../../types/import";
import type { ImportApi } from "../../lib/importApi";
import MappingRow from "./MappingRow";

interface Props {
  session: ImportSession;
  api: ImportApi;
  onUpdate: (s: ImportSession) => void;
}

interface FileMapping {
  file: string;
  domain: string;
  columns: ColumnMapping[];
}

function buildInitialMappings(session: ImportSession): FileMapping[] {
  if (!session.detection_result) return [];

  return session.detection_result.data_files.map((file) => ({
    file: file.filename,
    domain: file.domain,
    columns: file.columns.map((col) => {
      // File reference columns default to link_as_document
      if (col.inferred_type === "file_ref") {
        return {
          source: col.source_name,
          target: "file_ref",
          action: "link_as_document" as const,
        };
      }
      return {
        source: col.source_name,
        target: col.suggested_target ?? null,
        action: col.action ?? (col.suggested_target ? "map" as const : "skip" as const),
      };
    }),
  }));
}

export default function MappingScreen({ session, api, onUpdate }: Props) {
  const [mappings, setMappings] = useState<FileMapping[]>(() =>
    buildInitialMappings(session)
  );
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session.detection_result || !session.celeste_vocabulary) {
    return (
      <div className="card-brand" style={{ padding: "28px" }}>
        <p style={{ color: "var(--red)", fontSize: "13px", margin: 0 }}>
          Detection result not available.
        </p>
      </div>
    );
  }

  const files = session.detection_result.data_files;

  function updateColumn(
    fileIndex: number,
    colIndex: number,
    target: string | null,
    action: "map" | "skip" | "link_as_document"
  ) {
    setMappings((prev) => {
      const next = [...prev];
      next[fileIndex] = {
        ...next[fileIndex],
        columns: next[fileIndex].columns.map((col, i) =>
          i === colIndex ? { ...col, target, action } : col
        ),
      };
      return next;
    });
  }

  // Check if all red columns (< 60% confidence) have been resolved
  const allResolved = mappings.every((fileMap, fi) =>
    fileMap.columns.every((col, ci) => {
      const detected = files[fi]?.columns[ci];
      if (!detected) return true;
      // File ref columns with link_as_document are resolved
      if (col.action === "link_as_document") return true;
      if ((detected.confidence ?? 0) >= 0.6 && col.target) return true;
      // Red columns must be explicitly mapped or skipped
      return col.action === "skip" || (col.action === "map" && col.target);
    })
  );

  // Count columns needing review (exclude file_ref — they're auto-detected)
  const reviewCount = mappings.reduce((count, fileMap, fi) => {
    return (
      count +
      fileMap.columns.filter((col, ci) => {
        const detected = files[fi]?.columns[ci];
        if (!detected) return false;
        if (detected.inferred_type === "file_ref") return false;
        return (detected.confidence ?? 0) < 0.6 && col.action !== "skip" && !col.target;
      }).length
    );
  }, 0);

  // Count file reference columns
  const fileRefCount = files.reduce(
    (count, file) => count + file.columns.filter((c) => c.inferred_type === "file_ref").length,
    0
  );

  // Check required mappings — at least one source column must target each required field
  const missingRequired: { domain: string; field: string }[] = [];
  mappings.forEach((fileMap) => {
    const required =
      session.celeste_vocabulary?.[fileMap.domain]?.required || [];
    const mappedTargets = new Set(
      fileMap.columns
        .filter((c) => c.action === "map" && c.target)
        .map((c) => c.target)
    );
    for (const field of required) {
      if (!mappedTargets.has(field)) {
        missingRequired.push({ domain: fileMap.domain, field });
      }
    }
  });

  // Detect duplicate targets — two source columns mapping to the same CelesteOS field
  const duplicateTargets = new Set<string>();
  mappings.forEach((fileMap) => {
    const seen = new Map<string, number>();
    fileMap.columns.forEach((col) => {
      if (col.action === "map" && col.target) {
        seen.set(col.target, (seen.get(col.target) || 0) + 1);
      }
    });
    seen.forEach((count, target) => {
      if (count > 1) duplicateTargets.add(target);
    });
  });

  const canConfirm = allResolved && missingRequired.length === 0;

  async function handleConfirm() {
    setConfirming(true);
    setError(null);

    try {
      const payload: ColumnMap[] = mappings.map((m) => ({
        file: m.file,
        domain: m.domain,
        columns: m.columns,
      }));

      await api.confirmMapping(session.id, payload);

      // Trigger dry run immediately after mapping confirmed
      await api.dryRun(session.id);

      // Refetch session to get updated state with preview_summary
      const updated = await api.getSession(session.id);
      onUpdate(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Mapping confirmation failed. No changes were made."
      );
      setConfirming(false);
    }
  }

  // Count matched vs total for badge
  const totalCols = files.reduce((s, f) => s + f.columns.length, 0);
  const matchedCols = mappings.reduce(
    (s, fm) => s + fm.columns.filter((c) =>
      (c.action === "map" && c.target) || c.action === "link_as_document"
    ).length,
    0
  );

  return (
    <div className="panel-premium fade-in" style={{ overflow: "visible" }}>
      {/* Glass header */}
      <div className="glass-hdr">
        <span className="glass-hdr-title">Column mapping</span>
        <span className="glass-hdr-meta">
          <span className="match-badge green">
            {matchedCols} of {totalCols} matched
          </span>
        </span>
      </div>

      <div style={{ padding: "20px 24px 0" }}>
        <p style={{ fontSize: "12px", color: "var(--txt-ghost)", margin: "0 0 4px" }}>
          Verify each mapping before proceeding. Columns marked red require
          manual assignment.
        </p>
      </div>

      <div style={{ padding: "16px 0" }}>
        {files.map((file, fi) => {
          const vocab =
            session.celeste_vocabulary?.[file.domain]?.mappable || [];

          return (
            <div key={file.filename} style={{ marginBottom: fi < files.length - 1 ? "24px" : 0 }}>
              {/* File header */}
              <div
                style={{
                  padding: "8px 28px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  borderBottom: "1px solid var(--border-sub)",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    color: "var(--txt)",
                  }}
                >
                  {file.filename}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--txt-ghost)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {file.row_count} rows
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--txt-ghost)",
                    marginLeft: "auto",
                  }}
                >
                  → {file.domain}
                </span>
              </div>

              {/* Mapping table */}
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--txt-ghost)",
                          borderBottom: "1px solid var(--border-faint)",
                        }}
                      >
                        Source column
                      </th>
                      <th
                        style={{
                          padding: "8px 8px",
                          textAlign: "left",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--txt-ghost)",
                          borderBottom: "1px solid var(--border-faint)",
                        }}
                      >
                        CelesteOS field
                      </th>
                      <th
                        style={{
                          padding: "8px 8px",
                          textAlign: "center",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--txt-ghost)",
                          borderBottom: "1px solid var(--border-faint)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Confidence
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--txt-ghost)",
                          borderBottom: "1px solid var(--border-faint)",
                        }}
                      >
                        Sample values
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.columns.map((col, ci) => (
                      <MappingRow
                        key={col.source_name}
                        sourceName={col.source_name}
                        suggestedTarget={col.suggested_target}
                        confidence={col.confidence}
                        sampleValues={col.sample_values}
                        vocabularyOptions={vocab}
                        requiredFields={
                          session.celeste_vocabulary?.[file.domain]?.required || []
                        }
                        duplicateTargets={duplicateTargets}
                        selectedTarget={
                          mappings[fi]?.columns[ci]?.target ?? null
                        }
                        action={
                          mappings[fi]?.columns[ci]?.action ?? "skip"
                        }
                        inferredType={col.inferred_type}
                        onTargetChange={(target, action) =>
                          updateColumn(fi, ci, target, action)
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* File metadata */}
              <div
                style={{
                  padding: "8px 28px",
                  display: "flex",
                  gap: "16px",
                  borderTop: "1px solid var(--border-faint)",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--txt3)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Date format:{" "}
                  {file.date_format_detected === "ambiguous" ? (
                    <select
                      style={{
                        height: "22px",
                        padding: "0 6px",
                        background: "var(--surface-base)",
                        border: "1px solid var(--amber-border)",
                        borderRadius: "3px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--amber)",
                        cursor: "pointer",
                      }}
                      defaultValue=""
                      aria-label="Select date format"
                    >
                      <option value="" disabled>Select</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                    </select>
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {file.date_format_detected}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: "11px", color: "var(--txt3)" }}>
                  Encoding:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {file.encoding_detected}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading overlay during confirm + dry-run */}
      {confirming && (
        <div
          style={{
            padding: "32px 24px",
            textAlign: "center",
            borderTop: "1px solid var(--border-sub)",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--txt)", margin: "0 0 12px" }}>
            Running preview...
          </p>
          <div className="shimmer-row" style={{ width: "100%", marginBottom: "6px" }} />
          <div className="shimmer-row" style={{ width: "80%", marginBottom: "6px" }} />
          <div className="shimmer-row" style={{ width: "60%" }} />
          <p style={{ fontSize: "12px", color: "var(--txt-ghost)", marginTop: "12px" }}>
            Validating column mappings and checking for conflicts.
          </p>
        </div>
      )}

      {/* Footer */}
      {!confirming && (
        <div style={{ padding: "0 24px 24px" }}>
          {fileRefCount > 0 && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--teal)",
                marginBottom: reviewCount > 0 ? "4px" : "12px",
              }}
            >
              {fileRefCount} document reference column{fileRefCount !== 1 ? "s" : ""} detected.
            </p>
          )}
          {reviewCount > 0 && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--amber)",
                marginBottom: "12px",
              }}
            >
              {reviewCount} column{reviewCount !== 1 ? "s" : ""} require manual
              review.
            </p>
          )}

          {missingRequired.length > 0 && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                background: "var(--red-bg)",
                border: "1px solid var(--red-border)",
                marginBottom: "12px",
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--red)", margin: "0 0 4px" }}>
                Required fields not mapped:
              </p>
              {missingRequired.map((m, i) => (
                <p
                  key={i}
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--red)", margin: "2px 0 0" }}
                >
                  {m.domain} → {m.field}
                </p>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "12px", color: "var(--red)", margin: "0 0 8px" }}>
                {error}
              </p>
              <button
                onClick={() => { setError(null); setConfirming(false); }}
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

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              to="/import"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--txt3)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} /> Upload different file
            </Link>

            <button
              className="btn-brand"
              onClick={handleConfirm}
              disabled={!canConfirm || confirming}
              aria-disabled={!canConfirm || confirming}
              title={
                !allResolved
                  ? "Assign or skip all red columns before confirming"
                  : undefined
              }
              style={{ flex: 1 }}
            >
              Confirm mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
