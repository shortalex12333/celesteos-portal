import { Paperclip, FileText } from "lucide-react";
import type { ConfidenceLevel, MappingAction } from "../../types/import";

// Human-readable labels for virtual/special fields
const FIELD_DISPLAY_LABELS: Record<string, string> = {
  equipment_ref: "Equipment (name or code)",
  file_ref: "Document reference (link)",
};

function fieldLabel(field: string): string {
  return FIELD_DISPLAY_LABELS[field] || field;
}

interface Props {
  sourceName: string;
  suggestedTarget: string | null | undefined;
  confidence: number | undefined;
  sampleValues: string[];
  vocabularyOptions: string[];
  requiredFields: string[];
  duplicateTargets: Set<string>;
  selectedTarget: string | null;
  action: MappingAction;
  inferredType?: string;
  onTargetChange: (target: string | null, action: MappingAction) => void;
}

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.9) return "green";
  if (score >= 0.6) return "amber";
  return "red";
}

const ROW_CLASS: Record<ConfidenceLevel, string> = {
  green: "map-row-green",
  amber: "map-row-amber",
  red: "map-row-red",
};

const DOT_COLOR: Record<ConfidenceLevel, string> = {
  green: "var(--green)",
  amber: "var(--amber)",
  red: "var(--red)",
};

export default function MappingRow({
  sourceName,
  suggestedTarget,
  confidence,
  sampleValues,
  vocabularyOptions,
  requiredFields,
  duplicateTargets,
  selectedTarget,
  action,
  inferredType,
  onTargetChange,
}: Props) {
  const isFileRef = inferredType === "file_ref";
  const requiredSet = new Set(requiredFields);
  const isDuplicate = selectedTarget != null && action === "map" && duplicateTargets.has(selectedTarget);
  const score = confidence ?? 0;
  const level = getConfidenceLevel(score);
  const pct = Math.round(score * 100);

  function handleSelectChange(value: string) {
    if (value === "__skip__") {
      onTargetChange(null, "skip");
    } else if (value === "__link_doc__") {
      onTargetChange("file_ref", "link_as_document");
    } else {
      onTargetChange(value, "map");
    }
  }

  // File ref rows use amber background regardless of confidence
  const rowClass = isFileRef ? "map-row-amber" : ROW_CLASS[level];

  return (
    <tr className={rowClass} style={{ transition: "background 120ms" }}>
      {/* Source column name */}
      <td
        style={{
          padding: "10px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--txt)",
          fontWeight: 500,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {isFileRef && <Paperclip size={13} style={{ color: "var(--teal)", flexShrink: 0 }} />}
          {sourceName}
        </span>
      </td>

      {/* CelesteOS field dropdown */}
      <td style={{ padding: "8px" }}>
        {isFileRef ? (
          <select
            value={action === "skip" ? "__skip__" : "__link_doc__"}
            onChange={(e) => handleSelectChange(e.target.value)}
            style={{
              width: "100%",
              height: "32px",
              padding: "0 28px 0 10px",
              background: "var(--surface-base)",
              border: "1px solid var(--border-sub)",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: action === "skip" ? "var(--txt-ghost)" : "var(--teal)",
              cursor: "pointer",
              outline: "none",
              transition: "border-color 120ms",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-sub)")
            }
            aria-label={`Link ${sourceName} as document reference`}
          >
            <option value="__link_doc__">Link as document reference</option>
            <option value="__skip__">— skip —</option>
          </select>
        ) : (
          <select
            value={action === "skip" ? "__skip__" : selectedTarget || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            style={{
              width: "100%",
              height: "32px",
              padding: "0 28px 0 10px",
              background: "var(--surface-base)",
              border: "1px solid var(--border-sub)",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: action === "skip" ? "var(--txt-ghost)" : "var(--txt)",
              cursor: "pointer",
              outline: "none",
              transition: "border-color 120ms",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-sub)")
            }
            aria-label={`Map ${sourceName} to CelesteOS field`}
          >
            <option value="" disabled>
              — select —
            </option>
            <option value="__skip__">— skip —</option>
            {vocabularyOptions.map((field) => (
              <option key={field} value={field}>
                {fieldLabel(field)}{requiredSet.has(field) ? " ★" : ""}
              </option>
            ))}
          </select>
        )}
        {isDuplicate && (
          <span
            style={{
              display: "block",
              fontSize: "10px",
              color: "var(--amber)",
              marginTop: "3px",
              lineHeight: 1.2,
            }}
            title="Multiple columns map to the same target. Only the last value will be used."
          >
            Duplicate target — last value wins
          </span>
        )}
      </td>

      {/* Confidence */}
      <td style={{ padding: "8px", textAlign: "center", whiteSpace: "nowrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            color: isFileRef ? "var(--teal)" : DOT_COLOR[level],
          }}
          aria-label={isFileRef ? "Document reference" : `${pct} percent confidence`}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isFileRef ? "var(--teal)" : DOT_COLOR[level],
              boxShadow: isFileRef
                ? "0 0 6px rgba(74,148,140,0.5)"
                : level === "green"
                  ? "0 0 6px rgba(74,148,104,0.5)"
                  : level === "amber"
                    ? "0 0 6px rgba(196,137,59,0.5)"
                    : "0 0 6px rgba(192,80,58,0.5)",
            }}
          />
          {isFileRef ? "doc" : `${pct}%`}
        </span>
      </td>

      {/* Sample values */}
      <td
        style={{
          padding: "10px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--txt3)",
          maxWidth: "220px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={sampleValues.join(", ")}
      >
        {isFileRef
          ? sampleValues.slice(0, 3).map((v, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <FileText size={10} style={{ color: "var(--txt-ghost)", flexShrink: 0 }} />
                {v}
                {i < Math.min(sampleValues.length, 3) - 1 ? <span style={{ margin: "0 4px" }}>·</span> : null}
              </span>
            ))
          : sampleValues.slice(0, 5).join(" · ")}
      </td>
    </tr>
  );
}
