"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "next-view-transitions";

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtReturn(n) {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);
  const str = abs.toFixed(1) + "%";
  return n < 0 ? `(${str})` : str;
}

function getReturnStyle(value) {
  if (value == null || isNaN(value)) return {};
  var abs = Math.abs(value);
  var intensity = Math.min(abs / 30, 1);
  if (value >= 0) {
    var bgAlpha = (intensity * 0.25).toFixed(3);
    var r = Math.round(134 + (21 - 134) * intensity);
    var g = Math.round(184 + (128 - 184) * intensity);
    var b = Math.round(154 + (61 - 154) * intensity);
    return {
      background: "rgba(22, 163, 74, " + bgAlpha + ")",
      color: "rgb(" + r + "," + g + "," + b + ")",
      fontWeight: 600,
      textAlign: "center",
    };
  } else {
    var bgAlpha = (intensity * 0.25).toFixed(3);
    var r = Math.round(196 + (185 - 196) * intensity);
    var g = Math.round(138 + (28 - 138) * intensity);
    var b = Math.round(138 + (28 - 138) * intensity);
    return {
      background: "rgba(220, 38, 38, " + bgAlpha + ")",
      color: "rgb(" + r + "," + g + "," + b + ")",
      fontWeight: 600,
      textAlign: "center",
    };
  }
}

function getReturnBadgeStyle(value) {
  if (value == null || isNaN(value)) return {};
  var abs = Math.abs(value);
  var intensity = Math.min(abs / 30, 1);
  if (value >= 0) {
    var bgAlpha = (0.06 + intensity * 0.20).toFixed(3);
    var r = Math.round(134 + (21 - 134) * intensity);
    var g = Math.round(184 + (128 - 184) * intensity);
    var b = Math.round(154 + (61 - 154) * intensity);
    return {
      background: "rgba(22, 163, 74, " + bgAlpha + ")",
      color: "rgb(" + r + "," + g + "," + b + ")",
    };
  } else {
    var bgAlpha = (0.06 + intensity * 0.20).toFixed(3);
    var r = Math.round(196 + (185 - 196) * intensity);
    var g = Math.round(138 + (28 - 138) * intensity);
    var b = Math.round(138 + (28 - 138) * intensity);
    return {
      background: "rgba(220, 38, 38, " + bgAlpha + ")",
      color: "rgb(" + r + "," + g + "," + b + ")",
    };
  }
}

function PositionCard({ pos }) {
  var badgeStyle = getReturnBadgeStyle(pos.totalReturn);
  return (
    <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15, marginBottom: 4 }}>{pos.company}</div>
          <div style={{ fontSize: 12, color: "#5a6a7e" }}>
            {pos.symbol}
            <Link href={"/activity?ticker=" + pos.symbol} style={{ marginLeft: 6, fontSize: 11, color: "#1e3a5f", fontWeight: 500, opacity: 0.7 }} title="View activity">↗</Link>
          </div>
        </div>
        <span style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, borderRadius: 3, flexShrink: 0, ...badgeStyle }}>
          {fmtReturn(pos.totalReturn)}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Cost Basis</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>${fmt(pos.costBasis)}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Last Close</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>${fmt(pos.currentPrice)}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Position Size</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>${fmt(pos.positionSize, 0)}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Allocation</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{fmt(pos.allocation, 1)}%</div>
        </div>
      </div>
    </div>
  );
}

