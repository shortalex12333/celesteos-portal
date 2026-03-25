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
    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/30 backdrop-blur">
      <h2 className="text-lg text-slate-300 font-medium mb-2">
        Check your email
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Enter the 6-digit code we sent to{" "}
        <strong className="text-slate-300">{email}</strong>
      </p>

      <label className="block text-sm text-slate-400 mb-1.5">
        Verification code
      </label>
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
        className="w-full px-3.5 py-3 rounded-lg border border-slate-600 bg-slate-900 text-white
                   text-center text-2xl font-semibold tracking-[0.3em]
                   placeholder:text-slate-700 focus:border-blue-500 focus:outline-none mb-4"
      />
      <button
        onClick={() => verify(code)}
        disabled={loading || code.length !== 6}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm
                   hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                   transition-colors"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <button
        onClick={onBack}
        className="flex items-center gap-1 text-slate-500 text-xs mt-4 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Use a different email
      </button>
    </div>
  );
}
