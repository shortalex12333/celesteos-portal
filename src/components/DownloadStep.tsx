import { Apple, Monitor, Download } from "lucide-react";

interface Props {
  downloadUrl: string;
  yachtName: string;
  apiPlatform: string;
  chosenPlatform: "macos" | "windows";
}

export default function DownloadStep({
  downloadUrl,
  yachtName,
  apiPlatform,
  chosenPlatform,
}: Props) {
  const isWindows = apiPlatform === "windows";
  const PlatformIcon = isWindows ? Monitor : Apple;
  const fileExt = isWindows ? ".exe" : ".dmg";
  const instructions = isWindows
    ? "Run the installer and follow the setup wizard. Launch CelesteOS from the Start menu."
    : "Open the DMG and drag CelesteOS to Applications. Launch it to begin setup.";

  const mismatch = chosenPlatform !== apiPlatform;

  return (
    <div className="card-brand" style={{ textAlign: "center" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 0" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--txt)" }}>
          Ready to download
        </h2>
        <p
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--mark)",
            marginTop: "8px",
          }}
        >
          {yachtName}
        </p>
      </div>

      {/* Download */}
      <div style={{ padding: "24px 32px 32px" }}>
        <a href={downloadUrl} style={{ textDecoration: "none" }}>
          <button className="btn-download">
            <Download size={16} />
            Download CelesteOS Installer ({fileExt})
          </button>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "16px",
            fontSize: "12px",
            color: "var(--txt2)",
          }}
        >
          <PlatformIcon size={13} />
          <span>{isWindows ? "Windows" : "macOS"} installer</span>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--txt-ghost)",
            marginTop: "16px",
            lineHeight: 1.6,
          }}
        >
          {instructions}
        </p>

        {mismatch && (
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              color: "var(--amber)",
              background: "var(--amber-bg)",
              border: "1px solid var(--amber-border)",
              textAlign: "left",
            }}
          >
            Your yacht is configured for {isWindows ? "Windows" : "macOS"}.
            Contact support if you need a{" "}
            {isWindows ? "macOS" : "Windows"} installer.
          </div>
        )}
      </div>
    </div>
  );
}
