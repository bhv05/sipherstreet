"use client";
import { useState } from "react";

/*
  HOW TO ADD A NEW PITCH:
  1. Put the PDF in public/pitches/ (e.g. public/pitches/wbi-deck.pdf)
  2. Put the Excel model in public/pitches/ (e.g. public/pitches/wbi-model.xlsx)
  3. Add a new entry below
  4. Push to GitHub and Vercel will auto-deploy

  Decision options: "Buy" (green), "Short" (red), "Pass" (grey)
*/

const PITCHES = [
  {
    date: "3-Feb-2026",
    company: "WaterBridge (NYSE: WBI)",
    decision: "Buy",
    targetPrice: "$29",
    transactionPrice: "$22",
    pitchTeam: "Kristen Arieta, Adelyn Clemmer, Alex Moeller, Quinn Reilly",
    deck: "/pitches/VRT.pdf",
    model: "/pitches/wbi-model.xlsx",
  },
  // Add more pitches here following the same format
];

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

function PdfViewer({ pdf, company, onClose }) {
  const [zoomIndex, setZoomIndex] = useState(2);
  const zoom = ZOOM_LEVELS[zoomIndex];

  const zoomIn = () => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setZoomIndex((i) => Math.max(i - 1, 0));
  const zoomReset = () => setZoomIndex(2);

  const pdfUrl = `${pdf}#toolbar=0&navpanes=0&zoom=${zoom}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          width: "95vw",
          height: "92vh",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a2a44" }}>
            {company} — Pitch Deck
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              style={{ minWidth: 48, textAlign: "center", color: "#5a6a7e", cursor: "pointer", fontSize: 13 }}
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
            <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 6px" }} />
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, border: "1px solid #e2e8f0", background: "#fff",
                borderRadius: 4, cursor: "pointer", fontSize: 18, color: "#1a2a44",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        </div>

        {/* PDF */}
        <div style={{ flex: 1 }}>
          <iframe
            key={zoom}
            src={pdfUrl}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title={`${company} Pitch Deck`}
          />
        </div>
      </div>
    </div>
  );
}

function getDecisionStyle(decision) {
  const d = decision.toLowerCase();
  if (d === "buy") return { background: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
  if (d === "short") return { background: "rgba(220, 38, 38, 0.1)", color: "#dc2626" };
  return { background: "rgba(30, 58, 95, 0.08)", color: "#1e3a5f" };
}

export default function Pitches() {
  const [openDeck, setOpenDeck] = useState(null);

  return (
    <div className="page-section" style={{ maxWidth: 1100 }}>
      <p className="section-label">Investment Theses</p>
      <h2 className="section-title">
        Active <span>Pitches</span>
      </h2>

      {/* Pitches Table */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Date</th>
              <th style={{ textAlign: "left" }}>Company</th>
              <th style={{ textAlign: "center" }}>Decision</th>
              <th style={{ textAlign: "center" }}>Target Price</th>
              <th style={{ textAlign: "center" }}>Transaction Price</th>
              <th style={{ textAlign: "left" }}>Pitch Team</th>
            </tr>
          </thead>
          <tbody>
            {PITCHES.map((p, i) => {
              const ds = getDecisionStyle(p.decision);
              return (
                <tr key={i}>
                  <td style={{ whiteSpace: "nowrap", color: "#1a2a44" }}>{p.date}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: "#1a2a44", marginBottom: 8 }}>
                      {p.company}
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDeck(i);
                        }}
                        style={{
                          fontSize: 14,
                          color: "#1e3a5f",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        📄 Pitch
                      </span>
                      <a
                        href={p.model}
                        download
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 14,
                          color: "#1e3a5f",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        📊 Model
                      </a>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 3,
                        background: ds.background,
                        color: ds.color,
                      }}
                    >
                      {p.decision}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>
                    {p.targetPrice}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>
                    {p.transactionPrice}
                  </td>
                  <td style={{ color: "#5a6a7e", fontSize: 13, maxWidth: 280 }}>
                    {p.pitchTeam}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PDF Popup Viewer */}
      {openDeck !== null && (
        <PdfViewer
          pdf={PITCHES[openDeck].deck}
          company={PITCHES[openDeck].company}
          onClose={() => setOpenDeck(null)}
        />
      )}
    </div>
  );
}