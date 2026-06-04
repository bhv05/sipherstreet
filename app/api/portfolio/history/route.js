import { readFileSync } from "fs";
import { join } from "path";

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

  /* Load benchmark from local benchmark-history.json file */
  try {
    const filePath = join(process.cwd(), "public", "benchmark-history.json");
    const raw = readFileSync(filePath, "utf-8");
    benchmarkSeries = JSON.parse(raw);
  } catch (benchError) {
    console.error("Local benchmark load failed:", benchError.message);
  }

  return Response.json({
    portfolio: portfolioSeries,
    benchmark: benchmarkSeries,
    dataPoints: portfolioSeries.length,
  });
}