export default function About() {
  return (
    <div className="page-section" style={{ maxWidth: 800 }}>
      <p className="section-label">Who We Are</p>
      <h2 className="section-title">
        About <span>Us</span>
      </h2>

      <div style={{ display: "grid", gap: 40 }}>
        {/* Intro */}
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1a2a44",
              marginBottom: 12,
            }}
          >
            Our Story
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "#5a6a7e",
              lineHeight: 1.8,
            }}
          >
            Sipher Street was founded by two students at the London School of
            Economics with a shared conviction: that disciplined, research-driven
            investing can be learned by doing. What began as a conversation about
            markets grew into a fully operational student-run fund, managing a
            paper portfolio using real-time data and institutional-grade analysis.
          </p>
        </div>

        {/* Mission */}
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1a2a44",
              marginBottom: 12,
            }}
          >
            Our Mission
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "#5a6a7e",
              lineHeight: 1.8,
            }}
          >
            We exist to bridge the gap between academic finance and real-world
            portfolio management. Our mission is to develop practical investment
            skills, produce high-quality equity research, and build a track record
            that demonstrates the power of fundamental analysis applied with
            conviction and discipline.
          </p>
        </div>

        {/* Approach */}
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1a2a44",
              marginBottom: 12,
            }}
          >
            Our Approach
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "#5a6a7e",
              lineHeight: 1.8,
            }}
          >
            Sipher Street employs a long/short equity strategy across global
            markets. Every position begins with a rigorous investment thesis,
            supported by financial modelling, competitive analysis, and a clearly
            defined risk/reward framework. We size positions carefully and maintain
            strict risk limits to protect capital in all market environments.
          </p>
        </div>

        {/* Values */}
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1a2a44",
              marginBottom: 16,
            }}
          >
            What We Value
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {[
              ["Intellectual Rigour", "We demand evidence-based reasoning and challenge every assumption before committing capital."],
              ["Transparency", "Our portfolio, performance, and research are open for scrutiny. We believe accountability drives excellence."],
              ["Continuous Learning", "Markets evolve and so must we. We are committed to constant improvement in our process and thinking."],
              ["Conviction", "When our research supports a thesis, we have the courage to act on it — on both the long and short side."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="hover-card"
                style={{
                  padding: 24,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                }}
              >
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a2a44",
                    marginBottom: 8,
                  }}
                >
                  {title}
                </h4>
                <p style={{ fontSize: 13, color: "#5a6a7e", lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}