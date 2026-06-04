export const dynamic = "force-dynamic";

import { readFileSync } from "fs";
import { join } from "path";

const BASE_URL = "https://paper-api.alpaca.markets";

async function fetchAlpaca(endpoint, headers) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch ALL fill activities by paginating through Alpaca's API.
 * Alpaca limits each page to 100 items; we follow page_token until exhausted.
 */
async function fetchAllFills(headers) {
  let allFills = [];
  let pageToken = null;

  while (true) {
    let url = "/v2/account/activities/FILL?direction=desc&page_size=100";
    if (pageToken) url += "&page_token=" + pageToken;

    const page = await fetchAlpaca(url, headers);
    if (!page || page.length === 0) break;

    allFills = allFills.concat(page);

    if (page.length < 100) break;
    pageToken = page[page.length - 1].id;
  }

  return allFills;
}

/**
 * Load the pitches config from the filesystem (public/pitches-config.json).
 */
function loadConfig() {
  const defaults = {
    manualPitches: [],
    symbolOverrides: {},
    hedgeSymbols: [],
    defaultPitchTeam: "Bhavya Patel, Henish Patel",
  };
  try {
    const filePath = join(process.cwd(), "public", "pitches-config.json");
    const raw = readFileSync(filePath, "utf-8");
    return { ...defaults, ...JSON.parse(raw) };
  } catch (_) {
    return defaults;
  }
}

/**
 * Format an ISO date string into "DD-Mon-YYYY" to match the site's convention.
 */
