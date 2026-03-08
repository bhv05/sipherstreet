const BASE_URL = "https://paper-api.alpaca.markets";
const DATA_URL = "https://data.alpaca.markets";
const INITIAL_CAPITAL = 100000;

async function fetchWithHeaders(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(function () { return ""; });
    throw new Error("API " + res.status + ": " + text.slice(0, 200));
  }
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

  var portfolioSeries = [];
  var benchmarkSeries = [];

  try {
    var portfolioHistory = await fetchWithHeaders(
      BASE_URL + "/v2/account/portfolio/history?period=all&timeframe=1D",
      headers
    );

    var timestamps = portfolioHistory.timestamp || [];
    var equities = portfolioHistory.equity || [];

    if (timestamps.length === 0) {
      return Response.json({ portfolio: [], benchmark: [], debug: "No timestamps returned" });
    }

    var firstEquity = equities[0];
    if (!firstEquity || firstEquity === 0) firstEquity = INITIAL_CAPITAL;

    for (var i = 0; i < timestamps.length; i++) {
      var dateStr = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      var rebasedValue = (equities[i] / firstEquity) * INITIAL_CAPITAL;
      portfolioSeries.push({ date: dateStr, value: Math.round(rebasedValue * 100) / 100 });
    }
  } catch (error) {
    return Response.json({ error: "Portfolio history: " + error.message, portfolio: [], benchmark: [] });
  }

  /* Fetch SPY benchmark - use iex feed (free tier compatible) */
  try {
    var startDate = portfolioSeries[0].date;
    var endDate = portfolioSeries[portfolioSeries.length - 1].date;

    var endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    var endDateBuffer = endDateObj.toISOString().split("T")[0];

    var spyUrl = DATA_URL + "/v2/stocks/SPY/bars?timeframe=1Day&start=" + startDate + "&end=" + endDateBuffer + "&adjustment=split&feed=iex&limit=1000";

    var spyData = await fetchWithHeaders(spyUrl, headers);
    var spyBars = spyData.bars || [];

    if (spyBars.length > 0) {
      var firstSpyClose = spyBars[0].c;
      for (var j = 0; j < spyBars.length; j++) {
        var spyDate = spyBars[j].t.split("T")[0];
        var spyRebased = (spyBars[j].c / firstSpyClose) * INITIAL_CAPITAL;
        benchmarkSeries.push({ date: spyDate, value: Math.round(spyRebased * 100) / 100 });
      }
    }
  } catch (spyError) {
    /* SPY fetch failed - still return portfolio data without benchmark */
    console.error("SPY fetch failed:", spyError.message);
  }

  return Response.json({
    portfolio: portfolioSeries,
    benchmark: benchmarkSeries,
    dataPoints: portfolioSeries.length,
  });
}