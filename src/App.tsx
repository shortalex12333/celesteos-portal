import { Routes, Route } from "react-router-dom";
import DownloadFlow from "./components/DownloadFlow";
import ImportFlow from "./components/import/ImportFlow";
import ImportSession from "./components/import/ImportSession";

export default function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative"
      style={{ background: "var(--surface-base)" }}
    >
      {/* Teal orb backdrop */}
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

      <div className="w-full relative" style={{ zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<DownloadFlow />} />
          <Route path="/import" element={<ImportFlow />} />
          <Route path="/import/:sessionId" element={<ImportSession />} />
        </Routes>
      </div>
    </div>
  );
}