/*
  SVG-based performance chart.
  Renders portfolio vs S&P 500 as two lines, both rebased to $100,000.
  Includes hover tooltip, y-axis labels, x-axis date labels, and legend.
  No external dependencies required.
*/
function PerformanceChart({ portfolio, benchmark }) {
  var containerRef = useRef(null);
  var [dims, setDims] = useState({ w: 800, h: 360 });
  var [hover, setHover] = useState(null);

  /* Responsive: measure container width */
  useEffect(function () {
    function measure() {
      if (containerRef.current) {
        var w = containerRef.current.clientWidth;
        var h = Math.max(280, Math.min(400, w * 0.45));
        setDims({ w: w, h: h });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return function () { window.removeEventListener("resize", measure); };
  }, []);

  /* Fill out every single calendar day to ensure even time scaling */
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

  /* Chart dimensions */
  var pad = { top: 20, right: 20, bottom: 50, left: 65 };
  var chartW = dims.w - pad.left - pad.right;
  var chartH = dims.h - pad.top - pad.bottom;

  /* Find min/max across both series */
  var allValues = [];
  merged.forEach(function (d) {
    allValues.push(d.portfolio);
    if (d.benchmark != null) allValues.push(d.benchmark);
  });
  var minVal = Math.min.apply(null, allValues);
  var maxVal = Math.max.apply(null, allValues);

  /* Add 2% padding to range */
  var range = maxVal - minVal;
  if (range === 0) range = 1000;
  minVal = minVal - range * 0.05;
  maxVal = maxVal + range * 0.05;

  /* Scale functions */
  function xScale(i) {
    return pad.left + (i / (merged.length - 1)) * chartW;
  }
  function yScale(val) {
    return pad.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  }

  /* Build SVG path strings */
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

  /* Build area path for portfolio (fill under line) */
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

  /* Y-axis tick values (5 ticks) */
  var yTicks = [];
  for (var t = 0; t <= 4; t++) {
    var val = minVal + (t / 4) * (maxVal - minVal);
    yTicks.push(val);
  }

  /* X-axis date labels (max 6 evenly spaced) */
  var xLabelCount = Math.min(6, merged.length);
  var xLabels = [];
  for (var k = 0; k < xLabelCount; k++) {
    var idx = Math.round((k / (xLabelCount - 1)) * (merged.length - 1));
    var parts = merged[idx].date.split("-");
    var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var label = parseInt(parts[2]) + " " + monthNames[parseInt(parts[1]) - 1];
    xLabels.push({ x: xScale(idx), label: label });
  }

  /* Final return values for legend */
  var lastPortfolio = merged[merged.length - 1].portfolio;
  var firstPortfolio = merged[0].portfolio;
  var portfolioReturn = ((lastPortfolio - firstPortfolio) / firstPortfolio * 100).toFixed(2);

  var lastBench = null;
  var firstBench = null;
  for (var b1 = merged.length - 1; b1 >= 0; b1--) {
    if (merged[b1].benchmark != null) { lastBench = merged[b1].benchmark; break; }
  }
  for (var b2 = 0; b2 < merged.length; b2++) {
    if (merged[b2].benchmark != null) { firstBench = merged[b2].benchmark; break; }
  }
  var benchReturn = (firstBench && lastBench) ? ((lastBench - firstBench) / firstBench * 100).toFixed(2) : null;

  /* Hover handler */
  function handleMouseMove(e) {
    var rect = containerRef.current.getBoundingClientRect();
    var mx = e.clientX - rect.left - pad.left;
    var idx = Math.round((mx / chartW) * (merged.length - 1));
    idx = Math.max(0, Math.min(merged.length - 1, idx));
    setHover(idx);
  }

  function handleTouchMove(e) {
    var touch = e.touches[0];
    var rect = containerRef.current.getBoundingClientRect();
    var mx = touch.clientX - rect.left - pad.left;
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
      onTouchMove={handleTouchMove}
      onTouchEnd={function () { setHover(null); }}
    >
      <svg width={dims.w} height={dims.h} style={{ display: "block" }}>
        {/* Grid lines */}
        {yTicks.map(function (val, i) {
          var y = yScale(val);
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={dims.w - pad.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8896a6" fontFamily="Inter, sans-serif">
                {"$" + Math.round(val / 1000) + "k"}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map(function (item, i) {
          return (
            <text key={i} x={item.x} y={dims.h - 12} textAnchor="middle" fontSize="11" fill="#8896a6" fontFamily="Inter, sans-serif">
              {item.label}
            </text>
          );
        })}

        {/* Portfolio area fill */}
        {areaPath && (
          <path d={areaPath} fill="rgba(30, 58, 95, 0.06)" />
        )}

        {/* Benchmark line (S&P 500) */}
        {benchmarkPath && (
          <path d={benchmarkPath} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />
        )}

        {/* Portfolio line */}
        {portfolioPath && (
          <path d={portfolioPath} fill="none" stroke="#1a2a44" strokeWidth="2.5" />
        )}

        {/* $100k baseline (neutral line) */}
        <line
          x1={pad.left} y1={yScale(100000)} x2={dims.w - pad.right} y2={yScale(100000)}
          stroke="#94a3b8" strokeWidth="2" opacity="0.5"
        />

        {/* Hover crosshair + dots */}
        {hover !== null && merged[hover] && (
          <g>
            <line
              x1={xScale(hover)} y1={pad.top} x2={xScale(hover)} y2={pad.top + chartH}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3"
            />
            <circle cx={xScale(hover)} cy={yScale(merged[hover].portfolio)} r="4" fill="#1a2a44" stroke="#fff" strokeWidth="2" />
            {merged[hover].benchmark != null && (
              <circle cx={xScale(hover)} cy={yScale(merged[hover].benchmark)} r="4" fill="#cbd5e1" stroke="#fff" strokeWidth="2" />
            )}
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      {hover !== null && merged[hover] && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: Math.min(xScale(hover) - 80, dims.w - 190),
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 160,
          }}
        >
          <div style={{ fontWeight: 600, color: "#1a2a44", marginBottom: 6, fontSize: 11, letterSpacing: "0.03em" }}>
            {merged[hover].date}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
            <span style={{ color: "#5a6a7e" }}>Portfolio</span>
            <span style={{ fontWeight: 600, color: "#1a2a44" }}>{"$" + fmt(merged[hover].portfolio, 0)}</span>
          </div>
          {merged[hover].benchmark != null && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ color: "#5a6a7e" }}>S&P 500</span>
              <span style={{ fontWeight: 600, color: "#94a3b8" }}>{"$" + fmt(merged[hover].benchmark, 0)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Portfolio() {
  var stateData = useState(null);
  var data = stateData[0];
  var setData = stateData[1];

  var stateLoading = useState(true);
  var loading = stateLoading[0];
  var setLoading = stateLoading[1];

  var stateError = useState(null);
  var error = stateError[0];
  var setError = stateError[1];

  var stateChart = useState(null);
  var chartData = stateChart[0];
  var setChartData = stateChart[1];

  var stateChartLoading = useState(true);
  var chartLoading = stateChartLoading[0];
  var setChartLoading = stateChartLoading[1];

  useEffect(function () {
    fetch("/api/portfolio")
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(function (e) { setError(e.message); })
      .finally(function () { setLoading(false); });
  }, []);

  /* Fetch chart history data separately */
  useEffect(function () {
    fetch("/api/portfolio/history")
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (!d.error && d.portfolio && d.portfolio.length >= 2) {
          setChartData(d);
        }
      })
      .catch(function () {})
      .finally(function () { setChartLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#5a6a7e", letterSpacing: "0.1em" }}>LOADING PORTFOLIO DATA...</div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 8 }}>Fetching from Alpaca API</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 4 }}>
          <div style={{ fontSize: 16, color: "#dc2626", marginBottom: 8 }}>Unable to load portfolio</div>
          <div style={{ fontSize: 13, color: "#5a6a7e" }}>{error}</div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 16 }}>Check that Alpaca API keys are set in Vercel environment variables.</div>
        </div>
      </div>
    );
  }

  var d = data;
  var cashAllocation = (d.cash / d.totalValue) * 100;

  /* Chart legend return values */
  var chartPortfolioReturn = null;
  var chartBenchReturn = null;
  if (chartData && chartData.portfolio && chartData.portfolio.length >= 2) {
    var pFirst = chartData.portfolio[0].value;
    var pLast = chartData.portfolio[chartData.portfolio.length - 1].value;
    chartPortfolioReturn = ((pLast - pFirst) / pFirst * 100).toFixed(2);

    if (chartData.benchmark && chartData.benchmark.length >= 2) {
      var bFirst = chartData.benchmark[0].value;
      var bLast = chartData.benchmark[chartData.benchmark.length - 1].value;
      chartBenchReturn = ((bLast - bFirst) / bFirst * 100).toFixed(2);
    }
  }

  return (
    <div className="page-section">
      <div>
        <p className="section-label">Live Data</p>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          The <span>Portfolio</span>
        </h2>
        <p style={{ fontSize: 13, color: "#8896a6", marginBottom: 40 }}>
          Sipher Street Live Portfolio (as of last close) : Holdings
        </p>
      </div>

      {/* Desktop Table */}
      <div className="portfolio-desktop">
        <div style={{ border: "1px solid #e2e8f0", overflow: "auto", borderRadius: 4 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Asset</th>
                <th style={{ textAlign: "center" }}>Ticker</th>
                <th style={{ textAlign: "right" }}>Cost Basis</th>
                <th style={{ textAlign: "right" }}>Last Close</th>
                <th style={{ textAlign: "right" }}>Position Size</th>
                <th style={{ textAlign: "center" }}>Allocation</th>
                <th style={{ textAlign: "center" }}>Total Return</th>
              </tr>
            </thead>
            <tbody>
              {d.positions.map(function (pos) {
                var returnStyle = getReturnStyle(pos.totalReturn);
                return (
                  <tr key={pos.symbol}>
                    <td style={{ fontWeight: 500 }}>{pos.company}</td>
                    <td style={{ textAlign: "center", color: "#5a6a7e" }}>
                      {pos.symbol}
                      <Link href={"/activity?ticker=" + pos.symbol} style={{ marginLeft: 6, fontSize: 11, color: "#1e3a5f", fontWeight: 500, opacity: 0.7 }} title="View activity">↗</Link>
                    </td>
                    <td style={{ textAlign: "right" }}>{"$" + fmt(pos.costBasis)}</td>
                    <td style={{ textAlign: "right" }}>{"$" + fmt(pos.currentPrice)}</td>
                    <td style={{ textAlign: "right" }}>{"$" + fmt(pos.positionSize, 0)}</td>
                    <td style={{ textAlign: "center" }}>{fmt(pos.allocation, 1) + "%"}</td>
                    <td style={returnStyle}>{fmtReturn(pos.totalReturn)}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ fontWeight: 500 }}>Cash</td>
                <td></td><td></td><td></td>
                <td style={{ textAlign: "right" }}>{"$" + fmt(d.cash, 2)}</td>
                <td style={{ textAlign: "center" }}>{fmt(cashAllocation, 1) + "%"}</td>
                <td></td>
              </tr>
              <tr style={{ background: "#f1f5f9", fontWeight: 700 }}>
                <td style={{ fontWeight: 700 }}>Total</td>
                <td></td><td></td><td></td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{"$" + fmt(d.totalValue, 0)}</td>
                <td style={{ textAlign: "center", fontWeight: 700 }}>100.0%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="portfolio-mobile">
        <div style={{ display: "grid", gap: 16 }}>
          {d.positions.map(function (pos) {
            return <PositionCard key={pos.symbol} pos={pos} />;
          })}
          <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15 }}>Cash</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 500, color: "#1a2a44", fontSize: 14 }}>{"$" + fmt(d.cash, 2)}</div>
              <div style={{ fontSize: 11, color: "#8896a6", marginTop: 2 }}>{fmt(cashAllocation, 1) + "% allocation"}</div>
            </div>
          </div>
          <div style={{ padding: 20, background: "#1a2a44", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: "#ffffff", fontSize: 15 }}>Total</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: "#ffffff", fontSize: 16 }}>{"$" + fmt(d.totalValue, 0)}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>100.0% allocation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart, only shows when there are 2+ data points */}
      {chartData && chartData.portfolio && chartData.portfolio.length >= 2 && (
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div>
              <p className="section-label" style={{ marginBottom: 4 }}>Performance</p>
              <h3 style={{ fontSize: 22, fontWeight: 200, color: "#1a2a44" }}>
                Portfolio vs <span style={{ fontWeight: 600 }}>S&P 500</span>
              </h3>
              <p style={{ fontSize: 11, color: "#8896a6", marginTop: 4, letterSpacing: "0.05em" }}>
                Since inception · Rebased to $100,000
              </p>
            </div>

            {/* Legend with return values */}
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 3, background: "#1a2a44", borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: "#5a6a7e" }}>Sipher Street</span>
                {chartPortfolioReturn !== null && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: parseFloat(chartPortfolioReturn) >= 0 ? "#16a34a" : "#dc2626",
                  }}>
                    {(parseFloat(chartPortfolioReturn) >= 0 ? "+" : "") + chartPortfolioReturn + "%"}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 0, borderTop: "2px dashed #64748b" }} />
                <span style={{ fontSize: 12, color: "#5a6a7e" }}>S&P 500</span>
                {chartBenchReturn !== null && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: parseFloat(chartBenchReturn) >= 0 ? "#16a34a" : "#dc2626",
                  }}>
                    {(parseFloat(chartBenchReturn) >= 0 ? "+" : "") + chartBenchReturn + "%"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, padding: "20px 12px 12px", background: "#fafbfc" }}>
            <PerformanceChart portfolio={chartData.portfolio} benchmark={chartData.benchmark} />
          </div>
        </div>
      )}

      {/* Chart loading state */}
      {chartLoading && !chartData && (
        <div style={{ marginTop: 56, textAlign: "center", padding: 40, color: "#8896a6", fontSize: 13 }}>
          Loading performance data...
        </div>
      )}

      <style jsx>{`
        .portfolio-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .portfolio-desktop {
            display: none;
          }
          .portfolio-mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}