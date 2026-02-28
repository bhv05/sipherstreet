"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {});
  }, []);

  const aum = data ? `£${fmt(data.totalValue / 1000, 0)}K` : "£100K";
  const totalReturn = data ? `${data.totalReturnPct >= 0 ? "+" : ""}${fmt(data.totalReturnPct, 2)}%` : "0.00%";

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

      <h1
        style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 200,
          color: "#1a2a44",
          lineHeight: 1.1,
          marginBottom: 24,
          letterSpacing: "-0.02em",
        }}
      >
        Sipher
        <br />
        <span style={{ fontWeight: 600 }}>Street</span>
      </h1>

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

      {/* Stats row — live from Alpaca */}
      <div
        style={{
          display: "flex",
          gap: 64,
          marginTop: 80,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          [aum, "AUM"],
          [totalReturn, "Total Return"],
        ].map(([value, label]) => (
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
        ))}
      </div>
    </section>
  );
}