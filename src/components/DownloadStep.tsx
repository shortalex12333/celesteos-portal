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
    ? "Run the installer and follow the setup wizard. Launch CelesteOS from the Start menu to begin setup."
    : "Open the DMG and drag CelesteOS to your Applications folder. Launch it to begin setup.";

  const mismatch = chosenPlatform !== apiPlatform;

  return (
    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/30 backdrop-blur text-center">
      <h2 className="text-lg text-slate-300 font-medium mb-1">
        Ready to download
      </h2>
      <p className="text-blue-400 text-xl font-semibold mb-6">{yachtName}</p>

      <a href={downloadUrl} className="block">
        <button className="w-full py-4 rounded-lg bg-emerald-600 text-white font-semibold text-base
                           hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Download CelesteOS Installer ({fileExt})
        </button>
      </a>

      <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-500 text-sm">
        <PlatformIcon className="w-3.5 h-3.5" />
        <span>{isWindows ? "Windows" : "macOS"} installer</span>
      </div>

      <p className="text-slate-500 text-sm mt-4 leading-relaxed">
        {instructions}
      </p>

      {mismatch && (
        <p className="text-amber-400/80 text-xs mt-4 bg-amber-400/5 rounded-lg p-3 border border-amber-400/10">
          Your yacht is configured for {isWindows ? "Windows" : "macOS"}.
          Contact support if you need a{" "}
          {isWindows ? "macOS" : "Windows"} installer.
        </p>
      )}
    </div>
  );
}
