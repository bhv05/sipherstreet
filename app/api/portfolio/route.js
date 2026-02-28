const BASE_URL = "https://paper-api.alpaca.markets";

const headers = {
  "APCA-API-KEY-ID": process.env.ALPACA_API_KEY,
  "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY,
  "Content-Type": "application/json",
};

async function fetchAlpaca(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Alpaca API error: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    // Fetch account info and positions in parallel
    const [account, positions] = await Promise.all([
      fetchAlpaca("/v2/account"),
      fetchAlpaca("/v2/positions"),
    ]);

    // Format positions data
    const formattedPositions = positions.map((p) => ({
      symbol: p.symbol,
      qty: parseFloat(p.qty),
      side: parseFloat(p.qty) > 0 ? "LONG" : "SHORT",
      avgCost: parseFloat(p.avg_entry_price),
      currentPrice: parseFloat(p.current_price),
      marketValue: parseFloat(p.market_value),
      pl: parseFloat(p.unrealized_pl),
      plPct: parseFloat(p.unrealized_plpc) * 100,
    }));

    // Build response
    const data = {
      equity: parseFloat(account.equity),
      cash: parseFloat(account.cash),
      totalValue: parseFloat(account.portfolio_value),
      dayPL: parseFloat(account.equity) - parseFloat(account.last_equity),
      dayPLPct:
        ((parseFloat(account.equity) - parseFloat(account.last_equity)) /
          parseFloat(account.last_equity)) *
        100,
      totalPL:
        parseFloat(account.equity) - parseFloat(account.initial_margin || 100000),
      positions: formattedPositions,
    };

    return Response.json(data);
  } catch (error) {
    console.error("Alpaca API error:", error);
    return Response.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}