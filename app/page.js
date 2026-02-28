export default function About() {
  const pillars = [
    {
      title: "Fundamental Research",
      desc: "Every position is backed by thorough bottom-up analysis, financial modeling, and competitive landscape assessment.",
    },
    {
      title: "Risk Management",
      desc: "Disciplined position sizing, portfolio hedging, and drawdown limits ensure capital preservation in all market conditions.",
    },
    {
      title: "Long/Short Strategy",
      desc: "We capture alpha on both sides of the market, profiting from overvalued shorts and undervalued longs across sectors.",
    },
    {
      title: "Team Development",
      desc: "We cultivate the next generation of investment professionals through mentorship, live portfolio management, and real-time decision making.",
    },
  ];

  return (
    <div className="page-section" style={{ maxWidth: 900 }}>
      <p className="section-label">About Us</p>
      <h2 className="section-title">
        Our <span>Philosophy</span>
      </h2>

      <p
        style={{
          color: "#999",
          fontSize: 16,
          lineHeight: 1.8,
          borderLeft: "2px solid #10b981",
          paddingLeft: 24,
          marginBottom: 48,
        }}
      >
        Sipher Street is a student-run investment fund focused on generating
        risk-adjusted returns through fundamental, bottom-up equity analysis. We
        employ a long/short strategy across global equities, combining deep
        sector expertise with rigorous quantitative risk management.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
        }}
      >
        {pillars.map((p) => (
          <div
            key={p.title}
            className="hover-card"
            style={{
              padding: 28,
              border: "1px solid #1a1a1a",
              background: "#0a0a0a",
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#e0e0e0",
                marginBottom: 10,
              }}
            >
              {p.title}
            </h3>
            <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}