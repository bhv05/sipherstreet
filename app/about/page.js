"use client";
import { useState } from "react";
import useReveal from "../components/useReveal";

const STEPS = [
  {
    num: "1",
    title: "Sourcing",
    desc: "We generate ideas through macro thematic analysis, sector screening, industry conferences, earnings calls, and bottom-up observation. Our sourcing process spans U.S. and European markets to identify potential asymmetries.",
  },
  {
    num: "2",
    title: "Screening",
    desc: "Initial ideas are evaluated through a blend of qualitative and quantitative analysis. We assess competitive positioning, management quality, valuation multiples, and balance sheet strength to determine whether a company warrants deeper work.",
  },
  {
    num: "3",
    title: "Deep Dive",
    desc: "Surviving ideas receive full fundamental analysis including financial modelling, competitive positioning, unit economics, management assessment, and scenario analysis. We build proprietary models from the ground up.",
  },
  {
    num: "4",
    title: "Pitch",
    desc: "Every thesis is formally presented to the team with a written memo including target price, key catalysts, risks, and position sizing. The committee debates and stress-tests each idea before a vote.",
  },
  {
    num: "5",
    title: "Execution",
    desc: "Approved positions are sized according to conviction level and portfolio risk limits. Entry timing accounts for technical levels, liquidity, and prevailing market conditions to optimise execution quality.",
  },
  {
    num: "6",
    title: "Monitoring",
    desc: "Active positions are tracked through earnings updates, news flow, and evolving sector dynamics. We maintain ongoing thesis validity checks and adjust or exit positions when the framework changes.",
  },
];

