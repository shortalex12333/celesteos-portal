import { Upload, GitCompare, Eye, Check } from "lucide-react";
import type { ImportStatus } from "../../types/import";

const STAGES = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "map", label: "Map", icon: GitCompare },
  { key: "preview", label: "Preview", icon: Eye },
  { key: "done", label: "Done", icon: Check },
] as const;

const STATUS_TO_STAGE: Record<ImportStatus, number> = {
  pending: 0,
  detecting: 0,
  mapping: 1,
  preview: 2,
  importing: 3,
  completed: 3,
  failed: -1,
  rolled_back: -1,
};

interface Props {
  status: ImportStatus;
}

export default function ImportProgress({ status }: Props) {
  const activeIndex = STATUS_TO_STAGE[status] ?? 0;

  return (
    <div className="pipeline">
      {STAGES.map((stage, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        const Icon = stage.icon;

        return (
          <div key={stage.key} className="pipeline-stage">
            <div
              className={`pipeline-dot ${isDone ? "done" : isActive ? "active" : "pending"}`}
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                size={12}
                style={{
                  color: isDone
                    ? "#fff"
                    : isActive
                      ? "#fff"
                      : "var(--txt-ghost)",
                }}
              />
            </div>
            <span
              className={`pipeline-label ${isDone ? "done" : isActive ? "active" : "pending"}`}
            >
              {stage.label}
            </span>
            {i < STAGES.length - 1 && (
              <div className={`pipeline-line ${isDone ? "done" : "pending"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
