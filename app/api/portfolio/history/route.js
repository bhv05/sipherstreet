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
 * Accrues interest across EVERY CALENDAR DAY (including weekends & holidays) on an ACT/360 basis.
 */
async function buildSofrSeries(startDate, endDate) {
  try {
    let sofrByDate = {};
    try {
      const res = await fetch(SOFR_API);
      if (res.ok) {
        const data = await res.json();
        (data.refRates || []).forEach(function (r) {
          if (r.type === "SOFR") sofrByDate[r.effectiveDate] = r.percentRate;
        });
      }
    } catch (e) {
      console.warn("SOFR API fetch failed, using fallback flat rate 3.65%:", e);
    }

    var sortedDates = Object.keys(sofrByDate).sort();
    var lastKnownRate = sortedDates.length > 0 ? sofrByDate[sortedDates[0]] : 3.65;

    var series = [];
    var current = new Date(startDate + "T00:00:00Z");
    var end = new Date(endDate + "T00:00:00Z");
    var value = INITIAL_CAPITAL;
    var startTimestamp = current.getTime();

    while (current <= end) {
      var yyyy = current.getUTCFullYear();
      var mm = String(current.getUTCMonth() + 1).padStart(2, "0");
      var dd = String(current.getUTCDate()).padStart(2, "0");
      var dateStr = yyyy + "-" + mm + "-" + dd;

      if (sofrByDate[dateStr] != null) {
        lastKnownRate = sofrByDate[dateStr];
      } else {
        for (var i = 0; i < sortedDates.length; i++) {
          if (sortedDates[i] <= dateStr) lastKnownRate = sofrByDate[sortedDates[i]];
        }
      }

      // Accrue interest on EVERY CALENDAR DAY (ACT/360 convention)
      if (current.getTime() > startTimestamp) {
        var dailyRate = (lastKnownRate / 100) / 360;
        value = value * (1 + dailyRate);
      }

      series.push({
        date: dateStr,
        value: Math.round(value * 100) / 100,
      });

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
    const todayNY = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    var portfolioHistory = await fetchWithHeaders(
      BASE_URL + "/v2/account/portfolio/history?timeframe=1D&start=2026-02-26T00:00:00Z&end=" + todayNY + "T23:59:59Z",
      headers
    ).catch(function () {
      return fetchWithHeaders(BASE_URL + "/v2/account/portfolio/history?period=all&timeframe=1D", headers);
    });

    var timestamps = portfolioHistory.timestamp || [];
    var equities = portfolioHistory.equity || [];

    if (timestamps.length === 0) {
      return Response.json({ portfolio: [], benchmark: [], debug: "No timestamps returned" });
    }

    // Filter out initial 0.0 equity data points prior to account funding on Feb 26
    var validIndex = -1;
    for (var i = 0; i < equities.length; i++) {
      if (equities[i] && equities[i] > 1000) {
        validIndex = i;
        break;
      }
    }

    if (validIndex === -1) {
      return Response.json({ portfolio: [], benchmark: [], debug: "No valid non-zero equity points" });
    }

    var firstEquity = equities[validIndex];

    var firstDate = null;
    var lastDate = null;

    for (var j = validIndex; j < timestamps.length; j++) {
      if (!equities[j] || equities[j] <= 0) continue;
      var d = new Date(timestamps[j] * 1000);
      var dateStr = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      var rebasedValue = (equities[j] / firstEquity) * INITIAL_CAPITAL;

      if (isFinite(rebasedValue)) {
        portfolioSeries.push({ date: dateStr, value: Math.round(rebasedValue * 100) / 100 });
        if (!firstDate) firstDate = dateStr;
        lastDate = dateStr;
      }
    }

    // Build SOFR benchmark series covering the same date range across calendar days
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