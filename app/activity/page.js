"use client";
import { useState, useEffect, Suspense } from "react";
import { Link } from "next-view-transitions";
import { useSearchParams } from "next/navigation";
import useReveal from "../components/useReveal";

/* ── Helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  var parts = dateStr.split("-");
  var target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function fmt(n, decimals) {
  if (decimals === undefined) decimals = 2;
  if (n == null || isNaN(n)) return "-";
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* ── Pill colour map ── */
var PILL_COLORS = {
  green:  { bg: "rgba(22, 163, 74, 0.10)", color: "#16a34a", dot: "#16a34a" },
  red:    { bg: "rgba(220, 38, 38, 0.10)", color: "#dc2626", dot: "#dc2626" },
  grey:   { bg: "rgba(108, 117, 125, 0.10)", color: "#6c757d", dot: "#94a3b8" },
  pink:   { bg: "rgba(181, 81, 142, 0.10)", color: "#b5518e", dot: "#b5518e" },
  teal:   { bg: "rgba(13, 148, 136, 0.10)", color: "#0d9488", dot: "#0d9488" },
  blue:   { bg: "rgba(29, 111, 165, 0.10)", color: "#1d6fa5", dot: "#1d6fa5" },
  amber:  { bg: "rgba(184, 134, 11, 0.10)", color: "#b8860b", dot: "#b8860b" },
};

/* ── Filter groups ── */
var FILTERS = [
  { key: "all", label: "All" },
  { key: "capital", label: "Capital Moves" },
  { key: "position", label: "Positions" },
  { key: "kpi", label: "KPI Milestones" },
];

