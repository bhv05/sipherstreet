"use client";
import { useState, useEffect, useRef } from "react";
import useReveal from "../components/useReveal";

/*
  HOW TO ADD A NEW PITCH:
  1. Put the PDF in public/pitches/ (e.g. public/pitches/wbi-deck.pdf)
  2. Put the Excel model in public/pitches/ (e.g. public/pitches/wbi-model.xlsx)
  3. Add a new entry below
  4. Push to GitHub and Vercel will auto-deploy

  Decision options: "Buy" (green), "Short" (red), "Pass" (grey)
  Date format: "3-Feb-2026", will auto-split into two lines
*/

const PITCHES = [
  {
    date: "09-Mar-2026",
    company: "Intuit Inc. (NASDAQ: INTU)",
    decision: "Buy",
    targetPrice: "$604",
    transactionPrice: "$474",
    pitchTeam: "Bhavya Patel, Henish Patel",
    deck: "/pitches/Intuit_memo_vf.pdf",
    model: "/pitches/INTU_vf.xlsx",
  },
  {
    date: "02-Mar-2026",
    company: "Applovin Corp. (NASDAQ: APP)",
    decision: "Buy",
    targetPrice: "$590",
    transactionPrice: "$434",
    pitchTeam: "Bhavya Patel, Henish Patel",
    deck: "/pitches/Applovin_memo_vf.pdf",
    model: "/pitches/APP_vf.xlsx",
  },  
];

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

/*
  QUALITY_BOOST multiplies the render resolution beyond what DPR alone
  requires. A value of 2 means on a 2x retina display at 100% zoom,
  the canvas is rendered at 4x the display pixels. This is what makes
  chart labels, logos, and bold text razor-sharp instead of slightly soft.
  Increase to 2.5 or 3 if you want even more crispness (at the cost of
  slightly more memory and render time per page).
*/
var QUALITY_BOOST = 2;

/*
  MINIMUM_SCALE ensures that even at 50% zoom on a 1x display, we never
  render below this PDF.js scale factor. PDF.js scale 3 roughly equals
  ~216 DPI which keeps text legible and clean.
*/
var MINIMUM_SCALE = 3;

function formatDate(dateStr) {
  var parts = dateStr.split("-");
  if (parts.length === 3) {
    return { line1: parts[0] + "-" + parts[1], line2: parts[2] };
  }
  return { line1: dateStr, line2: "" };
}

function loadPdfJs() {
  return new Promise(function (resolve, reject) {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = function () {
      var lib = window["pdfjs-dist/build/pdf"];
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      window.pdfjsLib = lib;
      resolve(lib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function PdfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#e53e3e" />
      <path d="M14 2v6h6" fill="#fc8181" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Arial">PDF</text>
    </svg>
  );
}

function XlsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#217346" />
      <path d="M14 2v6h6" fill="#33a867" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" fontFamily="Arial">XLS</text>
    </svg>
  );
}

function PdfIconSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#e53e3e" />
      <path d="M14 2v6h6" fill="#fc8181" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Arial">PDF</text>
    </svg>
  );
}

function XlsIconSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#217346" />
      <path d="M14 2v6h6" fill="#33a867" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" fontFamily="Arial">XLS</text>
    </svg>
  );
}

