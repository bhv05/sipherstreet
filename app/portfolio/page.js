"use client";
import { useState, useEffect } from "react";

function StatCard({ label, value, color = "#f0f0f0" }) {
  return (
    <div style={{ padding: 24, background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 300, color }}>{value}</div>
    </div>
  );
}

function fmt(n, decimals = 2) {
  return n?.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) ?? "—";
}

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#555", letterSpacing: "0.1em" }}>LOADING PORTFOLIO DATA...</div>
          <div style={{ fontSize: 12, color: "#333", marginTop: 8 }}>Fetching from Alpaca API</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, border: "1px solid #331a1a", background: "rgba(239,68,68,0.05)" }}>
          <div style={{ fontSize: 16, color: "#ef4444", marginBottom: 8 }}>Unable to load portfolio</div>
          <div style={{ fontSize: 13, color: "#666" }}>{error}</div>
          <div style={{ fontSize: 12, color: "#444", marginTop: 16 }}>
            Check that Alpaca API keys are set in Vercel environment variables.
          </div>
        </div>
      </div>
    );
  }

  const d = data;
  const dayPositive = d.dayPL >= 0;
  const totalPositive = d.totalPL >= 0;

  return (
    <div className="page-section">
      <p className="section-label">Live Portfolio</p>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Portfolio <span>Performance</span>
      </h2>
      <p style={{ fontSize: 12, color: "#555", marginBottom: 40 }}>
        Data sourced from Alpaca Paper Trading API · Updated on page load
      </p>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
        <StatCard label="Total Value" value={`$${fmt(d.totalValue)}`} />
        <StatCard label="Equity" value={`$${fmt(d.equity)}`} />
        <StatCard label="Cash" value={`$${fmt(d.cash)}`} />
        <StatCard
          label="Day P&L"
          value={`${dayPositive ? "+" : ""}$${fmt(d.dayPL)} (${dayPositive ? "+" : ""}${fmt(d.dayPLPct)}%)`}
          color={dayPositive ? "#10b981" : "#ef4444"}
        />
      </div>

      {/* Positions Table */}
      <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", overflow: "auto" }}>
        <div style={{ padding: "16px 16px 0", fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Open Positions
        </div>
        {d.positions && d.positions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                {["Symbol", "Side", "Qty", "Avg Cost", "Price", "P&L", "P&L %"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.positions.map((pos) => {
                const positive = pos.pl >= 0;
                return (
                  <tr key={pos.symbol}>
                    <td style={{ color: "#e0e0e0", fontWeight: 600 }}>{pos.symbol}</td>
                    <td>
                      <span className={pos.side === "LONG" ? "tag-long" : "tag-short"}>
                        {pos.side}
                      </span>
                    </td>
                    <td style={{ color: "#999" }}>{Math.abs(pos.qty)}</td>
                    <td style={{ color: "#999" }}>${fmt(pos.avgCost)}</td>
                    <td style={{ color: "#e0e0e0" }}>${fmt(pos.currentPrice)}</td>
                    <td style={{ color: positive ? "#10b981" : "#ef4444", fontWeight: 500 }}>
                      {positive ? "+" : ""}${fmt(pos.pl)}
                    </td>
                    <td style={{ color: positive ? "#10b981" : "#ef4444" }}>
                      {positive ? "+" : ""}{fmt(pos.plPct)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 40, textAlign: "center", color: "#555" }}>
            No open positions
          </div>
        )}
      </div>
    </div>
  );
}