"use client";
import { useState, useEffect } from "react";
import BookFactsheet from "../components/BookFactsheet";
import useReveal from "../components/useReveal";

const STEPS = [
  {
    num: "1",
    title: "Sourcing",
    desc: "We generate ideas through quantitative factor screening, industry conferences, regulatory filings, corporate earnings calls, and bottom-up forensic observation across U.S. and European liquid equities.",
  },
  {
    num: "2",
    title: "Screening",
    desc: "Initial ideas are stress-tested through qualitative moat analysis and accounting forensic checks. We assess capital allocation history, unit economics, ROIC, and balance sheet durability to filter for genuine asymmetries.",
  },
  {
    num: "3",
    title: "Deep Dive",
    desc: "Surviving candidates undergo comprehensive proprietary financial modelling, discounted cash flow (DCF) scenario analysis, management interviews, and supply-chain channel checks from the ground up.",
  },
  {
    num: "4",
    title: "Pitch",
    desc: "Every thesis is presented with a detailed written memo specifying price targets, catalyst pathways, downside pre-mortems, and position sizing. Ideas are aggressively challenged before capital is allocated.",
  },
  {
    num: "5",
    title: "Execution",
    desc: "Approved positions are initiated with strict execution discipline, utilizing limit orders, liquidity-seeking algorithms, and systematic factor-hedging overlays to mitigate unwanted systematic beta.",
  },
  {
    num: "6",
    title: "Monitoring",
    desc: "Live investments are tracked continuously against earnings prints, sell-side revisions, channel check updates, and thesis invalidation triggers. We trim or exit decisively when facts change.",
  },
];

const STRATEGY_PILLARS = [
  {
    num: "01",
    tag: "LONG POSITIONS",
    title: "Quality Compounders",
    badge: "SECULAR GROWTH",
    desc: "High-conviction investments in exceptional businesses with durable competitive moats, structural pricing power, high return on capital (ROIC/ROCE), and shareholder-aligned capital allocation that compound intrinsic value over multi-year horizons.",
    bullets: [
      "Pristine balance sheets & cash generation",
      "Pricing power through inflationary regimes",
      "High ROIC well above weighted cost of capital",
      "Founder-led or disciplined owner-operators",
    ],
  },
  {
    num: "02",
    tag: "SHORT BOOK",
    title: "Catalyst Disruption",
    badge: "ASYMMETRIC PAYOFFS",
    desc: "Disciplined single-stock shorts targeting structural losers, fraudulent accounting, balance sheet distress, and businesses facing secular technological disruption. We seek asymmetric downside payoff profiles with explicit catalyst timelines.",
    bullets: [
      "Secular margin contraction & deteriorating unit economics",
      "Aggressive revenue recognition & accounting discrepancies",
      "Refinancing cliffs in elevated interest rate environments",
      "Asymmetric payoff profiles with defined loss mitigation",
    ],
  },
  {
    num: "03",
    tag: "RISK DISCIPLINE",
    title: "Dynamic Hedging",
    badge: "CAPITAL PRESERVATION",
    desc: "Sophisticated factor-neutralisation and dynamic beta hedging overlays to insulate portfolio equity from macroeconomic drawdowns and sector volatility, ensuring portfolio returns are overwhelmingly driven by idiosyncratic stock picking.",
    bullets: [
      "Target net exposure maintained strictly below 30%",
      "Macro and style factor orthogonality constraints",
      "Daily point-in-time VaR and stress testing across regimes",
      "Strict single-issuer concentration cap at 15% NAV",
    ],
  },
];

