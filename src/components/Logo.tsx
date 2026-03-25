export default function Logo() {
  return (
    <div className="text-center mb-8">
      <div
        style={{
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--mark)",
        }}
      >
        CELESTEOS
      </div>
      <h1
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--txt)",
          marginTop: "4px",
        }}
      >
        Download Portal
      </h1>
      <p
        style={{
          fontSize: "13px",
          color: "var(--txt-ghost)",
          marginTop: "4px",
        }}
      >
        Secure installer delivery for your yacht
      </p>
    </div>
  );
}
