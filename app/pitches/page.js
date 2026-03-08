"use client";
import { useState, useEffect, useRef } from "react";

/*
  HOW TO ADD A NEW PITCH:
  1. Put the PDF in public/pitches/ (e.g. public/pitches/wbi-deck.pdf)
  2. Put the Excel model in public/pitches/ (e.g. public/pitches/wbi-model.xlsx)
  3. Add a new entry below
  4. Push to GitHub and Vercel will auto-deploy

  Decision options: "Buy" (green), "Short" (red), "Pass" (grey)
  Date format: "3-Feb-2026" — will auto-split into two lines
*/

const PITCHES = [
  {
    date: "02-Mar-2026",
    company: "Applovin Corp. (NASDAQ: APP)",
    decision: "Buy",
    targetPrice: "$590",
    transactionPrice: "$434",
    pitchTeam: "Bhavya Patel, Henish Patel",
    deck: "/pitches/Applovin.pdf",
    model: "/pitches/APP_vf.xlsx",
  },
  // Add more pitches here following the same format
];

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

function formatDate(dateStr) {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return { line1: `${parts[0]}-${parts[1]}`, line2: parts[2] };
  }
  return { line1: dateStr, line2: "" };
}

/* Load PDF.js from CDN (renders PDFs as images so they work on all devices) */
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = window["pdfjs-dist/build/pdf"];
      lib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      window.pdfjsLib = lib;
      resolve(lib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function PdfViewer({ pdf, company, onClose }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [baseWidth, setBaseWidth] = useState(800);
  const contentRef = useRef(null);
  const blobUrls = useRef([]);
  const zoom = ZOOM_LEVELS[zoomIndex];

  /* Measure container so zoom is relative to available space */
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        const w = contentRef.current.clientWidth - 40;
        setBaseWidth(Math.min(w, 900));
      }
    };
    measure();
    const timer = setTimeout(measure, 150);
    return () => clearTimeout(timer);
  }, []);

  /* Load PDF and render each page to a JPEG blob URL */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjsLib = await loadPdfJs();
        const doc = await pdfjsLib.getDocument(pdf).promise;
        const rendered = [];

        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 2.5 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise((res) =>
            canvas.toBlob(res, "image/jpeg", 0.92)
          );
          const url = URL.createObjectURL(blob);
          blobUrls.current.push(url);
          rendered.push(url);

          if (!cancelled) setPages([...rendered]);
        }
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pdf]);

  /* Revoke blob URLs on unmount to free memory */
  useEffect(() => {
    return () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const zoomIn = () =>
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setZoomIndex((i) => Math.max(i - 1, 0));
  const zoomReset = () => setZoomIndex(2);

  const imgWidth = baseWidth * (zoom / 100);

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
        padding: 10,
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
            padding: "12px 16px",
            background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1a2a44",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {company} — Pitch Deck
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <button
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              style={{
                width: 32,
                height: 32,
                border: "1px solid #e2e8f0",
                background: "#fff",
                borderRadius: 4,
                cursor: zoomIndex === 0 ? "default" : "pointer",
                fontSize: 16,
                color: zoomIndex === 0 ? "#cbd5e1" : "#1a2a44",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              −
            </button>
            <span
              onClick={zoomReset}
              style={{
                minWidth: 44,
                textAlign: "center",
                color: "#5a6a7e",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              style={{
                width: 32,
                height: 32,
                border: "1px solid #e2e8f0",
                background: "#fff",
                borderRadius: 4,
                cursor:
                  zoomIndex === ZOOM_LEVELS.length - 1 ? "default" : "pointer",
                fontSize: 16,
                color:
                  zoomIndex === ZOOM_LEVELS.length - 1 ? "#cbd5e1" : "#1a2a44",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
            <div
              style={{
                width: 1,
                height: 20,
                background: "#e2e8f0",
                margin: "0 4px",
              }}
            />
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                border: "1px solid #e2e8f0",
                background: "#fff",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 18,
                color: "#1a2a44",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* PDF pages rendered as images */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflow: "auto",
            background: "#e5e7eb",
            WebkitOverflowScrolling: "touch",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div style={{ padding: 20 }}>
            {loading && pages.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 300,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "#5a6a7e",
                    letterSpacing: "0.1em",
                    textAlign: "center",
                  }}
                >
                  LOADING PITCH DECK...
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#dc2626",
                  fontSize: 14,
                }}
              >
                Unable to load PDF. Please try again.
              </div>
            )}

            {pages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                draggable={false}
                style={{
                  width: imgWidth,
                  maxWidth: zoom <= 100 ? "100%" : "none",
                  display: "block",
                  margin: "0 auto 8px",
                  pointerEvents: "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                }}
              />
            ))}

            {loading && pages.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 16,
                  color: "#8896a6",
                  fontSize: 12,
                }}
              >
                Loading more pages...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDecisionStyle(decision) {
  const d = decision.toLowerCase();
  if (d === "buy")
    return { background: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
  if (d === "short")
    return { background: "rgba(220, 38, 38, 0.1)", color: "#dc2626" };
  return { background: "rgba(30, 58, 95, 0.08)", color: "#1e3a5f" };
}

/* Mobile card layout for pitches */
function PitchCard({ p, index, onOpenDeck }) {
  const ds = getDecisionStyle(p.decision);
  const dt = formatDate(p.date);
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
          marginBottom: 12,
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
            {p.company}
          </div>
          <div style={{ fontSize: 12, color: "#5a6a7e" }}>
            {dt.line1} {dt.line2}
          </div>
        </div>
        <span
          style={{
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 3,
            background: ds.background,
            color: ds.color,
            flexShrink: 0,
          }}
        >
          {p.decision}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
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
            Target
          </div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>
            {p.targetPrice}
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
            Transaction
          </div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>
            {p.transactionPrice}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#5a6a7e", marginBottom: 14 }}>
        {p.pitchTeam}
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <span
          onClick={() => onOpenDeck(index)}
          style={{
            fontSize: 14,
            color: "#1e3a5f",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"
              fill="#e53e3e"
            />
            <path d="M14 2v6h6" fill="#fc8181" />
            <text
              x="12"
              y="17.5"
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="bold"
              fill="white"
              fontFamily="Arial"
            >
              PDF
            </text>
          </svg>
          Pitch
        </span>
        
          href={p.model}
          download
          style={{
            fontSize: 14,
            color: "#1e3a5f",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"
              fill="#217346"
            />
            <path d="M14 2v6h6" fill="#33a867" />
            <text
              x="12"
              y="17.5"
              textAnchor="middle"
              fontSize="5.5"
              fontWeight="bold"
              fill="white"
              fontFamily="Arial"
            >
              XLS
            </text>
          </svg>
          Model
        </a>
      </div>
    </div>
  );
}

export default function Pitches() {
  const [openDeck, setOpenDeck] = useState(null);

  return (
    <div className="page-section" style={{ maxWidth: 1100 }}>
      <p className="section-label">Investment Theses</p>
      <h2 className="section-title">
        Active <span>Pitches</span>
      </h2>

      {/* Desktop Table — hidden on mobile */}
      <div className="pitches-desktop">
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 4,
            overflow: "auto",
          }}
        >
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
                const dt = formatDate(p.date);
                return (
                  <tr key={i}>
                    <td style={{ color: "#1a2a44", lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 500 }}>{dt.line1}</div>
                      <div style={{ color: "#5a6a7e", fontSize: 12 }}>
                        {dt.line2}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1a2a44",
                          marginBottom: 8,
                          fontSize: 15,
                        }}
                      >
                        {p.company}
                      </div>
                      <div
                        style={{ display: "flex", gap: 20, marginTop: 2 }}
                      >
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDeck(i);
                          }}
                          style={{
                            fontSize: 15,
                            color: "#1e3a5f",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"
                              fill="#e53e3e"
                            />
                            <path d="M14 2v6h6" fill="#fc8181" />
                            <text
                              x="12"
                              y="17.5"
                              textAnchor="middle"
                              fontSize="6.5"
                              fontWeight="bold"
                              fill="white"
                              fontFamily="Arial"
                            >
                              PDF
                            </text>
                          </svg>
                          Pitch
                        </span>
                        
                          href={p.model}
                          download
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: 15,
                            color: "#1e3a5f",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"
                              fill="#217346"
                            />
                            <path d="M14 2v6h6" fill="#33a867" />
                            <text
                              x="12"
                              y="17.5"
                              textAnchor="middle"
                              fontSize="5.5"
                              fontWeight="bold"
                              fill="white"
                              fontFamily="Arial"
                            >
                              XLS
                            </text>
                          </svg>
                          Model
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
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 500,
                        color: "#1a2a44",
                      }}
                    >
                      {p.targetPrice}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 500,
                        color: "#1a2a44",
                      }}
                    >
                      {p.transactionPrice}
                    </td>
                    <td
                      style={{
                        color: "#5a6a7e",
                        fontSize: 13,
                        maxWidth: 280,
                      }}
                    >
                      {p.pitchTeam}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards — hidden on desktop */}
      <div className="pitches-mobile">
        <div style={{ display: "grid", gap: 16 }}>
          {PITCHES.map((p, i) => (
            <PitchCard key={i} p={p} index={i} onOpenDeck={setOpenDeck} />
          ))}
        </div>
      </div>

      {/* PDF Viewer (canvas-rendered, works on all devices) */}
      {openDeck !== null && (
        <PdfViewer
          pdf={PITCHES[openDeck].deck}
          company={PITCHES[openDeck].company}
          onClose={() => setOpenDeck(null)}
        />
      )}

      <style jsx>{`
        .pitches-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .pitches-desktop {
            display: none;
          }
          .pitches-mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}