const CORE_VALUES = [
  {
    num: "01",
    tag: "ALIGNING CAPITAL",
    title: "Partner Co-Investment",
    desc: "Every partner invests personal balance sheet capital directly into the Sipher Street strategy. We maintain complete alignment of interest with fee discipline and open portfolio transparency.",
  },
  {
    num: "02",
    tag: "UNCOMPROMISING STANDARDS",
    title: "Intellectual Rigour",
    desc: "We challenge consensus narratives through independent, ground-up financial models and forensic accounting. Every thesis must defend against rigorous downside stress scenarios.",
  },
  {
    num: "03",
    tag: "CONCENTRATED CONVICTION",
    title: "Focused Deployment",
    desc: "We do not dilute investor returns by index-hugging or over-diversifying. When deep analysis identifies asymmetric mispricings, we size positions with high conviction.",
  },
];

export default function About() {
  const [activeStep, setActiveStep] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Independent scroll reveal hooks tuned for fluid, early intersection triggers
  const nexusHeaderReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  const nexusCardsReveal = useReveal({ threshold: 0.04, rootMargin: "0px 0px -30px 0px" });
  const mandateReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  const valuesHeaderReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  const valuesCardsReveal = useReveal({ threshold: 0.04, rootMargin: "0px 0px -30px 0px" });
  const funnelHeaderReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  const funnelProcessReveal = useReveal({ threshold: 0.04, rootMargin: "0px 0px -30px 0px" });
  const showcaseReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });

  useEffect(() => {
    // Instantly bring to top with zero smooth-scroll lag
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    setHeroLoaded(false);
    const timer = setTimeout(() => setHeroLoaded(true), 50);

    const handleReset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setHeroLoaded(false);
      setTimeout(() => setHeroLoaded(true), 50);
    };

    window.addEventListener("sipher-nav-reset", handleReset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("sipher-nav-reset", handleReset);
    };
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", position: "relative" }}>
      {/* ── Ambient Background Glows ── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="aura-glow" style={{ position: "absolute", top: "5%", right: "-10%", width: 700, height: 700, pointerEvents: "none" }} />
        <div className="aura-glow" style={{ position: "absolute", top: "45%", left: "-15%", width: 800, height: 800, pointerEvents: "none" }} />
        <div className="aura-glow" style={{ position: "absolute", top: "75%", right: "-10%", width: 650, height: 650, pointerEvents: "none" }} />
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO — Investment Philosophy & Core Mandate
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          background: "var(--bg-primary)",
          color: "#f4f3ef",
          paddingTop: 140,
          paddingBottom: 70,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div className={"reveal-group" + (heroLoaded ? " in-view" : "")}>
            <div className="reveal-item" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--accent-light)",
                  fontWeight: 600,
                }}
              >
                Strategy & Investment Philosophy
              </span>
              <span className="reveal-line-expand" style={{ width: 36, height: 1, background: "var(--accent-light)" }} />
            </div>

            <h1
              className="reveal-item reveal-delay-1"
              style={{
                fontSize: "clamp(36px, 6vw, 72px)",
                fontWeight: 200,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                maxWidth: 960,
                marginBottom: 28,
                color: "#ffffff",
              }}
            >
              Idiosyncratic Alpha,{" "}
              <span
                className="font-heading"
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--accent-light)",
                }}
              >
                Uncorrelated Returns
              </span>
            </h1>

            <p
              className="reveal-item reveal-delay-2"
              style={{
                fontSize: "clamp(16px, 2vw, 19px)",
                color: "rgba(244, 243, 239, 0.85)",
                lineHeight: 1.75,
                maxWidth: 820,
                fontWeight: 300,
                marginBottom: 44,
              }}
            >
              Our objective is to generate genuine idiosyncratic returns that outperform SOFR across all market conditions and regimes. Through strategic single-stock selection paired with disciplined beta hedging, we insulate partner capital from broader market drawdowns while capturing company-specific alpha across both our long and short books.
            </p>

            {/* Live Factsheet Strategy Badges Ribbon */}
            <div
              className="reveal-item reveal-delay-3"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                paddingTop: 28,
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Benchmark</span>
                <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 600 }}>SOFR</span>
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Net Exposure Range</span>
                <span style={{ fontSize: 13, color: "var(--accent-light)", fontWeight: 600 }}>&lt; 30%</span>
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.15)" }}>|</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Structure</span>
                <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 600 }}>U.S. &amp; European L/S Equity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          THE STRATEGY NEXUS — Three Core Investment Pillars
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "96px 24px",
          maxWidth: 1160,
          margin: "0 auto",
          zIndex: 1,
        }}
      >
        <div ref={nexusHeaderReveal.ref} className={"reveal-group" + (nexusHeaderReveal.inView ? " in-view" : "")} style={{ marginBottom: 52 }}>
          <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Strategy Architecture</p>
          <h2
            className="reveal-item reveal-delay-1"
            style={{
              fontSize: "clamp(30px, 4vw, 42px)",
              fontWeight: 200,
              color: "#ffffff",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            The Strategy <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)" }}>Nexus</span>
          </h2>
          <p
            className="reveal-item reveal-delay-2"
            style={{
              fontSize: 16,
              color: "rgba(244, 243, 239, 0.8)",
              lineHeight: 1.7,
              maxWidth: 680,
            }}
          >
            Our portfolio is anchored around three distinct investment pillars designed to produce compounding returns irrespective of market direction.
          </p>
        </div>

        <div ref={nexusCardsReveal.ref} className={"pillars-grid reveal-group" + (nexusCardsReveal.inView ? " in-view" : "")}>
          {STRATEGY_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.title}
              className={"pillar-card hover-lift reveal-item reveal-delay-" + ((idx * 2) + 1)}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 2,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
              }}
            >

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "var(--accent-light)" }}>
                    {pillar.tag}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      padding: "3px 8px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      color: "rgba(244, 243, 239, 0.8)",
                    }}
                  >
                    {pillar.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 300,
                    color: "#ffffff",
                    marginBottom: 16,
                    lineHeight: 1.25,
                  }}
                >
                  {pillar.title}
                </h3>

                <div className="reveal-line-expand" style={{ width: 44, height: 2, background: "var(--accent-light)", marginBottom: 20 }} />

                <p style={{ fontSize: 14.5, color: "rgba(244, 243, 239, 0.75)", lineHeight: 1.7, marginBottom: 28 }}>
                  {pillar.desc}
                </p>
              </div>

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 20 }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {pillar.bullets.map((b, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "rgba(244, 243, 239, 0.7)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent-light)", fontSize: 14, lineHeight: 1, marginTop: 1 }}>›</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MANDATE & RISK FRAMEWORK — Interactive Exposure Visualizer
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          background: "var(--bg-subsurface)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "96px 24px",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div ref={mandateReveal.ref} className={"mandate-split reveal-group" + (mandateReveal.inView ? " in-view" : "")}>
            <div>
              <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Return Objective</p>
              <h2
                className="reveal-item reveal-delay-1"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: 200,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  marginBottom: 18,
                }}
              >
                Idiosyncratic returns across{" "}
                <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)" }}>
                  all market regimes
                </span>
              </h2>
              <p
                className="reveal-item reveal-delay-2"
                style={{
                  fontSize: 15.5,
                  color: "rgba(244, 243, 239, 0.8)",
                  lineHeight: 1.75,
                  marginBottom: 24,
                }}
              >
                We believe investors should not pay hedge fund fees for passive market beta. Our primary benchmark is the Secured Overnight Financing Rate (SOFR). Every basis point of excess return must represent true idiosyncratic alpha produced by deep single-stock analysis rather than market tailwinds.
              </p>
              <div className="reveal-item reveal-delay-3" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 2 }}>
                <span style={{ fontSize: 12, color: "#ffffff", fontWeight: 500 }}>
                  Excess Return over SOFR: Active Alpha Benchmark
                </span>
              </div>
            </div>

            {/* Dynamic Exposure & Risk Terminal Visualizer Card */}
            <div>
              <div
                className="hover-lift reveal-item reveal-delay-2"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "36px 32px",
                  borderRadius: 2,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-light)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Portfolio Exposure Limits
                  </div>
                  <span style={{ fontSize: 10.5, color: "rgba(244, 243, 239, 0.55)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Point-In-Time Constraints
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Meter 1: Target Net Exposure */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                      <span style={{ color: "#ffffff", fontWeight: 500 }}>Target Net Exposure</span>
                      <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>&lt; 30%</span>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{
                          width: mandateReveal.inView ? "30%" : "0%",
                          transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                          background: "linear-gradient(to right, var(--accent-light), #34d399)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Meter 2: Long Book Target */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                      <span style={{ color: "#ffffff", fontWeight: 500 }}>Long Book Sizing</span>
                      <span style={{ color: "#34d399", fontWeight: 600 }}>80% – 100% Gross</span>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{
                          width: mandateReveal.inView ? "90%" : "0%",
                          transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
                          background: "#34d399",
                        }}
                      />
                    </div>
                  </div>

                  {/* Meter 3: Short Book Sizing */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                      <span style={{ color: "#ffffff", fontWeight: 500 }}>Short Book Sizing</span>
                      <span style={{ color: "#f87171", fontWeight: 600 }}>40% – 60% Gross</span>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{
                          width: mandateReveal.inView ? "50%" : "0%",
                          transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
                          background: "#f87171",
                        }}
                      />
                    </div>
                  </div>

                  {/* Meter 4: Single Stock Concentration */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                      <span style={{ color: "#ffffff", fontWeight: 500 }}>Single-Stock Concentration Cap</span>
                      <span style={{ color: "#ffffff", fontWeight: 600 }}>&lt; 15% Maximum NAV</span>
                    </div>
                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{
                          width: mandateReveal.inView ? "15%" : "0%",
                          transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.65s",
                          background: "var(--accent-light)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "rgba(244, 243, 239, 0.6)" }}>
                  <span>Hedging Strategy:</span>
                  <span style={{ color: "#ffffff", fontWeight: 500 }}>Dynamic Index Overlays & Sector Skews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOUNDATIONAL PRINCIPLES — Core Values Grid
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "96px 24px",
          maxWidth: 1160,
          margin: "0 auto",
          zIndex: 1,
        }}
      >
        <div ref={valuesHeaderReveal.ref} className={"reveal-group" + (valuesHeaderReveal.inView ? " in-view" : "")} style={{ marginBottom: 48 }}>
          <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Foundational Principles</p>
          <h2
            className="reveal-item reveal-delay-1"
            style={{
              fontSize: "clamp(30px, 4vw, 42px)",
              fontWeight: 200,
              color: "#ffffff",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            What We <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)" }}>Value</span>
          </h2>
          <p
            className="reveal-item reveal-delay-2"
            style={{
              fontSize: 16,
              color: "rgba(244, 243, 239, 0.8)",
              lineHeight: 1.7,
              maxWidth: 620,
            }}
          >
            The philosophical tenets that govern our analytical standards, capital allocation discipline, and partner relationships.
          </p>
        </div>

        {/* 3 Value Cards with Watermark Numerals */}
        <div ref={valuesCardsReveal.ref} className={"values-grid reveal-group" + (valuesCardsReveal.inView ? " in-view" : "")}>
          {CORE_VALUES.map((val, idx) => (
            <div
              key={val.title}
              className={"value-card hover-lift reveal-item reveal-delay-" + ((idx * 2) + 1)}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 2,
                padding: "36px 32px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 240,
                height: "100%",
                position: "relative",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.2em", color: "var(--accent-light)", display: "block", marginBottom: 14 }}>
                  {val.tag}
                </span>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 300,
                    color: "#ffffff",
                    marginBottom: 16,
                  }}
                >
                  {val.title}
                </h3>
                <div className="reveal-line-expand" style={{ width: 40, height: 2, background: "var(--accent-light)", marginBottom: 18 }} />
                <p style={{ fontSize: 14.5, color: "rgba(244, 243, 239, 0.75)", lineHeight: 1.7 }}>
                  {val.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DISCIPLINE IN EXECUTION — Interactive Investment Process
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          background: "var(--bg-surface)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "96px 24px",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div ref={funnelHeaderReveal.ref} className={"reveal-group" + (funnelHeaderReveal.inView ? " in-view" : "")} style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Discipline in Execution</p>
            <h2 className="section-title reveal-item reveal-delay-1" style={{ marginBottom: 16 }}>
              Our <em>investment process</em>
            </h2>
            <p className="reveal-item reveal-delay-2" style={{ color: "rgba(244, 243, 239, 0.8)", fontSize: 16, lineHeight: 1.7 }}>
              A structured 6-stage funnel designed to eliminate bias and isolate high-conviction asymmetries.
            </p>
          </div>

          {/* Desktop Interactive Timeline */}
          <div ref={funnelProcessReveal.ref} className={"reveal-group" + (funnelProcessReveal.inView ? " in-view" : "")}>
            <div className="timeline-desktop reveal-item reveal-delay-2">
              <div className="timeline-line" />
              <div
                className="timeline-line-fill"
                style={{
                  width: funnelProcessReveal.inView ? "90%" : "0%",
                  transition: "width 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
                }}
              />
              <div className="timeline-nodes">
                {STEPS.map(function (step, i) {
                  const isActive = activeStep === i;
                  return (
                    <div
                      key={step.num}
                      className="timeline-node"
                      style={{
                        animationDelay: (0.15 + i * 0.1) + "s",
                      }}
                      onMouseEnter={function () { setActiveStep(i); }}
                      onMouseLeave={function () { setActiveStep(null); }}
                    >
                      <div className={"node-circle" + (isActive ? " active" : "")}>
                        {step.num}
                      </div>
                      <p className={"node-title" + (isActive ? " active" : "")}>{step.title}</p>
                      <div className={"node-tooltip" + (isActive ? " visible" : "")}>
                        <p className="node-tooltip-title">{step.title}</p>
                        <p className="node-tooltip-desc">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Accordion */}
            <div className="timeline-mobile reveal-item reveal-delay-2">
              {STEPS.map(function (step, i) {
                const isOpen = activeStep === i;
                return (
                  <div key={step.num} className="timeline-mobile-item">
                    <button
                      onClick={function () { setActiveStep(isOpen ? null : i); }}
                      className="timeline-mobile-btn"
                    >
                      <span className="timeline-mobile-num">{step.num}</span>
                      <span className={"timeline-mobile-title" + (isOpen ? " active" : "")}>
                        {step.title}
                      </span>
                      <span className="timeline-mobile-icon">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="timeline-mobile-content">
                        <p>{step.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FACTSHEET SHOWCASE & PDF VIEWER
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "96px 24px",
          maxWidth: 1160,
          margin: "0 auto",
          zIndex: 1,
        }}
      >
        <div ref={showcaseReveal.ref} className={"showcase-grid reveal-group" + (showcaseReveal.inView ? " in-view" : "")}>
          <div className="showcase-info-card hover-lift reveal-item reveal-delay-1" style={{ height: "100%", boxSizing: "border-box" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <p className="section-label" style={{ margin: 0, color: "var(--accent-light)" }}>
                  Fund Materials
                </p>
              </div>
              <h2 className="showcase-title">
                Quarterly <em>factsheet</em>
              </h2>
              <p className="showcase-desc">
                Review our comprehensive factsheet documenting long/short equity exposure breakdowns, monthly net return records, factor exposures, and risk limits.
              </p>
            </div>

            <div className="showcase-meta">
              <div className="showcase-meta-row">
                <span className="showcase-meta-label">Reporting Period</span>
                <span className="showcase-meta-value">Q1 2026</span>
              </div>
              <div className="showcase-meta-row">
                <span className="showcase-meta-label">Benchmark</span>
                <span className="showcase-meta-value">SOFR</span>
              </div>
              <div className="showcase-meta-row">
                <span className="showcase-meta-label">Format</span>
                <span className="showcase-meta-value">4-Page PDF</span>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <a
                href="/factsheet.pdf"
                download="Sipher-Street-Factsheet-Q1-2026.pdf"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  padding: "12px 28px",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                <span>Download Factsheet</span>
                <span style={{ fontSize: 16 }}>↓</span>
              </a>
            </div>
          </div>

          <div className="showcase-book-card hover-lift reveal-item reveal-delay-3" style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <BookFactsheet />
          </div>
        </div>

        <style jsx global>{`
          .pillars-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          .mandate-split {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: center;
          }
          .values-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          .showcase-grid {
            display: grid;
            grid-template-columns: 1fr 1.35fr;
            gap: 48px;
            align-items: stretch;
          }
          .showcase-info-card {
            background: var(--bg-surface);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 2px;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .showcase-title {
            font-size: clamp(26px, 3.2vw, 36px);
            font-weight: 200;
            color: #ffffff;
            line-height: 1.2;
            margin-bottom: 14px;
          }
          .showcase-title em {
            font-style: italic;
            font-weight: 400;
            color: var(--accent-light);
          }
          .showcase-desc {
            font-size: 15px;
            color: rgba(244, 243, 239, 0.8);
            line-height: 1.7;
            margin-bottom: 32px;
          }
          .showcase-meta {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .showcase-meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }
          .showcase-meta-label {
            color: rgba(244, 243, 239, 0.55);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.08em;
          }
          .showcase-meta-value {
            color: #ffffff;
            font-weight: 600;
          }
          .showcase-book-card {
            background: var(--bg-subsurface);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 2px;
            padding: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .timeline-mobile-icon {
            font-size: 18px;
            color: var(--accent-light);
            font-weight: 300;
          }
          .timeline-mobile-content p {
            margin: 0;
          }
          .timeline-mobile-content {
            padding: 0 0 16px 40px;
            font-size: 13.5px;
            color: rgba(244, 243, 239, 0.75);
            line-height: 1.65;
          }
          .timeline-mobile-title {
            font-size: 15px;
            font-weight: 400;
            flex-grow: 1;
            color: rgba(244, 243, 239, 0.85);
          }
          .timeline-mobile-title.active {
            color: var(--accent-light);
          }
          .timeline-mobile-num {
            font-size: 13px;
            font-weight: 700;
            color: var(--accent-light);
            min-width: 24px;
          }
          .timeline-mobile-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 16px;
            background: none;
            border: none;
            padding: 16px 0;
            cursor: pointer;
            color: #ffffff;
            text-align: left;
          }
          .timeline-mobile-item {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }
          .timeline-mobile {
            display: none;
          }
          .node-tooltip-desc {
            font-size: 12.5px;
            color: rgba(244, 243, 239, 0.8);
            line-height: 1.6;
            margin: 0;
          }
          .node-tooltip-title {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--accent-light);
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .node-tooltip {
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            background: var(--bg-surface);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 16px;
            border-radius: 2px;
            width: 260px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            opacity: 0;
            pointer-events: none;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 10;
          }
          .node-tooltip.visible,
          .timeline-node:hover .node-tooltip {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
            pointer-events: auto;
          }
          .node-title {
            font-size: 13px;
            font-weight: 500;
            color: rgba(244, 243, 239, 0.7);
            transition: color 0.2s ease;
            text-align: center;
            margin: 0;
          }
          .node-title.active,
          .timeline-node:hover .node-title {
            color: #ffffff;
          }
          .node-circle {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: var(--bg-surface);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: rgba(244, 243, 239, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            margin-bottom: 14px;
          }
          .node-circle.active,
          .timeline-node:hover .node-circle {
            background: var(--accent-light);
            border-color: var(--accent-light);
            color: #ffffff;
            transform: scale(1.15);
            box-shadow: 0 0 20px rgba(213, 109, 74, 0.5);
          }
          .timeline-node {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            position: relative;
            width: 120px;
          }
          .reveal-group.in-view .timeline-node {
            animation: nodeEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          }
          @keyframes nodeEntrance {
            0% {
              opacity: 0;
              transform: translateY(16px) scale(0.92);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .timeline-nodes {
            display: flex;
            justify-content: space-between;
            position: relative;
            z-index: 3;
          }
          .timeline-line {
            position: absolute;
            top: 60px;
            left: 5%;
            right: 5%;
            height: 2px;
            background: rgba(255, 255, 255, 0.10);
            z-index: 1;
          }
          .timeline-line-fill {
            position: absolute;
            top: 60px;
            left: 5%;
            height: 2px;
            background: linear-gradient(90deg, var(--accent-light), #34d399);
            z-index: 2;
            pointer-events: none;
          }
          .timeline-desktop {
            position: relative;
            padding: 40px 0;
          }
          @media (max-width: 960px) {
            .pillars-grid {
              grid-template-columns: 1fr;
            }
            .mandate-split {
              grid-template-columns: 1fr;
              gap: 40px;
            }
            .values-grid {
              grid-template-columns: 1fr;
            }
            .showcase-grid {
              grid-template-columns: 1fr;
            }
            .timeline-desktop {
              display: none;
            }
            .timeline-mobile {
              display: block;
            }
          }
          @media (max-width: 768px) {
            .pillar-card {
              padding: 28px 24px !important;
            }
            .value-card {
              padding: 28px 24px !important;
              min-height: 200px !important;
            }
            .showcase-info-card {
              padding: 28px 24px !important;
            }
            .showcase-book-card {
              padding: 16px !important;
            }
            .showcase-desc {
              margin-bottom: 20px;
            }
          }
          @media (max-width: 480px) {
            .pillar-card {
              padding: 24px 20px !important;
            }
            .value-card {
              padding: 24px 20px !important;
              min-height: auto !important;
            }
            .showcase-info-card {
              padding: 24px 18px !important;
            }
            .showcase-meta {
              flex-direction: column;
              gap: 8px;
            }
          }

          /* Robust motion rules */
          .reveal-group .reveal-item {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
          }
          .reveal-group.in-view .reveal-item {
            opacity: 1;
            transform: translateY(0);
          }
          .reveal-group.in-view .reveal-delay-1 { transition-delay: 0.08s; }
          .reveal-group.in-view .reveal-delay-2 { transition-delay: 0.16s; }
          .reveal-group.in-view .reveal-delay-3 { transition-delay: 0.24s; }
          .reveal-group.in-view .reveal-delay-4 { transition-delay: 0.32s; }
          .reveal-group.in-view .reveal-delay-5 { transition-delay: 0.40s; }
          .reveal-group.in-view .reveal-delay-6 { transition-delay: 0.48s; }

          .reveal-line-expand {
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
            will-change: transform;
          }
          .reveal-group.in-view .reveal-line-expand {
            transform: scaleX(1);
          }
          .hover-lift {
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        border-color 0.35s ease;
          }
          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 14px 36px rgba(0, 0, 0, 0.4);
            border-color: rgba(255, 255, 255, 0.24) !important;
          }
          .meter-track {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 9999px;
            overflow: hidden;
            position: relative;
          }
          .meter-fill {
            height: 100%;
            border-radius: 9999px;
            will-change: width;
          }

          @media (prefers-reduced-motion: reduce) {
            .reveal-group .reveal-item {
              opacity: 1 !important;
              transform: none !important;
              transition: none !important;
            }
            .reveal-line-expand {
              transform: none !important;
              transition: none !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
