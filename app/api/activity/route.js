const BASE_URL = "https://paper-api.alpaca.markets";
const INITIAL_CAPITAL = 100000;

async function fetchAlpaca(endpoint, headers) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`);
  return res.json();
}

export async function GET() {
  const apiKey = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return Response.json({
      error: "Alpaca not configured",
      account: { equity: INITIAL_CAPITAL, cash: INITIAL_CAPITAL },
      positions: [],
      exposures: { nav: INITIAL_CAPITAL, longExposure: 0, shortExposure: 0, netPct: "0.0", grossPct: "0.0", longPct: "0.0", shortPct: "0.0", longCount: 0, shortCount: 0 },
      fills: [],
    });
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
      fetchAlpaca("/v2/account/activities/FILL?direction=desc&page_size=100", headers),
    ]);

    // Compute exposure metrics
    const nav = parseFloat(account.equity);
    let longExposure = 0;
    let shortExposure = 0;

    const positionMap = {};
    positions.forEach(function (p) {
      const mv = Math.abs(parseFloat(p.market_value));
      const qty = parseFloat(p.qty);
      const side = qty > 0 ? "long" : "short";
      if (side === "long") longExposure += mv;
      else shortExposure += mv;
      positionMap[p.symbol] = {
        side: side,
        qty: Math.abs(qty),
        market_value: mv,
        current_price: parseFloat(p.current_price),
        avg_entry_price: parseFloat(p.avg_entry_price),
        unrealized_plpc: p.unrealized_plpc != null ? parseFloat(p.unrealized_plpc) : null,
        symbol: p.symbol,
      };
    });

    const exposures = {
      nav: nav,
      longExposure: longExposure,
      shortExposure: shortExposure,
      netPct: ((longExposure - shortExposure) / nav * 100).toFixed(1),
      grossPct: ((longExposure + shortExposure) / nav * 100).toFixed(1),
      longPct: (longExposure / nav * 100).toFixed(1),
      shortPct: (shortExposure / nav * 100).toFixed(1),
      longCount: positions.filter(function(p) { return parseFloat(p.qty) > 0; }).length,
      shortCount: positions.filter(function(p) { return parseFloat(p.qty) < 0; }).length,
    };

    // Process fills into categorised entries
    // Group fills by symbol to track cumulative qty changes
    const fills = activities.map(function (a) {
      return {
        id: a.id,
        symbol: a.symbol,
        side: a.side, // "buy" or "sell"
        qty: parseFloat(a.qty),
        price: parseFloat(a.price),
        timestamp: a.transaction_time || a.timestamp,
        cum_qty: a.cum_qty ? parseFloat(a.cum_qty) : null,
        leaves_qty: a.leaves_qty ? parseFloat(a.leaves_qty) : null,
      };
    });

    // Determine position symbols held currently
    const currentSymbols = new Set(Object.keys(positionMap));

    // For each fill, categorise it
    // We need to figure out if a fill opened/added/trimmed/exited a position
    // Group consecutive fills by symbol+date for better categorisation
    const symbolFillGroups = {};
    fills.forEach(function (f) {
      const dateStr = f.timestamp ? f.timestamp.split("T")[0] : "";
      const key = f.symbol + "|" + dateStr;
      if (!symbolFillGroups[key]) {
        symbolFillGroups[key] = {
          symbol: f.symbol,
          date: dateStr,
          fills: [],
          totalQty: 0,
          side: f.side,
          avgPrice: 0,
        };
      }
      symbolFillGroups[key].fills.push(f);
      symbolFillGroups[key].totalQty += f.qty;
    });

    // Calculate avg price per group
    Object.values(symbolFillGroups).forEach(function (g) {
      let totalCost = 0;
      let totalQty = 0;
      g.fills.forEach(function (f) {
        totalCost += f.price * f.qty;
        totalQty += f.qty;
      });
      g.avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
    });

    const categorisedFills = Object.values(symbolFillGroups).map(function (g) {
      const inPortfolio = currentSymbols.has(g.symbol);
      const pos = positionMap[g.symbol];
      let category, pillText, pillColor, filterGroup;

      if (g.side === "buy") {
        // Buy side
        if (!inPortfolio) {
          // Bought and then exited (or was a short cover that closed)
          category = "exit";
          pillText = "Exit";
          pillColor = "grey";
          filterGroup = "capital";
        } else if (pos && pos.side === "long") {
          // Could be new position or add
          // Heuristic: if total fill qty is close to current position qty, it's likely a new position
          if (g.totalQty >= pos.qty * 0.8) {
            category = "long";
            pillText = "Long";
            pillColor = "green";
            filterGroup = "capital";
          } else {
            category = "add";
            pillText = "Add";
            pillColor = "teal";
            filterGroup = "position";
          }
        } else if (pos && pos.side === "short") {
          // Buying against a short = trim or exit
          category = "trim";
          pillText = "Trim";
          pillColor = "pink";
          filterGroup = "position";
        } else {
          category = "long";
          pillText = "Long";
          pillColor = "green";
          filterGroup = "capital";
        }
      } else {
        // Sell side
        if (!inPortfolio) {
          category = "exit";
          pillText = "Exit";
          pillColor = "grey";
          filterGroup = "capital";
        } else if (pos && pos.side === "short") {
          if (g.totalQty >= pos.qty * 0.8) {
            category = "short";
            pillText = "Short";
            pillColor = "red";
            filterGroup = "capital";
          } else {
            category = "add";
            pillText = "Add";
            pillColor = "teal";
            filterGroup = "position";
          }
        } else if (pos && pos.side === "long") {
          category = "trim";
          pillText = "Trim";
          pillColor = "pink";
          filterGroup = "position";
        } else {
          category = "short";
          pillText = "Short";
          pillColor = "red";
          filterGroup = "capital";
        }
      }

      // Calculate position size as % of NAV
      const positionSize = (g.avgPrice * g.totalQty / nav * 100).toFixed(1);

      return {
        date: g.date,
        symbol: g.symbol,
        category: category,
        filterGroup: filterGroup,
        pillText: pillText,
        pillColor: pillColor,
        side: g.side,
        qty: g.totalQty,
        avgPrice: g.avgPrice,
        positionSizePct: positionSize,
        fillCount: g.fills.length,
      };
    });

    return Response.json({
      account: {
        equity: nav,
        cash: parseFloat(account.cash),
      },
      positions: Object.values(positionMap),
      exposures: exposures,
      fills: categorisedFills,
    });
  } catch (error) {
    console.error("Activity API error:", error.message || error);
    return Response.json({
      error: error.message || "Failed to fetch activity data",
      account: { equity: INITIAL_CAPITAL, cash: INITIAL_CAPITAL },
      positions: [],
      exposures: { nav: INITIAL_CAPITAL, longExposure: 0, shortExposure: 0, netPct: "0.0", grossPct: "0.0", longPct: "0.0", shortPct: "0.0", longCount: 0, shortCount: 0 },
      fills: [],
    });
  }
}
