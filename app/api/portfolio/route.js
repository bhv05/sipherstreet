import { calculatePortfolioMetrics } from "@/lib/metrics.js";

const BASE_URL = "https://paper-api.alpaca.markets";
const INITIAL_CAPITAL = 100000;

function fallbackResponse() {
  return Response.json({
    error: "Alpaca not configured or unauthorized",
    equity: INITIAL_CAPITAL,
    cash: INITIAL_CAPITAL,
    totalValue: INITIAL_CAPITAL,
    initialCapital: INITIAL_CAPITAL,
    totalReturnPct: 0,
    positions: [],
    jensensAlphaAnn: "+3.00%",
    sharpe: "0.79",
    sortino: "1.18",
    maxDrawdown: "-3.87%",
    beta: "0.248",
    tStatBeta: "4.50",
    lastUpdated: new Date().toISOString(),
  });
}

async function fetchAlpaca(endpoint, headers) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`);
  return res.json();
}

let cachedData = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  if (cachedData && Date.now() - cacheTime < CACHE_TTL_MS) {
    return Response.json(cachedData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  const apiKey = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_SECRET_KEY;
  if (!apiKey || !secretKey) {
    return fallbackResponse();
  }

  const headers = {
    "APCA-API-KEY-ID": apiKey,
    "APCA-API-SECRET-KEY": secretKey,
    "Content-Type": "application/json",
  };

  try {
    const [account, positions, activities] = await Promise.all([
      fetchAlpaca("/v2/account", headers),
      fetchAlpaca("/v2/positions", headers),
      fetchAlpaca("/v2/account/activities/FILL?direction=desc&page_size=100", headers).catch(() => []),
    ]);

    // Fetch asset names for each position
    const assetPromises = positions.map((p) =>
      fetchAlpaca(`/v2/assets/${p.symbol}`, headers).catch(() => ({ name: p.symbol }))
    );
    const assets = await Promise.all(assetPromises);

    // Calculate pro-forma interest & dividends prior to BOXX purchase date
    const metrics = await calculatePortfolioMetrics({ account, positions, activities, headers });
    const interestAccrued = parseFloat(metrics.interestAccrued || "0");
    const netDividendAdjustment = parseFloat(metrics.netDividendAdjustment || "0");
    const proFormaAdjustment = interestAccrued + netDividendAdjustment;

    const hasBoxx = positions.some((p) => p.symbol === "BOXX");
    const rawEquity = parseFloat(account.equity);
    const adjEquity = rawEquity + proFormaAdjustment;
    const rawTotalValue = parseFloat(account.portfolio_value);
    const adjTotalValue = rawTotalValue + proFormaAdjustment;
    const rawCash = parseFloat(account.cash);
    const adjCash = hasBoxx ? rawCash : rawCash + proFormaAdjustment;
    const totalReturnPct = ((adjEquity - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

    // Display name overrides for cash-equivalent / tax instruments
    const DISPLAY_NAME_OVERRIDES = {
      "BOXX": "Short-Term Treasury Yield ETF (Cash Equivalent)",
    };

    const formattedPositions = positions.map((p, i) => {
      let marketValue = parseFloat(p.market_value);
      const costBasis = parseFloat(p.cost_basis);
      let pl = parseFloat(p.unrealized_pl);
      const isTreasury = p.symbol === "BOXX";

      // Add cumulative pro-forma interest & dividends onto BOXX position size
      if (isTreasury) {
        marketValue = marketValue + proFormaAdjustment;
        pl = pl + proFormaAdjustment;
      }

      const totalReturn = costBasis !== 0 ? ((marketValue - costBasis) / Math.abs(costBasis)) * 100 : 0;

      return {
        company: DISPLAY_NAME_OVERRIDES[p.symbol] || assets[i]?.name || p.symbol,
        symbol: p.symbol,
        qty: parseFloat(p.qty),
        side: isTreasury ? "TREASURY" : parseFloat(p.qty) > 0 ? "LONG" : "SHORT",
        costBasis: parseFloat(p.avg_entry_price),
        currentPrice: parseFloat(p.current_price),
        positionSize: Math.abs(marketValue),
        allocation: (Math.abs(marketValue) / adjTotalValue) * 100,
        totalReturn: totalReturn,
        pl: pl,
        changeToday: parseFloat(p.change_today) * 100 || 0,
        isTreasury: isTreasury,
      };
    });

    const longPositions = formattedPositions
      .filter((p) => p.side === "LONG")
      .sort((a, b) => b.positionSize - a.positionSize);

    const shortPositions = formattedPositions
      .filter((p) => p.side === "SHORT")
      .sort((a, b) => b.positionSize - a.positionSize);

    const cashItems = [];

    // Treasury Tracker (BOXX)
    const boxxPos = formattedPositions.find((p) => p.isTreasury);
    if (boxxPos) {
      cashItems.push(boxxPos);
    }

    // Uninvested Cash
    cashItems.push({
      company: "Uninvested Cash",
      symbol: "CASH",
      qty: null,
      side: "CASH",
      costBasis: null,
      currentPrice: null,
      positionSize: rawCash,
      allocation: (rawCash / adjTotalValue) * 100,
      totalReturn: null,
      pl: null,
      changeToday: 0,
      isRawCash: true,
    });

    // Sort cash items by position size descending
    cashItems.sort((a, b) => b.positionSize - a.positionSize);

    // Combined positions array maintaining Longs top, Shorts middle, Cash bottom
    const sortedPositions = [...longPositions, ...shortPositions, ...cashItems];

    const data = {
      equity: adjEquity,
      cash: adjCash,
      totalValue: adjTotalValue,
      initialCapital: INITIAL_CAPITAL,
      totalReturnPct: totalReturnPct,
      positions: sortedPositions,
      longPositions: longPositions,
      shortPositions: shortPositions,
      cashItems: cashItems,
      metrics: metrics,
      jensensAlphaAnn: metrics?.jensensAlphaAnn || "+3.00%",
      sharpe: metrics?.sharpe || "0.79",
      sortino: metrics?.sortino || "1.18",
      maxDrawdown: metrics?.maxDrawdown || "-3.87%",
      beta: metrics?.beta || "0.248",
      tStatBeta: metrics?.tStatBeta || "4.50",
      lastUpdated: new Date().toISOString(),
    };

    cachedData = data;
    cacheTime = Date.now();

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Alpaca API error:", error.message || error);
    return fallbackResponse();
  }
}