/* ── KPI Card ── */
function KpiCard({ label, value, subtitle, subtitleColor }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {subtitle && (
        <div className="kpi-subtitle" style={{ color: subtitleColor || "#8896a6" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* ── Category Pill ── */
function Pill({ text, color }) {
  var c = PILL_COLORS[color] || PILL_COLORS.grey;
  return (
    <span className="category-pill" style={{
      background: c.bg,
      color: c.color,
    }}>
      {text}
    </span>
  );
}

/* ── Timeline Entry ── */
function TimelineEntry({ entry, config, isLast }) {
  var pitchLink = config && config.pitch_links && config.pitch_links[entry.symbol];
  var c = PILL_COLORS[entry.pillColor] || PILL_COLORS.grey;

  return (
    <div className="tl-entry" data-category={entry.filterGroup} data-ticker={entry.symbol || ""}>
      {/* Vertical rail */}
      <div className="tl-rail">
        <div className="tl-dot" style={{ background: c.dot, boxShadow: "0 0 0 4px " + c.bg }} />
        {!isLast && <div className="tl-line" />}
      </div>

      {/* Content card */}
      <div className="tl-card">
        <div className="tl-card-head">
          <span className="tl-date">{formatDate(entry.date)}</span>
          <Pill text={entry.pillText} color={entry.pillColor} />
        </div>
        <h4 className="tl-title">{entry.title}</h4>
        <p className="tl-desc">{entry.description}</p>
        {(entry.symbol || pitchLink) && (
          <div className="tl-links">
            {entry.symbol && (
              <Link href={"/portfolio"} className="tl-link">{entry.symbol} ↗</Link>
            )}
            {pitchLink && (
              <Link href={pitchLink} className="tl-link">View pitch →</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Earnings Risk Briefing Card ── */
function EarningsCard({ ticker, data, position, nav }) {
  var days = daysUntil(data.date);
  var isUpcoming = data.date && days >= 0 && days <= 14;
  var isPast = data.date && days < 0;
  var isETF = data.date === null;

  /* Position exposure data */
  var posData = null;
  if (position) {
    var mv = Math.abs(parseFloat(position.market_value || 0));
    var side = parseFloat(position.qty || 0) > 0 ? "long" : "short";
    posData = {
      side: side,
      weight: nav > 0 ? (mv / nav * 100).toFixed(1) : "-",
      entryPrice: parseFloat(position.avg_entry_price || 0).toFixed(2),
      currentPrice: parseFloat(position.current_price || 0).toFixed(2),
      plPct: position.unrealized_plpc != null ? (parseFloat(position.unrealized_plpc) * 100).toFixed(1) : null,
    };
  }

  /* Countdown text */
  var countdownEl = null;
  if (!isETF && data.date) {
    var countdownText = isPast ? "Reported" : days === 0 ? "Today" : days === 1 ? "Tomorrow" : days + " days";
    if (isUpcoming) {
      countdownEl = <span className="earn-countdown-pill">{countdownText}</span>;
    } else if (isPast) {
      countdownEl = <span className="earn-countdown-muted">{countdownText}</span>;
    } else {
      countdownEl = <span className="earn-countdown-muted">{countdownText}</span>;
    }
  }

  /* Card classes */
  var cardClass = "earn-card";
  if (isUpcoming) cardClass += " earn-urgent";

  return (
    <div className={cardClass}>
      {/* Row 1: Header */}
      <div className="earn-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="earn-ticker">{ticker}</span>
            {posData && (
              <span className={"earn-side-pill earn-side-" + posData.side}>
                {posData.side === "long" ? "Long" : "Short"}
              </span>
            )}
          </div>
          <div className="earn-company">{data.company}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {countdownEl}
        </div>
      </div>

      {/* Divider */}
      <div className="earn-divider" />

      {/* Row 2: Position Exposure */}
      {posData ? (
        <div className="earn-data-block">
          {!isETF && data.date && (
            <div className="earn-row">
              <span className="earn-label">Report date</span>
              <span className="earn-val">{formatDate(data.date)}{data.timing ? " · " + data.timing : ""}</span>
            </div>
          )}
          {isETF && (
            <div className="earn-row">
              <span className="earn-label">Status</span>
              <span className="earn-val" style={{ color: "#8896a6" }}>{data.note || "ETF, no earnings"}</span>
            </div>
          )}
          <div className="earn-row">
            <span className="earn-label">Position weight</span>
            <span className="earn-val">{posData.weight}% of NAV</span>
          </div>
          <div className="earn-row">
            <span className="earn-label">Entry / Current</span>
            <span className="earn-val">${posData.entryPrice} / ${posData.currentPrice}</span>
          </div>
          <div className="earn-row">
            <span className="earn-label">Unrealised P&L</span>
            <span className="earn-val" style={{ color: posData.plPct && parseFloat(posData.plPct) >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
              {posData.plPct != null ? (parseFloat(posData.plPct) >= 0 ? "+" : "") + posData.plPct + "%" : "-"}
            </span>
          </div>
        </div>
      ) : (
        <div className="earn-data-block">
          {!isETF && data.date && (
            <div className="earn-row">
              <span className="earn-label">Report date</span>
              <span className="earn-val">{formatDate(data.date)}{data.timing ? " · " + data.timing : ""}</span>
            </div>
          )}
          <div className="earn-row">
            <span className="earn-label">Position</span>
            <span className="earn-val" style={{ color: "#8896a6", fontStyle: "italic" }}>No current position</span>
          </div>
        </div>
      )}

      {/* Skip market expectations and history for ETFs */}
      {!isETF && (
        <>
          {/* Divider */}
          <div className="earn-divider" />

          {/* Row 3: Market Expectations */}
          <div className="earn-data-block">
            <div className="earn-row">
              <span className="earn-label">Est. EPS</span>
              <span className="earn-val">{data.consensus_eps != null ? "$" + fmt(data.consensus_eps) : "-"}</span>
            </div>
            {data.consensus_revenue && (
              <div className="earn-row">
                <span className="earn-label">Est. Revenue</span>
                <span className="earn-val">${data.consensus_revenue}</span>
              </div>
            )}
            {data.implied_move != null && (
              <div className="earn-row">
                <span className="earn-label">Implied Move</span>
                <span className="earn-val">{"\u00B1" + data.implied_move + "%"}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="earn-divider" />

          {/* Row 4: Historical Pattern */}
          <div className="earn-data-block">
            {data.last_quarter_result && (
              <div className="earn-row">
                <span className="earn-label">Last Quarter</span>
                <span className="earn-val" style={{ color: data.last_quarter_result === "beat" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                  {data.last_quarter_result === "beat" ? "Beat" : "Miss"}
                  {data.last_quarter_surprise != null ? " · " + (data.last_quarter_surprise >= 0 ? "+" : "") + "$" + Math.abs(data.last_quarter_surprise).toFixed(2) : ""}
                </span>
              </div>
            )}
            {data.beat_rate_4q && (
              <div className="earn-row">
                <span className="earn-label">Last 4 Qs</span>
                <span className="earn-val">{data.beat_rate_4q} beats</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Page (Inner component using useSearchParams) ── */
function ActivityInner() {
  var [apiData, setApiData] = useState(null);
  var [config, setConfig] = useState(null);
  var [earningsJson, setEarningsJson] = useState(null);
  var [loading, setLoading] = useState(true);
  var [apiError, setApiError] = useState(false);
  var [activeFilter, setActiveFilter] = useState("all");
  var [visibleCount, setVisibleCount] = useState(20);

  var searchParams = useSearchParams();
  var tickerFilter = searchParams.get("ticker");

  var headerReveal = useReveal();
  var kpiReveal = useReveal();
  var timelineReveal = useReveal();
  var earningsReveal = useReveal();

  /* Fetch API data */
  useEffect(function () {
    fetch("/api/activity")
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (d.error && d.fills && d.fills.length === 0) {
          setApiError(true);
        }
        setApiData(d);
      })
      .catch(function () { setApiError(true); })
      .finally(function () { setLoading(false); });
  }, []);

  /* Fetch config */
  useEffect(function () {
    fetch("/activity-config.json")
      .then(function (res) { return res.json(); })
      .then(function (d) { setConfig(d); })
      .catch(function () {
        setConfig({
          portfolio_beta: 0,
          net_exposure_target: 30,
          manual_entries: [],
          earnings_lookup: {},
          trade_descriptions: {},
          pitch_links: {},
        });
      });
  }, []);

  /* Fetch auto-generated earnings data (from pipeline) */
  useEffect(function () {
    fetch("/earnings-data.json")
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(function (d) { setEarningsJson(d); })
      .catch(function () { setEarningsJson(null); });
  }, []);

  /* Build merged timeline */
  var timelineEntries = [];

  if (apiData && apiData.fills) {
    var descs = (config && config.trade_descriptions) || {};
    apiData.fills.forEach(function (f) {
      var verb = f.side === "buy" ? "Bought" : "Sold";
      var autoDesc = verb + " " + f.qty + " shares of " + f.symbol + " at $" + fmt(f.avgPrice) + ", accounting for " + f.positionSizePct + "% of NAV.";
      var actionKey = f.symbol + "_" + f.category;
      if (descs[actionKey]) {
        autoDesc += " " + descs[actionKey];
      } else if (descs[f.symbol]) {
        autoDesc += " " + descs[f.symbol];
      }
      var autoTitle = "";
      if (f.category === "long") autoTitle = "Initiated " + f.symbol + " long position";
      else if (f.category === "short") autoTitle = "Initiated " + f.symbol + " short position";
      else if (f.category === "add") autoTitle = "Added to " + f.symbol + " position";
      else if (f.category === "trim") autoTitle = "Trimmed " + f.symbol + " position";
      else if (f.category === "exit") autoTitle = "Exited " + f.symbol + " position";
      else autoTitle = f.pillText + " " + f.symbol;

      timelineEntries.push({
        date: f.date,
        category: f.category,
        filterGroup: f.filterGroup,
        pillText: f.pillText,
        pillColor: f.pillColor,
        title: autoTitle,
        description: autoDesc,
        symbol: f.symbol,
        source: "auto",
      });
    });
  }

  if (config && config.manual_entries) {
    config.manual_entries.forEach(function (m) {
      timelineEntries.push({
        date: m.date,
        category: m.category,
        filterGroup: m.filter_group,
        pillText: m.pill_text,
        pillColor: m.pill_color,
        title: m.title,
        description: m.description,
        symbol: m.ticker || null,
        source: "manual",
      });
    });
  }

  timelineEntries.sort(function (a, b) {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  if (tickerFilter) {
    var t = tickerFilter.toUpperCase();
    timelineEntries = timelineEntries.filter(function (e) {
      return e.symbol && e.symbol.toUpperCase() === t;
    });
  }

  var filteredEntries = activeFilter === "all"
    ? timelineEntries
    : timelineEntries.filter(function (e) { return e.filterGroup === activeFilter; });

  var displayedEntries = filteredEntries.slice(0, visibleCount);
  var hasMore = filteredEntries.length > visibleCount;

  /* KPI values */
  var exposures = apiData ? apiData.exposures : null;
  var netExposure = exposures ? exposures.netPct + "%" : "-";
  var grossExposure = exposures ? exposures.grossPct + "%" : "-";
  var longPct = exposures ? exposures.longPct : "-";
  var shortPct = exposures ? exposures.shortPct : "-";
  var longCount = exposures ? exposures.longCount : 0;
  var shortCount = exposures ? exposures.shortCount : 0;
  var totalPositions = longCount + shortCount;
  var beta = config && config.portfolio_beta ? config.portfolio_beta : "-";
  var sharpe = config && config.sharpe_ratio ? config.sharpe_ratio : "-";
  var netTarget = config ? config.net_exposure_target : 30;

  /* Earnings: prefer auto-generated earnings-data.json, fallback to manual config */
  var earningsData = [];
  var positionsByTicker = {};
  var accountNav = apiData && apiData.account ? parseFloat(apiData.account.equity) : 0;
  var earningsLastUpdated = earningsJson ? earningsJson.last_updated : null;

  if (apiData && apiData.positions) {
    apiData.positions.forEach(function (pos) {
      positionsByTicker[pos.symbol] = pos;
    });
  }

  if (earningsJson && earningsJson.earnings_calendar && apiData && apiData.positions) {
    /* Use the auto-generated pipeline data, but keep live position exposure from Alpaca */
    var heldTickers = new Set(apiData.positions.map(function (p) { return p.symbol; }));
    earningsJson.earnings_calendar.forEach(function (entry) {
      if (heldTickers.has(entry.ticker)) {
        earningsData.push({
          ticker: entry.ticker,
          data: entry,
          position: positionsByTicker[entry.ticker] || null,
        });
      }
    });
  } else if (config && config.earnings_lookup && apiData && apiData.positions) {
    /* Fallback to manual config */
    var lookup = config.earnings_lookup;
    apiData.positions.forEach(function (pos) {
      var sym = pos.symbol;
      if (lookup[sym]) {
        earningsData.push({ ticker: sym, data: lookup[sym], position: pos });
      }
    });
  }

  // Sort by date ascending (nearest first), nulls (ETFs) last
  earningsData.sort(function (a, b) {
    if (!a.data.date) return 1;
    if (!b.data.date) return -1;
    return a.data.date < b.data.date ? -1 : 1;
  });

  /* Loading state */
  if (loading && !config) {
    return (
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#5a6a7e", letterSpacing: "0.1em" }}>LOADING ACTIVITY DATA...</div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 8 }}>Fetching from Alpaca API</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section activity-page" style={{ maxWidth: 1100 }}>
      {/* Page Header */}
      <div ref={headerReveal.ref} className={"reveal" + (headerReveal.inView ? " in-view" : "")}>
        <p className="section-label">Decision Log</p>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Portfolio <span>Activity</span>
        </h2>
        <p style={{ fontSize: 13, color: "#8896a6", marginBottom: 40 }}>
          Capital allocation decisions, position changes, and key milestones updated in real time.
        </p>
      </div>

      {/* API error notice */}
      {apiError && (
        <div className="activity-notice notice-warn">
          Live data is temporarily unavailable, showing manual entries only.
        </div>
      )}

      {/* Ticker filter notice */}
      {tickerFilter && (
        <div className="activity-notice notice-info">
          <span>Filtering: <b>{tickerFilter.toUpperCase()}</b></span>
          <Link href="/activity" style={{ marginLeft: "auto", fontSize: 11, color: "#8896a6" }}>Clear filter ×</Link>
        </div>
      )}

      {/* Section A — KPI Dashboard */}
      <div ref={kpiReveal.ref} className={"kpi-grid reveal" + (kpiReveal.inView ? " in-view" : "")}>
        <KpiCard
          label="Net Long Exposure"
          value={netExposure}
          subtitle={"Target: " + netTarget + "%"}
          subtitleColor={exposures && Math.abs(parseFloat(exposures.netPct) - netTarget) < 15 ? "#16a34a" : "#8896a6"}
        />
        <KpiCard
          label="Gross Exposure"
          value={grossExposure}
          subtitle={"L: " + longPct + "% / S: " + shortPct + "%"}
        />
        <KpiCard
          label="Portfolio Beta"
          value={beta}
          subtitle="vs SPX"
        />
        <KpiCard
          label="Sharpe Ratio"
          value={sharpe}
          subtitle={sharpe === "N/A" || sharpe === "TBD" ? "Building Track Record" : "Risk-adjusted Return"}
        />
      </div>

      {/* Section B — Filter Bar */}
      <div className="filter-bar">
        {FILTERS.map(function (f) {
          var isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              className={"filter-btn" + (isActive ? " active" : "")}
              onClick={function () {
                setActiveFilter(f.key);
                setVisibleCount(20);
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Section C — Activity Timeline */}
      <div ref={timelineReveal.ref} className={"reveal" + (timelineReveal.inView ? " in-view" : "")}>
        <div className="tl-container">
          {displayedEntries.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#8896a6", fontSize: 13 }}>
              No activity entries to display.
            </div>
          )}
          {displayedEntries.map(function (entry, i) {
            return (
              <TimelineEntry
                key={entry.date + "-" + entry.symbol + "-" + i}
                entry={entry}
                config={config}
                isLast={i === displayedEntries.length - 1}
              />
            );
          })}
        </div>

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              className="btn-outline"
              style={{ padding: "10px 28px", fontSize: 12 }}
              onClick={function () { setVisibleCount(function (c) { return c + 20; }); }}
            >
              Load more
            </button>
          </div>
        )}
      </div>

      {/* Section D — Earnings Risk Briefing (portfolio tickers only) */}
      {earningsData.length > 0 && (
        <div ref={earningsReveal.ref} className={"earn-section reveal" + (earningsReveal.inView ? " in-view" : "")}>
          <p className="section-label">Earnings Watch</p>
          <h3 className="earn-heading">Upcoming Earnings</h3>
          <p className="earn-sub">Earnings risk briefing for current positions</p>
          {earningsLastUpdated && (
            <p style={{ fontSize: 11, color: "#8896a6", marginTop: -20, marginBottom: 24 }}>
              Last updated: {new Date(earningsLastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
          <div className="earn-grid">
            {earningsData.map(function (item) {
              return <EarningsCard key={item.ticker} ticker={item.ticker} data={item.data} position={item.position || null} nav={accountNav} />;
            })}
          </div>
        </div>
      )}

      {/* ── Styles ── */}
      <style jsx global>{`
        /* ---- KPI Dashboard ---- */
        .activity-page .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .activity-page .kpi-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 18px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .activity-page .kpi-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(26, 42, 68, 0.08);
        }
        .activity-page .kpi-label {
          font-size: 11px;
          color: #8896a6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .activity-page .kpi-value {
          font-size: 24px;
          font-weight: 500;
          color: var(--navy);
          margin-bottom: 4px;
        }
        .activity-page .kpi-subtitle {
          font-size: 11px;
          font-weight: 500;
        }

        /* ---- Notices ---- */
        .activity-page .activity-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 24px;
        }
        .activity-page .notice-warn {
          background: rgba(184, 134, 11, 0.06);
          border: 1px solid rgba(184, 134, 11, 0.18);
          color: #b8860b;
        }
        .activity-page .notice-info {
          background: rgba(30, 58, 95, 0.04);
          border: 1px solid rgba(30, 58, 95, 0.10);
          color: #1e3a5f;
        }

        /* ---- Filter Bar ---- */
        .activity-page .filter-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .activity-page .filter-btn {
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          border: 1px solid var(--border);
          background: transparent;
          color: #5a6a7e;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .activity-page .filter-btn:hover {
          border-color: var(--navy);
          color: var(--navy);
        }
        .activity-page .filter-btn.active {
          background: var(--navy);
          color: #ffffff;
          border-color: var(--navy);
        }

        /* ---- TIMELINE ---- */
        .activity-page .tl-container {
          position: relative;
          padding-left: 0;
        }
        .activity-page .tl-entry {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 0;
          position: relative;
          min-height: 48px;
        }

        /* Rail: dot + vertical line */
        .activity-page .tl-rail {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .activity-page .tl-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          margin-top: 6px;
        }
        .activity-page .tl-line {
          width: 2px;
          flex: 1;
          background: var(--border);
          margin-top: 4px;
          min-height: 20px;
        }

        /* Content card */
        .activity-page .tl-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 20px;
          margin-left: 8px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .activity-page .tl-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 16px rgba(26, 42, 68, 0.06);
        }
        .activity-page .tl-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .activity-page .tl-date {
          font-size: 11px;
          color: #8896a6;
          letter-spacing: 0.04em;
          font-weight: 500;
        }
        .activity-page .category-pill {
          display: inline-block;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .activity-page .tl-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--navy);
          margin: 0 0 8px 0;
          line-height: 1.4;
        }
        .activity-page .tl-desc {
          font-size: 13px;
          color: #5a6a7e;
          line-height: 1.7;
          margin: 0 0 8px 0;
        }
        .activity-page .tl-links {
          display: flex;
          gap: 14px;
        }
        .activity-page .tl-link {
          font-size: 11px;
          color: var(--accent);
          font-weight: 500;
          transition: color 0.2s;
        }
        .activity-page .tl-link:hover {
          color: var(--navy);
        }

        /* ---- EARNINGS ---- */
        .activity-page .earn-section {
          margin-top: 72px;
          padding-top: 48px;
          border-top: 1px solid var(--border);
        }
        .activity-page .earn-heading {
          font-size: 22px;
          font-weight: 200;
          color: var(--navy);
          margin-bottom: 4px;
        }
        .activity-page .earn-sub {
          font-size: 13px;
          color: #8896a6;
          margin-bottom: 28px;
        }
        .activity-page .earn-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .activity-page .earn-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px 20px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .activity-page .earn-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(26, 42, 68, 0.06);
        }
        .activity-page .earn-urgent {
          border-left: 3px solid #b8860b;
          border-radius: 0 10px 10px 0;
        }
        .activity-page .earn-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .activity-page .earn-ticker {
          font-size: 16px;
          font-weight: 600;
          color: var(--navy);
        }
        .activity-page .earn-side-pill {
          display: inline-block;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-radius: 3px;
        }
        .activity-page .earn-side-long {
          background: rgba(22, 163, 74, 0.1);
          color: #16a34a;
        }
        .activity-page .earn-side-short {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
        .activity-page .earn-countdown-pill {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #92400e;
          background: rgba(184, 134, 11, 0.1);
          padding: 3px 10px;
          border-radius: 3px;
        }
        .activity-page .earn-countdown-muted {
          font-size: 11px;
          color: #8896a6;
          font-weight: 500;
        }
        .activity-page .earn-company {
          font-size: 12px;
          color: #8896a6;
          margin-top: 2px;
        }
        .activity-page .earn-divider {
          height: 1px;
          background: var(--border);
          margin: 12px 0;
        }
        .activity-page .earn-data-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activity-page .earn-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3px 0;
        }
        .activity-page .earn-label {
          font-size: 11px;
          color: #8896a6;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }
        .activity-page .earn-val {
          font-size: 13px;
          color: var(--navy);
          font-weight: 500;
        }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 1024px) {
          .activity-page .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .activity-page .kpi-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .activity-page .kpi-value {
            font-size: 22px;
          }
          .activity-page .filter-bar {
            gap: 6px;
          }
          .activity-page .filter-btn {
            padding: 6px 14px;
            font-size: 11px;
          }
          .activity-page .earn-grid {
            grid-template-columns: 1fr;
          }
          .activity-page .tl-entry {
            grid-template-columns: 24px 1fr;
          }
          .activity-page .tl-dot {
            width: 12px;
            height: 12px;
          }
          .activity-page .tl-card {
            padding: 16px 18px;
            margin-left: 4px;
            margin-bottom: 16px;
          }
          .activity-page .tl-title {
            font-size: 14px;
          }
          .activity-page .tl-desc {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

/* Wrap with Suspense for useSearchParams (required by Next.js static rendering) */
export default function Activity() {
  return (
    <Suspense fallback={
      <div className="page-section" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#5a6a7e", letterSpacing: "0.1em" }}>LOADING ACTIVITY DATA...</div>
          <div style={{ fontSize: 12, color: "#8896a6", marginTop: 8 }}>Fetching from Alpaca API</div>
        </div>
      </div>
    }>
      <ActivityInner />
    </Suspense>
  );
}
