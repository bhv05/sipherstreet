"use client";
import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import useReveal from "./components/useReveal";

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return "—";
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
    symbol: "AUM",
    price: "$" + fmt(data.totalValue, 0),
    change: null,
    type: "stat",
  });

  items.push({
    symbol: "PORTFOLIO",
    price: (data.totalReturnPct >= 0 ? "+" : "") + fmt(data.totalReturnPct, 2) + "%",
    change: null,
    type: "stat",
    isReturn: true,
    returnPositive: data.totalReturnPct >= 0,
  });

  items.push({
    symbol: "CASH",
    price: "$" + fmt(data.cash, 0),
    change: null,
    type: "stat",
  });

  return items;
}

function TickerStrip({ data }) {
  var items = buildTickerItems(data);
  if (items.length === 0) return null;

  var allItems = items.concat(items).concat(items).concat(items);
  var duration = Math.max(items.length * 4, 20);

  return (
    <div
      style={{
        width: "100%",
        background: "#0f1c30",
        overflow: "hidden",
        position: "relative",
        marginTop: 64,
        borderBottom: "1px solid #1a2a44",
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(to right, #0f1c30, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(to left, #0f1c30, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div className="ticker-track" style={{ animationDuration: duration + "s" }}>
        {allItems.map(function (item, i) {
          var changeText = "";
          var changeColor = "#94a3b8";
          var arrow = "";

          if (item.change != null) {
            var pos = item.positive;
            arrow = pos ? "\u25B2" : "\u25BC";
            changeColor = pos ? "#4ade80" : "#f87171";
            var abs = Math.abs(item.change);
            changeText = (pos ? "+" : "-") + fmt(abs, 1) + "%";
          }

          if (item.isReturn) {
            changeColor = item.returnPositive ? "#4ade80" : "#f87171";
          }

          return (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 32px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                }}
              >
                {item.symbol}
              </span>

              <span style={{ color: "#334155", fontSize: 8 }}>{"\u2022"}</span>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: item.isReturn ? changeColor : "#e2e8f0",
                }}
              >
                {item.price}
              </span>

              {changeText && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: changeColor,
                  }}
                >
                  {arrow} {changeText}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .ticker-track {
          display: flex;
          animation: ticker-scroll linear infinite;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  var stateData = useState(null);
  var data = stateData[0];
  var setData = stateData[1];

  useEffect(function () {
    fetch("/api/portfolio")
      .then(function (res) { return res.json(); })
      .then(function (d) { if (!d.error) setData(d); })
      .catch(function () {});
  }, []);

  var aum = data ? "$" + fmt(data.totalValue / 1000, 0) + "K" : "$100K";
  var totalReturn = data
    ? (data.totalReturnPct >= 0 ? "+" : "") + fmt(data.totalReturnPct, 2) + "%"
    : "0.00%";

  var showTicker = data && data.positions && data.positions.length > 0;

  var heroReveal = useReveal();
  var statsReveal = useReveal();
  var darkReveal = useReveal();

  return (
    <div>
      {/* Full-width ticker — directly below navbar */}
      {showTicker && <TickerStrip data={data} />}

      {/* Hero section */}
      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: showTicker ? "calc(100vh - 106px)" : "100vh",
          padding: showTicker ? "60px 24px 80px" : "120px 24px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(30,58,95,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          ref={heroReveal.ref}
          className={"reveal" + (heroReveal.inView ? " in-view" : "")}
        >
          <p className="section-label" style={{ marginBottom: 16 }}>
            L/S Strategies
          </p>

          <picture style={{ display: "block", marginBottom: 32, textAlign: "center" }}>
            <source srcSet="/logo-hero.svg" type="image/svg+xml" />
            <img
              src="/logo-hero.png"
              alt="Sipher Street"
              style={{
                height: "auto",
                width: "clamp(280px, 55vw, 440px)",
                maxWidth: "100%",
                objectFit: "contain",
                display: "inline-block",
                margin: "0 auto",
              }}
              fetchPriority="high"
            />
          </picture>

          <p
            style={{
              maxWidth: 520,
              color: "#5a6a7e",
              fontSize: 16,
              lineHeight: 1.7,
              marginBottom: 48,
              margin: "0 auto 48px",
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
        </div>

        {/* Stats row */}
        <div
          ref={statsReveal.ref}
          className={"home-stats reveal" + (statsReveal.inView ? " in-view" : "")}
        >
          {[
            [aum, "AUM"],
            [totalReturn, "Total Return"],
          ].map(function (pair) {
            var value = pair[0];
            var label = pair[1];
            return (
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
            );
          })}
        </div>

        {/* Last close note */}
        {showTicker && (
          <div
            style={{
              marginTop: 32,
              fontSize: 10,
              color: "#b0bac6",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Live when markets are open · Prices as of last close
          </div>
        )}

        <style jsx>{`
          .home-stats {
            display: flex;
            gap: 64px;
            margin-top: 56px;
            flex-wrap: wrap;
            justify-content: center;
          }
          @media (max-width: 768px) {
            .home-stats {
              gap: 36px;
              margin-top: 40px;
            }
          }
        `}</style>
      </section>

      {/* Dark section — Fund Edge */}
      <section
        ref={darkReveal.ref}
        className={"reveal" + (darkReveal.inView ? " in-view" : "")}
        style={{
          background: "#0f1c30",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#4a6a8a",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Our Edge
          </p>
          <h2
            style={{
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 200,
              color: "#e2e8f0",
              lineHeight: 1.5,
              marginBottom: 56,
              maxWidth: 680,
              margin: "0 auto 56px",
            }}
          >
            Conviction-driven research.{" "}
            <span style={{ fontWeight: 600, color: "#ffffff" }}>
              Institutional-grade discipline.
            </span>
          </h2>

          <div className="dark-stats-grid">
            {[
              ["3", "Strategy Pillars", "Quality compounders, event-driven, and short ideas"],
              ["U.S. & Europe", "Market Coverage", "Equity opportunities across American and European markets"],
              ["100%", "Research-Led", "Every position backed by original fundamental analysis"],
              ["Live", "Portfolio Tracking", "Real-time portfolio data updated with every market close"],
            ].map(function (item, i) {
              var val = item[0];
              var label = item[1];
              var sub = item[2];
              return (
                <div
                  key={label}
                  style={{
                    textAlign: "center",
                    padding: "24px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 300,
                      color: "#ffffff",
                      marginBottom: 8,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      lineHeight: 1.6,
                      maxWidth: 200,
                      margin: "0 auto",
                    }}
                  >
                    {sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx>{`
          .dark-stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            border-top: 1px solid #1a2a44;
            padding-top: 40px;
          }
          @media (max-width: 768px) {
            .dark-stats-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
          }
        `}</style>
      </section>
    </div>
  );
}