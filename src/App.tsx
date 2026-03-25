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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
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