function fmtDate(isoStr) {
  if (!isoStr) return "";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const d = new Date(isoStr);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = months[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mon}-${yyyy}`;
}

/**
 * Parse "DD-Mon-YYYY" into a timestamp for sorting.
 */
function parseDateStr(s) {
  if (!s) return 0;
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const p = s.split("-");
  if (p.length !== 3) return 0;
  return new Date(parseInt(p[2]), months[p[1]], parseInt(p[0])).getTime();
}

/**
 * Normalise Alpaca fill side:
 *   "buy"        → "buy"
 *   "sell"       → "sell"
 *   "sell_short" → "sell"   (opening a short = selling)
 *   "buy_to_cover" → "buy" (closing a short = buying)
 * Some Alpaca paper accounts just use "buy"/"sell" for everything,
 * so we also handle those gracefully.
 */
function normaliseSide(side) {
  if (side === "sell_short") return "sell";
  if (side === "buy_to_cover") return "buy";
  return side; // "buy" or "sell"
}

export async function GET() {
  const apiKey = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_SECRET_KEY;

  const config = loadConfig();
  const hedgeSet = new Set((config.hedgeSymbols || []).map((s) => s.toUpperCase()));

  if (!apiKey || !secretKey) {
    return Response.json({
      error: "Alpaca not configured",
      activePitches: [],
      archivedPitches: [],
      hedges: [],
      manualPitches: config.manualPitches || [],
    });
  }

  const headers = {
    "APCA-API-KEY-ID": apiKey,
    "APCA-API-SECRET-KEY": secretKey,
    "Content-Type": "application/json",
  };

  try {
    /* ──────── 1. Fetch data from Alpaca ──────── */
    const [positions, fills] = await Promise.all([
      fetchAlpaca("/v2/positions", headers),
      fetchAllFills(headers),
    ]);

    // Fetch asset names for current positions
    const assetPromises = positions.map((p) =>
      fetchAlpaca(`/v2/assets/${p.symbol}`, headers).catch(() => ({ name: p.symbol }))
    );
    const assets = await Promise.all(assetPromises);
    const assetNameMap = {};
    positions.forEach((p, i) => { assetNameMap[p.symbol] = assets[i]?.name || p.symbol; });

    // Group ALL fills by symbol, chronologically (oldest first)
    // Normalise sides: sell_short → sell, buy_to_cover → buy
    const fillsBySymbol = {};
    fills.forEach((f) => {
      if (!fillsBySymbol[f.symbol]) fillsBySymbol[f.symbol] = [];
      fillsBySymbol[f.symbol].push({
        side: normaliseSide(f.side),
        rawSide: f.side,
        qty: parseFloat(f.qty),
        price: parseFloat(f.price),
        timestamp: f.transaction_time || f.timestamp,
      });
    });
    // Reverse so oldest first (API returns desc)
    Object.values(fillsBySymbol).forEach((arr) => arr.reverse());

    // Set of currently held symbols
    const heldSymbols = new Set(positions.map((p) => p.symbol));

    /* ──────── 2. Build Active Pitches + Hedges from current positions ──────── */
    const activePitches = [];
    const hedges = [];

    positions.forEach((p) => {
      const symbol = p.symbol;
      const overrides = config.symbolOverrides?.[symbol] || {};
      const symbolFills = fillsBySymbol[symbol] || [];
      const qty = parseFloat(p.qty);
      const isShort = qty < 0;

      // Find the first fill that opened the position
      const openingSide = isShort ? "sell" : "buy";
      const firstOpen = symbolFills.find((f) => f.side === openingSide);
      const datePitched = firstOpen ? fmtDate(firstOpen.timestamp) : "";

      const entry = {
        date: datePitched,
        company: overrides.companyName || assetNameMap[symbol] || symbol,
        symbol: symbol,
        decision: isShort ? "Short" : "Buy",
        targetPrice: overrides.targetPrice || null,
        transactionPrice: "$" + parseFloat(p.avg_entry_price).toFixed(2),
        pitchTeam: overrides.pitchTeam || config.defaultPitchTeam,
        deck: overrides.deck || null,
        model: overrides.model || null,
        isStrategy: false,
        _fromAlpaca: true,
      };

      // Route to hedges or pitches based on config
      if (hedgeSet.has(symbol.toUpperCase())) {
        hedges.push(entry);
      } else {
        activePitches.push(entry);
      }
    });

    /* ──────── 3. Closed positions → Archived Pitches + Archived Hedges ──────── */
    const archivedPitches = [];
    const archivedHedges = [];

    Object.entries(fillsBySymbol).forEach(([symbol, symbolFills]) => {
      // Skip symbols still held
      if (heldSymbols.has(symbol)) return;

      // Determine the thesis direction from the first fill
      const firstFill = symbolFills[0];
      if (!firstFill) return;
      const isShortThesis = firstFill.side === "sell";

      let totalOpenCost = 0;
      let totalOpenQty = 0;
      let totalCloseCost = 0;
      let totalCloseQty = 0;
      let firstOpenDate = null;
      let lastCloseDate = null;

      const openSide = isShortThesis ? "sell" : "buy";
      const closeSide = isShortThesis ? "buy" : "sell";

      symbolFills.forEach((f) => {
        if (f.side === openSide) {
          totalOpenCost += f.price * f.qty;
          totalOpenQty += f.qty;
          if (!firstOpenDate) firstOpenDate = f.timestamp;
        } else if (f.side === closeSide) {
          totalCloseCost += f.price * f.qty;
          totalCloseQty += f.qty;
          lastCloseDate = f.timestamp;
        }
      });

      // Only archive if there was actual opening AND closing activity
      if (totalOpenQty === 0 || totalCloseQty === 0) return;

      const avgEntry = totalOpenCost / totalOpenQty;
      const avgExit = totalCloseCost / totalCloseQty;

      // For longs: profit = (exit - entry) / entry
      // For shorts: profit = (entry - exit) / entry
      const returnPct = isShortThesis
        ? ((avgEntry - avgExit) / avgEntry) * 100
        : ((avgExit - avgEntry) / avgEntry) * 100;

      const overrides = config.symbolOverrides?.[symbol] || {};

      const archived = {
        symbol: symbol,
        _needsAssetName: true,
        datePitched: fmtDate(firstOpenDate),
        dateSold: fmtDate(lastCloseDate),
        company: overrides.companyName || symbol,
        decision: isShortThesis ? "Short" : "Buy",
        transactionPrice: "$" + avgEntry.toFixed(2),
        sellPrice: "$" + avgExit.toFixed(2),
        profitPct: (returnPct >= 0 ? "+" : "") + returnPct.toFixed(1) + "%",
        pitchTeam: overrides.pitchTeam || config.defaultPitchTeam,
        deck: overrides.deck || null,
        model: overrides.model || null,
      };

      if (hedgeSet.has(symbol.toUpperCase())) {
        archivedHedges.push(archived);
      } else {
        archivedPitches.push(archived);
      }
    });

    // Resolve asset names for all entries that need it
    const allNeedingNames = [
      ...activePitches.filter((p) => p._fromAlpaca),
      ...hedges.filter((p) => p._fromAlpaca),
      ...archivedPitches.filter((p) => p._needsAssetName && p.company === p.symbol),
      ...archivedHedges.filter((p) => p._needsAssetName && p.company === p.symbol),
    ];
    // We already have names for held positions; only resolve for archived
    const archivedNeedingNames = [...archivedPitches, ...archivedHedges]
      .filter((p) => p._needsAssetName && p.company === p.symbol);
    if (archivedNeedingNames.length > 0) {
      const namePromises = archivedNeedingNames.map((p) =>
        fetchAlpaca(`/v2/assets/${p.symbol}`, headers).catch(() => ({ name: p.symbol }))
      );
      const resolvedNames = await Promise.all(namePromises);
      archivedNeedingNames.forEach((p, i) => {
        const ov = config.symbolOverrides?.[p.symbol] || {};
        p.company = ov.companyName || resolvedNames[i]?.name || p.symbol;
      });
    }

    // Format company names to include ticker: "Company Name (TICKER)"
    const addTicker = (p) => {
      if (!p.company.includes("(")) {
        p.company = p.company + " (" + p.symbol + ")";
      }
      delete p._fromAlpaca;
      delete p._needsAssetName;
    };
    activePitches.forEach(addTicker);
    hedges.forEach(addTicker);
    archivedPitches.forEach(addTicker);
    archivedHedges.forEach(addTicker);

    // Sort all lists: latest date first (descending)
    activePitches.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));
    hedges.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));
    archivedPitches.sort((a, b) => parseDateStr(b.dateSold) - parseDateStr(a.dateSold));
    archivedHedges.sort((a, b) => parseDateStr(b.dateSold) - parseDateStr(a.dateSold));

    return Response.json({
      activePitches,
      archivedPitches,
      hedges,
      archivedHedges,
      manualPitches: config.manualPitches || [],
    });

  } catch (error) {
    console.error("Pitches API error:", error.message || error);
    return Response.json({
      error: error.message || "Failed to fetch pitches data",
      activePitches: [],
      archivedPitches: [],
      hedges: [],
      archivedHedges: [],
      manualPitches: config.manualPitches || [],
    });
  }
}
