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
    lastUpdated: new Date().toISOString(),
  });
}

async function fetchAlpaca(endpoint, headers) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`);
  return res.json();
}

export async function GET() {
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
    const [account, positions] = await Promise.all([
      fetchAlpaca("/v2/account", headers),
      fetchAlpaca("/v2/positions", headers),
    ]);

    // Fetch asset names for each position
    const assetPromises = positions.map((p) =>
      fetchAlpaca(`/v2/assets/${p.symbol}`, headers).catch(() => ({ name: p.symbol }))
    );
    const assets = await Promise.all(assetPromises);

    const totalPortfolioValue = parseFloat(account.portfolio_value);
    const equity = parseFloat(account.equity);
    const cash = parseFloat(account.cash);
    const totalReturnPct = ((equity - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

    const formattedPositions = positions.map((p, i) => {
      const marketValue = parseFloat(p.market_value);
      const costBasis = parseFloat(p.cost_basis);
      const totalReturn = costBasis !== 0 ? ((marketValue - costBasis) / Math.abs(costBasis)) * 100 : 0;

      return {
        company: assets[i]?.name || p.symbol,
        symbol: p.symbol,
        qty: parseFloat(p.qty),
        side: parseFloat(p.qty) > 0 ? "LONG" : "SHORT",
        costBasis: parseFloat(p.avg_entry_price),
        currentPrice: parseFloat(p.current_price),
        positionSize: Math.abs(marketValue),
        allocation: (Math.abs(marketValue) / totalPortfolioValue) * 100,
        totalReturn: totalReturn,
        pl: parseFloat(p.unrealized_pl),
        changeToday: parseFloat(p.change_today) * 100 || 0,
      };
    });

    formattedPositions.sort((a, b) => b.allocation - a.allocation);

    const data = {
      equity,
      cash,
      totalValue: totalPortfolioValue,
      initialCapital: INITIAL_CAPITAL,
      totalReturnPct,
      positions: formattedPositions,
      lastUpdated: new Date().toISOString(),
    };

    return Response.json(data);
  } catch (error) {
    console.error("Alpaca API error:", error.message || error);
    return fallbackResponse();
  }
}