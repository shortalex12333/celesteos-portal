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
    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/30 backdrop-blur">
      <div className="flex items-center gap-2 mb-1">
        <PlatformIcon className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 text-xs font-medium">{platformLabel}</span>
      </div>
      <h2 className="text-lg text-slate-300 font-medium mb-2">
        Download your installer
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Enter the email address associated with your yacht purchase.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm text-slate-400 mb-1.5">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="buyer@example.com"
          autoComplete="email"
          className="w-full px-3.5 py-3 rounded-lg border border-slate-600 bg-slate-900 text-white
                     placeholder:text-slate-600 focus:border-blue-500 focus:outline-none text-base mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm
                     hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                     transition-colors"
        >
          {loading ? "Sending..." : "Send verification code"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <button
        onClick={onBack}
        className="flex items-center gap-1 text-slate-500 text-xs mt-4 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Change platform
      </button>
    </div>
  );
}
