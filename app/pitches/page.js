"use client";
import { useState, useEffect, useRef } from "react";
import useReveal from "../components/useReveal";

/*
  PITCHES PAGE — Dynamic from Alpaca
  ===================================
  Active pitches are sourced from current Alpaca positions.
  Archived pitches are derived from fully-closed fill history.
  Manual overrides (deck, model, target price) come from
  public/pitches-config.json — edit that file to add materials.

  Strategy-type pitches (e.g. hedging) are defined as
  "manualPitches" in the config and rendered separately.
*/

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
  if (!dateStr) return { line1: "—", line2: "" };
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

/* Greyed-out placeholder icons for missing deck/model */
function PdfIconDisabled() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#94a3b8" />
      <path d="M14 2v6h6" fill="#cbd5e1" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Arial">PDF</text>
    </svg>
  );
}
function XlsIconDisabled() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#94a3b8" />
      <path d="M14 2v6h6" fill="#cbd5e1" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" fontFamily="Arial">XLS</text>
    </svg>
  );
}
function PdfIconSmallDisabled() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#94a3b8" />
      <path d="M14 2v6h6" fill="#cbd5e1" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Arial">PDF</text>
    </svg>
  );
}
function XlsIconSmallDisabled() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" fill="#94a3b8" />
      <path d="M14 2v6h6" fill="#cbd5e1" />
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

        var calculatedScale = (displayWidth / nativeViewport.width) * dpr * QUALITY_BOOST;
        var renderScale = Math.max(calculatedScale, MINIMUM_SCALE);
        var viewport = page.getViewport({ scale: renderScale });

        var canvas = canvasRefs.current[i - 1];
        if (!canvas || renderIdRef.current !== thisRenderId) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

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

var disabledLinkStyle = {
  fontSize: 14, color: "#b0bec5", textDecoration: "none",
  cursor: "default", fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
  opacity: 0.5,
};

var disabledLinkStyleDesktop = {
  fontSize: 15, color: "#b0bec5", textDecoration: "none",
  cursor: "default", fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
  opacity: 0.5,
};

/* ──────── Pitch links with placeholder fallback ──────── */
function PitchLink({ deck, onClick, size }) {
  if (deck) {
    return (
      <span onClick={onClick} style={size === "small" ? linkStyle : linkStyleDesktop}>
        {size === "small" ? <PdfIconSmall /> : <PdfIcon />}
        Pitch
      </span>
    );
  }
  return (
    <span style={size === "small" ? disabledLinkStyle : disabledLinkStyleDesktop} title="Pitch deck pending">
      {size === "small" ? <PdfIconSmallDisabled /> : <PdfIconDisabled />}
      Pending
    </span>
  );
}

function ModelLink({ model, size }) {
  if (model) {
    return (
      <a href={model} download style={size === "small" ? linkStyle : linkStyleDesktop}>
        {size === "small" ? <XlsIconSmall /> : <XlsIcon />}
        Model
      </a>
    );
  }
  return (
    <span style={size === "small" ? disabledLinkStyle : disabledLinkStyleDesktop} title="Model pending">
      {size === "small" ? <XlsIconSmallDisabled /> : <XlsIconDisabled />}
      Pending
    </span>
  );
}

/* ──────── Mobile card for active pitches ──────── */
function PitchCard({ p, onOpenDeck }) {
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
      {p.isStrategy ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Hedging Instruments</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {p.basket && p.basket.map(function (ticker) {
              return (
                <span key={ticker} style={{ padding: "3px 8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12, fontWeight: 500, color: "#1a2a44" }}>
                  {ticker}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14, fontSize: 13 }}>
          <div>
            <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Target</div>
            <div style={{ fontWeight: 500, color: p.targetPrice ? "#1a2a44" : "#b0bec5" }}>{p.targetPrice || "—"}</div>
          </div>
          <div>
            <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Transaction</div>
            <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</div>
          </div>
        </div>
      )}
      <div style={{ fontSize: 12, color: "#5a6a7e", marginBottom: 14 }}>{p.pitchTeam}</div>
      <div style={{ display: "flex", gap: 20 }}>
        <PitchLink deck={p.deck} onClick={function () { onOpenDeck({ deck: p.deck, company: p.company }); }} size="small" />
        <ModelLink model={p.model} size="small" />
      </div>
    </div>
  );
}

/* ──────── Mobile card for archived pitches ──────── */
function ArchivedPitchCard({ p, onOpenDeck }) {
  var dtPitched = formatDate(p.datePitched);
  var dtSold = formatDate(p.dateSold);
  var isPositive = p.profitPct.startsWith("+");
  var pctColor = isPositive ? "#16a34a" : "#dc2626";
  return (
    <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15, marginBottom: 4 }}>{p.company}</div>
          <div style={{ fontSize: 11, color: "#5a6a7e" }}>Pitched {dtPitched.line1} {dtPitched.line2}</div>
          <div style={{ fontSize: 11, color: "#5a6a7e" }}>Closed {dtSold.line1} {dtSold.line2}</div>
        </div>
        <span style={{
          padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 3,
          background: "rgba(30, 58, 95, 0.08)", color: "#5a6a7e", flexShrink: 0,
        }}>
          CLOSED
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14, fontSize: 13 }}>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Entry</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Exit</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.sellPrice}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Return</div>
          <div style={{ fontWeight: 600, color: pctColor }}>{p.profitPct}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#5a6a7e", marginBottom: 14 }}>{p.pitchTeam}</div>
      <div style={{ display: "flex", gap: 20 }}>
        <PitchLink deck={p.deck} onClick={function () { onOpenDeck({ deck: p.deck, company: p.company }); }} size="small" />
        <ModelLink model={p.model} size="small" />
      </div>
    </div>
  );
}

