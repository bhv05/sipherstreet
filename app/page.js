"use client";
import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/*
  Builds the array of ticker items from portfolio data.
  Each item: { label, value, change, isPositive }
  If there are few positions, we pad with fund-level stats
  so the strip always has enough content to scroll smoothly.
*/
function buildTickerItems(data) {
  if (!data || !data.positions) return [];

  var items = [];

  /* Each position: SYMBOL  $price  ▲/▼ change% */
  data.positions.forEach(function (pos) {
    items.push({
      symbol: pos.symbol,
      price: "$" + fmt(pos.currentPrice),
      change: pos.changeToday,
      type: "position",
    });
  });

  /* Fund-level stats to fill the strip */
  items.push({
    symbol: "AUM",
    price: "$" + fmt(data.totalValue, 0),
    change: null,
    type: "stat",
  });

  items.push({
    symbol: "TOTAL RETURN",
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

  /*
    We render the items 4 times to ensure seamless looping.
    The CSS animation slides the entire strip left by 50%
    (which is 2 full sets), then snaps back — creating
    an infinite seamless scroll.
  */
  var allItems = items.concat(items).concat(items).concat(items);

  /* Speed: roughly 30px per second per item, minimum 20s */
  var duration = Math.max(items.length * 4, 20);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "48px auto 0",
        overflow: "hidden",
        borderRadius: 4,
        background: "#0f1c30",
        position: "relative",
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 40,
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
          width: 40,
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
            var pos = item.change >= 0;
            arrow = pos ? "\u25B2" : "\u25BC";
            changeColor = pos ? "#4ade80" : "#f87171";
            changeText = (pos ? "+" : "") + fmt(item.change, 2) + "%";
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
                padding: "10px 28px",
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

              {/* Subtle dot separator */}
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

      {/* "As of last close" label */}
      {data && data.lastUpdated && (
        <div
          style={{
            textAlign: "center",
            padding: "0 0 8px",
            fontSize: 9,
            color: "#475569",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Live when markets are open · Prices as of last close
        </div>
      )}

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
        L/S Strategies
      </p>

      <picture style={{ display: "block", marginBottom: 32 }}>
        <source srcSet="/logo-hero.svg" type="image/svg+xml" />
        <img
          src="/logo-hero.png"
          alt="Sipher Street"
          style={{
            height: "auto",
            width: "clamp(280px, 55vw, 440px)",
            maxWidth: "100%",
            objectFit: "contain",
            display: "block",
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

      {/* Live Ticker Strip */}
      {data && data.positions && data.positions.length > 0 && (
        <TickerStrip data={data} />
      )}

      {/* Stats row — live from Alpaca */}
      <div className="home-stats">
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

      <style jsx>{`
        .home-stats {
          display: flex;
          gap: 64px;
          margin-top: 48px;
          flex-wrap: wrap;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .home-stats {
            gap: 36px;
            margin-top: 36px;
          }
        }
      `}</style>
    </section>
  );
}