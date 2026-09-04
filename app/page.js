"use client";
import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import useReveal from "./components/useReveal";

function fmt(n, decimals) {
  if (decimals === undefined) decimals = 2;
  if (n == null || isNaN(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function buildTickerItems(data) {
  if (!data || !data.positions) return [];

  var items = [];

  data.positions.forEach(function (pos) {
    var positive = pos.totalReturn >= 0;
    items.push({
      symbol: pos.symbol,
      price: "$" + fmt(pos.currentPrice),
      change: pos.totalReturn,
      positive: positive,
      type: "position",
    });
  });

  items.push({
    symbol: "REBASED NAV",
    price: "$" + fmt(data.totalValue, 0),
    change: null,
    type: "stat",
  });

  items.push({
    symbol: "PORTFOLIO RETURN",
    price: (data.totalReturnPct >= 0 ? "+" : "") + fmt(data.totalReturnPct, 2) + "%",
    change: null,
    type: "stat",
    isReturn: true,
    returnPositive: data.totalReturnPct >= 0,
  });

  items.push({
    symbol: "UNINVESTED CASH",
    price: "$" + fmt(data.cash, 0),
    change: null,
    type: "stat",
  });

  return items;
}

function TickerStrip({ data }) {
  var items = buildTickerItems(data);
  if (items.length === 0) return null;

  var allItems = items.concat(items).concat(items);
  var duration = Math.max(items.length * 4, 25);

  return (
    <div
      style={{
        width: "100%",
        background: "var(--bg-surface)",
        overflow: "hidden",
        position: "relative",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, bottom: 0, width: 80,
          background: "linear-gradient(to right, var(--bg-surface), transparent)",
          zIndex: 2, pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, width: 80,
          background: "linear-gradient(to left, var(--bg-surface), transparent)",
          zIndex: 2, pointerEvents: "none",
        }}
      />
      <div className="ticker-track" style={{ animationDuration: duration + "s" }}>
        {allItems.map(function (item, i) {
          var changeText = "";
          var changeColor = "rgba(244, 243, 239, 0.7)";
          var arrow = "";

          if (item.change != null) {
            var pos = item.positive;
            arrow = pos ? "▲" : "▼";
            changeColor = pos ? "#34d399" : "#f87171";
            var abs = Math.abs(item.change);
            changeText = (pos ? "+" : "-") + fmt(abs, 1) + "%";
          }

          if (item.isReturn) {
            changeColor = item.returnPositive ? "#34d399" : "#f87171";
          }

          return (
            <div
              key={i}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 32px", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(244, 243, 239, 0.8)", letterSpacing: "0.12em" }}>
                {item.symbol}
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 8 }}>{"•"}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: item.isReturn ? changeColor : "#ffffff" }}>
                {item.price}
              </span>
              {changeText && (
                <span style={{ fontSize: 11, fontWeight: 600, color: changeColor }}>
                  {arrow} {changeText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const VALUES = [
  {
    title: "Trust and integrity",
    desc: "Trust is the foundation of our enduring relationships with investors and partners. We sustain that trust by upholding the highest standards of transparency, maintaining point-in-time auditable portfolio reporting, and communicating openly.",
  },
  {
    title: "Independent alignment",
    desc: "We co-invest £10,000 of partner capital directly into the strategy. Our compensation structure of 1% management fee and 17.5% performance fee ensures that partner rewards are earned exclusively through capital growth and disciplined risk management.",
  },
  {
    title: "Intellectual rigour",
    desc: "We challenge consensus assumptions and construct proprietary, ground-up financial models before allocating capital. Every thesis is stress-tested against competitive moats, balance sheet durability, and asymmetric payoff profiles.",
  },
  {
    title: "Concentrated conviction",
    desc: "When research uncovers genuine operational or market dislocations, we size positions with conviction. We do not index-hug; our portfolio reflects a focused roster of high-probability compounders and catalyst-driven shorts.",
  },
  {
    title: "Continuous improvement",
    desc: "Active positions undergo continuous thesis validation against ongoing earnings calls, competitive data, and macro developments. When the thesis evolves, we adjust or exit without hesitation.",
  },
];

const PILLARS = [
  {
    num: "01",
    title: "Independent",
    italic: "Alignment",
    desc: "Independence frees us to focus solely on managing the strategy in the best long-term interest of our investors. We co-invest real partner capital under a 1% management and 17.5% performance fee structure.",
  },
  {
    num: "02",
    title: "Quality",
    italic: "Compounders",
    desc: "We dedicate rigorous fundamental analysis to high-return businesses with structural moats and secular reinvestment runways, identifying asymmetric mispricings across global equity markets.",
  },
  {
    num: "03",
    title: "Downside",
    italic: "Discipline",
    desc: "Our short book selectively targets fundamentally impaired or aggressively valued companies, generating idiosyncratic alpha while dampening net exposure during turbulent market regimes.",
  },
];

export default function Home() {
  var stateData = useState(null);
  var data = stateData[0];
  var setData = stateData[1];

  var [openAccordion, setOpenAccordion] = useState(0);
  var [heroLoaded, setHeroLoaded] = useState(false);

  var pillarsReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  var cultureReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
  var termsReveal = useReveal({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });

  useEffect(function () {
    fetch("/api/portfolio")
      .then(function (res) { return res.json(); })
      .then(function (d) { if (!d.error) setData(d); })
      .catch(function () {});

    var timer = setTimeout(function () { setHeroLoaded(true); }, 40);
    return function () { clearTimeout(timer); };
  }, []);

  var navVal = data ? "$" + fmt(data.totalValue / 1000, 0) + "K" : "$100K";
  var totalReturn = data
    ? (data.totalReturnPct >= 0 ? "+" : "") + fmt(data.totalReturnPct, 2) + "%"
    : "0.00%";

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          background: "var(--bg-primary)",
          color: "#f4f3ef",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          paddingTop: 100,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-10%", right: "-12%",
            width: 700, height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(30, 58, 95, 0.18) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "auraBreath 10s ease-in-out infinite alternate",
          }}
        />

        <div style={{ maxWidth: 1160, width: "100%", margin: "auto", padding: "24px 24px", position: "relative", zIndex: 1 }}>
          <div className={"reveal-group" + (heroLoaded ? " in-view" : "")}>

            {/* Eyebrow */}
            <div
              className="reveal-item"
              style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28 }}
            >
              <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--accent-light)", fontWeight: 600 }}>
                Independent Long/Short Equity
              </span>
              <span
                className="reveal-line-expand"
                style={{ display: "inline-block", width: 48, height: 1, background: "var(--accent-light)", verticalAlign: "middle" }}
              />
            </div>

            {/* Headline */}
            <h1
              className="reveal-item reveal-delay-1"
              style={{
                fontSize: "clamp(52px, 7.8vw, 96px)",
                fontWeight: 200,
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                maxWidth: 900,
                marginBottom: 28,
                color: "#ffffff",
              }}
            >
              Sipher{" "}
              <span
                className="font-heading"
                style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent-light)", display: "inline-block" }}
              >
                Street
              </span>
            </h1>

            <p
              className="reveal-item reveal-delay-2"
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                color: "rgba(244, 243, 239, 0.8)",
                lineHeight: 1.7,
                maxWidth: 700,
                fontWeight: 300,
                marginBottom: 48,
              }}
            >
              Sipher Street Capital is an independent long/short equity hedge fund. Co-invested directly alongside our partners, we deploy concentrated long and short equity strategies across American and European markets, pairing original fundamental research with rigorous downside protection.
            </p>

            {/* CTAs + Live Metrics */}
            <div
              className="reveal-item reveal-delay-3"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
                paddingTop: 36,
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <div className="hero-actions-group" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/portfolio">
                  <button className="btn-primary" style={{ padding: "14px 32px" }}>View Portfolio</button>
                </Link>
                <Link href="/pitches">
                  <button className="btn-dark-outline" style={{ padding: "14px 32px" }}>Our Research</button>
                </Link>
              </div>

              <div className="hero-live-metrics" style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(244, 243, 239, 0.55)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Rebased NAV</div>
                  <div style={{ fontSize: 26, fontWeight: 300, color: "#ffffff", letterSpacing: "0.01em" }}>{navVal}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(244, 243, 239, 0.55)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Inception Return</div>
                  <div style={{ fontSize: 26, fontWeight: 400, color: "#34d399", letterSpacing: "0.01em" }}>{totalReturn}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(244, 243, 239, 0.55)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Co-Invested Capital</div>
                  <div style={{ fontSize: 26, fontWeight: 300, color: "#ffffff", letterSpacing: "0.01em" }}>£10,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker at bottom of fold */}
        <div className={"reveal-group" + (heroLoaded ? " in-view" : "")} style={{ width: "100%", position: "relative", zIndex: 1 }}>
          <div className="reveal-item reveal-delay-4">
            {data && data.positions && <TickerStrip data={data} />}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          THREE PILLARS
          ══════════════════════════════════════════════════════ */}
      <section
        ref={pillarsReveal.ref}
        className={"reveal-group" + (pillarsReveal.inView ? " in-view" : "")}
        style={{ padding: "96px 24px", maxWidth: 1160, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 64px" }}>
          <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Investment Architecture</p>
          <h2 className="section-title reveal-item reveal-delay-1" style={{ marginBottom: 16 }}>
            Built for <em>enduring performance</em>
          </h2>
          <p className="reveal-item reveal-delay-2" style={{ color: "rgba(244, 243, 239, 0.8)", fontSize: 16, lineHeight: 1.7 }}>
            Our partnership structure and focused philosophy enable us to manage capital with complete alignment and long-term conviction.
          </p>
        </div>

        <div className="home-pillars-grid">
          {PILLARS.map(function (item, idx) {
            return (
              <div
                key={item.num}
                className={"home-pillar-card hover-lift reveal-item reveal-delay-" + (idx + 1)}
                style={{
                  background: "var(--bg-surface)",
                  color: "#f4f3ef",
                  padding: "44px 36px",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 320,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <h3 style={{ fontSize: 26, fontWeight: 300, color: "#ffffff", marginBottom: 16, lineHeight: 1.2 }}>
                    {item.title}{" "}
                    <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)", fontWeight: 400 }}>
                      {item.italic}
                    </span>
                  </h3>
                  <div className="reveal-line-expand" style={{ width: 40, height: 2, background: "var(--accent-light)", marginBottom: 20 }} />
                  <p style={{ fontSize: 14, color: "rgba(244, 243, 239, 0.75)", lineHeight: 1.75 }}>
                    {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CULTURE & VALUES
          ══════════════════════════════════════════════════════ */}
      <section
        ref={cultureReveal.ref}
        className={"reveal-group" + (cultureReveal.inView ? " in-view" : "")}
        style={{
          background: "var(--bg-surface)",
          padding: "96px 24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="home-culture-split">
            <div style={{ position: "relative" }}>
              <div className="reveal-item" style={{ position: "sticky", top: 120 }}>
                <p className="section-label" style={{ color: "var(--accent-light)" }}>Our Culture</p>
                <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 200, color: "#ffffff", lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.02em" }}>
                  Culture drives{" "}
                  <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)", fontWeight: 400 }}>
                    consistent outcomes
                  </span>
                </h2>
                <div className="reveal-line-expand" style={{ width: 44, height: 2, background: "var(--accent-light)", marginBottom: 24 }} />
                <p style={{ fontSize: 16, color: "rgba(244, 243, 239, 0.8)", lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
                  Our culture is the foundation of who we are and how we operate. It embodies the principles and discipline that unite us with our partners.
                </p>
                <Link href="/about">
                  <button className="btn-outline">Read Our Full Philosophy</button>
                </Link>
              </div>
            </div>

            <div>
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}>
                {VALUES.map(function (v, idx) {
                  var isOpen = openAccordion === idx;
                  var delayClass = "reveal-delay-" + Math.min(idx + 1, 6);
                  return (
                    <div
                      key={v.title}
                      className={"reveal-item " + delayClass}
                      style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", padding: "24px 0" }}
                    >
                      <button
                        onClick={function () { setOpenAccordion(isOpen ? null : idx); }}
                        style={{
                          width: "100%", display: "flex", justifyContent: "space-between",
                          alignItems: "center", background: "none", border: "none",
                          textAlign: "left", cursor: "pointer", padding: 0,
                        }}
                      >
                        <span
                          className="font-heading"
                          style={{
                            fontSize: "clamp(20px, 2.5vw, 26px)",
                            fontStyle: "italic",
                            color: isOpen ? "var(--accent-light)" : "rgba(244, 243, 239, 0.88)",
                            fontWeight: 400,
                            transition: "color 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        >
                          {v.title}
                        </span>
                        <div style={{
                          width: 28, height: 28, display: "flex", alignItems: "center",
                          justifyContent: "center",
                          color: isOpen ? "var(--accent-light)" : "rgba(244, 243, 239, 0.5)",
                          fontSize: 22, fontWeight: 300,
                          transition: "color 0.25s ease",
                        }}>
                          {isOpen ? "−" : "+"}
                        </div>
                      </button>

                      {isOpen && (
                        <div style={{ marginTop: 16, paddingRight: 32 }}>
                          <div style={{ width: 32, height: 1, background: "var(--accent-light)", marginBottom: 14, opacity: 0.7 }} />
                          <p style={{ fontSize: 15, color: "rgba(244, 243, 239, 0.8)", lineHeight: 1.75 }}>
                            {v.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FUND TERMS TABLE
          ══════════════════════════════════════════════════════ */}
      <section
        ref={termsReveal.ref}
        className={"reveal-group" + (termsReveal.inView ? " in-view" : "")}
        style={{ padding: "96px 24px", maxWidth: 1160, margin: "0 auto" }}
      >
        <div className="reveal-item" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
          <p className="section-label" style={{ color: "var(--accent-light)" }}>Partnership Terms</p>
          <h2 className="section-title" style={{ marginBottom: 12 }}>
            Institutional <em>fund terms</em>
          </h2>
          <div className="reveal-line-expand" style={{ width: 40, height: 2, background: "var(--accent-light)", margin: "0 auto 20px" }} />
          <p style={{ color: "rgba(244, 243, 239, 0.8)", fontSize: 15, lineHeight: 1.7 }}>
            Designed for long-term alignment of interest with fee discipline and complete portfolio transparency.
          </p>
        </div>

        <div
          className="reveal-item reveal-delay-2 fund-terms-wrapper"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <table className="data-table">
            <tbody>
              {[
                ["Management Fee", "1.00% per annum, calculated and accrued monthly"],
                ["Performance Fee", "17.50% of net profits subject to high-water mark"],
                ["Strategy & Structure", "U.S. & European L/S Equity Partnership"],
                ["Benchmark", "SOFR"],
                ["Partner Co-Investment", "£10,000 partner capital co-invested into the strategy"],
                ["Valuation & Pricing", "Rebased NAV computed daily from point-in-time exchange feeds"],
                ["Transparency & Reporting", "Open-source holdings, trade ledger, and historical pitch models"],
              ].map(function (row, idx) {
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: "#ffffff", width: "35%", background: "var(--bg-subsurface)", borderRight: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      {row[0]}
                    </td>
                    <td style={{ color: "rgba(244, 243, 239, 0.85)", fontSize: 14 }}>
                      {row[1]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="reveal-item reveal-delay-3" style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/portfolio">
            <button className="btn-primary" style={{ padding: "14px 36px" }}>
              Explore Live Portfolio & Performance
            </button>
          </Link>
        </div>
      </section>

      {/* Single global style block — no nesting */}
      <style jsx global>{`
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker-scroll linear infinite;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .home-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .home-culture-split {
          display: grid;
          grid-template-columns: 4.5fr 7fr;
          gap: 64px;
        }
        @keyframes auraBreath {
          0% { transform: scale(1) translate(0, 0); opacity: 0.4; }
          100% { transform: scale(1.18) translate(15px, -10px); opacity: 0.75; }
        }
        @media (max-width: 860px) {
          .home-pillars-grid { grid-template-columns: 1fr; gap: 20px; }
          .home-culture-split { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 768px) {
          .home-pillar-card {
            padding: 32px 24px !important;
            min-height: 260px !important;
          }
        }
        @media (max-width: 480px) {
          .home-pillar-card {
            padding: 28px 20px !important;
            min-height: auto !important;
          }
        }
        @media (max-width: 768px) {
          .hero-live-metrics {
            gap: 24px !important;
          }
          .fund-terms-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .fund-terms-wrapper .data-table td:first-child {
            min-width: 140px;
          }
        }
        @media (max-width: 480px) {
          .hero-actions-group {
            width: 100%;
          }
          .hero-actions-group a {
            width: 100%;
          }
          .hero-actions-group button {
            width: 100%;
            padding: 12px 20px !important;
          }
          .hero-live-metrics {
            flex-direction: column !important;
            gap: 20px !important;
          }
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
    </div>
  );
}
