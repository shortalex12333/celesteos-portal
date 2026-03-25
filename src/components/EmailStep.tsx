import { useState } from "react";
import { Apple, Monitor, ArrowLeft } from "lucide-react";
import { requestDownloadCode } from "../lib/api";

interface Props {
  platform: "macos" | "windows";
  onCodeSent: (email: string) => void;
  onBack: () => void;
}

export default function EmailStep({ platform, onCodeSent, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await requestDownloadCode(trimmed);
      if (data.success) {
        onCodeSent(trimmed);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const PlatformIcon = platform === "macos" ? Apple : Monitor;
  const platformLabel = platform === "macos" ? "macOS" : "Windows";

  return (
    <div className="card-brand">
      {/* Header */}
      <div style={{ padding: "32px 32px 0", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <PlatformIcon size={12} style={{ color: "var(--mark)" }} />
          <span
            style={{
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--mark)",
            }}
          >
            {platformLabel}
          </span>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--txt)" }}>
          Download your installer
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--txt-ghost)",
            marginTop: "4px",
          }}
        >
          Enter the email associated with your yacht purchase
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: "24px 32px 32px" }}>
        <label className="label-brand">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="buyer@example.com"
          autoComplete="email"
          className="input-brand"
          style={{ marginBottom: "16px" }}
        />
        <button type="submit" disabled={loading} className="btn-brand">
          {loading ? "Sending..." : "Send verification code"}
        </button>

        {error && (
          <p style={{ color: "var(--red)", fontSize: "13px", marginTop: "12px" }}>
            {error}
          </p>
        )}
      </form>

      {/* Back */}
      <div style={{ padding: "0 32px 20px" }}>
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            color: "var(--txt-ghost)",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "color 80ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--txt2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--txt-ghost)")
          }
        >
          <ArrowLeft size={10} />
          Change platform
        </button>
      </div>
    </div>
  );
}
