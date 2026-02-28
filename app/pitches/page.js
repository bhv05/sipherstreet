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

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

function PdfViewer({ pdf, ticker }) {
  const [zoomIndex, setZoomIndex] = useState(2); // starts at 100%
  const zoom = ZOOM_LEVELS[zoomIndex];

  const zoomIn = (e) => {
    e.stopPropagation();
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  };
  const zoomOut = (e) => {
    e.stopPropagation();
    setZoomIndex((i) => Math.max(i - 1, 0));
  };
  const zoomReset = (e) => {
    e.stopPropagation();
    setZoomIndex(2);
  };

  // Native PDF zoom via URL parameter — re-renders at full quality
  const pdfUrl = `${pdf}#toolbar=0&navpanes=0&zoom=${zoom}`;

  return (
    <div
      style={{ marginTop: 20 }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Zoom controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: "4px 4px 0 0",
          fontSize: 13,
        }}
      >
        <button
          onClick={zoomOut}
          disabled={zoomIndex === 0}
          style={{
            width: 32, height: 32, border: "1px solid #e2e8f0", background: "#fff",
            borderRadius: 4, cursor: zoomIndex === 0 ? "default" : "pointer",
            fontSize: 16, color: zoomIndex === 0 ? "#cbd5e1" : "#1a2a44",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >−</button>
        <span
          onClick={zoomReset}
          style={{
            minWidth: 50, textAlign: "center", color: "#5a6a7e",
            cursor: "pointer", fontSize: 12, userSelect: "none",
          }}
        >{zoom}%</span>
        <button
          onClick={zoomIn}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          style={{
            width: 32, height: 32, border: "1px solid #e2e8f0", background: "#fff",
            borderRadius: 4, cursor: zoomIndex === ZOOM_LEVELS.length - 1 ? "default" : "pointer",
            fontSize: 16, color: zoomIndex === ZOOM_LEVELS.length - 1 ? "#cbd5e1" : "#1a2a44",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >+</button>
      </div>

      {/* PDF frame — uses native browser PDF zoom */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          overflow: "hidden",
          height: 600,
          background: "#fff",
        }}
      >
        <iframe
          key={zoom}
          src={pdfUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          title={`${ticker} Pitch Deck`}
        />
      </div>
    </div>
  );
}

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

            {/* PDF Viewer — with zoom, no download */}
            {openPdf === p.ticker && (
              <PdfViewer pdf={p.pdf} ticker={p.ticker} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}