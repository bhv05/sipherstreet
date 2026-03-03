export default function About() {
  return (
    <div className="page-section" style={{ maxWidth: 800 }}>
      <p className="section-label">Who We Are</p>
      <h2 className="section-title">
        About <span>Us</span>
      </h2>

      <div style={{ display: "grid", gap: 40 }}>
        {/* Our Story */}
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
            portfolio using real-time data and institutional-grade analysis.
          </p>
        </div>

        {/* Our Approach */}
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1a2a44",
              marginBottom: 16,
            }}
          >
            Our Approach
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "#5a6a7e",
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            Sipher Street employs a long/short equity strategy across global
            markets, built around three complementary pillars. Every position
            begins with a rigorous investment thesis, supported by financial
            modelling, competitive analysis, and a clearly defined risk/reward
            framework.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[
              [
                "01",
                "Quality Compounders",
                "We identify businesses that can consistently reinvest cash flows at high incremental returns on capital over long periods. These companies generate exponential earnings growth through expanding reinvestment, rising productivity, or disciplined capital returns without needing an external catalyst or rerating to create value.",
              ],
              [
                "02",
                "Event & Catalyst Driven",
                "We target discrete, time-bounded corporate or market events such as M&A, spin-offs, restructurings, earnings inflections, and regulatory decisions that are expected to materially alter a company's valuation. These setups offer asymmetric, often market-agnostic payoffs driven by quantifiable probabilities and deep fundamental work.",
              ],
              [
                "03",
                "Short Ideas",
                "We take short positions where our proprietary research uncovers structural deterioration, over-earning, or misunderstood risks the market has yet to price in. Each short is anchored by a differentiated insight, whether a flawed business model, unsustainable unit economics, or an approaching negative catalyst, and framed with strict risk limits.",
              ],
            ].map(([num, title, desc]) => (
              <div
                key={title}
                style={{
                  padding: "28px 24px",
                  borderLeft: "3px solid #1a2a44",
                  background: "transparent",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  {num}
                </span>
                <h4
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1a2a44",
                    marginBottom: 10,
                  }}
                >
                  {title}
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a6a7e",
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
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

        {/* What We Value */}
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
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[
              [
                "Intellectual Rigour",
                "We demand evidence-based reasoning and challenge every assumption before committing capital. Conclusions must be earned through analysis, not borrowed from consensus.",
              ],
              [
                "Conviction",
                "When our research supports a thesis, we have the courage to act on it. We size positions with confidence and hold through volatility when the fundamentals remain intact.",
              ],
              [
                "Perspicacious",
                "We cultivate sharp, penetrating insight into businesses and markets. Surface-level analysis is never sufficient; we seek to understand what others overlook and act where the crowd cannot.",
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="hover-card"
                style={{
                  padding: 24,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a2a44",
                    marginBottom: 10,
                  }}
                >
                  {title}
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a6a7e",
                    lineHeight: 1.7,
                  }}
                >
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