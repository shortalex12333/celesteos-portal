import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { verifyDownloadCode, type VerifyResponse } from "../lib/api";

interface Props {
  email: string;
  onVerified: (data: VerifyResponse) => void;
  onBack: () => void;
}

export default function CodeStep({ email, onVerified, onBack }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function verify(value: string) {
    if (value.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const data = await verifyDownloadCode(email, value);
      if (data.success) {
        onVerified(data);
      } else {
        const msg = data.error || "Invalid code.";
        const extra =
          data.attempts_remaining !== undefined
            ? ` (${data.attempts_remaining} attempts remaining)`
            : "";
        setError(msg + extra);
        setCode("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) {
      verify(digits);
    }
  }

  return (
    <div className="card-brand">
      {/* Header */}
      <div style={{ padding: "32px 32px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--txt)" }}>
          Check your email
        </h2>
        <p style={{ fontSize: "13px", color: "var(--txt-ghost)", marginTop: "4px" }}>
          Enter the 6-digit code sent to{" "}
          <span style={{ color: "var(--mark)" }}>{email}</span>
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: "24px 32px 32px" }}>
        <label className="label-brand">Verification code</label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={handleChange}
          placeholder="000000"
          disabled={loading}
          className="input-brand"
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.25em",
            fontFamily: "var(--font-mono)",
            marginBottom: "16px",
          }}
        />
        <button
          onClick={() => verify(code)}
          disabled={loading || code.length !== 6}
          className="btn-brand"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {error && (
          <p style={{ color: "var(--red)", fontSize: "13px", marginTop: "12px" }}>
            {error}
          </p>
        )}
      </div>

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
          Use a different email
        </button>
      </div>
    </div>
  );
}
