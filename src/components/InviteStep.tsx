import { useState } from "react";
import { UserPlus, X, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { sendInvites } from "../lib/api";

interface Invitee {
  email: string;
  name: string;
  rank: string;
  vessel_ids: string[];
}

interface FleetVessel {
  yacht_id: string;
  yacht_name: string;
}

interface Props {
  yachtName: string;
  yachtId: string;
  token: string;
  fleetVessels: FleetVessel[];
}

// Values must match the CHECK constraint on tenant auth_users_roles.role:
// chief_engineer | eto | captain | manager | vendor | crew | deck | interior
const RANKS = [
  { value: "captain", label: "Captain" },
  { value: "deck", label: "Deck Officer" },
  { value: "chief_engineer", label: "Chief Engineer" },
  { value: "eto", label: "ETO / 2nd Engineer" },
  { value: "interior", label: "Interior / Steward" },
  { value: "crew", label: "Crew" },
  { value: "manager", label: "Manager / Admin" },
  { value: "vendor", label: "Vendor" },
];

export default function InviteStep({ yachtName, yachtId, token, fleetVessels }: Props) {
  const isFleet = fleetVessels.length > 1;
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>(
    fleetVessels.length > 0 ? fleetVessels.map((v) => v.yacht_id) : [yachtId]
  );

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [rank, setRank] = useState("crew");
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function addInvitee() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address");
      return;
    }
    if (!name.trim()) {
      setError("Enter a name");
      return;
    }
    if (invitees.some((i) => i.email === trimmed)) {
      setError("Already added");
      return;
    }
    setInvitees([...invitees, { email: trimmed, name: name.trim(), rank, vessel_ids: selectedVesselIds }]);
    setEmail("");
    setName("");
    setRank("crew");
    setError("");
  }

  function removeInvitee(emailToRemove: string) {
    setInvitees(invitees.filter((i) => i.email !== emailToRemove));
  }

  async function handleSend() {
    if (invitees.length === 0) return;
    setSending(true);
    setError("");
    try {
      const result = await sendInvites(token, invitees);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || "Failed to send invites");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  // ── Sent confirmation ──
  if (sent) {
    return (
      <div className="card-brand fade-in" style={{ textAlign: "center" }}>
        <div style={{ padding: "32px" }}>
          <div className="check-circle">
            <UserPlus size={22} strokeWidth={2.5} color="#fff" />
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--txt)",
              margin: "0 0 4px",
            }}
          >
            Invites sent
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--txt2)",
              margin: "0 0 24px",
            }}
          >
            {invitees.length} invite{invitees.length !== 1 ? "s" : ""} sent for{" "}
            <span style={{ color: "var(--mark)" }}>{yachtName}</span>
          </p>

          <a
            href="https://app.celeste7.ai"
            className="btn-brand"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "12px",
              boxShadow: "0 0 20px rgba(58,124,157,0.2)",
            }}
          >
            Open CelesteOS
            <ExternalLink size={14} />
          </a>

          <Link
            to="/import"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--mark)",
              textDecoration: "none",
            }}
          >
            Import data <ArrowRight size={14} />
          </Link>

          <p
            style={{
              fontSize: "11px",
              color: "var(--txt-ghost)",
              margin: "20px 0 0",
              lineHeight: 1.5,
            }}
          >
            Re-sending an invite only issues a new login link — it does not update name or rank. To change a crew member&apos;s role, use role management in the app.
          </p>
        </div>
      </div>
    );
  }

  // ── Invite form ──
  return (
    <div className="card-brand fade-in">
      <div style={{ padding: "32px 32px 0" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--txt)",
            margin: "0 0 4px",
          }}
        >
          Invite your team
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--txt2)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Add crew and officers to{" "}
          <span style={{ color: "var(--mark)", fontWeight: 500 }}>
            {yachtName}
          </span>
          . They'll receive an email to set up their account.
        </p>

        {/* Fleet vessel selector — only shown for fleet accounts */}
        {isFleet && (
          <div style={{ marginBottom: "16px" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--txt-ghost)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: "0 0 8px",
              }}
            >
              Assign to vessels
            </p>
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid var(--border-faint)",
                overflow: "hidden",
              }}
            >
              {fleetVessels.map((vessel, i) => {
                const checked = selectedVesselIds.includes(vessel.yacht_id);
                return (
                  <label
                    key={vessel.yacht_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 14px",
                      borderBottom:
                        i < fleetVessels.length - 1
                          ? "1px solid var(--border-faint)"
                          : "none",
                      cursor: "pointer",
                      background: checked ? "var(--surface-raised)" : "transparent",
                      transition: "background 100ms",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedVesselIds(
                          e.target.checked
                            ? [...selectedVesselIds, vessel.yacht_id]
                            : selectedVesselIds.filter((id) => id !== vessel.yacht_id)
                        );
                      }}
                      style={{ accentColor: "var(--mark)", width: "14px", height: "14px" }}
                    />
                    <span style={{ fontSize: "13px", color: "var(--txt)" }}>
                      {vessel.yacht_name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Name + Rank input row */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input
            type="text"
            className="input-brand"
            placeholder="Full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInvitee();
              }
            }}
            style={{ flex: 1 }}
          />
          <select
            className="select-premium"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            style={{ width: "130px", flex: "none" }}
          >
            {RANKS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email input row */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
          <input
            type="email"
            className="input-brand"
            placeholder="crew@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInvitee();
              }
            }}
            style={{ flex: 1 }}
          />
        </div>

        {error && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--red)",
              margin: "0 0 6px",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={addInvitee}
          disabled={!email.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid var(--border-sub)",
            background: "transparent",
            color: email.trim() ? "var(--mark)" : "var(--txt-ghost)",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            cursor: email.trim() ? "pointer" : "default",
            transition: "border-color 120ms, color 120ms",
            marginBottom: "20px",
          }}
        >
          <UserPlus size={14} />
          Add
        </button>

        {/* Invitee list */}
        {invitees.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              borderRadius: "6px",
              background: "var(--surface-base)",
              border: "1px solid var(--border-faint)",
              overflow: "hidden",
            }}
          >
            {invitees.map((inv, i) => (
              <div
                key={inv.email}
                className="fade-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderBottom:
                    i < invitees.length - 1
                      ? "1px solid var(--border-faint)"
                      : "none",
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--txt)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inv.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--txt2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inv.email}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    color: "var(--txt-ghost)",
                    flexShrink: 0,
                  }}
                >
                  {inv.rank}
                </span>
                <button
                  onClick={() => removeInvitee(inv.email)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    border: "none",
                    background: "transparent",
                    color: "var(--txt-ghost)",
                    cursor: "pointer",
                    borderRadius: "4px",
                    flexShrink: 0,
                    transition: "color 120ms",
                  }}
                  aria-label={`Remove ${inv.email}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "0 32px 32px" }}>
        <button
          className="btn-brand"
          disabled={invitees.length === 0 || sending}
          onClick={handleSend}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "12px",
            boxShadow:
              invitees.length > 0
                ? "0 0 20px rgba(58,124,157,0.2)"
                : "none",
          }}
        >
          {sending ? "Sending..." : `Send ${invitees.length || ""} invite${invitees.length !== 1 ? "s" : ""}`}
        </button>

        {/* Skip + secondary links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "4px",
          }}
        >
          <a
            href="https://app.celeste7.ai"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--txt-ghost)",
              textDecoration: "none",
              transition: "color 120ms",
            }}
          >
            Skip for now
          </a>
          <Link
            to="/import"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--mark)",
              textDecoration: "none",
            }}
          >
            Import data
          </Link>
        </div>
      </div>
    </div>
  );
}
