"use client";
import { useState, useEffect, useRef } from "react";
import useReveal from "../components/useReveal";

/*
  PITCHES / RESEARCH PAGE — Institutional Tabbed Architecture (Option 1)
  ======================================================================
  Tabs:
  - Realized Track Record (Archived pitches ordered strictly latest to oldest)
  - Active Theses (Current live portfolio positions)
  - Portfolio Hedges (Active & closed macro overlay hedges)
  - All Research (Unified view with Realized Track Record first)
*/

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];
var QUALITY_BOOST = 2;
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function XlsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="17" />
      <line x1="16" y1="13" x2="8" y2="17" />
    </svg>
  );
}

function PdfIconDisabled() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(244, 243, 239, 0.25)" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function XlsIconDisabled() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(244, 243, 239, 0.25)" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
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
    if (!pdfDocRef.current || numPages === 0) return;
    var thisRenderId = ++renderIdRef.current;
    var doc = pdfDocRef.current;

    for (var pageNum = 1; pageNum <= numPages; pageNum++) {
      (function (pNum) {
        doc.getPage(pNum).then(function (page) {
          if (thisRenderId !== renderIdRef.current) return;
          var unscaledVp = page.getViewport({ scale: 1 });
          var displayW = (baseWidth * zoom) / 100;
          var cssScale = displayW / unscaledVp.width;
          var dpr = window.devicePixelRatio || 1;
          var renderScale = Math.max(cssScale * dpr * QUALITY_BOOST, MINIMUM_SCALE);
          var renderVp = page.getViewport({ scale: renderScale });

          var canvas = canvasRefs.current[pNum - 1];
          if (!canvas) return;

          canvas.width = Math.round(renderVp.width);
          canvas.height = Math.round(renderVp.height);
          canvas.style.width = Math.round(unscaledVp.width * cssScale) + "px";
          canvas.style.height = Math.round(unscaledVp.height * cssScale) + "px";

          var ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          page.render({ canvasContext: ctx, viewport: renderVp });
        });
      })(pageNum);
    }
  }, [numPages, zoom, baseWidth]);

  useEffect(function () {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return function () { window.removeEventListener("keydown", handleKeyDown); };
  }, [onClose]);

  function zoomIn() { if (zoomIndex < ZOOM_LEVELS.length - 1) setZoomIndex(zoomIndex + 1); }
  function zoomOut() { if (zoomIndex > 0) setZoomIndex(zoomIndex - 1); }

  return (
    <div
      onClick={onClose}
      className="pdf-viewer-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 15, 20, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={function (e) { e.stopPropagation(); }}
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "var(--bg-surface)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Viewer Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-subsurface)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent-light)", fontWeight: 600 }}>
              Research Memo & Presentation
            </div>
            <h3 style={{ fontSize: 18, color: "#ffffff", margin: 0, fontWeight: 300 }}>{company}</h3>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255, 255, 255, 0.05)", borderRadius: 4, padding: 3 }}>
              <button
                onClick={zoomOut}
                disabled={zoomIndex === 0}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 16,
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: zoomIndex === 0 ? 0.3 : 1,
                }}
              >
                −
              </button>
              <span style={{ fontSize: 12, color: "rgba(244, 243, 239, 0.8)", minWidth: 44, textAlign: "center" }}>
                {zoom}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 16,
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: zoomIndex === ZOOM_LEVELS.length - 1 ? 0.3 : 1,
                }}
              >
                +
              </button>
            </div>

            <a
              href={pdf}
              download
              style={{
                padding: "6px 14px",
                background: "var(--accent-dim)",
                border: "1px solid rgba(213, 109, 74, 0.4)",
                color: "var(--accent-light)",
                borderRadius: 2,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              DOWNLOAD PDF
            </a>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "rgba(244, 243, 239, 0.7)",
                fontSize: 22,
                cursor: "pointer",
                padding: "0 6px",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            background: "#001a21",
          }}
        >
          {loading && (
            <div style={{ color: "rgba(244, 243, 239, 0.6)", padding: "60px 0", fontSize: 14 }}>
              Loading high-resolution deck...
            </div>
          )}
          {error && (
            <div style={{ color: "#f87171", padding: "60px 0", fontSize: 14 }}>
              Unable to load PDF document preview. Please use the download button above.
            </div>
          )}
          {Array.from({ length: numPages }).map(function (_, idx) {
            return (
              <div
                key={idx}
                style={{
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                  background: "#ffffff",
                  lineHeight: 0,
                }}
              >
                <canvas
                  ref={function (el) { canvasRefs.current[idx] = el; }}
                  style={{ display: "block" }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getDecisionStyle(decision) {
  var d = (decision || "").toLowerCase();
  if (d === "buy" || d === "long") {
    return { background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)" };
  }
  if (d === "short") {
    return { background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" };
  }
  return { background: "var(--accent-dim)", color: "var(--accent-light)", border: "1px solid var(--border-accent)" };
}

function getProfitStyle(pct) {
  if (!pct) return { color: "#ffffff", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.1)" };
  var isPositive = pct.startsWith("+");
  return {
    color: isPositive ? "#4ade80" : "#f87171",
    background: isPositive ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
    border: isPositive ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
  };
}

var actionBtnStyle = {
  fontSize: 13,
  color: "var(--accent-light)",
  cursor: "pointer",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  textDecoration: "none",
  transition: "opacity 0.2s ease",
};

var disabledActionStyle = {
  fontSize: 13,
  color: "rgba(244, 243, 239, 0.25)",
  cursor: "default",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  textDecoration: "none",
};

function PitchLink({ deck, onClick }) {
  if (deck) {
    return (
      <span onClick={onClick} style={actionBtnStyle}>
        <PdfIcon /> Memo Deck
      </span>
    );
  }
  return (
    <span style={disabledActionStyle} title="Pitch memo pending">
      <PdfIconDisabled /> Memo
    </span>
  );
}

function ModelLink({ model }) {
  if (model) {
    return (
      <a href={model} download style={{ ...actionBtnStyle, color: "#4ade80" }}>
        <XlsIcon /> Model
      </a>
    );
  }
  return (
    <span style={disabledActionStyle} title="DCF Model pending">
      <XlsIconDisabled /> Model
    </span>
  );
}

export default function Pitches() {
  const [activeTab, setActiveTab] = useState("archived"); // Default to Realized Track Record as requested
  const [openDeck, setOpenDeck] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const heroReveal = useReveal();
  const contentReveal = useReveal();

  useEffect(() => {
    fetch("/api/pitches")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setMounted(true), 40);
      });
  }, []);

  function parseDateStr(s) {
    if (!s) return 0;
    var months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    var p = s.split("-");
    if (p.length !== 3) return 0;
    return new Date(parseInt(p[2]), months[p[1]], parseInt(p[0])).getTime();
  }

  const manualPitches = (data && data.manualPitches) || [];
  const activeManual = manualPitches.filter((p) => !p.isStrategy);
  const hedgeManual = manualPitches.filter((p) => p.isStrategy);

  // Active positions sorted latest first
  const activePitches = activeManual.concat((data && data.activePitches) || []);
  activePitches.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));

  // Archived pitches strictly sorted from LATEST CLOSED to OLDEST
  const archivedPitches = (data && data.archivedPitches) || [];
  archivedPitches.sort((a, b) => parseDateStr(b.dateSold) - parseDateStr(a.dateSold));

  // Active & Archived Hedges
  const activeHedges = hedgeManual.concat((data && data.hedges) || []);
  activeHedges.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));

  const archivedHedges = (data && data.archivedHedges) || [];
  archivedHedges.sort((a, b) => parseDateStr(b.dateSold) - parseDateStr(a.dateSold));

  const totalResearchCount = activePitches.length + archivedPitches.length + activeHedges.length + archivedHedges.length;

  // Compute average realized return on closed positions
  let avgReturnStr = "—";
  if (archivedPitches.length > 0) {
    let sum = 0;
    let count = 0;
    archivedPitches.forEach((p) => {
      if (p.profitPct) {
        const val = parseFloat(p.profitPct.replace("+", "").replace("%", ""));
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      }
    });
    if (count > 0) {
      const avg = sum / count;
      avgReturnStr = (avg >= 0 ? "+" : "") + avg.toFixed(1) + "%";
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-light)", marginBottom: 8 }}>
            Sipher Street Capital
          </div>
          <div style={{ fontSize: 16, color: "rgba(244, 243, 239, 0.8)", fontWeight: 300 }}>
            Loading institutional research & memos...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "140px 24px", color: "#ffffff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: 32, background: "var(--bg-surface)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 2 }}>
          <h3 style={{ color: "#f87171", margin: "0 0 8px 0" }}>Unable to load research database</h3>
          <p style={{ color: "rgba(244, 243, 239, 0.7)", margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "#f4f3ef" }}>
      {/* ══════════════════════════════════════════════════════
          HERO — Institutional Research Header
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          paddingTop: 140,
          paddingBottom: 60,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
          <div className={"reveal-group" + (mounted ? " in-view" : "")}>
            <div className="reveal-item" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--accent-light)",
                  fontWeight: 600,
                }}
              >
                Investment Research & Thesis Archive
              </span>
              <span className="reveal-line-expand" style={{ width: 32, height: 1, background: "var(--accent-light)" }} />
            </div>

            <h1
              className="reveal-item reveal-delay-1"
              style={{
                fontSize: "clamp(36px, 5.5vw, 68px)",
                fontWeight: 200,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                marginBottom: 20,
              }}
            >
              Institutional <em>Research</em>
            </h1>

            <p
              className="reveal-item reveal-delay-2"
              style={{
                fontSize: "clamp(15px, 1.8vw, 18px)",
                color: "rgba(244, 243, 239, 0.8)",
                lineHeight: 1.7,
                maxWidth: 820,
                fontWeight: 300,
                marginBottom: 40,
              }}
            >
              Every position in the Sipher Street Capital portfolio is underpinned by an exhaustive written thesis memo, proprietary discounted cash flow (DCF) model, and stress-tested risk analysis. Explore our completed track record, active investment theses, and macro hedges.
            </p>

            {/* Performance & Metric Ribbon */}
            <div className="research-kpi-ribbon hover-lift reveal-item reveal-delay-3">
              <div className="kpi-block">
                <span className="kpi-label">Completed Theses</span>
                <span className="kpi-value">{archivedPitches.length}</span>
              </div>
              <div className="kpi-divider" />
              <div className="kpi-block">
                <span className="kpi-label">Avg. Realized Return</span>
                <span className="kpi-value" style={{ color: "#4ade80" }}>{avgReturnStr}</span>
              </div>
              <div className="kpi-divider" />
              <div className="kpi-block">
                <span className="kpi-label">Active Live Positions</span>
                <span className="kpi-value">{activePitches.length}</span>
              </div>
              <div className="kpi-divider" />
              <div className="kpi-block">
                <span className="kpi-label">Portfolio Hedges</span>
                <span className="kpi-value">{activeHedges.length + archivedHedges.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEGMENTED VIEW FILTER TABS (OPTION 1)
          ══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 96px" }}>
        <div ref={contentReveal.ref} className={"reveal-group" + (contentReveal.inView ? " in-view" : "")}>
          
          {/* Filter Bar */}
          <div className="tab-bar-container reveal-item">
            <div className="tabs-group">
              <button
                onClick={() => setActiveTab("archived")}
                className={`tab-btn ${activeTab === "archived" ? "active" : ""}`}
              >
                <span>Realized Track Record</span>
                <span className="tab-pill">{archivedPitches.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("active")}
                className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
              >
                <span>Active Theses</span>
                <span className="tab-pill">{activePitches.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("hedges")}
                className={`tab-btn ${activeTab === "hedges" ? "active" : ""}`}
              >
                <span>Portfolio Hedges</span>
                <span className="tab-pill">{activeHedges.length + archivedHedges.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("all")}
                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              >
                <span>All Research</span>
                <span className="tab-pill">{totalResearchCount}</span>
              </button>
            </div>

            {/* Sort indicator */}
            <div className="sort-indicator">
              <span>Chronological:</span>
              <strong>Latest to Oldest</strong>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────
              TAB CONTENT: REALIZED TRACK RECORD (ARCHIVED)
              ────────────────────────────────────────────────── */}
          {(activeTab === "archived" || activeTab === "all") && archivedPitches.length > 0 && (
            <div style={{ marginBottom: activeTab === "all" ? 64 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", margin: "0 0 6px 0" }}>
                    Realized Track Record <em>(Historical Memos)</em>
                  </h2>
                  <p style={{ fontSize: 14, color: "rgba(244, 243, 239, 0.7)", margin: 0 }}>
                    Completed investment theses sorted strictly by exit date (latest to oldest), including realized profit %, pitch decks, and financial models.
                  </p>
                </div>
              </div>

              {/* Table Wrapper */}
              <div className="table-wrapper">
                <table className="research-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", width: 110 }}>Pitched</th>
                      <th style={{ textAlign: "left" }}>Investment</th>
                      <th style={{ textAlign: "center", width: 110 }}>Entry Price</th>
                      <th style={{ textAlign: "center", width: 110 }}>Exit Price</th>
                      <th style={{ textAlign: "center", width: 120 }}>Return</th>
                      <th style={{ textAlign: "center", width: 110 }}>Date Sold</th>
                      <th style={{ textAlign: "left", width: 220 }}>Pitch Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedPitches.map((p, i) => {
                      const dtPitched = formatDate(p.datePitched);
                      const dtSold = formatDate(p.dateSold);
                      const profitStyle = getProfitStyle(p.profitPct);
                      return (
                        <tr key={p.symbol || "archived-" + i}>
                          <td>
                            <div style={{ fontWeight: 500, color: "#ffffff" }}>{dtPitched.line1}</div>
                            <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.5)" }}>{dtPitched.line2}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15, marginBottom: 6 }}>
                              {p.company}
                            </div>
                            <div style={{ display: "flex", gap: 16 }}>
                              <PitchLink
                                deck={p.deck}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDeck({ deck: p.deck, company: p.company });
                                }}
                              />
                              <ModelLink model={p.model} />
                            </div>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: "rgba(244, 243, 239, 0.9)" }}>
                            {p.transactionPrice}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: "rgba(244, 243, 239, 0.9)" }}>
                            {p.sellPrice}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                borderRadius: 2,
                                background: profitStyle.background,
                                color: profitStyle.color,
                                border: profitStyle.border,
                                display: "inline-block",
                              }}
                            >
                              {p.profitPct}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 500, color: "#ffffff" }}>{dtSold.line1}</div>
                            <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.5)" }}>{dtSold.line2}</div>
                          </td>
                          <td style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.75)", lineHeight: 1.4 }}>
                            {p.pitchTeam}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────
              TAB CONTENT: ACTIVE THESES (LIVE POSITIONS)
              ────────────────────────────────────────────────── */}
          {(activeTab === "active" || activeTab === "all") && activePitches.length > 0 && (
            <div style={{ marginBottom: activeTab === "all" ? 64 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", margin: "0 0 6px 0" }}>
                    Active Investment Theses <em>(Live Book)</em>
                  </h2>
                  <p style={{ fontSize: 14, color: "rgba(244, 243, 239, 0.7)", margin: 0 }}>
                    Live long and short positions currently held in the Alpaca portfolio, with target prices and research materials.
                  </p>
                </div>
              </div>

              {/* Table Wrapper */}
              <div className="table-wrapper">
                <table className="research-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", width: 110 }}>Date</th>
                      <th style={{ textAlign: "left" }}>Investment</th>
                      <th style={{ textAlign: "center", width: 110 }}>Decision</th>
                      <th style={{ textAlign: "center", width: 120 }}>Target Price</th>
                      <th style={{ textAlign: "center", width: 130 }}>Transaction Price</th>
                      <th style={{ textAlign: "left", width: 240 }}>Pitch Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePitches.map((p, i) => {
                      const ds = getDecisionStyle(p.decision);
                      const dt = formatDate(p.date);
                      return (
                        <tr key={p.symbol || "active-" + i}>
                          <td>
                            <div style={{ fontWeight: 500, color: "#ffffff" }}>{dt.line1}</div>
                            <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.5)" }}>{dt.line2}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15, marginBottom: 6 }}>
                              {p.company}
                            </div>
                            <div style={{ display: "flex", gap: 16 }}>
                              <PitchLink
                                deck={p.deck}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDeck({ deck: p.deck, company: p.company });
                                }}
                              />
                              <ModelLink model={p.model} />
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: 2,
                                background: ds.background,
                                color: ds.color,
                                border: ds.border,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {p.decision}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: p.targetPrice ? "#ffffff" : "rgba(244, 243, 239, 0.4)" }}>
                            {p.targetPrice || "—"}
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 500, color: "rgba(244, 243, 239, 0.9)" }}>
                            {p.transactionPrice}
                          </td>
                          <td style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.75)", lineHeight: 1.4 }}>
                            {p.pitchTeam}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────
              TAB CONTENT: PORTFOLIO HEDGES & OVERLAYS
              ────────────────────────────────────────────────── */}
          {(activeTab === "hedges" || activeTab === "all") && (activeHedges.length > 0 || archivedHedges.length > 0) && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 300, color: "#ffffff", margin: "0 0 6px 0" }}>
                    Portfolio Hedges & Systematic Overlays
                  </h2>
                  <p style={{ fontSize: 14, color: "rgba(244, 243, 239, 0.7)", margin: 0 }}>
                    Beta hedges, ETF baskets, and options structures deployed to neutralize market risk and isolate single-stock alpha.
                  </p>
                </div>
              </div>

              {/* Active Hedges Table */}
              {activeHedges.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, color: "var(--accent-light)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                    Active Hedges
                  </h3>
                  <div className="table-wrapper desktop-only">
                    <table className="research-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", width: 110 }}>Date</th>
                          <th style={{ textAlign: "left" }}>Hedge Instrument</th>
                          <th style={{ textAlign: "center", width: 110 }}>Decision</th>
                          <th style={{ textAlign: "left" }}>Strategy Details</th>
                          <th style={{ textAlign: "left", width: 240 }}>Pitch Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeHedges.map((p, i) => {
                          const ds = getDecisionStyle(p.decision);
                          const dt = formatDate(p.date);
                          return (
                            <tr key={p.symbol || "hedge-" + i}>
                              <td>
                                <div style={{ fontWeight: 500, color: "#ffffff" }}>{dt.line1}</div>
                                <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.5)" }}>{dt.line2}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15 }}>{p.company}</div>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    background: ds.background,
                                    color: ds.color,
                                    border: ds.border,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {p.decision}
                                </span>
                              </td>
                              <td>
                                {p.basket ? (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {p.basket.map((ticker) => (
                                      <span
                                        key={ticker}
                                        style={{
                                          padding: "3px 8px",
                                          background: "rgba(255, 255, 255, 0.06)",
                                          border: "1px solid rgba(255, 255, 255, 0.1)",
                                          borderRadius: 2,
                                          fontSize: 12,
                                          color: "#ffffff",
                                        }}
                                      >
                                        {ticker}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ color: "rgba(244, 243, 239, 0.7)", fontSize: 13 }}>Index / ETF Hedge</span>
                                )}
                              </td>
                              <td style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.75)" }}>{p.pitchTeam}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Closed Hedges Table */}
              {archivedHedges.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 16, color: "rgba(244, 243, 239, 0.6)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                    Closed Hedges
                  </h3>
                  <div className="table-wrapper desktop-only">
                    <table className="research-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", width: 110 }}>Pitched</th>
                          <th style={{ textAlign: "left" }}>Hedge Instrument</th>
                          <th style={{ textAlign: "center", width: 110 }}>Entry</th>
                          <th style={{ textAlign: "center", width: 110 }}>Exit</th>
                          <th style={{ textAlign: "center", width: 120 }}>Return</th>
                          <th style={{ textAlign: "center", width: 110 }}>Date Sold</th>
                          <th style={{ textAlign: "left", width: 240 }}>Pitch Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedHedges.map((p, i) => {
                          const dtPitched = formatDate(p.datePitched);
                          const dtSold = formatDate(p.dateSold);
                          const profitStyle = getProfitStyle(p.profitPct);
                          return (
                            <tr key={p.symbol || "archived-hedge-" + i}>
                              <td>
                                <div style={{ fontWeight: 500, color: "#ffffff" }}>{dtPitched.line1}</div>
                                <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.5)" }}>{dtPitched.line2}</div>
                              </td>
                              <td style={{ fontWeight: 600, color: "#ffffff", fontSize: 15 }}>{p.company}</td>
                              <td style={{ textAlign: "center", fontWeight: 500, color: "rgba(244, 243, 239, 0.9)" }}>{p.transactionPrice}</td>
                              <td style={{ textAlign: "center", fontWeight: 500, color: "rgba(244, 243, 239, 0.9)" }}>{p.sellPrice}</td>
                              <td style={{ textAlign: "center" }}>
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    background: profitStyle.background,
                                    color: profitStyle.color,
                                    border: profitStyle.border,
                                  }}
                                >
                                  {p.profitPct}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 500, color: "#ffffff" }}>{dtSold.line1}</div>
                                <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.5)" }}>{dtSold.line2}</div>
                              </td>
                              <td style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.75)" }}>{p.pitchTeam}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* PDF Modal Viewer */}
      {openDeck && openDeck.deck && (
        <PdfViewer
          pdf={openDeck.deck}
          company={openDeck.company}
          onClose={() => setOpenDeck(null)}
        />
      )}

      {/* Embedded Styles */}
      <style jsx>{`
        .research-kpi-ribbon {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 32px;
          padding: 20px 28px;
          background: var(--bg-surface);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          width: fit-content;
          max-width: 100%;
          box-sizing: border-box;
        }
        .kpi-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .kpi-label {
          font-size: 11px;
          letter-spacing: "0.14em";
          text-transform: uppercase;
          color: rgba(244, 243, 239, 0.55);
          font-weight: 600;
        }
        .kpi-value {
          font-size: 22px;
          font-weight: 300;
          color: #ffffff;
          line-height: 1.1;
        }
        .kpi-divider {
          width: 1px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
        }
        .tab-bar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 36px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .tabs-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          background: var(--bg-surface);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          color: rgba(244, 243, 239, 0.75);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .tab-btn:hover {
          background: #0a3a46;
          border-color: rgba(213, 109, 74, 0.4);
          color: #ffffff;
        }
        .tab-btn.active {
          background: #0a3a46;
          border-color: var(--accent-light);
          color: #ffffff;
          box-shadow: 0 0 16px rgba(213, 109, 74, 0.2);
        }
        .tab-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--accent-light);
        }
        .tab-btn.active .tab-pill {
          background: var(--accent-light);
          color: #ffffff;
        }
        .sort-indicator {
          font-size: 12px;
          color: rgba(244, 243, 239, 0.6);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sort-indicator strong {
          color: var(--accent-light);
        }
        .table-wrapper {
          background: var(--bg-surface);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
        }
        .research-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .research-table th {
          background: var(--bg-subsurface);
          padding: 14px 18px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(244, 243, 239, 0.6);
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .research-table td {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          vertical-align: middle;
          font-size: 14px;
        }
        .research-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .research-card {
          background: var(--bg-surface);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }
        .desktop-only {
          display: block;
        }
        .mobile-only {
          display: none;
        }
        @media (max-width: 860px) {
          .desktop-only {
            display: none;
          }
          .mobile-only {
            display: grid;
          }
          .kpi-divider {
            display: none;
          }
          .research-kpi-ribbon {
            gap: 20px;
          }
        }
        @media (max-width: 768px) {
          .tab-btn {
            padding: 8px 14px;
            font-size: 12px;
            gap: 8px;
          }
          .sort-indicator {
            font-size: 11px;
          }
          .table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .research-table {
            min-width: 700px;
          }
          .research-table th,
          .research-table td {
            padding: 12px 14px;
            font-size: 13px;
          }
        }
        @media (max-width: 480px) {
          .tabs-group {
            width: 100%;
          }
          .tab-btn {
            flex: 1;
            justify-content: center;
            padding: 8px 10px;
            font-size: 11px;
            gap: 6px;
          }
          .tab-bar-container {
            flex-direction: column;
            gap: 12px;
          }
          .research-kpi-ribbon {
            flex-direction: column;
            width: 100%;
            gap: 16px;
            padding: 18px 20px;
          }
          .pdf-viewer-overlay {
            padding: 8px !important;
          }
          .pdf-viewer-overlay > div {
            max-height: 96vh !important;
            border-radius: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}