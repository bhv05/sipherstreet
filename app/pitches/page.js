"use client";
import { useState } from "react";

/*
  HOW TO ADD A NEW PITCH:
  1. Put the PDF file in your public/pitches/ folder (e.g. public/pitches/nvda.pdf)
  2. Add a new entry below with pdf: "/pitches/your-filename.pdf"
  3. Push to GitHub and Vercel will auto-deploy
*/

const PITCHES = [
  {
    ticker: "NVDA",
    title: "NVIDIA Corporation",
    type: "LONG",
    date: "January 15, 2026",
    thesis:
      "AI infrastructure demand continues to accelerate. Data center revenue growth outpacing consensus estimates.",
    target: "$155",
    pdf: "/pitches/VRT.pdf",
  },
  {
    ticker: "TSLA",
    title: "Tesla Inc.",
    type: "SHORT",
    date: "December 3, 2025",
    thesis:
      "Valuation disconnected from automotive fundamentals. Increasing competition in EV market compressing margins.",
    target: "$240",
    pdf: "/pitches/tsla.pdf",
  },
  {
    ticker: "AMZN",
    title: "Amazon.com",
    type: "SHORT",
    date: "February 10, 2026",
    thesis:
      "AWS growth decelerating as enterprises optimize cloud spend. Retail margins under pressure.",
    target: "$175",
    pdf: "/pitches/amzn.pdf",
  },
  {
    ticker: "MSFT",
    title: "Microsoft Corp.",
    type: "LONG",
    date: "November 20, 2025",
    thesis:
      "Copilot monetization inflecting. Azure market share gains accelerating with AI workload migration.",
    target: "$470",
    pdf: "/pitches/msft.pdf",
  },
];

export default function Pitches() {
  const [openPdf, setOpenPdf] = useState(null);

  return (
    <div className="page-section" style={{ maxWidth: 1000 }}>
      <p className="section-label">Investment Theses</p>
      <h2 className="section-title">
        Active <span>Pitches</span>
      </h2>

      <div style={{ display: "grid", gap: 20 }}>
        {PITCHES.map((p) => (
          <div
            key={p.ticker}
            className="hover-card"
            style={{
              padding: 32,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              cursor: "pointer",
            }}
            onClick={() => setOpenPdf(openPdf === p.ticker ? null : p.ticker)}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 24,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 20, fontWeight: 600, color: "#1a2a44" }}>
                    {p.ticker}
                  </span>
                  <span className={p.type === "LONG" ? "tag-long" : "tag-short"}>
                    {p.type}
                  </span>
                  <span style={{ fontSize: 12, color: "#5a6a7e" }}>{p.title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#8896a6", marginBottom: 10 }}>
                  Published: {p.date}
                </p>
                <p style={{ fontSize: 14, color: "#5a6a7e", lineHeight: 1.7 }}>
                  {p.thesis}
                </p>
                <p style={{ fontSize: 12, color: "#1e3a5f", marginTop: 12, fontWeight: 500 }}>
                  {openPdf === p.ticker ? "▲ Close pitch deck" : "▼ Click to view full pitch deck"}
                </p>
              </div>
              <div style={{ textAlign: "right", minWidth: 100 }}>
                <div style={{ fontSize: 11, color: "#8896a6", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Price Target
                </div>
                <div style={{ fontSize: 20, fontWeight: 300, color: "#1a2a44", marginTop: 4 }}>
                  {p.target}
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            {openPdf === p.ticker && (
              <div
                style={{
                  marginTop: 20,
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "#fff",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  src={p.pdf}
                  style={{
                    width: "100%",
                    height: 600,
                    border: "none",
                  }}
                  title={`${p.ticker} Pitch Deck`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}