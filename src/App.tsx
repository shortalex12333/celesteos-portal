import { useState } from "react";
import Logo from "./components/Logo";
import PlatformStep from "./components/PlatformStep";
import EmailStep from "./components/EmailStep";
import CodeStep from "./components/CodeStep";
import DownloadStep from "./components/DownloadStep";
import type { VerifyResponse } from "./lib/api";

type Step = "platform" | "email" | "code" | "download";

export default function App() {
  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState<"macos" | "windows">("macos");
  const [email, setEmail] = useState("");
  const [downloadData, setDownloadData] = useState<VerifyResponse | null>(null);

  function handlePlatformSelect(p: "macos" | "windows") {
    setPlatform(p);
    setStep("email");
  }

  function handleCodeSent(em: string) {
    setEmail(em);
    setStep("code");
  }

  function handleVerified(data: VerifyResponse) {
    setDownloadData(data);
    setStep("download");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative"
      style={{ background: "var(--surface-base)" }}
    >
      {/* Teal orb backdrop (from auth.html) */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: "60vw",
            height: "60vw",
            top: "-20vw",
            left: "-8vw",
            background:
              "radial-gradient(circle, rgba(58,124,157,0.50) 0%, transparent 70%)",
            filter: "blur(90px)",
            opacity: 0.5,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "45vw",
            height: "45vw",
            bottom: "-12vw",
            right: "-5vw",
            background:
              "radial-gradient(circle, rgba(30,90,130,0.38) 0%, transparent 70%)",
            filter: "blur(90px)",
            opacity: 0.5,
          }}
        />
      </div>

      <div className="w-full relative" style={{ maxWidth: "384px", zIndex: 1 }}>
        <Logo />

        {step === "platform" && (
          <PlatformStep onSelect={handlePlatformSelect} />
        )}

        {step === "email" && (
          <EmailStep
            platform={platform}
            onCodeSent={handleCodeSent}
            onBack={() => setStep("platform")}
          />
        )}

        {step === "code" && (
          <CodeStep
            email={email}
            onVerified={handleVerified}
            onBack={() => setStep("email")}
          />
        )}

        {step === "download" && downloadData && (
          <DownloadStep
            downloadUrl={downloadData.download_url!}
            yachtName={downloadData.yacht_name || "Your Yacht"}
            apiPlatform={downloadData.platform || "macos"}
            chosenPlatform={platform}
          />
        )}
      </div>
    </div>
  );
}
