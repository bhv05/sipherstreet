const TEAM = [
  {
    name: "Alexandra Chen",
    role: "Portfolio Manager",
    desc: "Finance & CS double major. 3 years of equity research experience.",
  },
  {
    name: "Marcus Williams",
    role: "Head of Research",
    desc: "Economics major. Specializes in semiconductor and tech sector analysis.",
  },
  {
    name: "Sarah Kowalski",
    role: "Risk Analyst",
    desc: "Applied Math major. Leads quantitative risk modeling and position sizing.",
  },
  {
    name: "James Nakamura",
    role: "Trading Lead",
    desc: "Finance major. Manages order execution and portfolio rebalancing.",
  },
  {
    name: "Priya Sharma",
    role: "Macro Strategist",
    desc: "Econ & Political Science. Tracks global macro trends and policy impacts.",
  },
  {
    name: "David Okonkwo",
    role: "Junior Analyst",
    desc: "Finance sophomore. Covers consumer discretionary and industrials.",
  },
];

export default function Team() {
  return (
    <div className="page-section" style={{ maxWidth: 1000 }}>
      <p className="section-label">Our People</p>
      <h2 className="section-title">
        The <span>Team</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {TEAM.map((m) => (
          <div
            key={m.name}
            className="hover-card"
            style={{
              padding: 32,
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
            }}
          >
            {/* Avatar with initials */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #065f46)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 300,
                color: "#fff",
                marginBottom: 20,
              }}
            >
              {m.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e0e0e0",
                marginBottom: 4,
              }}
            >
              {m.name}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#10b981",
                marginBottom: 12,
                letterSpacing: "0.05em",
              }}
            >
              {m.role}
            </p>
            <p style={{ fontSize: 13, color: "#777", lineHeight: 1.6 }}>
              {m.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}