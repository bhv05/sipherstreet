"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Dynamic PDF Page Renderer to Canvas (Aspect-Ratio Preserved & Lossless High-DPI Scaling)
function PDFPageCanvas({ pdfDoc, pageNumber, width, height }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    if (!pdfDoc) return;
    
    let isCancelled = false;
    
    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        // Cancel any existing render task to prevent collision/race-condition
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
        
        const dpr = window.devicePixelRatio || 1;
        // Increase render scale factor to 4.0x quality boost for ultra-crisp vector shapes
        const QUALITY_BOOST = 4.0; 
        const MINIMUM_SCALE = 4.0;
        
        const nativeViewport = page.getViewport({ scale: 1 });
        
        // Calculate fitScale to preserve aspect ratio without stretching/distorting the canvas layout
        const scaleX = width / nativeViewport.width;
        const scaleY = height / nativeViewport.height;
        const fitScale = Math.min(scaleX, scaleY);
        
        const displayWidth = Math.round(nativeViewport.width * fitScale);
        const displayHeight = Math.round(nativeViewport.height * fitScale);
        
        const calculatedScale = (displayWidth / nativeViewport.width) * dpr * QUALITY_BOOST;
        const renderScale = Math.max(calculatedScale, MINIMUM_SCALE);
        const viewport = page.getViewport({ scale: renderScale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Error rendering PDF page:", err);
        }
      }
    }
    
    renderPage();
    
    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, width, height]);

  return (
    <div className="pdf-page-wrapper" style={{ 
      width, 
      height, 
      position: "relative", 
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff"
    }}>
      <canvas ref={canvasRef} style={{ display: "block", pointerEvents: "none", userSelect: "none", imageRendering: "auto" }} />
    </div>
  );
}

// Mock Cover Page Component
function MockCover() {
  return (
    <div className="mock-page-container cover-page">
      <div className="cover-border">
        <div className="cover-top-label">SIPHER STREET RESEARCH</div>
        <div className="cover-center-art">
          <div className="grid-line horizontal" />
          <div className="grid-line horizontal second" />
          <div className="grid-line vertical" />
          <div className="grid-line vertical second" />
          <div className="center-diamond" />
        </div>
        <div className="cover-title-group">
          <h1 className="cover-title">FUND FACTSHEET</h1>
          <p className="cover-subtitle">Long/Short Equity Strategy</p>
          <div className="cover-divider" />
          <p className="cover-date">Q1 2026</p>
        </div>
        <div className="cover-footer">
          <p>London School of Economics</p>
          <p>Student-Run Investment Fund</p>
        </div>
      </div>
    </div>
  );
}

