const BASE_URL = "https://paper-api.alpaca.markets";
const DATA_URL = "https://data.alpaca.markets";
const INITIAL_CAPITAL = 100000;

async function fetchWithHeaders(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("API error: " + res.status);
  return res.json();
}

export async function GET() {
  const apiKey = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return Response.json({ error: "Not configured", portfolio: [], benchmark: [] });
  }

  const headers = {
    "APCA-API-KEY-ID": apiKey,
    "APCA-API-SECRET-KEY": secretKey,
  };

  try {
    /*
      Fetch portfolio equity history from Alpaca.
      period=all gives us everything since account creation.
      timeframe=1D gives daily data points.
    */
    const portfolioHistory = await fetchWithHeaders(
      BASE_URL + "/v2/account/portfolio/history?period=all&timeframe=1D&intraday_reporting=market_hours&pnl_reset=per_day",
      headers
    );

    const timestamps = portfolioHistory.timestamp || [];
    const equities = portfolioHistory.equity || [];

    if (timestamps.length === 0) {
      return Response.json({ portfolio: [], benchmark: [] });
    }

    /* Build portfolio series rebased to $100,000 starting value */
    var firstEquity = equities[0];
    if (!firstEquity || firstEquity === 0) firstEquity = INITIAL_CAPITAL;

    var portfolioSeries = [];
    for (var i = 0; i < timestamps.length; i++) {
      /* Alpaca returns Unix timestamps in seconds */
      var dateStr = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      var rebasedValue = (equities[i] / firstEquity) * INITIAL_CAPITAL;
      portfolioSeries.push({ date: dateStr, value: Math.round(rebasedValue * 100) / 100 });
    }

    /*
      Fetch SPY daily bars for the same date range.
      Uses the Alpaca market data API (data.alpaca.markets).
    */
    var startDate = portfolioSeries[0].date;
    var endDate = portfolioSeries[portfolioSeries.length - 1].date;

    /* Add one day buffer to end date to ensure we get the last bar */
    var endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    var endDateBuffer = endDateObj.toISOString().split("T")[0];

    var spyUrl = DATA_URL + "/v2/stocks/SPY/bars?timeframe=1Day&start=" + startDate + "&end=" + endDateBuffer + "&adjustment=split&feed=sip&limit=1000";

    var spyData = await fetchWithHeaders(spyUrl, headers);
    var spyBars = spyData.bars || [];

    /* Rebase SPY to same $100,000 starting value */
    var benchmarkSeries = [];
    if (spyBars.length > 0) {
      var firstSpyClose = spyBars[0].c;
      for (var j = 0; j < spyBars.length; j++) {
        var spyDate = spyBars[j].t.split("T")[0];
        var spyRebased = (spyBars[j].c / firstSpyClose) * INITIAL_CAPITAL;
        benchmarkSeries.push({ date: spyDate, value: Math.round(spyRebased * 100) / 100 });
      }
    }

    return Response.json({
      portfolio: portfolioSeries,
      benchmark: benchmarkSeries,
    });
  } catch (error) {
    console.error("Portfolio history error:", error.message || error);
    return Response.json({ error: error.message, portfolio: [], benchmark: [] });
  }
}