/* ──────── Custom links for hedges (hides deck/model if missing) ──────── */
function HedgeLink({ deck, model, onClick }) {
  if (!deck && !model) return null;
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
      {deck && (
        <span onClick={onClick} style={linkStyleDesktop}>
          <PdfIcon /> Pitch
        </span>
      )}
      {model && (
        <a href={model} download style={linkStyleDesktop}>
          <XlsIcon /> Model
        </a>
      )}
    </div>
  );
}

function HedgeLinkSmall({ deck, model, onClick }) {
  if (!deck && !model) return null;
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
      {deck && (
        <span onClick={onClick} style={linkStyle}>
          <PdfIconSmall /> Pitch
        </span>
      )}
      {model && (
        <a href={model} download style={linkStyle}>
          <XlsIconSmall /> Model
        </a>
      )}
    </div>
  );
}

/* ──────── Mobile card for active hedges ──────── */
function HedgeCard({ p, onOpenDeck }) {
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
      
      {p.isStrategy ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Hedging Instruments</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {p.basket && p.basket.map(function (ticker) {
              return (
                <span key={ticker} style={{ padding: "3px 8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12, fontWeight: 500, color: "#1a2a44" }}>
                  {ticker}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 14, fontSize: 13 }}>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Type</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>Index Hedge</div>
        </div>
      )}
      
      <div style={{ fontSize: 12, color: "#5a6a7e" }}>{p.pitchTeam}</div>
      <HedgeLinkSmall deck={p.deck} model={p.model} onClick={function () { onOpenDeck({ deck: p.deck, company: p.company }); }} />
    </div>
  );
}

/* ──────── Mobile card for archived hedges ──────── */
function ArchivedHedgeCard({ p, onOpenDeck }) {
  var dtPitched = formatDate(p.datePitched);
  var dtSold = formatDate(p.dateSold);
  var isPositive = p.profitPct.startsWith("+");
  var pctColor = isPositive ? "#16a34a" : "#dc2626";
  return (
    <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15, marginBottom: 4 }}>{p.company}</div>
          <div style={{ fontSize: 11, color: "#5a6a7e" }}>Pitched {dtPitched.line1} {dtPitched.line2}</div>
          <div style={{ fontSize: 11, color: "#5a6a7e" }}>Closed {dtSold.line1} {dtSold.line2}</div>
        </div>
        <span style={{
          padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 3,
          background: "rgba(30, 58, 95, 0.08)", color: "#5a6a7e", flexShrink: 0,
        }}>
          CLOSED
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14, fontSize: 13 }}>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Entry</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Exit</div>
          <div style={{ fontWeight: 500, color: "#1a2a44" }}>{p.sellPrice}</div>
        </div>
        <div>
          <div style={{ color: "#8896a6", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Return</div>
          <div style={{ fontWeight: 600, color: pctColor }}>{p.profitPct}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#5a6a7e" }}>{p.pitchTeam}</div>
      <HedgeLinkSmall deck={p.deck} model={p.model} onClick={function () { onOpenDeck({ deck: p.deck, company: p.company }); }} />
    </div>
  );
}

