import Link from "next/link";

export default function Home() {
  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "100vh",
        padding: "120px 24px 80px",
      }}
    >
      {/* Subtle background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(30,58,95,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <p className="section-label" style={{ marginBottom: 16 }}>
        Global Equities · Long/Short
      </p>

      <h1
        style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 200,
          color: "#1a2a44",
          lineHeight: 1.1,
          marginBottom: 24,
          letterSpacing: "-0.02em",
        }}
      >
        Sipher
        <br />
        <span style={{ fontWeight: 600 }}>Street</span>
      </h1>

      <p
        style={{
          maxWidth: 520,
          color: "#5a6a7e",
          fontSize: 16,
          lineHeight: 1.7,
          marginBottom: 48,
        }}
      >
        A student-managed investment fund deploying long/short equity strategies
        across global markets with disciplined risk management.
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link href="/portfolio">
          <button className="btn-primary">View Portfolio</button>
        </Link>
        <Link href="/pitches">
          <button className="btn-outline">Our Pitches</button>
        </Link>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 64,
          marginTop: 80,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          ["$150K", "AUM"],
          ["9.05%", "Total Return"],
          ["35", "Trades Executed"],
          ["2", "Founders"],
        ].map(([value, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: "#1a2a44" }}>
              {value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#8896a6",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}