function PdfViewer({ pdf, company, onClose }) {
  var pdfDocRef = useRef(null);
  var canvasRefs = useRef([]);
  var renderIdRef = useRef(0);
  var [numPages, setNumPages] = useState(0);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(false);
  var [zoomIndex, setZoomIndex] = useState(2);
  var [baseWidth, setBaseWidth] = useState(800);
  var contentRef = useRef(null);
  var zoom = ZOOM_LEVELS[zoomIndex];

  useEffect(function () {
    var measure = function () {
      if (contentRef.current) {
        var w = contentRef.current.clientWidth - 40;
        setBaseWidth(Math.min(w, 900));
      }
    };
    measure();
    var timer = setTimeout(measure, 150);
    return function () { clearTimeout(timer); };
  }, []);

  useEffect(function () {
    var cancelled = false;
    async function load() {
      try {
        var pdfjsLib = await loadPdfJs();
        var doc = await pdfjsLib.getDocument(pdf).promise;
        if (!cancelled) {
          pdfDocRef.current = doc;
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    load();
    return function () { cancelled = true; };
  }, [pdf]);

  /*
    Render pipeline:
    1. Calculate display width from baseWidth * zoom%
    2. Calculate render scale = (displayWidth / nativePageWidth) * DPR * QUALITY_BOOST
    3. Enforce MINIMUM_SCALE floor so low zoom still looks sharp
    4. Render canvas at that scale, then set CSS size to displayWidth
    5. Browser downscales the oversized canvas = super-crisp output

    This means at 100% zoom on a 2x retina Mac with QUALITY_BOOST=2,
    the canvas is rendered at ~4x display pixels. Charts, logos, bold
    text, and small labels all come out razor-sharp.
  */
  useEffect(function () {
    var doc = pdfDocRef.current;
    if (!doc || numPages === 0) return;

    renderIdRef.current += 1;
    var thisRenderId = renderIdRef.current;

    async function renderAll() {
      var dpr = window.devicePixelRatio || 1;
      var displayWidth = baseWidth * (zoom / 100);

      for (var i = 1; i <= doc.numPages; i++) {
        if (renderIdRef.current !== thisRenderId) return;

        var page = await doc.getPage(i);
        var nativeViewport = page.getViewport({ scale: 1 });

        /* The key formula: display scale * DPR * quality boost, with a minimum floor */
        var calculatedScale = (displayWidth / nativeViewport.width) * dpr * QUALITY_BOOST;
        var renderScale = Math.max(calculatedScale, MINIMUM_SCALE);
        var viewport = page.getViewport({ scale: renderScale });

        var canvas = canvasRefs.current[i - 1];
        if (!canvas || renderIdRef.current !== thisRenderId) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        /* CSS size = what the user actually sees */
        canvas.style.width = displayWidth + "px";
        canvas.style.height = Math.round(displayWidth * (nativeViewport.height / nativeViewport.width)) + "px";

        var ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      }
    }

    renderAll();
  }, [numPages, zoom, baseWidth]);

  var zoomIn = function () { setZoomIndex(function (i) { return Math.min(i + 1, ZOOM_LEVELS.length - 1); }); };
  var zoomOut = function () { setZoomIndex(function (i) { return Math.max(i - 1, 0); }); };
  var zoomReset = function () { setZoomIndex(2); };

  var pageElements = [];
  for (var i = 0; i < numPages; i++) {
    pageElements.push(i);
  }

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 200, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 10,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 8,
          width: "95vw", height: "92vh", maxWidth: 1200,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={function (e) { e.stopPropagation(); }}
        onContextMenu={function (e) { e.preventDefault(); }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0", flexShrink: 0, gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14, fontWeight: 600, color: "#1a2a44",
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", flex: 1, minWidth: 0,
            }}
          >
            {company}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              style={{
                width: 32, height: 32, border: "1px solid #e2e8f0", background: "#fff",
                borderRadius: 4, cursor: zoomIndex === 0 ? "default" : "pointer",
                fontSize: 16, color: zoomIndex === 0 ? "#cbd5e1" : "#1a2a44",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{"\u2212"}</button>
            <span
              onClick={zoomReset}
              style={{ minWidth: 44, textAlign: "center", color: "#5a6a7e", cursor: "pointer", fontSize: 12 }}
            >{zoom + "%"}</span>
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
            <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 4px" }} />
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, border: "1px solid #e2e8f0", background: "#fff",
                borderRadius: 4, cursor: "pointer", fontSize: 18, color: "#1a2a44",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{"\u2715"}</button>
          </div>
        </div>

        {/* Scrollable page area */}
        <div
          ref={contentRef}
          style={{
            flex: 1, overflow: "auto", background: "#e5e7eb",
            WebkitOverflowScrolling: "touch",
          }}
          onContextMenu={function (e) { e.preventDefault(); }}
        >
          <div style={{ padding: 20 }}>
            {loading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                <div style={{ fontSize: 14, color: "#5a6a7e", letterSpacing: "0.1em", textAlign: "center" }}>
                  LOADING PITCH DECK...
                </div>
              </div>
            )}

            {error && (
              <div style={{ textAlign: "center", padding: 40, color: "#dc2626", fontSize: 14 }}>
                Unable to load PDF. Please try again.
              </div>
            )}

            {pageElements.map(function (idx) {
              return (
                <canvas
                  key={idx}
                  ref={function (el) { canvasRefs.current[idx] = el; }}
                  style={{
                    display: "block",
                    margin: "0 auto 8px",
                    maxWidth: zoom <= 100 ? "100%" : "none",
                    pointerEvents: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDecisionStyle(decision) {
  var d = decision.toLowerCase();
  if (d === "buy") return { background: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
  if (d === "short") return { background: "rgba(220, 38, 38, 0.1)", color: "#dc2626" };
  return { background: "rgba(30, 58, 95, 0.08)", color: "#1e3a5f" };
}

var linkStyle = {
  fontSize: 14, color: "#1e3a5f", textDecoration: "underline",
  cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
};

var linkStyleDesktop = {
  fontSize: 15, color: "#1e3a5f", textDecoration: "underline",
  cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
};

function PitchCard({ p, index, onOpenDeck }) {
  var ds = getDecisionStyle(p.decision);
  var dt = formatDate(p.date);
  return (
    <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15, marginBottom: 4 }}>{p.company}</div>
          <div style={{ fontSize: 12, color: "#5a6a7e" }}>{dt.line1} {dt.line2}</div>
        </div>
        <span style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 3, background: ds.background, color: ds.color, flexShrink: 0 }}>
          {p.decision}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14, fontSize: 13 }}>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Target</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.targetPrice}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Transaction</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#5a6a7e", marginBottom: 14 }}>{p.pitchTeam}</div>
      <div style={{ display: "flex", gap: 20 }}>
        <span onClick={function () { onOpenDeck(index); }} style={linkStyle}>
          <PdfIconSmall />
          Pitch
        </span>
        <a href={p.model} download style={linkStyle}>
          <XlsIconSmall />
          Model
        </a>
      </div>
    </div>
  );
}

export default function Pitches() {
  var openDeck = useState(null);
  var openDeckValue = openDeck[0];
  var setOpenDeck = openDeck[1];

  var headerReveal = useReveal();
  var contentReveal = useReveal();

  return (
    <div className="page-section" style={{ maxWidth: 1100 }}>
      <div ref={headerReveal.ref} className={"reveal" + (headerReveal.inView ? " in-view" : "")}>
        <p className="section-label">Investment Theses</p>
        <h2 className="section-title">
          Active <span>Pitches</span>
        </h2>
      </div>

      <div ref={contentReveal.ref} className={"reveal" + (contentReveal.inView ? " in-view" : "")}>
      <div className="pitches-desktop">
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
              {PITCHES.map(function (p, i) {
                var ds = getDecisionStyle(p.decision);
                var dt = formatDate(p.date);
                return (
                  <tr key={i}>
                    <td style={{ color: "#1a2a44", lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 500 }}>{dt.line1}</div>
                      <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dt.line2}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1a2a44", marginBottom: 8, fontSize: 15 }}>{p.company}</div>
                      <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
                        <span
                          onClick={function (e) { e.stopPropagation(); setOpenDeck(i); }}
                          style={linkStyleDesktop}
                        >
                          <PdfIcon />
                          Pitch
                        </span>
                        <a
                          href={p.model}
                          download
                          onClick={function (e) { e.stopPropagation(); }}
                          style={linkStyleDesktop}
                        >
                          <XlsIcon />
                          Model
                        </a>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ padding: "4px 14px", fontSize: 12, fontWeight: 600, borderRadius: 3, background: ds.background, color: ds.color }}>
                        {p.decision}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.targetPrice}</td>
                    <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</td>
                    <td style={{ color: "#5a6a7e", fontSize: 13, maxWidth: 280 }}>{p.pitchTeam}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <div className="pitches-mobile">
        <div style={{ display: "grid", gap: 16 }}>
          {PITCHES.map(function (p, i) {
            return <PitchCard key={i} p={p} index={i} onOpenDeck={setOpenDeck} />;
          })}
        </div>
      </div>

      {openDeckValue !== null && (
        <PdfViewer
          pdf={PITCHES[openDeckValue].deck}
          company={PITCHES[openDeckValue].company}
          onClose={function () { setOpenDeck(null); }}
        />
      )}

      <style jsx>{`
        .pitches-mobile { display: none; }
        @media (max-width: 768px) {
          .pitches-desktop { display: none; }
          .pitches-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}