/* ──────── Main Page Component ──────── */
export default function Pitches() {
  var openDeck = useState(null);
  var openDeckValue = openDeck[0];
  var setOpenDeck = openDeck[1];

  var stateData = useState(null);
  var data = stateData[0];
  var setData = stateData[1];

  var stateLoading = useState(true);
  var loading = stateLoading[0];
  var setLoading = stateLoading[1];

  var stateError = useState(null);
  var error = stateError[0];
  var setError = stateError[1];

  var headerReveal = useReveal();
  var contentReveal = useReveal();
  var hedgesHeaderReveal = useReveal();
  var hedgesContentReveal = useReveal();
  var archivedHeaderReveal = useReveal();
  var archivedContentReveal = useReveal();

  /* Fetch pitches data from API on mount */
  useEffect(function () {
    fetch("/api/pitches")
      .then(function (res) { return res.json(); })
      .then(function (d) {
        setData(d);
      })
      .catch(function (e) { setError(e.message); })
      .finally(function () { setLoading(false); });
  }, []);

  /* ──────── Loading state ──────── */
  if (loading) {
    return (
      <div className="page-section" style={{ maxWidth: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#5a6a7e", letterSpacing: "0.1em" }}>LOADING PITCHES...</div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 8 }}>Fetching from Alpaca Portfolio</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section" style={{ maxWidth: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 4 }}>
          <div style={{ fontSize: 16, color: "#dc2626", marginBottom: 8 }}>Unable to load pitches</div>
          <div style={{ fontSize: 13, color: "#5a6a7e" }}>{error}</div>
        </div>
      </div>
    );
  }

  function parseDateStr(s) {
    if (!s) return 0;
    var months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    var p = s.split("-");
    if (p.length !== 3) return 0;
    return new Date(parseInt(p[2]), months[p[1]], parseInt(p[0])).getTime();
  }

  /* ──────── Merge manual strategy pitches into the active list ──────── */
  var manualPitches = (data && data.manualPitches) || [];
  var activeManual = manualPitches.filter(function (p) { return !p.isStrategy; });
  var hedgeManual = manualPitches.filter(function (p) { return p.isStrategy; });

  var activePitches = activeManual.concat((data && data.activePitches) || []);
  activePitches.sort(function (a, b) { return parseDateStr(b.date) - parseDateStr(a.date); });

  var archivedPitches = (data && data.archivedPitches) || [];
  archivedPitches.sort(function (a, b) { return parseDateStr(b.dateSold) - parseDateStr(a.dateSold); });

  var activeHedges = hedgeManual.concat((data && data.hedges) || []);
  activeHedges.sort(function (a, b) { return parseDateStr(b.date) - parseDateStr(a.date); });

  var archivedHedges = (data && data.archivedHedges) || [];
  archivedHedges.sort(function (a, b) { return parseDateStr(b.dateSold) - parseDateStr(a.dateSold); });

  function getProfitStyle(pct) {
    var isPositive = pct.startsWith("+");
    return {
      color: isPositive ? "#16a34a" : "#dc2626",
      background: isPositive ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
    };
  }

  return (
    <div className="page-section" style={{ maxWidth: 1100 }}>
      {/* ──────────── ACTIVE PITCHES ──────────── */}
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
                  <th style={{ textAlign: "left" }}>Investment</th>
                  <th style={{ textAlign: "center" }}>Decision</th>
                  <th style={{ textAlign: "center" }}>Target Price</th>
                  <th style={{ textAlign: "center" }}>Transaction Price</th>
                  <th style={{ textAlign: "left" }}>Pitch Team</th>
                </tr>
              </thead>
              <tbody>
                {activePitches.map(function (p, i) {
                  var ds = getDecisionStyle(p.decision);
                  var dt = formatDate(p.date);
                  return (
                    <tr key={p.symbol || ("manual-" + i)}>
                      <td style={{ color: "#1a2a44", lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 500 }}>{dt.line1}</div>
                        <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dt.line2}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#1a2a44", marginBottom: 8, fontSize: 15 }}>{p.company}</div>
                        <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
                          <PitchLink
                            deck={p.deck}
                            onClick={function (e) { e.stopPropagation(); setOpenDeck({ deck: p.deck, company: p.company }); }}
                            size="large"
                          />
                          <ModelLink model={p.model} size="large" />
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ padding: "4px 14px", fontSize: 12, fontWeight: 600, borderRadius: 3, background: ds.background, color: ds.color }}>
                          {p.decision}
                        </span>
                      </td>
                      {p.isStrategy ? (
                        <td colSpan={2} style={{ textAlign: "center", padding: "12px" }}>
                          <div style={{ fontSize: 10, color: "#8896a6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Hedging Instruments</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                            {p.basket && p.basket.map(function (ticker) {
                              return (
                                <span key={ticker} style={{ padding: "3px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12, fontWeight: 500, color: "#1a2a44" }}>
                                  {ticker}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      ) : (
                        <>
                          <td style={{ textAlign: "center", fontWeight: 500, color: p.targetPrice ? "#1a2a44" : "#b0bec5" }}>
                            {p.targetPrice || "—"}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</td>
                        </>
                      )}
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
          {activePitches.map(function (p, i) {
            return <PitchCard key={p.symbol || ("manual-" + i)} p={p} onOpenDeck={setOpenDeck} />;
          })}
        </div>
      </div>

      {/* ──────────── PORTFOLIO HEDGES ──────────── */}
      {(activeHedges.length > 0 || archivedHedges.length > 0) && (
        <div style={{ marginTop: 80 }}>
          <div ref={hedgesHeaderReveal.ref} className={"reveal" + (hedgesHeaderReveal.inView ? " in-view" : "")}>
            <p className="section-label">Risk Management</p>
            <h2 className="section-title">
              Portfolio <span>Hedges</span>
            </h2>
          </div>

          <div ref={hedgesContentReveal.ref} className={"reveal" + (hedgesContentReveal.inView ? " in-view" : "")}>
            {activeHedges.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a2a44", marginBottom: 16 }}>Active Hedges</h3>
                <div className="pitches-desktop">
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "auto", marginBottom: 32 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left" }}>Date</th>
                          <th style={{ textAlign: "left" }}>Hedge Strategy / Instrument</th>
                          <th style={{ textAlign: "center" }}>Decision</th>
                          <th style={{ textAlign: "left" }}>Details</th>
                          <th style={{ textAlign: "left" }}>Pitch Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeHedges.map(function (p, i) {
                          var ds = getDecisionStyle(p.decision);
                          var dt = formatDate(p.date);
                          return (
                            <tr key={p.symbol || ("hedge-" + i)}>
                              <td style={{ color: "#1a2a44", lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 500 }}>{dt.line1}</div>
                                <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dt.line2}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15 }}>{p.company}</div>
                                <HedgeLink deck={p.deck} model={p.model} onClick={function (e) { e.stopPropagation(); setOpenDeck({ deck: p.deck, company: p.company }); }} />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span style={{ padding: "4px 14px", fontSize: 12, fontWeight: 600, borderRadius: 3, background: ds.background, color: ds.color }}>
                                  {p.decision}
                                </span>
                              </td>
                              <td>
                                {p.isStrategy ? (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {p.basket && p.basket.map(function (ticker) {
                                      return (
                                        <span key={ticker} style={{ padding: "3px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12, fontWeight: 500, color: "#1a2a44" }}>
                                          {ticker}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span style={{ color: "#5a6a7e", fontSize: 13 }}>Index/ETF Hedge</span>
                                )}
                              </td>
                              <td style={{ color: "#5a6a7e", fontSize: 13, maxWidth: 280 }}>{p.pitchTeam}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pitches-mobile" style={{ marginBottom: 32 }}>
                  <div style={{ display: "grid", gap: 16 }}>
                    {activeHedges.map(function (p, i) {
                      return <HedgeCard key={p.symbol || ("hedge-" + i)} p={p} onOpenDeck={setOpenDeck} />;
                    })}
                  </div>
                </div>
              </>
            )}

            {archivedHedges.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a2a44", marginBottom: 16, marginTop: 32 }}>Closed Hedges</h3>
                <div className="pitches-desktop">
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left" }}>Pitched</th>
                          <th style={{ textAlign: "left" }}>Hedge Strategy / Instrument</th>
                          <th style={{ textAlign: "center" }}>Entry Price</th>
                          <th style={{ textAlign: "center" }}>Exit Price</th>
                          <th style={{ textAlign: "center" }}>Return</th>
                          <th style={{ textAlign: "center" }}>Date Sold</th>
                          <th style={{ textAlign: "left" }}>Pitch Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedHedges.map(function (p, i) {
                          var dtPitched = formatDate(p.datePitched);
                          var dtSold = formatDate(p.dateSold);
                          var profitStyle = getProfitStyle(p.profitPct);
                          return (
                            <tr key={p.symbol || ("archived-hedge-" + i)}>
                              <td style={{ color: "#1a2a44", lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 500 }}>{dtPitched.line1}</div>
                                <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dtPitched.line2}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: "#1a2a44", fontSize: 15 }}>{p.company}</div>
                                <HedgeLink deck={p.deck} model={p.model} onClick={function (e) { e.stopPropagation(); setOpenDeck({ deck: p.deck, company: p.company }); }} />
                              </td>
                              <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</td>
                              <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.sellPrice}</td>
                              <td style={{ textAlign: "center" }}>
                                <span style={{
                                  padding: "4px 14px", fontSize: 12, fontWeight: 700, borderRadius: 3,
                                  background: profitStyle.background, color: profitStyle.color,
                                }}>
                                  {p.profitPct}
                                </span>
                              </td>
                              <td style={{ textAlign: "center", color: "#1a2a44", lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 500 }}>{dtSold.line1}</div>
                                <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dtSold.line2}</div>
                              </td>
                              <td style={{ color: "#5a6a7e", fontSize: 13, maxWidth: 280 }}>{p.pitchTeam}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pitches-mobile">
                  <div style={{ display: "grid", gap: 16 }}>
                    {archivedHedges.map(function (p, i) {
                      return <ArchivedHedgeCard key={p.symbol || ("archived-hedge-" + i)} p={p} onOpenDeck={setOpenDeck} />;
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ──────────── ARCHIVED / CLOSED POSITIONS ──────────── */}
      {archivedPitches.length > 0 && (
        <div style={{ marginTop: 80 }}>
          <div ref={archivedHeaderReveal.ref} className={"reveal" + (archivedHeaderReveal.inView ? " in-view" : "")}>
            <p className="section-label">Closed Positions</p>
            <h2 className="section-title">
              Archived <span>Pitches</span>
            </h2>

            {/* Summary strip — aggregate performance banner */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 24, padding: "16px 24px",
              background: "linear-gradient(135deg, #0f1c30 0%, #1a2a44 100%)",
              borderRadius: 6, marginBottom: 32, alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  Positions Closed
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#ffffff" }}>
                  {archivedPitches.length}
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.12)" }} />
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  Avg. Realised Return
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#34d399" }}>
                  {(function () {
                    var sum = 0;
                    archivedPitches.forEach(function (p) {
                      sum += parseFloat(p.profitPct.replace("+", ""));
                    });
                    var avg = sum / archivedPitches.length;
                    return (avg >= 0 ? "+" : "") + avg.toFixed(1) + "%";
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div ref={archivedContentReveal.ref} className={"reveal" + (archivedContentReveal.inView ? " in-view" : "")}>
            {/* Desktop table */}
            <div className="pitches-desktop">
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Pitched</th>
                      <th style={{ textAlign: "left" }}>Investment</th>
                      <th style={{ textAlign: "center" }}>Entry Price</th>
                      <th style={{ textAlign: "center" }}>Exit Price</th>
                      <th style={{ textAlign: "center" }}>Return</th>
                      <th style={{ textAlign: "center" }}>Date Sold</th>
                      <th style={{ textAlign: "left" }}>Pitch Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedPitches.map(function (p, i) {
                      var dtPitched = formatDate(p.datePitched);
                      var dtSold = formatDate(p.dateSold);
                      var profitStyle = getProfitStyle(p.profitPct);
                      return (
                        <tr key={p.symbol || ("archived-" + i)}>
                          <td style={{ color: "#1a2a44", lineHeight: 1.4 }}>
                            <div style={{ fontWeight: 500 }}>{dtPitched.line1}</div>
                            <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dtPitched.line2}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#1a2a44", marginBottom: 8, fontSize: 15 }}>{p.company}</div>
                            <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
                              <PitchLink
                                deck={p.deck}
                                onClick={function (e) { e.stopPropagation(); setOpenDeck({ deck: p.deck, company: p.company }); }}
                                size="large"
                              />
                              <ModelLink model={p.model} size="large" />
                            </div>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.transactionPrice}</td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: "#1a2a44" }}>{p.sellPrice}</td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{
                              padding: "4px 14px", fontSize: 12, fontWeight: 700, borderRadius: 3,
                              background: profitStyle.background, color: profitStyle.color,
                            }}>
                              {p.profitPct}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", color: "#1a2a44", lineHeight: 1.4 }}>
                            <div style={{ fontWeight: 500 }}>{dtSold.line1}</div>
                            <div style={{ color: "#5a6a7e", fontSize: 12 }}>{dtSold.line2}</div>
                          </td>
                          <td style={{ color: "#5a6a7e", fontSize: 13, maxWidth: 280 }}>{p.pitchTeam}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="pitches-mobile">
              <div style={{ display: "grid", gap: 16 }}>
                {archivedPitches.map(function (p, i) {
                  return <ArchivedPitchCard key={p.symbol || ("archived-" + i)} p={p} onOpenDeck={setOpenDeck} />;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── PDF VIEWER (handles both active + archived) ──────────── */}
      {openDeckValue !== null && openDeckValue.deck && (
        <PdfViewer
          pdf={openDeckValue.deck}
          company={openDeckValue.company}
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