// Mock Overview Page Component
function MockOverview() {
  return (
    <div className="mock-page-container content-page">
      <div className="page-header">
        <span className="header-category">FUND OVERVIEW</span>
        <span className="header-page-num">02</span>
      </div>
      
      <h3 className="page-heading">Executive Summary</h3>
      <p className="page-paragraph">
        Sipher Street is a student-managed long/short equity fund deploying disciplined capital across global markets. We generate excess returns through a combination of macro thematic screening, bottom-up fundamental modelling, and corporate catalyst observation.
      </p>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Net Asset Value (NAV)</span>
          <span className="stat-value">$1.28</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Portfolio AUM</span>
          <span className="stat-value">$128,450</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">YTD Return</span>
          <span className="stat-value text-green">+14.20%</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Inception Date</span>
          <span className="stat-value">Oct 2025</span>
        </div>
      </div>

      <h3 className="page-heading">Performance History</h3>
      <table className="mini-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Sipher Street</th>
            <th>S&P 500</th>
            <th>Alpha</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Jan 2026</td>
            <td className="text-green">+3.4%</td>
            <td>+1.2%</td>
            <td className="text-green">+2.2%</td>
          </tr>
          <tr>
            <td>Feb 2026</td>
            <td className="text-green">+2.8%</td>
            <td className="text-red">-1.5%</td>
            <td className="text-green">+4.3%</td>
          </tr>
          <tr>
            <td>Mar 2026</td>
            <td className="text-green">+4.1%</td>
            <td>+2.0%</td>
            <td className="text-green">+2.1%</td>
          </tr>
          <tr>
            <td>Apr 2026</td>
            <td className="text-green">+1.5%</td>
            <td>+0.5%</td>
            <td className="text-green">+1.0%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Mock Holdings Page Component
function MockHoldings() {
  return (
    <div className="mock-page-container content-page">
      <div className="page-header">
        <span className="header-category">PORTFOLIO EXPOSURE</span>
        <span className="header-page-num">03</span>
      </div>

      <h3 className="page-heading">Top Holdings</h3>
      <table className="mini-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Ticker</th>
            <th>Type</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Microsoft Corp</td>
            <td>MSFT</td>
            <td><span className="badge badge-long">LONG</span></td>
            <td>8.5%</td>
          </tr>
          <tr>
            <td>Alphabet Inc</td>
            <td>GOOGL</td>
            <td><span className="badge badge-long">LONG</span></td>
            <td>7.2%</td>
          </tr>
          <tr>
            <td>Apple Inc</td>
            <td>AAPL</td>
            <td><span className="badge badge-long">LONG</span></td>
            <td>6.0%</td>
          </tr>
          <tr>
            <td>Nvidia Corp</td>
            <td>NVDA</td>
            <td><span className="badge badge-short">SHORT</span></td>
            <td>4.5%</td>
          </tr>
          <tr>
            <td>LVMH SE</td>
            <td>MC.PA</td>
            <td><span className="badge badge-short">SHORT</span></td>
            <td>3.8%</td>
          </tr>
        </tbody>
      </table>

      <h3 className="page-heading">Sector Exposure</h3>
      <div className="sector-bars">
        {[
          ["Technology", 35],
          ["Consumer Discretionary", 18],
          ["Industrials", 15],
          ["Financials", 12],
          ["Cash & Equiv.", 20],
        ].map(([name, pct]) => (
          <div key={name} className="sector-bar-item">
            <div className="sector-bar-labels">
              <span>{name}</span>
              <span>{pct}%</span>
            </div>
            <div className="sector-bar-track">
              <div className="sector-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock Philosophy Page Component
function MockPhilosophy() {
  return (
    <div className="mock-page-container content-page">
      <div className="page-header">
        <span className="header-category">PHILOSOPHY & MANAGEMENT</span>
        <span className="header-page-num">04</span>
      </div>

      <h3 className="page-heading">Investment Philosophy</h3>
      <p className="page-paragraph">
        Our research framework demands evidence-based execution. We seek to capture market mispricings through structured, rigorous analysis rather than momentum. We restrict position sizing to limit maximum drawdown while scaling conviction.
      </p>

      <h3 className="page-heading">Risk Controls</h3>
      <ul className="bullets-list">
        <li><strong>Position Size Limits:</strong> Long exposure is capped at 10% per issuer; short exposure capped at 5%.</li>
        <li><strong>Beta Hedging:</strong> Portfolio net exposure is dynamically managed between 30% and 60% based on market volatility indicators.</li>
        <li><strong>Liquidity Buffer:</strong> Minimum 15% cash/liquid treasury holdings maintained at all times.</li>
      </ul>

      <div className="philosophy-signature">
        <div className="sig-line" />
        <p className="sig-title">Sipher Street Portfolio Management</p>
        <p className="sig-subtitle">LSE Student Investment Committee</p>
      </div>

      <div className="disclaimer-text">
        Disclaimer: For educational and internal discussion purposes only. This factsheet does not constitute investment advice or a solicitation to buy or sell securities.
      </div>
    </div>
  );
}

export default function BookFactsheet() {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // for mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [zoomIndex, setZoomIndex] = useState(0);
  const ZOOM_LEVELS = [1.0, 1.25, 1.5, 1.75, 2.0];
  const zoomFactor = ZOOM_LEVELS[zoomIndex];

  const normalPerspectiveRef = useRef(null);
  const portalPerspectiveRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Track component mounting for Portal safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when expanded modal is active & set default zoom to 125%
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
      setZoomIndex(1); // Default to 125% zoom when expanded
    } else {
      document.body.style.overflow = "";
      setZoomIndex(0); // Reset to 100% zoom
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Resize listener to detect mobile & compute book scale factor
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);

      const activeRef = isExpanded ? portalPerspectiveRef.current : normalPerspectiveRef.current;
      if (!activeRef) return;
      const parentWidth = activeRef.offsetWidth || window.innerWidth;
      const parentHeight = activeRef.offsetHeight || window.innerHeight;

      // inline view is 720x500, expanded is 1100x760
      const bookWidth = isExpanded ? 1100 : 720;
      const bookHeight = isExpanded ? 760 : 500;

      // In expanded mode, we account for the fixed control margins (e.g. 240px width margin, 140px height margin)
      const bufferWidth = isExpanded ? 240 : 0;
      const bufferHeight = isExpanded ? 140 : 0;

      const scaleX = (parentWidth - bufferWidth) / bookWidth;
      const scaleY = (parentHeight - bufferHeight) / bookHeight;

      let newScale = Math.min(scaleX, scaleY);
      // Cap maximum scale factor at 1.0 (100% size) to prevent browser interpolation blur on canvases/images
      if (newScale > 1.0) newScale = 1.0; 
      if (newScale < 0.2) newScale = 0.2; // Safety lower bound

      setScale(newScale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [isExpanded, isMobile, loading, useMock, pdfPageCount]);

  // PDF.js dynamic loader
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadPdf = async () => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument("/factsheet.pdf");
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setPdfPageCount(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.warn("Could not load factsheet.pdf, using beautiful mock pages:", err);
        setUseMock(true);
        setLoading(false);
      }
    };

    loadPdf();
  }, []);

  const mockPages = [
    <MockCover key="p1" />,
<MockOverview key="p2" />,
    <MockHoldings key="p3" />,
    <MockPhilosophy key="p4" />,
  ];

  // Render normal (inline) size pages (360x500 each)
  const normalPagesRendered = Array.from({ length: pdfPageCount }, (_, i) => (
    <PDFPageCanvas
      key={`normal-pdf-page-${i}`}
      pdfDoc={pdfDoc}
      pageNumber={i + 1}
      width={360}
      height={500}
    />
  ));

  // Render portal (expanded) size pages (550 * zoomFactor x 760 * zoomFactor each)
  const portalPagesRendered = Array.from({ length: pdfPageCount }, (_, i) => (
    <PDFPageCanvas
      key={`portal-pdf-page-${i}`}
      pdfDoc={pdfDoc}
      pageNumber={i + 1}
      width={550 * zoomFactor}
      height={760 * zoomFactor}
    />
  ));

  const normalPages = useMock ? mockPages : normalPagesRendered;
  const portalPages = useMock ? mockPages : portalPagesRendered;
  
  const totalPagesCount = useMock ? mockPages.length : pdfPageCount;
  const totalSheetsCount = Math.ceil(totalPagesCount / 2);

  // Arrange pages into sheets for inline normal book
  const normalSheets = [];
  for (let i = 0; i < totalSheetsCount; i++) {
    normalSheets.push({
      front: normalPages[2 * i],
      back: normalPages[2 * i + 1] || <div className="blank-page" key={`normal-blank-${i}`} />,
    });
  }

  // Arrange pages into sheets for portal expanded book
  const portalSheets = [];
  for (let i = 0; i < totalSheetsCount; i++) {
    portalSheets.push({
      front: portalPages[2 * i],
      back: portalPages[2 * i + 1] || <div className="blank-page" key={`portal-blank-${i}`} />,
    });
  }

  // Navigation handlers
  const flipForward = () => {
    if (isMobile) {
      if (currentPageIndex < totalPagesCount - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
      }
    } else {
      if (currentSheetIndex < totalSheetsCount) {
        setCurrentSheetIndex(currentSheetIndex + 1);
      }
    }
  };

  const flipBackward = () => {
    if (isMobile) {
      if (currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
    } else {
      if (currentSheetIndex > 0) {
        setCurrentSheetIndex(currentSheetIndex - 1);
      }
    }
  };

  const jumpToStart = () => {
    if (isMobile) {
      setCurrentPageIndex(0);
    } else {
      setCurrentSheetIndex(0);
    }
  };

  const jumpToEnd = () => {
    if (isMobile) {
      setCurrentPageIndex(totalPagesCount - 1);
    } else {
      setCurrentSheetIndex(totalSheetsCount);
    }
  };

  // Sync mobile page index with desktop sheet index if layout changes
  useEffect(() => {
    if (isMobile) {
      if (currentSheetIndex === 0) {
        setCurrentPageIndex(0);
      } else {
        setCurrentPageIndex(Math.min(2 * currentSheetIndex - 1, totalPagesCount - 1));
      }
    } else {
      if (currentPageIndex === 0) {
        setCurrentSheetIndex(0);
      } else {
        setCurrentSheetIndex(Math.ceil(currentPageIndex / 2));
      }
    }
  }, [isMobile]);

  // Zoom handlers for portal view
  const zoomIn = () => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  };
  const zoomOut = () => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  };
  const zoomReset = () => {
    setZoomIndex(0);
  };
  const zoomPercentage = Math.round(zoomFactor * 100) + "%";

  // Loading spinner
  if (loading && !useMock) {
    return (
      <div className="book-loading-container">
        <div className="spinner" />
        <p>Loading Factsheet...</p>
        <style jsx>{`
          .book-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            color: #5a6a7e;
            font-size: 14px;
            gap: 16px;
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e2e8f0;
            border-top-color: #1a2a44;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Inline Normal Component */}
      <div className="factsheet-module">
        <div className="book-outer-wrapper" ref={normalPerspectiveRef}>
          <div className="book-stage">
            {/* Previous controls */}
            <div className="nav-controls-left">
              <button
                onClick={jumpToStart}
                disabled={isMobile ? currentPageIndex === 0 : currentSheetIndex === 0}
                className="nav-arrow-btn"
                title="Jump to cover"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <polyline points="11 17 6 12 11 7" />
                  <line x1="18" y1="19" x2="18" y2="5" />
                </svg>
              </button>
              <button
                onClick={flipBackward}
                disabled={isMobile ? currentPageIndex === 0 : currentSheetIndex === 0}
                className="nav-arrow-btn highlight-btn"
                title="Previous page"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            {/* Book Canvas */}
            <div className="book-perspective">
              {isMobile ? (
                /* Mobile Single Page View */
                <div className="mobile-page-holder shadow-premium">
                  {normalPages[currentPageIndex]}
                </div>
              ) : (
                /* Desktop 3D Flipbook View */
                <div
                  className={`book-3d ${currentSheetIndex === 0 ? "closed-right" : ""} ${currentSheetIndex === totalSheetsCount ? "closed-left" : ""}`}
                  style={{
                    width: 720,
                    height: 500,
                    "--scale": scale,
                  }}
                >
                  {/* Book Spine Centerline */}
                  <div className="book-spine-line" />

                  {normalSheets.map((sheet, index) => {
                    const isFlipped = index < currentSheetIndex;
                    
                    // Compute Z-indexing to ensure sheets stack properly
                    let zIndex = 0;
                    if (isFlipped) {
                      zIndex = index + 1;
                    } else {
                      zIndex = totalSheetsCount - index;
                    }
                    
                    // Elevate currently active sheets to stay on top during animation
                    if (index === currentSheetIndex || index === currentSheetIndex - 1) {
                      zIndex += totalSheetsCount;
                    }

                    return (
                      <div
                        key={index}
                        className={`book-sheet ${isFlipped ? "flipped" : ""}`}
                        style={{
                          zIndex: zIndex,
                          transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
                        }}
                      >
                        {/* Front Page (shown when sheet is flat on the right) */}
                        <div className="sheet-side sheet-front shadow-premium">
                          {sheet.front}
                          
                          {/* Shadow Gradient near spine */}
                          <div className="spine-shadow-right" />

                          {/* Page Corner Fold Hover Effect for Next Page */}
                          {index === currentSheetIndex && (
                            <div className="corner-fold-hitbox right-corner" onClick={flipForward} title="Turn Page">
                              <div className="corner-fold-flap-right" />
                            </div>
                          )}
                        </div>

                        {/* Back Page (shown when sheet is flipped to the left) */}
                        <div className="sheet-side sheet-back shadow-premium">
                          {sheet.back}
                          
                          {/* Shadow Gradient near spine */}
                          <div className="spine-shadow-left" />

                          {/* Page Corner Fold Hover Effect for Previous Page */}
                          {index === currentSheetIndex - 1 && (
                            <div className="corner-fold-hitbox left-corner" onClick={flipBackward} title="Previous Page">
                              <div className="corner-fold-flap-left" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Next controls */}
            <div className="nav-controls-right">
              <button
                onClick={flipForward}
                disabled={isMobile ? currentPageIndex === totalPagesCount - 1 : currentSheetIndex === totalSheetsCount}
                className="nav-arrow-btn highlight-btn"
                title="Next page"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                onClick={jumpToEnd}
                disabled={isMobile ? currentPageIndex === totalPagesCount - 1 : currentSheetIndex === totalSheetsCount}
                className="nav-arrow-btn"
                title="Jump to end"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <polyline points="13 7 18 12 13 17" />
                  <line x1="6" y1="5" x2="6" y2="19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="book-toolbar">
            {/* Page indicator */}
            <div className="toolbar-page-num">
              {isMobile ? (
                <span>Page {currentPageIndex + 1} of {totalPagesCount}</span>
              ) : (
                <span>
                  {currentSheetIndex === 0
                    ? "Cover"
                    : currentSheetIndex === totalSheetsCount
                    ? "Back Cover"
                    : `Pages ${currentSheetIndex * 2} - ${currentSheetIndex * 2 + 1} of ${totalPagesCount}`}
                </span>
              )}
            </div>

            <div className="toolbar-actions">
              {/* Fullscreen expanded button */}
              <button
                className="toolbar-btn"
                onClick={() => setIsExpanded(true)}
                title="Fullscreen View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3M10 21V10H21" />
                </svg>
                <span>Expand</span>
              </button>

              {/* Download PDF button */}
              <a
                href="/factsheet.pdf"
                download="sipherstreet_factsheet.pdf"
                className="toolbar-btn highlight-action"
                title="Download Factsheet PDF"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Portal Component */}
      {isExpanded && mounted && createPortal(
        <div className="factsheet-module-portal-overlay" onContextMenu={(e) => e.preventDefault()}>
          {/* Navigation Left Arrow on the viewport edge */}
          <button
            onClick={flipBackward}
            disabled={isMobile ? currentPageIndex === 0 : currentSheetIndex === 0}
            className="portal-nav-arrow-fixed left-arrow"
            title="Previous Page"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Navigation Right Arrow on the viewport edge */}
          <button
            onClick={flipForward}
            disabled={isMobile ? currentPageIndex === totalPagesCount - 1 : currentSheetIndex === totalSheetsCount}
            className="portal-nav-arrow-fixed right-arrow"
            title="Next Page"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Centered Expanded Book Stage with Scroll Wrapper */}
          <div className="portal-book-stage">
            <div className="portal-book-scroll-wrapper">
              <div className="book-perspective">
                {isMobile ? (
                  <div className="mobile-page-holder shadow-premium portal-mobile-book">
                    {portalPages[currentPageIndex]}
                  </div>
                ) : (
                  <div
                    className={`book-3d portal-book-3d ${currentSheetIndex === 0 ? "closed-right" : ""} ${currentSheetIndex === totalSheetsCount ? "closed-left" : ""}`}
                    style={{
                      width: 1100 * zoomFactor,
                      height: 760 * zoomFactor,
                      "--scale": 1,
                    }}
                    ref={portalPerspectiveRef}
                  >
                    {/* Book Spine Centerline */}
                    <div className="book-spine-line" />

                    {portalSheets.map((sheet, index) => {
                      const isFlipped = index < currentSheetIndex;
                      let zIndex = index + 1;
                      if (!isFlipped) {
                        zIndex = totalSheetsCount - index;
                      }
                      if (index === currentSheetIndex || index === currentSheetIndex - 1) {
                        zIndex += totalSheetsCount;
                      }

                      return (
                        <div
                          key={index}
                          className={`book-sheet ${isFlipped ? "flipped" : ""}`}
                          style={{
                            zIndex: zIndex,
                            transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
                          }}
                        >
                          <div className="sheet-side sheet-front shadow-premium">
                            {sheet.front}
                            <div className="spine-shadow-right" />
                            {index === currentSheetIndex && (
                              <div className="corner-fold-hitbox right-corner" onClick={flipForward} title="Turn Page">
                                <div className="corner-fold-flap-right" />
                              </div>
                            )}
                          </div>
                          <div className="sheet-side sheet-back shadow-premium">
                            {sheet.back}
                            <div className="spine-shadow-left" />
                            {index === currentSheetIndex - 1 && (
                              <div className="corner-fold-hitbox left-corner" onClick={flipBackward} title="Previous Page">
                                <div className="corner-fold-flap-left" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Right Floating Control Toolbar */}
          <div className="portal-toolbar-fixed">
            <div className="portal-toolbar-inner shadow-premium">
              {/* Jump to start */}
              <button
                onClick={jumpToStart}
                disabled={isMobile ? currentPageIndex === 0 : currentSheetIndex === 0}
                className="portal-toolbar-btn"
                title="Jump to cover"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <polyline points="11 17 6 12 11 7" />
                  <line x1="18" y1="19" x2="18" y2="5" />
                </svg>
              </button>

              <div className="portal-toolbar-divider" />

              {/* Page Indicator */}
              <div className="portal-page-num">
                {isMobile ? (
                  <span>Page {currentPageIndex + 1} of {totalPagesCount}</span>
                ) : (
                  <span>
                    {currentSheetIndex === 0
                      ? "Cover"
                      : currentSheetIndex === totalSheetsCount
                      ? "Back Cover"
                      : `Pages ${currentSheetIndex * 2} - ${currentSheetIndex * 2 + 1} of ${totalPagesCount}`}
                  </span>
                )}
              </div>

              <div className="portal-toolbar-divider" />

              {/* Jump to end */}
              <button
                onClick={jumpToEnd}
                disabled={isMobile ? currentPageIndex === totalPagesCount - 1 : currentSheetIndex === totalSheetsCount}
                className="portal-toolbar-btn"
                title="Jump to end"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <polyline points="13 7 18 12 13 17" />
                  <line x1="6" y1="5" x2="6" y2="19" />
                </svg>
              </button>

              <div className="portal-toolbar-divider" />

              {/* Zoom Out Button */}
              <button
                onClick={zoomOut}
                disabled={zoomIndex === 0}
                className="portal-toolbar-btn"
                title="Zoom Out"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              {/* Zoom Percentage Reset Button */}
              <span 
                className="portal-zoom-val" 
                onClick={zoomReset} 
                title="Reset Zoom"
              >
                {zoomPercentage}
              </span>

              {/* Zoom In Button */}
              <button
                onClick={zoomIn}
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                className="portal-toolbar-btn"
                title="Zoom In"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <div className="portal-toolbar-divider" />

              {/* Download PDF button */}
              <a
                href="/factsheet.pdf"
                download="sipherstreet_factsheet.pdf"
                className="portal-toolbar-btn highlight-link"
                title="Download Factsheet PDF"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>

              <div className="portal-toolbar-divider" />

              {/* Close expanded mode */}
              <button
                className="portal-toolbar-btn close-btn"
                onClick={() => setIsExpanded(false)}
                title="Exit Fullscreen"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Scoped styled-jsx for regular layout */}
      <style jsx>{`
        .factsheet-module {
          width: 100%;
          height: 100%;
          position: relative;
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
        }

        .book-outer-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100%;
          justify-content: space-between;
          gap: 20px;
          position: relative;
        }

        .book-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          flex: 1;
          position: relative;
        }

        .nav-controls-left,
        .nav-controls-right {
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 10;
        }

        .nav-arrow-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #5a6a7e;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .nav-arrow-btn:hover:not(:disabled) {
          border-color: #1a2a44;
          color: #1a2a44;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(26, 42, 68, 0.08);
        }

        .nav-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-arrow-btn.highlight-btn {
          background: #1a2a44;
          color: #ffffff;
          border-color: #1a2a44;
        }
        .nav-arrow-btn.highlight-btn:hover:not(:disabled) {
          background: #2c3e5a;
          border-color: #2c3e5a;
        }

        .book-perspective {
          perspective: 1500px;
          margin: 0 32px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          width: 100%;
          height: 100%;
          overflow: hidden; /* Prevent cover/back pages translation from overflowing container border */
        }

        .book-3d {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform: scale(var(--scale, 1)) translateX(0);
        }

        .book-3d.closed-right {
          transform: scale(var(--scale, 1)) translateX(-25%);
        }
        .book-3d.closed-left {
          transform: scale(var(--scale, 1)) translateX(25%);
        }

        .book-spine-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%);
          z-index: 100;
          transform: translateX(-50%);
        }

        .book-sheet {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          transform-style: preserve-3d;
          transform-origin: left center;
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .sheet-side {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          background: #ffffff;
          overflow: hidden;
        }

        .sheet-front {
          transform: rotateY(0deg);
          z-index: 2;
          border-radius: 0 6px 6px 0;
        }

        .sheet-back {
          transform: rotateY(180deg);
          z-index: 1;
          border-radius: 6px 0 0 6px;
        }

        .spine-shadow-right {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 20px;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.08) 0%, transparent 100%);
          pointer-events: none;
        }

        .spine-shadow-left {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 20px;
          background: linear-gradient(to left, rgba(0, 0, 0, 0.08) 0%, transparent 100%);
          pointer-events: none;
        }

        .mobile-page-holder {
          width: 320px;
          height: 440px;
          background: #ffffff;
          border-radius: 6px;
          overflow: hidden;
        }

        .shadow-premium {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .corner-fold-hitbox {
          position: absolute;
          top: 0;
          width: 36px;
          height: 36px;
          cursor: pointer;
          z-index: 150;
          transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      height 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .corner-fold-hitbox.right-corner {
          right: 0;
        }
        .corner-fold-hitbox.left-corner {
          left: 0;
        }

        .corner-fold-hitbox:hover {
          width: 52px;
          height: 52px;
        }

        .corner-fold-flap-right {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, transparent 50%, rgba(220, 220, 215, 0.8) 50%, #f4f3ef 65%, #ffffff 80%);
          filter: drop-shadow(-2px 2px 2px rgba(0,0,0,0.12));
          transition: all 0.3s ease;
        }

        .corner-fold-flap-left {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(225deg, transparent 50%, rgba(220, 220, 215, 0.8) 50%, #f4f3ef 65%, #ffffff 80%);
          filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.12));
          transition: all 0.3s ease;
        }

        .corner-fold-hitbox:hover .corner-fold-flap-right {
          filter: drop-shadow(-4px 4px 4px rgba(0,0,0,0.18));
        }
        .corner-fold-hitbox:hover .corner-fold-flap-left {
          filter: drop-shadow(4px 4px 4px rgba(0,0,0,0.18));
        }

        .sheet-front {
          clip-path: polygon(0% 0%, calc(100% - 36px) 0%, 100% 36px, 100% 100%, 0% 100%);
          transition: clip-path 0.3s ease;
        }
        .sheet-front:has(.corner-fold-hitbox:hover) {
          clip-path: polygon(0% 0%, calc(100% - 52px) 0%, 100% 52px, 100% 100%, 0% 100%);
        }

        .sheet-back {
          clip-path: polygon(36px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 36px);
          transition: clip-path 0.3s ease;
        }
        .sheet-back:has(.corner-fold-hitbox:hover) {
          clip-path: polygon(52px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 52px);
        }

        .book-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .toolbar-page-num {
          font-size: 13px;
          color: #5a6a7e;
          font-weight: 500;
        }

        .toolbar-actions {
          display: flex;
          gap: 12px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1a2a44;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toolbar-btn:hover {
          border-color: #1a2a44;
          background: rgba(26, 42, 68, 0.02);
        }

        .toolbar-btn.highlight-action {
          background: #1a2a44;
          color: #ffffff;
          border-color: #1a2a44;
        }
        .toolbar-btn.highlight-action:hover {
          background: #2c3e5a;
          border-color: #2c3e5a;
        }

        .blank-page {
          width: 100%;
          height: 100%;
          background: #fbfbfa;
        }

        @media (max-width: 768px) {
          .factsheet-module {
            padding: 16px;
          }
          
          .book-stage {
            flex-direction: column;
            gap: 16px;
          }

          .book-perspective {
            margin: 0;
            width: 100%;
          }

          .nav-controls-left,
          .nav-controls-right {
            flex-direction: row;
            justify-content: center;
            width: 100%;
            gap: 20px;
          }

          .nav-arrow-btn {
            width: 44px;
            height: 44px;
          }

          .toolbar-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .book-toolbar {
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }
        }
      `}</style>

      {/* Global styled-jsx for Portaled components */}
      <style jsx global>{`
        /* Portal background overlay covering viewport */
        .factsheet-module-portal-overlay {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #f4f3ef; /* Solid cream/light-gray color */
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Fixed Navigation Buttons in Fullscreen Modal */
        .portal-nav-arrow-fixed {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1a2a44;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100000;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .portal-nav-arrow-fixed:hover:not(:disabled) {
          border-color: #1a2a44;
          color: #1a2a44;
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 6px 20px rgba(26, 42, 68, 0.12);
        }

        .portal-nav-arrow-fixed:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .portal-nav-arrow-fixed.left-arrow {
          left: 40px;
        }

        .portal-nav-arrow-fixed.right-arrow {
          right: 40px;
        }

        /* Centered Book Stage with scrolling wrapper support */
        .portal-book-stage {
          width: 100%;
          height: 100%;
          overflow: auto;
          display: block;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        .portal-book-scroll-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100%;
          min-height: 100%;
          padding: 60px;
          box-sizing: border-box;
        }

        /* Floating Toolbar in Expanded Mode */
        .portal-toolbar-fixed {
          position: fixed;
          right: 40px;
          bottom: 40px;
          z-index: 100001;
        }

        .portal-toolbar-inner {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          padding: 6px 18px;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .portal-toolbar-btn {
          background: none;
          border: none;
          color: #5a6a7e;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .portal-toolbar-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1a2a44;
        }

        .portal-toolbar-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .portal-toolbar-btn.highlight-link {
          color: #1a2a44;
        }

        .portal-toolbar-btn.highlight-link:hover {
          background: #e2e8f0;
        }

        .portal-toolbar-btn.close-btn {
          background: #1a2a44;
          color: #ffffff;
        }

        .portal-toolbar-btn.close-btn:hover {
          background: #dc2626;
          color: #ffffff;
        }

        .portal-toolbar-divider {
          width: 1px;
          height: 18px;
          background: #e2e8f0;
        }

        .portal-page-num {
          font-size: 13px;
          font-weight: 600;
          color: #1a2a44;
          padding: 0 6px;
          white-space: nowrap;
        }

        .portal-zoom-val {
          font-size: 12px;
          font-weight: 600;
          color: #1a2a44;
          cursor: pointer;
          min-width: 40px;
          text-align: center;
        }
        .portal-zoom-val:hover {
          color: #2c3e5a;
        }

        /* Portal book styles */
        .factsheet-module-portal-overlay .book-perspective {
          perspective: 1500px;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .factsheet-module-portal-overlay .book-3d {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform: scale(var(--scale, 1)) translateX(0);
        }

        .factsheet-module-portal-overlay .shadow-premium {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .factsheet-module-portal-overlay .pdf-page-wrapper {
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .factsheet-module-portal-overlay .blank-page {
          width: 100%;
          height: 100%;
          background: #fbfbfa;
        }

        /* MOCK PAGES PORTAL SUPPORT */
        .factsheet-module-portal-overlay .mock-page-container {
          width: 100%;
          height: 100%;
          background: #fcfbfa;
          padding: 32px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1a2a44;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: inherit;
        }

        .factsheet-module-portal-overlay .cover-page {
          padding: 24px;
        }

        .factsheet-module-portal-overlay .cover-border {
          border: 1px solid #1a2a44;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 60px 32px;
          position: relative;
        }

        .factsheet-module-portal-overlay .cover-top-label {
          font-size: 11px;
          letter-spacing: 0.25em;
          color: #5a6a7e;
          font-weight: 600;
        }

        .factsheet-module-portal-overlay .cover-center-art {
          position: relative;
          width: 160px;
          height: 160px;
        }

        .factsheet-module-portal-overlay .grid-line.horizontal {
          left: 0;
          right: 0;
          top: 53px;
          height: 1px;
        }
        .factsheet-module-portal-overlay .grid-line.horizontal.second {
          top: 106px;
        }
        .factsheet-module-portal-overlay .grid-line.vertical {
          top: 0;
          bottom: 0;
          left: 53px;
          width: 1px;
        }
        .factsheet-module-portal-overlay .grid-line.vertical.second {
          left: 106px;
        }

        .factsheet-module-portal-overlay .center-diamond {
          position: absolute;
          left: 48px;
          top: 48px;
          width: 64px;
          height: 64px;
          border: 1px solid #1a2a44;
          transform: rotate(45deg);
          background: #fcfbfa;
        }

        .factsheet-module-portal-overlay .cover-title {
          font-size: 26px;
          font-weight: 300;
          letter-spacing: 0.15em;
          margin-bottom: 6px;
          color: #1a2a44;
        }

        .factsheet-module-portal-overlay .cover-subtitle {
          font-size: 14px;
          color: #5a6a7e;
          letter-spacing: 0.05em;
        }

        .factsheet-module-portal-overlay .cover-divider {
          height: 1px;
          width: 80px;
          background: #cbd5e1;
          margin: 24px auto;
        }

        .factsheet-module-portal-overlay .cover-date {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .factsheet-module-portal-overlay .cover-footer {
          text-align: center;
          font-size: 11px;
          color: #8896a6;
          line-height: 1.6;
          letter-spacing: 0.05em;
        }

        .factsheet-module-portal-overlay .content-page {
          padding: 40px 36px;
        }

        .factsheet-module-portal-overlay .page-header {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }

        .factsheet-module-portal-overlay .header-category {
          font-size: 11px;
        }

        .factsheet-module-portal-overlay .header-page-num {
          font-size: 13px;
        }

        .factsheet-module-portal-overlay .page-heading {
          font-size: 16px;
          margin-bottom: 12px;
          margin-top: 18px;
        }

        .factsheet-module-portal-overlay .page-paragraph {
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 18px;
        }

        .factsheet-module-portal-overlay .stats-grid {
          gap: 16px;
          margin-bottom: 20px;
        }

        .factsheet-module-portal-overlay .stat-box {
          padding: 12px 18px;
        }

        .factsheet-module-portal-overlay .stat-label {
          font-size: 10px;
        }

        .factsheet-module-portal-overlay .stat-value {
          font-size: 16px;
        }

        .factsheet-module-portal-overlay .mini-table {
          font-size: 13px;
          margin-bottom: 20px;
        }

        .factsheet-module-portal-overlay .mini-table th,
        .factsheet-module-portal-overlay .mini-table td {
          padding: 8px 6px;
        }

        .factsheet-module-portal-overlay .badge {
          font-size: 10px;
          padding: 2px 6px;
        }

        .factsheet-module-portal-overlay .sector-bars {
          gap: 10px;
        }

        .factsheet-module-portal-overlay .sector-bar-labels {
          font-size: 11px;
        }

        .factsheet-module-portal-overlay .sector-bar-track {
          height: 6px;
        }

        .factsheet-module-portal-overlay .bullets-list {
          font-size: 13px;
          padding-left: 20px;
          margin-bottom: 20px;
        }

        .factsheet-module-portal-overlay .bullets-list li {
          margin-bottom: 10px;
        }

        .factsheet-module-portal-overlay .sig-line {
          width: 120px;
        }

        .factsheet-module-portal-overlay .sig-title {
          font-size: 11px;
        }

        .factsheet-module-portal-overlay .sig-subtitle {
          font-size: 10px;
        }

        .factsheet-module-portal-overlay .disclaimer-text {
          font-size: 10px;
          margin-top: 20px;
          padding-top: 12px;
        }

        /* PEEL CORNER FOLDS IN PORTAL */
        .factsheet-module-portal-overlay .corner-fold-hitbox {
          position: absolute;
          top: 0;
          width: 44px;
          height: 44px;
          cursor: pointer;
          z-index: 150;
          transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      height 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .factsheet-module-portal-overlay .corner-fold-hitbox.right-corner { right: 0; }
        .factsheet-module-portal-overlay .corner-fold-hitbox.left-corner { left: 0; }
        .factsheet-module-portal-overlay .corner-fold-hitbox:hover {
          width: 64px;
          height: 64px;
        }
        .factsheet-module-portal-overlay .corner-fold-flap-right {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, transparent 50%, rgba(220, 220, 215, 0.8) 50%, #f4f3ef 65%, #ffffff 80%);
          filter: drop-shadow(-2px 2px 2px rgba(0,0,0,0.12));
          transition: all 0.3s ease;
        }
        .factsheet-module-portal-overlay .corner-fold-flap-left {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(225deg, transparent 50%, rgba(220, 220, 215, 0.8) 50%, #f4f3ef 65%, #ffffff 80%);
          filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.12));
          transition: all 0.3s ease;
        }
        .factsheet-module-portal-overlay .corner-fold-hitbox:hover .corner-fold-flap-right {
          filter: drop-shadow(-4px 4px 4px rgba(0,0,0,0.18));
        }
        .factsheet-module-portal-overlay .corner-fold-hitbox:hover .corner-fold-flap-left {
          filter: drop-shadow(4px 4px 4px rgba(0,0,0,0.18));
        }
        .factsheet-module-portal-overlay .sheet-front {
          clip-path: polygon(0% 0%, calc(100% - 44px) 0%, 100% 44px, 100% 100%, 0% 100%);
          transition: clip-path 0.3s ease;
        }
        .factsheet-module-portal-overlay .sheet-front:has(.corner-fold-hitbox:hover) {
          clip-path: polygon(0% 0%, calc(100% - 64px) 0%, 100% 64px, 100% 100%, 0% 100%);
        }
        .factsheet-module-portal-overlay .sheet-back {
          clip-path: polygon(44px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 44px);
          transition: clip-path 0.3s ease;
        }
        .factsheet-module-portal-overlay .sheet-back:has(.corner-fold-hitbox:hover) {
          clip-path: polygon(64px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 64px);
        }

        /* RESPONSIVE PORTAL STYLES */
        @media (max-width: 768px) {
          .factsheet-module-portal-overlay {
            padding: 24px 16px;
          }
          .portal-nav-arrow-fixed {
            width: 44px;
            height: 44px;
          }
          .portal-nav-arrow-fixed.left-arrow {
            left: 12px;
          }
          .portal-nav-arrow-fixed.right-arrow {
            right: 12px;
          }
          .portal-toolbar-fixed {
            left: 50%;
            transform: translateX(-50%);
            right: auto;
            bottom: 24px;
            width: max-content;
          }
          .portal-toolbar-inner {
            padding: 4px 12px;
            gap: 8px;
          }
          .portal-toolbar-btn {
            width: 32px;
            height: 32px;
          }
          .portal-page-num {
            font-size: 11px;
          }
          .portal-mobile-book {
            width: 300px;
            height: 410px;
          }
        }
      `}</style>
    </>
  );
}
