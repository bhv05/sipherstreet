"use client";
import { useState, useEffect } from "react";

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtReturn(n) {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const str = abs.toFixed(1) + "%";
  return n < 0 ? `(${str})` : str;
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
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 16 }}>
            Check that Alpaca API keys are set in Vercel environment variables.
          </div>
        </div>
      </div>
    );
  }

  const d = data;
  const totalPositionSize = d.positions.reduce((sum, p) => sum + p.positionSize, 0);
  const totalAllocation = d.positions.reduce((sum, p) => sum + p.allocation, 0);
  const cashAllocation = (d.cash / d.totalValue) * 100;

  return (
    <div className="page-section">
      <p className="section-label">Live Data</p>
      <h2 className="section-title" style={{ marginBottom: 8 }}>
        The <span>Portfolio</span>
      </h2>
      <p style={{ fontSize: 13, color: "#8896a6", marginBottom: 40 }}>
        Sipher Street Live Portfolio (as of last close) : Holdings
      </p>

      {/* Table */}
      <div style={{ border: "1px solid #e2e8f0", overflow: "auto", borderRadius: 4 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Company</th>
              <th style={{ textAlign: "center" }}>Ticker</th>
              <th style={{ textAlign: "right" }}>Cost Basis</th>
              <th style={{ textAlign: "right" }}>Last Close</th>
              <th style={{ textAlign: "right" }}>Position Size</th>
              <th style={{ textAlign: "center" }}>Allocation</th>
              <th style={{ textAlign: "center" }}>Total Return</th>
            </tr>
          </thead>
          <tbody>
            {d.positions.map((pos) => {
              const positive = pos.totalReturn >= 0;
              return (
                <tr key={pos.symbol}>
                  <td style={{ fontWeight: 500 }}>{pos.company}</td>
                  <td style={{ textAlign: "center", color: "#5a6a7e" }}>{pos.symbol}</td>
                  <td style={{ textAlign: "right" }}>${fmt(pos.costBasis)}</td>
                  <td style={{ textAlign: "right" }}>${fmt(pos.currentPrice)}</td>
                  <td style={{ textAlign: "right" }}>${fmt(pos.positionSize, 0)}</td>
                  <td style={{ textAlign: "center" }}>{fmt(pos.allocation, 1)}%</td>
                  <td className={positive ? "return-positive" : "return-negative"}>
                    {fmtReturn(pos.totalReturn)}
                  </td>
                </tr>
              );
            })}

            {/* Cash row */}
            <tr>
              <td style={{ fontWeight: 500 }}>Cash</td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ textAlign: "right" }}>${fmt(d.cash, 2)}</td>
              <td style={{ textAlign: "center" }}>{fmt(cashAllocation, 1)}%</td>
              <td></td>
            </tr>

            {/* Total row */}
            <tr style={{ background: "#f1f5f9", fontWeight: 700 }}>
              <td style={{ fontWeight: 700 }}>Total</td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>${fmt(d.totalValue, 0)}</td>
              <td style={{ textAlign: "center", fontWeight: 700 }}>100.0%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}