export default function About() {
  var [activeStep, setActiveStep] = useState(null);

  var storyReveal = useReveal();
  var approachReveal = useReveal();
  var pillarsReveal = useReveal();
  var timelineReveal = useReveal();
  var missionReveal = useReveal();
  var valuesReveal = useReveal();

  return (
    <div className="page-section" style={{ maxWidth: 800 }}>
      <p className="section-label">Who We Are</p>
      <h2 className="section-title">
        About <span>Us</span>
      </h2>

      <div style={{ display: "grid", gap: 40 }}>
        {/* Our Story */}
        <div
          ref={storyReveal.ref}
          className={"reveal" + (storyReveal.inView ? " in-view" : "")}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a2a44", marginBottom: 12 }}>
            Our Story
          </h3>
          <p style={{ fontSize: 15, color: "#5a6a7e", lineHeight: 1.8 }}>
            Sipher Street was founded by two students at the London School of
            Economics with a shared conviction: that disciplined, research-driven
            investing can be learned by doing. What began as a conversation about
            markets grew into a fully operational student-run fund, managing a
            portfolio using real-time data and institutional-grade analysis.
          </p>
        </div>

        {/* Our Approach */}
        <div
          ref={approachReveal.ref}
          className={"reveal" + (approachReveal.inView ? " in-view" : "")}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a2a44", marginBottom: 16 }}>
            Our Approach
          </h3>
          <p style={{ fontSize: 15, color: "#5a6a7e", lineHeight: 1.8, marginBottom: 24 }}>
            Sipher Street employs a long/short equity strategy across global
            markets, built around three complementary pillars. Every position
            begins with a rigorous investment thesis, supported by financial
            modelling, competitive analysis, and a clearly defined risk/reward
            framework.
          </p>
          <div
            ref={pillarsReveal.ref}
            className={"approach-grid reveal" + (pillarsReveal.inView ? " in-view" : "")}
          >
            {[
              ["1", "Quality Compounders", "We identify businesses that can consistently reinvest cash flows at high incremental returns on capital over long periods. These companies generate exponential earnings growth through expanding reinvestment, rising productivity, or disciplined capital returns without needing an external catalyst or rerating to create value."],
              ["2", "Event & Catalyst Driven", "We target discrete, time-bounded corporate or market events such as M&A, spin-offs, restructurings, earnings inflections, and regulatory decisions that are expected to materially alter a company's valuation. These setups offer asymmetric, often market-agnostic payoffs driven by quantifiable probabilities and deep fundamental work."],
              ["3", "Short Ideas", "We take short positions where our proprietary research uncovers structural deterioration, over-earning, or misunderstood risks the market has yet to price in. Each short is anchored by a differentiated insight, whether a flawed business model, unsustainable unit economics, or an approaching negative catalyst, and framed with strict risk limits."],
            ].map(([num, title, desc], i) => (
              <div
                key={title}
                className={"pillar-card reveal" + (pillarsReveal.inView ? " in-view" : "") + " reveal-delay-" + (i + 1)}
              >
                <div className="pillar-accent" />
                <div className="pillar-content">
                  <span className="pillar-number">{num}</span>
                  <h4 className="pillar-title">{title}</h4>
                  <p className="pillar-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Process Timeline */}
        <div
          ref={timelineReveal.ref}
          className={"reveal" + (timelineReveal.inView ? " in-view" : "")}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a2a44", marginBottom: 8 }}>
            Our Process
          </h3>
          <p style={{ fontSize: 15, color: "#5a6a7e", lineHeight: 1.8, marginBottom: 32 }}>
            Every position follows a rigorous six-stage pipeline from idea generation to active monitoring.
          </p>

          {/* Desktop Timeline */}
          <div className="timeline-desktop">
            {/* Connecting line */}
            <div className="timeline-line" />

            {/* Step nodes */}
            <div className="timeline-nodes">
              {STEPS.map(function (step, i) {
                var isActive = activeStep === i;
                return (
                  <div
                    key={step.title}
                    className={"timeline-node" + (isActive ? " active" : "")}
                    onClick={function () { setActiveStep(isActive ? null : i); }}
                    onMouseEnter={function () { setActiveStep(i); }}
                  >
                    <div className={"timeline-dot" + (isActive ? " active" : "")}>
                      <span className="timeline-dot-num">{step.num}</span>
                    </div>
                    <div className={"timeline-label" + (isActive ? " active" : "")}>
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div
              className="timeline-detail"
              style={{
                maxHeight: activeStep !== null ? 160 : 0,
                opacity: activeStep !== null ? 1 : 0,
                marginTop: activeStep !== null ? 24 : 0,
              }}
            >
              {activeStep !== null && (
                <div className="timeline-detail-inner">
                  <div className="timeline-detail-num">{STEPS[activeStep].num}</div>
                  <div>
                    <div className="timeline-detail-title">{STEPS[activeStep].title}</div>
                    <p className="timeline-detail-desc">{STEPS[activeStep].desc}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Timeline (vertical) */}
          <div className="timeline-mobile">
            {STEPS.map(function (step, i) {
              var isActive = activeStep === i;
              return (
                <div
                  key={step.title}
                  className={"timeline-mobile-item" + (isActive ? " active" : "")}
                  onClick={function () { setActiveStep(isActive ? null : i); }}
                >
                  <div className="timeline-mobile-left">
                    <div className={"timeline-mobile-dot" + (isActive ? " active" : "")}>
                      {step.num}
                    </div>
                    {i < STEPS.length - 1 && <div className="timeline-mobile-line" />}
                  </div>
                  <div className="timeline-mobile-content">
                    <div className={"timeline-mobile-title" + (isActive ? " active" : "")}>
                      {step.title}
                    </div>
                    <div
                      className="timeline-mobile-desc"
                      style={{
                        maxHeight: isActive ? 200 : 0,
                        opacity: isActive ? 1 : 0,
                        marginTop: isActive ? 8 : 0,
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Our Mission */}
        <div
          ref={missionReveal.ref}
          className={"reveal" + (missionReveal.inView ? " in-view" : "")}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a2a44", marginBottom: 12 }}>
            Our Mission
          </h3>
          <p style={{ fontSize: 15, color: "#5a6a7e", lineHeight: 1.8 }}>
            We exist to bridge the gap between academic finance and real-world
            portfolio management. Our mission is to develop practical investment
            skills, produce high-quality equity research, and build a track record
            that demonstrates the power of fundamental analysis applied with
            conviction and discipline.
          </p>
        </div>

        {/* What We Value */}
        <div
          ref={valuesReveal.ref}
          className={"reveal" + (valuesReveal.inView ? " in-view" : "")}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a2a44", marginBottom: 16 }}>
            What We Value
          </h3>
          <div className="values-grid">
            {[
              ["Perspicacity", "We cultivate sharp, penetrating insight into businesses and markets. Surface-level analysis is never sufficient; we seek to understand what others overlook and act where the crowd cannot."],
              ["Intellectual Rigour", "We demand evidence-based reasoning and challenge every assumption before committing capital. Conclusions must be earned through analysis, not borrowed from consensus."],
              ["Conviction", "When our research supports a thesis, we have the courage to act on it. We size positions with confidence and hold through volatility when the fundamentals remain intact."],
            ].map(([title, desc], i) => (
              <div
                key={title}
                className={"hover-card reveal" + (valuesReveal.inView ? " in-view" : "") + " reveal-delay-" + (i + 1)}
                style={{ padding: 24, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, display: "flex", flexDirection: "column" }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1a2a44", marginBottom: 10 }}>{title}</h4>
                <p style={{ fontSize: 13, color: "#5a6a7e", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .approach-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: stretch;
        }
        .pillar-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease,
                      opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(26, 42, 68, 0.1);
        }
        .pillar-accent {
          height: 4px;
          background: #1a2a44;
          width: 100%;
          flex-shrink: 0;
        }
        .pillar-content {
          padding: 28px 24px 32px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .pillar-number {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #1a2a44;
          letter-spacing: 0.08em;
          margin: 0 auto 14px;
          text-align: center;
        }
        .pillar-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a2a44;
          margin-bottom: 12px;
          text-align: center;
        }
        .pillar-desc {
          font-size: 13px;
          color: #5a6a7e;
          line-height: 1.75;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* ========= TIMELINE DESKTOP ========= */
        .timeline-desktop {
          position: relative;
          padding: 20px 0;
        }
        .timeline-line {
          position: absolute;
          top: 39px;
          left: 28px;
          right: 28px;
          height: 2px;
          background: #e2e8f0;
        }
        .timeline-nodes {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .timeline-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          flex: 1;
        }
        .timeline-dot {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }
        .timeline-dot.active {
          border-color: #1a2a44;
          background: #1a2a44;
        }
        .timeline-dot-num {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          transition: color 0.3s ease;
        }
        .timeline-dot.active .timeline-dot-num {
          color: #ffffff;
        }
        .timeline-label {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: color 0.3s ease;
          text-align: center;
        }
        .timeline-label.active {
          color: #1a2a44;
          font-weight: 600;
        }
        .timeline-detail {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease,
                      margin-top 0.4s ease;
        }
        .timeline-detail-inner {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          border-top: 3px solid #1a2a44;
        }
        .timeline-detail-num {
          font-size: 28px;
          font-weight: 200;
          color: #1a2a44;
          line-height: 1;
          flex-shrink: 0;
          width: 36px;
        }
        .timeline-detail-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a2a44;
          margin-bottom: 8px;
        }
        .timeline-detail-desc {
          font-size: 13px;
          color: #5a6a7e;
          line-height: 1.75;
          margin: 0;
        }

        /* ========= TIMELINE MOBILE ========= */
        .timeline-mobile {
          display: none;
        }
        .timeline-mobile-item {
          display: flex;
          gap: 16px;
          cursor: pointer;
          padding-bottom: 8px;
        }
        .timeline-mobile-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .timeline-mobile-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .timeline-mobile-dot.active {
          border-color: #1a2a44;
          background: #1a2a44;
          color: #ffffff;
        }
        .timeline-mobile-line {
          width: 2px;
          flex: 1;
          background: #e2e8f0;
          min-height: 16px;
        }
        .timeline-mobile-content {
          padding-top: 5px;
          padding-bottom: 12px;
          flex: 1;
        }
        .timeline-mobile-title {
          font-size: 14px;
          font-weight: 500;
          color: #5a6a7e;
          transition: color 0.2s;
        }
        .timeline-mobile-title.active {
          color: #1a2a44;
          font-weight: 600;
        }
        .timeline-mobile-desc {
          font-size: 13px;
          color: #5a6a7e;
          line-height: 1.7;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease,
                      margin-top 0.3s ease;
        }

        @media (max-width: 768px) {
          .approach-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .pillar-card:hover {
            transform: none;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          }
          .pillar-content {
            padding: 24px 20px 28px;
          }
          .values-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .timeline-desktop {
            display: none;
          }
          .timeline-mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}