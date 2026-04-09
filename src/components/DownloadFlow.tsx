import { useState } from "react";
import Logo from "./Logo";
import PlatformStep from "./PlatformStep";
import EmailStep from "./EmailStep";
import CodeStep from "./CodeStep";
import DownloadStep from "./DownloadStep";
import InviteStep from "./InviteStep";
import type { VerifyResponse } from "../lib/api";
import { storeAuth } from "../lib/auth";

type Step = "platform" | "email" | "code" | "download" | "invite";

export default function DownloadFlow() {
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

    // Store auth for import flow — after 2FA, user is authenticated
    if (data.import_token) {
      storeAuth(data.import_token, data.yacht_name || "", email);
    }

    setStep("download");
  }

  return (
    <div style={{ maxWidth: "384px", margin: "0 auto" }}>
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
          onInviteTeam={() => setStep("invite")}
        />
      )}

      {step === "invite" && downloadData && (
        <InviteStep
          yachtName={downloadData.yacht_name || "Your Yacht"}
          token={downloadData.import_token || ""}
        />
      )}
    </div>
  );
}
