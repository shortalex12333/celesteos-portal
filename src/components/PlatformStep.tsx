import { useState } from "react";
import { Apple, Monitor } from "lucide-react";

interface Props {
  onSelect: (platform: "macos" | "windows") => void;
}

export default function PlatformStep({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="card-brand" style={{ padding: "32px 32px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--txt)" }}>
          Choose your platform
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--txt-ghost)",
            marginTop: "4px",
          }}
        >
          Select the operating system on your yacht's computer
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {(["macos", "windows"] as const).map((p) => {
          const Icon = p === "macos" ? Apple : Monitor;
          const label = p === "macos" ? "macOS" : "Windows";
          const ext = p === "macos" ? ".dmg installer" : ".exe installer";
          const isHovered = hovered === p;

          return (
            <button
              key={p}
              onClick={() => onSelect(p)}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                padding: "24px 16px",
                borderRadius: "6px",
                border: `1px solid ${isHovered ? "var(--mark)" : "var(--border-sub)"}`,
                background: isHovered ? "var(--surface-hover)" : "var(--surface-el)",
                cursor: "pointer",
                transition: "all 120ms",
              }}
            >
              <Icon
                size={28}
                style={{
                  color: isHovered ? "var(--txt)" : "var(--txt2)",
                  transition: "color 120ms",
                }}
              />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--txt)" }}>
                {label}
              </span>
              <span style={{ fontSize: "11px", color: "var(--txt-ghost)" }}>
                {ext}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
