const PITCHES = [
  {
    ticker: "NVDA",
    title: "NVIDIA Corporation",
    type: "LONG",
    date: "Jan 2026",
    thesis:
      "AI infrastructure demand continues to accelerate. Data center revenue growth outpacing consensus estimates.",
    target: "$155",
  },
  {
    ticker: "TSLA",
    title: "Tesla Inc.",
    type: "SHORT",
    date: "Dec 2025",
    thesis:
      "Valuation disconnected from automotive fundamentals. Increasing competition in EV market compressing margins.",
    target: "$240",
  },
  {
    ticker: "AMZN",
    title: "Amazon.com",
    type: "SHORT",
    date: "Feb 2026",
    thesis:
      "AWS growth decelerating as enterprises optimize cloud spend. Retail margins under pressure.",
    target: "$175",
  },
  {
    ticker: "MSFT",
    title: "Microsoft Corp.",
    type: "LONG",
    date: "Nov 2025",
    thesis:
      "Copilot monetization inflecting. Azure market share gains accelerating with AI workload migration.",
    target: "$470",
  },
];

export default function Pitches() {
  return (
    <div className="page-section" style={{ maxWidth: 1000 }}>
      <p className="section-label">Investment Theses</p>
      <h2 className="section-title">
        Active <span>Pitches</span>
      </h2>

      <div style={{ display: "grid", gap: 20 }}>
        {PITCHES.map((p) => (
          <div
            key={p.ticker}
            className="hover-card"
            style={{
              padding: 32,
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{ fontSize: 20, fontWeight: 600, color: "#f0f0f0" }}
                >
                  {p.ticker}
                </span>
                <span
                  className={p.type === "LONG" ? "tag-long" : "tag-short"}
                >
                  {p.type}
                </span>
                <span style={{ fontSize: 12, color: "#555" }}>{p.title}</span>
              </div>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
                {p.thesis}
              </p>
            </div>
            <div style={{ textAlign: "right", minWidth: 100 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Price Target
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 300,
                  color: "#f0f0f0",
                  marginTop: 4,
                }}
              >
                {p.target}
              </div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>
                {p.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}