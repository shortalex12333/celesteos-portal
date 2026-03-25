import { Apple, Monitor } from "lucide-react";

interface Props {
  onSelect: (platform: "macos" | "windows") => void;
}

export default function PlatformStep({ onSelect }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/30 backdrop-blur">
      <h2 className="text-lg text-slate-300 font-medium mb-2">
        Choose your platform
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Select the operating system on your yacht's computer.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("macos")}
          className="flex flex-col items-center gap-3 p-6 rounded-lg border border-slate-600/40 bg-slate-700/30
                     hover:border-blue-500/60 hover:bg-slate-700/60 transition-all cursor-pointer group"
        >
          <Apple className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-white font-semibold text-base">macOS</span>
          <span className="text-slate-500 text-xs">.dmg installer</span>
        </button>

        <button
          onClick={() => onSelect("windows")}
          className="flex flex-col items-center gap-3 p-6 rounded-lg border border-slate-600/40 bg-slate-700/30
                     hover:border-blue-500/60 hover:bg-slate-700/60 transition-all cursor-pointer group"
        >
          <Monitor className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-white font-semibold text-base">Windows</span>
          <span className="text-xs text-slate-500">.exe installer</span>
        </button>
      </div>
    </div>
  );
}
