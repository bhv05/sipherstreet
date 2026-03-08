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

function PositionCard({ pos }) {
  const positive = pos.totalReturn >= 0;
  return (
    <div
      style={{
        padding: 20,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 600,
              color: "#1a2a44",
              fontSize: 15,
              marginBottom: 4,
            }}
          >
            {pos.company}
          </div>
          <div style={{ fontSize: 12, color: "#5a6a7e" }}>{pos.symbol}</div>
        </div>
        <span
          style={{
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 3,
            background: positive
              ? "rgba(22, 163, 74, 0.12)"
              : "rgba(220, 38, 38, 0.12)",
            color: positive ? "#16a34a" : "#dc2626",
            flexShrink: 0,
          }}
        >
          {fmtReturn(pos.totalReturn)}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          fontSize: 13,
        }}
      >
        <div>
          <div
            style={{
              color: "#8896a6",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 2,
            }}
          >
            Cost Basis
          </div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>
            ${fmt(pos.costBasis)}
          </div>
        </div>
        <div>
          <div
            style={{
              color: "#8896a6",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 2,
            }}
          >
            Last Close
          </div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>
            ${fmt(pos.currentPrice)}
          </div>
        </div>
        <div>
          <div
            style={{
              color: "#8896a6",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 2,
            }}
          >
            Position Size
          </div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>
            ${fmt(pos.positionSize, 0)}
          </div>
        </div>
        <div>
          <div
            style={{
              color: "#8896a6",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 2,
            }}
          >
            Allocation
          </div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>
            {fmt(pos.allocation, 1)}%
          </div>
        </div>
      </div>
    </div>
  );
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
      <div
        className="page-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 14,
              color: "#5a6a7e",
              letterSpacing: "0.1em",
            }}
          >
            LOADING PORTFOLIO DATA...
          </div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 8 }}>
            Fetching from Alpaca API
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="page-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: 40,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            borderRadius: 4,
          }}
        >
          <div style={{ fontSize: 16, color: "#dc2626", marginBottom: 8 }}>
            Unable to load portfolio
          </div>
          <div style={{ fontSize: 13, color: "#5a6a7e" }}>{error}</div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 16 }}>
            Check that Alpaca API keys are set in Vercel environment variables.
          </div>
        </div>
      </div>
    );
  }

  const d = data;
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

      {/* Desktop Table */}
      <div className="portfolio-desktop">
        <div
          style={{
            border: "1px solid #e2e8f0",
            overflow: "auto",
            borderRadius: 4,
          }}
        >
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
                    <td style={{ textAlign: "center", color: "#5a6a7e" }}>
                      {pos.symbol}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ${fmt(pos.costBasis)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ${fmt(pos.currentPrice)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ${fmt(pos.positionSize, 0)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {fmt(pos.allocation, 1)}%
                    </td>
                    <td
                      className={
                        positive ? "return-positive" : "return-negative"
                      }
                    >
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
                <td style={{ textAlign: "center" }}>
                  {fmt(cashAllocation, 1)}%
                </td>
                <td></td>
              </tr>

              {/* Total row */}
              <tr style={{ background: "#f1f5f9", fontWeight: 700 }}>
                <td style={{ fontWeight: 700 }}>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>
                  ${fmt(d.totalValue, 0)}
                </td>
                <td style={{ textAlign: "center", fontWeight: 700 }}>
                  100.0%
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="portfolio-mobile">
        <div style={{ display: "grid", gap: 16 }}>
          {d.positions.map((pos) => (
            <PositionCard key={pos.symbol} pos={pos} />
          ))}

          {/* Cash card */}
          <div
            style={{
              padding: 20,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15 }}
            >
              Cash
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 500, color: "#1a2a44", fontSize: 14 }}>
                ${fmt(d.cash, 2)}
              </div>
              <div style={{ fontSize: 11, color: "#8896a6", marginTop: 2 }}>
                {fmt(cashAllocation, 1)}% allocation
              </div>
            </div>
          </div>

          {/* Total card */}
          <div
            style={{
              padding: 20,
              background: "#1a2a44",
              borderRadius: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ fontWeight: 700, color: "#ffffff", fontSize: 15 }}
            >
              Total
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: "#ffffff", fontSize: 16 }}>
                ${fmt(d.totalValue, 0)}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                100.0% allocation
              </div>
            </div>
          </div>
        </div>
      </div>

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