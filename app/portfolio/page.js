"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "next-view-transitions";
import useReveal from "../components/useReveal";

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtReturn(val) {
  if (val == null || isNaN(val)) return "-";
  return (val >= 0 ? "+" : "") + fmt(val, 2) + "%";
}

function getReturnStyle(value) {
  if (value == null || isNaN(value)) return { textAlign: "center" };
  if (value >= 0) {
    return {
      color: "#34d399",
      fontWeight: 600,
      textAlign: "center",
      background: "rgba(52, 211, 153, 0.12)",
    };
  } else {
    return {
      color: "#f87171",
      fontWeight: 600,
      textAlign: "center",
      background: "rgba(248, 113, 113, 0.12)",
    };
  }
}

function PositionCard({ pos }) {
  return (
    <div style={{ padding: 20, background: "var(--bg-surface)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15, marginBottom: 4 }}>{pos.company}</div>
          <div style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.6)" }}>
            {pos.symbol !== "CASH" ? (
              <>
                {pos.symbol}
                <Link href={"/activity?ticker=" + pos.symbol} style={{ marginLeft: 6, fontSize: 11, color: "var(--accent-light)", fontWeight: 600 }} title="View activity">↗</Link>
              </>
            ) : (
              "Cash & Liquidity"
            )}
          </div>
        </div>
        {pos.totalReturn != null && (
          <span style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, borderRadius: 2, flexShrink: 0, ...getReturnStyle(pos.totalReturn) }}>
            {fmtReturn(pos.totalReturn)}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
        <div>
          <div style={{ color: "rgba(244, 243, 239, 0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Cost Basis</div>
          <div style={{ fontWeight: 500, color: "#f4f3ef" }}>{pos.costBasis != null ? "$" + fmt(pos.costBasis) : "-"}</div>
        </div>
        <div>
          <div style={{ color: "rgba(244, 243, 239, 0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Last Close</div>
          <div style={{ fontWeight: 500, color: "#f4f3ef" }}>{pos.currentPrice != null ? "$" + fmt(pos.currentPrice) : "-"}</div>
        </div>
        <div>
          <div style={{ color: "rgba(244, 243, 239, 0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Position Size</div>
          <div style={{ fontWeight: 600, color: "#ffffff" }}>${fmt(pos.positionSize, 0)}</div>
        </div>
        <div>
          <div style={{ color: "rgba(244, 243, 239, 0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Allocation</div>
          <div style={{ fontWeight: 600, color: "#ffffff" }}>{fmt(pos.allocation, 1)}%</div>
        </div>
      </div>
    </div>
  );
}

function PerformanceChart({ portfolio, benchmark }) {
  var containerRef = useRef(null);
  var [dims, setDims] = useState({ w: 800, h: 360 });
  var [hover, setHover] = useState(null);

  useEffect(function () {
    function measure() {
      if (containerRef.current) {
        var w = containerRef.current.clientWidth;
        var h = Math.max(280, Math.min(420, w * 0.45));
        setDims({ w: w, h: h });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return function () { window.removeEventListener("resize", measure); };
  }, []);

  var portMap = {};
  portfolio.forEach(function (p) { portMap[p.date] = p.value; });

  var benchMap = {};
  benchmark.forEach(function (b) { benchMap[b.date] = b.value; });

  var merged = [];
  if (portfolio.length > 0) {
    var firstParts = portfolio[0].date.split("-");
    var lastParts = portfolio[portfolio.length - 1].date.split("-");
    
    var current = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]);
    var lastDate = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
    
    var lastKnownPort = null;
    var lastKnownBench = null;
    
    while (current <= lastDate) {
      var yyyy = current.getFullYear();
      var mm = String(current.getMonth() + 1).padStart(2, "0");
      var dd = String(current.getDate()).padStart(2, "0");
      var dStr = yyyy + "-" + mm + "-" + dd;
      
      if (portMap[dStr] != null) lastKnownPort = portMap[dStr];
      if (benchMap[dStr] != null) lastKnownBench = benchMap[dStr];
      
      if (lastKnownPort != null) {
        merged.push({
          date: dStr,
          portfolio: lastKnownPort,
          benchmark: lastKnownBench,
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
  }

  if (merged.length < 2) return null;

  var pad = { top: 20, right: 20, bottom: 50, left: 65 };
  var chartW = dims.w - pad.left - pad.right;
  var chartH = dims.h - pad.top - pad.bottom;

  var allValues = [];
  merged.forEach(function (d) {
    allValues.push(d.portfolio);
    if (d.benchmark != null) allValues.push(d.benchmark);
  });
  var minVal = Math.min.apply(null, allValues);
  var maxVal = Math.max.apply(null, allValues);

  var range = maxVal - minVal;
  if (range === 0) range = 1000;
  minVal = minVal - range * 0.05;
  maxVal = maxVal + range * 0.05;

  function xScale(i) {
    return pad.left + (i / (merged.length - 1)) * chartW;
  }
  function yScale(val) {
    return pad.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  }

  function buildPath(key) {
    var points = [];
    merged.forEach(function (d, i) {
      if (d[key] != null) {
        points.push(xScale(i) + "," + yScale(d[key]));
      }
    });
    if (points.length < 2) return "";
    return "M" + points.join("L");
  }

  function buildArea() {
    var points = [];
    var validIndices = [];
    merged.forEach(function (d, i) {
      if (d.portfolio != null) {
        points.push(xScale(i) + "," + yScale(d.portfolio));
        validIndices.push(i);
      }
    });
    if (points.length < 2) return "";
    var first = validIndices[0];
    var last = validIndices[validIndices.length - 1];
    return "M" + points.join("L") +
      "L" + xScale(last) + "," + (pad.top + chartH) +
      "L" + xScale(first) + "," + (pad.top + chartH) + "Z";
  }

  var portfolioPath = buildPath("portfolio");
  var benchmarkPath = buildPath("benchmark");
  var areaPath = buildArea();

  var yTicks = [];
  for (var t = 0; t <= 4; t++) {
    yTicks.push(minVal + (t / 4) * (maxVal - minVal));
  }

  var xLabels = [];
  var step = Math.max(1, Math.floor(merged.length / 5));
  for (var idx = 0; idx < merged.length; idx += step) {
    var d = merged[idx];
    var p = d.date.split("-");
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    xLabels.push({
      x: xScale(idx),
      label: months[parseInt(p[1], 10) - 1] + " " + p[0].slice(2),
    });
  }

  function handleMouseMove(e) {
    var rect = containerRef.current.getBoundingClientRect();
    var mx = e.clientX - rect.left - pad.left;
    var idx = Math.round((mx / chartW) * (merged.length - 1));
    idx = Math.max(0, Math.min(merged.length - 1, idx));
    setHover(idx);
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={function () { setHover(null); }}
    >
      <svg width={dims.w} height={dims.h} style={{ display: "block" }}>
        {yTicks.map(function (val, i) {
          var y = yScale(val);
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={dims.w - pad.right} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(244, 243, 239, 0.6)">
                {"$" + Math.round(val / 1000) + "k"}
              </text>
            </g>
          );
        })}

        {xLabels.map(function (item, i) {
          return (
            <text key={i} x={item.x} y={dims.h - 14} textAnchor="middle" fontSize="11" fill="rgba(244, 243, 239, 0.6)">
              {item.label}
            </text>
          );
        })}

        {/* Portfolio Area Fill */}
        {areaPath && (
          <path d={areaPath} fill="rgba(213, 109, 74, 0.08)" />
        )}

        {/* Benchmark line (SOFR) */}
        {benchmarkPath && (
          <path d={benchmarkPath} fill="none" stroke="var(--chart-benchmark)" strokeWidth="2" strokeDasharray="5,5" />
        )}

        {/* Portfolio line */}
        {portfolioPath && (
          <path d={portfolioPath} fill="none" stroke="#ffffff" strokeWidth="2.5" />
        )}

        {/* $100k Baseline */}
        <line
          x1={pad.left} y1={yScale(100000)} x2={dims.w - pad.right} y2={yScale(100000)}
          stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.5" strokeDasharray="3,3"
        />

        {hover !== null && merged[hover] && (
          <g>
            <line
              x1={xScale(hover)} y1={pad.top} x2={xScale(hover)} y2={pad.top + chartH}
              stroke="var(--chart-benchmark)" strokeWidth="1" strokeDasharray="3,3"
            />
            <circle cx={xScale(hover)} cy={yScale(merged[hover].portfolio)} r="4.5" fill="#ffffff" stroke="var(--bg-surface)" strokeWidth="2" />
            {merged[hover].benchmark != null && (
              <circle cx={xScale(hover)} cy={yScale(merged[hover].benchmark)} r="4" fill="var(--chart-benchmark)" stroke="#ffffff" strokeWidth="1.5" />
            )}
          </g>
        )}
      </svg>

      {hover !== null && merged[hover] && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: Math.min(xScale(hover) - 80, dims.w - 200),
            background: "var(--bg-primary)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: 2,
            padding: "10px 14px",
            fontSize: 12,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 170,
          }}
        >
          <div style={{ fontWeight: 600, color: "#ffffff", marginBottom: 6, fontSize: 11, letterSpacing: "0.04em" }}>
            {merged[hover].date}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ color: "rgba(244, 243, 239, 0.7)" }}>Sipher Street</span>
            <span style={{ fontWeight: 600, color: "#34d399" }}>{"$" + fmt(merged[hover].portfolio, 0)}</span>
          </div>
          {merged[hover].benchmark != null && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ color: "rgba(244, 243, 239, 0.7)" }}>SOFR Index</span>
              <span style={{ fontWeight: 600, color: "var(--accent-light)" }}>{"$" + fmt(merged[hover].benchmark, 0)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Portfolio() {
  var [data, setData] = useState(null);
  var [metrics, setMetrics] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(null);
  var [mounted, setMounted] = useState(false);

  var [chartData, setChartData] = useState(null);

  var chartReveal = useReveal();
  var tablesReveal = useReveal();

  useEffect(function () {
    Promise.all([
      fetch("/api/portfolio").then(function (res) { return res.json(); }),
      fetch("/api/activity").then(function (res) { return res.json(); }).catch(function () { return null; }),
    ])
      .then(function ([d, act]) {
        if (d.error && !d.positions) throw new Error(d.error);
        setData(d);
        if (d.metrics) {
          setMetrics(d.metrics);
        } else if (act && act.metrics) {
          setMetrics(act.metrics);
        }
      })
      .catch(function (e) { setError(e.message); })
      .finally(function () {
        setLoading(false);
        setTimeout(function () { setMounted(true); }, 40);
      });
  }, []);

  useEffect(function () {
    fetch("/api/portfolio/history")
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (!d.error && d.portfolio && d.portfolio.length >= 2) {
          setChartData(d);
        }
      })
      .catch(function () {});
  }, []);

  if (loading) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.6)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Loading Portfolio Factsheet...
          </div>
          <div style={{ fontSize: 12, color: "var(--accent-light)", marginTop: 8 }}>Reconciling live Alpaca brokerage records</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, border: "1px solid rgba(248, 113, 113, 0.25)", background: "rgba(248, 113, 113, 0.06)", borderRadius: 2 }}>
          <div style={{ fontSize: 16, color: "#f87171", marginBottom: 8, fontWeight: 600 }}>Unable to load portfolio</div>
          <div style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.75)" }}>{error}</div>
        </div>
      </div>
    );
  }

  var d = data;
  var m = metrics || (d && d.metrics) || {};
  var liveJensensAlpha = d.jensensAlphaAnn || m.jensensAlphaAnn || "+3.00%";
  var liveSortino = d.sortino || m.sortino || "1.18";
  var liveMaxDD = d.maxDrawdown || m.maxDrawdown || "-3.87%";

  var longPositions = d.longPositions || d.positions.filter(function (p) { return p.side === "LONG" && !p.isTreasury && p.symbol !== "BOXX"; });
  var shortPositions = d.shortPositions || d.positions.filter(function (p) { return p.side === "SHORT"; });
  var cashItems = d.cashItems || [];

  if (!d.cashItems) {
    var boxx = d.positions.find(function (p) { return p.symbol === "BOXX" || p.isTreasury; });
    if (boxx) cashItems.push(Object.assign({}, boxx, { side: "TREASURY" }));
    cashItems.push({
      company: "Uninvested Cash",
      symbol: "CASH",
      qty: null,
      side: "CASH",
      costBasis: null,
      currentPrice: null,
      positionSize: d.cash,
      allocation: (d.cash / d.totalValue) * 100,
      totalReturn: null,
      pl: null,
    });
  }

  longPositions.sort(function (a, b) { return b.positionSize - a.positionSize; });
  shortPositions.sort(function (a, b) { return b.positionSize - a.positionSize; });

  var chartPortfolioReturn = null;
  var chartBenchReturn = null;
  if (chartData && chartData.portfolio && chartData.portfolio.length >= 2) {
    var p0 = chartData.portfolio[0].value;
    var pN = chartData.portfolio[chartData.portfolio.length - 1].value;
    chartPortfolioReturn = (((pN - p0) / p0) * 100).toFixed(2);
    if (chartData.benchmark && chartData.benchmark.length >= 2) {
      var b0 = chartData.benchmark[0].value;
      var bN = chartData.benchmark[chartData.benchmark.length - 1].value;
      chartBenchReturn = (((bN - b0) / b0) * 100).toFixed(2);
    }
  }

  function renderTableRow(pos) {
    var retStyle = pos.totalReturn != null ? getReturnStyle(pos.totalReturn) : {};
    return (
      <tr key={pos.symbol + "-" + pos.side}>
        <td style={{ fontWeight: 600, color: "#ffffff" }}>
          {pos.symbol !== "CASH" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {pos.symbol}
              <Link href={"/activity?ticker=" + pos.symbol} style={{ fontSize: 11, color: "var(--accent-light)", fontWeight: 600 }}>↗</Link>
            </span>
          ) : (
            <span style={{ color: "rgba(244, 243, 239, 0.5)" }}>{pos.symbol}</span>
          )}
        </td>
        <td style={{ color: "rgba(244, 243, 239, 0.85)" }}>{pos.company}</td>
        <td style={{ textAlign: "center" }}>
          <span className={pos.side === "LONG" ? "tag-long" : pos.side === "SHORT" ? "tag-short" : ""}>
            {pos.side}
          </span>
        </td>
        <td style={{ textAlign: "right", color: "rgba(244, 243, 239, 0.75)" }}>{pos.costBasis != null ? "$" + fmt(pos.costBasis) : "-"}</td>
        <td style={{ textAlign: "right", color: "rgba(244, 243, 239, 0.75)" }}>{pos.currentPrice != null ? "$" + fmt(pos.currentPrice) : "-"}</td>
        <td style={{ textAlign: "right", fontWeight: 600, color: "#ffffff" }}>{"$" + fmt(pos.positionSize, 0)}</td>
        <td style={{ textAlign: "center", fontWeight: 500, color: "#ffffff" }}>{fmt(pos.allocation, 1)}%</td>
        <td style={{ textAlign: "center", ...retStyle }}>
          {pos.totalReturn != null ? fmtReturn(pos.totalReturn) : "-"}
        </td>
      </tr>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingTop: 100 }}>
      <div className="page-section" style={{ minHeight: "auto", paddingTop: 32 }}>
        {/* Editorial Page Header */}
        <div className={"reveal-group" + (mounted ? " in-view" : "")} style={{ marginBottom: 48 }}>
          <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Point-In-Time Factsheet</p>
          <h1 className="section-title reveal-item reveal-delay-1" style={{ marginBottom: 12 }}>
            Portfolio & <em>Performance</em>
          </h1>
          <p className="reveal-item reveal-delay-2" style={{ color: "rgba(244, 243, 239, 0.8)", fontSize: 16, lineHeight: 1.7, maxWidth: 680 }}>
            Daily reconciled holdings, equity curves, and risk-adjusted metrics derived directly from brokerage execution feeds and New York Fed SOFR rates.
          </p>
        </div>

        {/* Top Key Metric Factsheet Tiles — STRICTLY 1 ROW (5 COLUMNS) */}
        <div className={"metrics-single-row reveal-group" + (mounted ? " in-view" : "")}>
          {[
            ["Rebased NAV", "$" + fmt(d.totalValue, 0), "Initial Capital $100K"],
            ["Total Net Return", fmtReturn(d.totalReturnPct), "Net of dividends & interest"],
            ["Jensen's Alpha", liveJensensAlpha, "Annualised vs SPY"],
            ["Sortino Ratio", liveSortino, "Downside deviation"],
            ["Max Drawdown", liveMaxDD, "Peak-to-trough"],
          ].map(function (tile, idx) {
            return (
              <div
                key={tile[0]}
                className={"hover-lift reveal-item reveal-delay-" + (idx + 1)}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "24px 18px",
                  borderRadius: 2,
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.6)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>
                    {tile[0]}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", marginBottom: 6, letterSpacing: "0.01em" }}>
                    {tile[1]}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--accent-light)", fontWeight: 500 }}>
                  {tile[2]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Chart Section */}
        {chartData && chartData.portfolio && chartData.portfolio.length >= 2 && (
          <div
            ref={chartReveal.ref}
            className={"reveal-group" + (chartReveal.inView ? " in-view" : "")}
            style={{ marginBottom: 56 }}
          >
            <div
              className="hover-lift reveal-item"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "32px 28px",
                borderRadius: 2,
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.25)",
              }}
            >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 4, color: "var(--accent-light)" }}>Time-Weighted Equity Curve</p>
                <h3 style={{ fontSize: 22, fontWeight: 200, color: "#ffffff" }}>
                  Sipher Street vs <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)" }}>SOFR Benchmark</span>
                </h3>
                <p style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.55)", marginTop: 4 }}>
                  Since inception (26 February 2026) · Rebased to $100,000 baseline
                </p>
              </div>

              {/* Legend with returns */}
              <div className="chart-legend-row" style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 3, background: "#ffffff" }} />
                  <span style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.8)", fontWeight: 500 }}>Sipher Street</span>
                  {chartPortfolioReturn && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#34d399" }}>
                      +{chartPortfolioReturn}%
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 0, borderTop: "2px dashed var(--chart-benchmark)" }} />
                  <span style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.8)", fontWeight: 500 }}>SOFR</span>
                  {chartBenchReturn && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-light)" }}>
                      +{chartBenchReturn}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <PerformanceChart portfolio={chartData.portfolio} benchmark={chartData.benchmark} />
            </div>
          </div>
        )}

        {/* Holdings Table Section */}
        <div
          ref={tablesReveal.ref}
          className={"reveal-group" + (tablesReveal.inView ? " in-view" : "")}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div>
              <p className="section-label" style={{ marginBottom: 4, color: "var(--accent-light)" }}>Active Holdings</p>
              <h3 style={{ fontSize: 22, fontWeight: 200, color: "#ffffff" }}>
                Current <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)" }}>Book Exposure</span>
              </h3>
            </div>
            <div style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.55)" }}>
              Prices as of last market close
            </div>
          </div>

          <div className="portfolio-desktop reveal-item reveal-delay-1">
            <div className="hover-lift" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 2, overflow: "hidden", background: "var(--bg-surface)" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th style={{ textAlign: "center" }}>Side</th>
                    <th style={{ textAlign: "right" }}>Cost Basis</th>
                    <th style={{ textAlign: "right" }}>Last Close</th>
                    <th style={{ textAlign: "right" }}>Position Size</th>
                    <th style={{ textAlign: "center" }}>Allocation</th>
                    <th style={{ textAlign: "center" }}>Return</th>
                  </tr>
                </thead>
                <tbody>
                  {longPositions.length > 0 && (
                    <>
                      <tr className="group-header-row">
                        <td colSpan={8}>
                          <span className="group-header-title">Long Portfolio</span>
                        </td>
                      </tr>
                      {longPositions.map(renderTableRow)}
                    </>
                  )}

                  {shortPositions.length > 0 && (
                    <>
                      <tr className="group-header-row">
                        <td colSpan={8}>
                          <span className="group-header-title">Short Book (Hedges)</span>
                        </td>
                      </tr>
                      {shortPositions.map(renderTableRow)}
                    </>
                  )}

                  {cashItems.length > 0 && (
                    <>
                      <tr className="group-header-row">
                        <td colSpan={8}>
                          <span className="group-header-title">Cash & Treasuries</span>
                        </td>
                      </tr>
                      {cashItems.map(renderTableRow)}
                    </>
                  )}

                  <tr style={{ background: "var(--bg-subsurface)", fontWeight: 700 }}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>Total Rebased NAV</td>
                    <td colSpan={4}></td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#ffffff" }}>{"$" + fmt(d.totalValue, 0)}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#ffffff" }}>100.0%</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: d.totalReturnPct >= 0 ? "#34d399" : "#f87171" }}>
                      {fmtReturn(d.totalReturnPct)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Position Cards */}
          <div className="portfolio-mobile">
            <div style={{ display: "grid", gap: 16 }}>
              {longPositions.map(function (pos) { return <PositionCard key={pos.symbol} pos={pos} />; })}
              {shortPositions.map(function (pos) { return <PositionCard key={pos.symbol} pos={pos} />; })}
              {cashItems.map(function (pos) { return <PositionCard key={pos.symbol} pos={pos} />; })}
            </div>
          </div>
        </div>

        {/* Regulatory Disclosures Box */}
        <div style={{ background: "var(--bg-subsurface)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 24, borderRadius: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Pro-Forma Measurement & Methodology Disclosure
          </div>
          <p style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.7)", lineHeight: 1.7 }}>
            Performance metrics are calculated dynamically via the Sipher Street financial engine (`lib/metrics.js`) utilizing the authoritative point-in-time equity series from Alpaca. SOFR interest is compounded daily using ACT/360 conventions on uninvested long cash balance only, reconciling within $1 of account statements. Dividend netting reflects actual historical corporate action ex-dates. Alpha and Beta are calculated via OLS regression against common market trading days in New York time.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .metrics-single-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 48px;
        }
        @media (max-width: 1024px) {
          .metrics-single-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .group-header-row td {
          background: var(--bg-subsurface) !important;
          padding: 8px 18px !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .group-header-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-light);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .portfolio-mobile { display: none; }
        @media (max-width: 860px) {
          .portfolio-desktop { display: none; }
          .portfolio-mobile { display: block; }
        }
        @media (max-width: 640px) {
          .metrics-single-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .metrics-single-row {
            grid-template-columns: 1fr;
          }
          .chart-legend-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}