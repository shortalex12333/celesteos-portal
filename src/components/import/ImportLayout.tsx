import { Monitor } from "lucide-react";
import Logo from "../Logo";

interface Props {
  children: React.ReactNode;
  wide?: boolean;
}

export default function ImportLayout({ children, wide }: Props) {
  return (
    <div style={{ maxWidth: wide ? "720px" : "480px", margin: "0 auto" }}>
      <Logo />

      {/* Mobile notice — import flow requires desktop */}
      <div
        className="mobile-notice"
        style={{
          display: "none",
          padding: "10px 14px",
          marginBottom: "12px",
          borderRadius: "6px",
          background: "var(--amber-bg)",
          border: "1px solid var(--amber-border)",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "var(--amber)",
        }}
      >
        <Monitor size={14} />
        <span>Data import is best viewed on desktop.</span>
      </div>

      {children}
    </div>
  );
}
