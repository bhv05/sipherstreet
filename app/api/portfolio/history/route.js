const BASE_URL = "https://paper-api.alpaca.markets";
const INITIAL_CAPITAL = 100000;
const SOFR_API = "https://markets.newyorkfed.org/api/rates/secured/sofr/last/500.json";

async function fetchWithHeaders(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(function () { return ""; });
    throw new Error("API " + res.status + ": " + text.slice(0, 200));
  }
  return res.json();
}

/**
 * Build a SOFR-compounded series rebased to $100,000.
 * Takes the portfolio start date and builds day-by-day using actual published SOFR rates.
 * SOFR is an overnight rate quoted as an annualised percentage, compounded daily using ACT/360.
 */
async function buildSofrSeries(startDate, endDate) {
  try {
    const res = await fetch(SOFR_API);
    if (!res.ok) throw new Error("SOFR API " + res.status);
    const data = await res.json();

    if (!data.refRates || data.refRates.length === 0) return [];

    // Build a map of date -> daily SOFR rate (percent)
    const sofrByDate = {};
    data.refRates.forEach(function (r) {
      if (r.type === "SOFR") {
        sofrByDate[r.effectiveDate] = r.percentRate;
      }
    });

    // Walk from startDate to endDate, compounding daily
    var series = [];
    var current = new Date(startDate + "T00:00:00Z");
    var end = new Date(endDate + "T00:00:00Z");
    var value = INITIAL_CAPITAL;
    var lastKnownRate = null;

    // Find the earliest available SOFR rate as fallback
    var sortedDates = Object.keys(sofrByDate).sort();
    if (sortedDates.length > 0) {
      lastKnownRate = sofrByDate[sortedDates[sortedDates.length - 1]];
    }

    while (current <= end) {
      var yyyy = current.getUTCFullYear();
      var mm = String(current.getUTCMonth() + 1).padStart(2, "0");
      var dd = String(current.getUTCDate()).padStart(2, "0");
      var dateStr = yyyy + "-" + mm + "-" + dd;
      var dayOfWeek = current.getUTCDay(); // 0=Sun, 6=Sat

      // Only compound on weekdays (SOFR is an overnight rate for business days)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Use the SOFR rate for this date, or carry forward the last known rate
        if (sofrByDate[dateStr] != null) {
          lastKnownRate = sofrByDate[dateStr];
        }

        if (lastKnownRate != null && series.length > 0) {
          // Compound: daily rate = annualised rate / 360 (ACT/360 convention)
          var dailyRate = lastKnownRate / 100 / 360;
          value = value * (1 + dailyRate);
        }

        series.push({
          date: dateStr,
          value: Math.round(value * 100) / 100,
        });
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return series;
  } catch (err) {
    console.error("SOFR series build failed:", err.message);
    return [];
  }
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

    var firstDate = null;
    var lastDate = null;

    for (var i = 0; i < timestamps.length; i++) {
      var dateStr = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      var rebasedValue = (equities[i] / firstEquity) * INITIAL_CAPITAL;
      portfolioSeries.push({ date: dateStr, value: Math.round(rebasedValue * 100) / 100 });

      if (i === 0) firstDate = dateStr;
      lastDate = dateStr;
    }

    // Build SOFR benchmark series covering the same date range
    if (firstDate && lastDate) {
      benchmarkSeries = await buildSofrSeries(firstDate, lastDate);
    }
  } catch (error) {
    return Response.json({ error: "Portfolio history: " + error.message, portfolio: [], benchmark: [] });
  }

  return Response.json({
    portfolio: portfolioSeries,
    benchmark: benchmarkSeries,
    dataPoints: portfolioSeries.length,
  });
}