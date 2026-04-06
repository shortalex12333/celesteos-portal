import { useState, useEffect } from "react";
import { FileText, Columns3, GitCompare, Check } from "lucide-react";
import type { ImportSession } from "../../types/import";

interface Props {
  session: ImportSession;
}

const DETECT_STEPS = [
  { label: "Reading file structure", icon: FileText },
  { label: "Detecting columns", icon: Columns3 },
  { label: "Matching to CelesteOS fields", icon: GitCompare },
];

export default function DetectingScreen({ session }: Props) {
  const hasResult = session.detection_result !== null;
  const [activeStep, setActiveStep] = useState(0);

  // Simulate step progression for visual feedback
  useEffect(() => {
    if (hasResult) {
      setActiveStep(DETECT_STEPS.length);
      return;
    }
    const timer = setInterval(() => {
      setActiveStep((prev) =>
        prev < DETECT_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 1200);
    return () => clearInterval(timer);
  }, [hasResult]);

  const matchedCount = hasResult
    ? session.detection_result!.data_files.reduce(
        (sum, f) => sum + f.columns.filter((c) => c.suggested_target).length,
        0
      )
    : 0;
  const totalCols = hasResult
    ? session.detection_result!.data_files.reduce(
        (sum, f) => sum + f.columns.length,
        0
      )
    : 0;

  return (
    <div className="panel-premium fade-in">
      {/* Glass header */}
      <div className="glass-hdr">
        <span className="glass-hdr-title">Analysing</span>
        <span className="glass-hdr-meta">
          {session.file_paths?.[0]?.split("/").pop() || "..."}
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Detection steps */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0" }}
          aria-live="polite"
        >
          {DETECT_STEPS.map((step, i) => {
            const isDone = hasResult || i < activeStep;
            const isActive = !hasResult && i === activeStep;
            const Icon = isDone ? Check : step.icon;

            return (
              <div
                key={step.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom:
                    i < DETECT_STEPS.length - 1
                      ? "1px solid var(--border-faint)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDone
                      ? "var(--green)"
                      : isActive
                        ? "var(--teal-bg)"
                        : "transparent",
                    border: isDone
                      ? "none"
                      : isActive
                        ? "1.5px solid var(--mark)"
                        : "1.5px solid var(--border-sub)",
                    transition: "all 300ms ease",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={13}
                    style={{
                      color: isDone
                        ? "#fff"
                        : isActive
                          ? "var(--mark)"
                          : "var(--txt-ghost)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 500 : 400,
                    color: isDone
                      ? "var(--txt3)"
                      : isActive
                        ? "var(--txt)"
                        : "var(--txt-ghost)",
                    transition: "color 300ms",
                  }}
                  aria-label={
                    isDone
                      ? `${step.label}: complete`
                      : isActive
                        ? `${step.label}: in progress`
                        : `${step.label}: pending`
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Shimmer skeleton (while detecting) */}
        {!hasResult && (
          <div style={{ marginTop: "20px" }}>
            <div
              className="shimmer-row"
              style={{ width: "100%", marginBottom: "6px" }}
            />
            <div
              className="shimmer-row"
              style={{ width: "85%", marginBottom: "6px" }}
            />
            <div
              className="shimmer-row"
              style={{ width: "70%", marginBottom: "6px" }}
            />
            <div className="shimmer-row" style={{ width: "60%" }} />
          </div>
        )}

        {/* Live match counter (when detection complete) */}
        {hasResult && (
          <div
            className="fade-in"
            style={{
              marginTop: "20px",
              padding: "14px 16px",
              borderRadius: "6px",
              background: "var(--teal-bg)",
              border: "1px solid rgba(58,124,157,0.18)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              className="counter-tick"
              style={{
                fontSize: "20px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--mark)",
              }}
            >
              {matchedCount}
            </span>
            <span style={{ fontSize: "13px", color: "var(--txt2)" }}>
              of {totalCols} fields auto-matched
            </span>
          </div>
        )}

        {/* File info */}
        {session.file_paths && session.file_paths.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            {session.file_paths.map((path) => {
              const filename = path.split("/").pop() || path;
              return (
                <p
                  key={path}
                  className="mono"
                  style={{
                    fontSize: "12px",
                    color: "var(--txt-ghost)",
                    margin: "0 0 2px",
                  }}
                >
                  {filename}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
