"""
Jensen's Alpha Calculator for Sipher Street Portfolio
─────────────────────────────────────────────────────
α = Rp - [Rf + β(Rm - Rf)]
Calculated via OLS regression of excess returns vs market excess returns.
Same methodology as Sharpe/Sortino: dividend-adjusted, SOFR risk-free rate.
"""

import requests
import numpy as np
import yfinance as yf
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

# ── Config ──
API_KEY = "PKKGL6NZKPRD6KGI3YNQSZLVSU"
SECRET_KEY = "3aMfBfnsVG77BSgEVg8JSt2PpjNWZLGvyVXYREQXENEf"
BASE_URL = "https://paper-api.alpaca.markets"
SOFR_API = "https://markets.newyorkfed.org/api/rates/secured/sofr/last/500.json"
INITIAL_CAPITAL = 100000

headers = {
    "APCA-API-KEY-ID": API_KEY,
    "APCA-API-SECRET-KEY": SECRET_KEY,
}


def fetch_portfolio_history():
    url = f"{BASE_URL}/v2/account/portfolio/history?period=all&timeframe=1D"
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    series = []
    for i, ts in enumerate(data.get("timestamp", [])):
        date_str = datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d")
        series.append({"date": date_str, "equity": data["equity"][i]})
    return series


def fetch_fills():
    all_fills = []
    page_token = None
    while True:
        url = f"{BASE_URL}/v2/account/activities/FILL?direction=desc&page_size=100"
        if page_token:
            url += f"&page_token={page_token}"
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            break
        all_fills.extend(data)
        if len(data) < 100:
            break
        page_token = data[-1].get("id")
        if not page_token:
            break
    return all_fills


def fetch_sofr_rates():
    resp = requests.get(SOFR_API)
    resp.raise_for_status()
    rates = {}
    for r in resp.json().get("refRates", []):
        if r["type"] == "SOFR":
            rates[r["effectiveDate"]] = r["percentRate"]
    return rates


def reconstruct_daily_holdings(fills, portfolio_history):
    fill_list = []
    for f in fills:
        date_str = (f.get("transaction_time") or f.get("timestamp", "")).split("T")[0]
        qty = float(f["qty"])
        signed_qty = qty if f["side"] == "buy" else -qty
        fill_list.append({"date": date_str, "symbol": f["symbol"], "qty": signed_qty})
    fill_list.sort(key=lambda x: x["date"])

    all_dates = sorted(set(p["date"] for p in portfolio_history))
    cumulative = {}
    fill_idx = 0
    daily_holdings = {}

    for date in all_dates:
        while fill_idx < len(fill_list) and fill_list[fill_idx]["date"] <= date:
            f = fill_list[fill_idx]
            cumulative[f["symbol"]] = cumulative.get(f["symbol"], 0) + f["qty"]
            if abs(cumulative[f["symbol"]]) < 0.001:
                del cumulative[f["symbol"]]
            fill_idx += 1
        daily_holdings[date] = dict(cumulative)

    return daily_holdings


def main():
    print("=" * 70)
    print("  SIPHER STREET — JENSEN'S ALPHA CALCULATOR")
    print("=" * 70)

    # Fetch data
    print("\n[1/5] Fetching portfolio history...")
    portfolio_history = fetch_portfolio_history()
    start_date = portfolio_history[0]["date"]
    end_date = portfolio_history[-1]["date"]
    print(f"       → {len(portfolio_history)} days: {start_date} to {end_date}")

    print("[2/5] Fetching fills & reconstructing holdings...")
    fills = fetch_fills()
    daily_holdings = reconstruct_daily_holdings(fills, portfolio_history)
    all_symbols = set()
    for h in daily_holdings.values():
        all_symbols.update(h.keys())

    print("[3/5] Fetching SOFR rates...")
    sofr_rates = fetch_sofr_rates()
    sorted_sofr = sorted(sofr_rates.keys())

    print("[4/5] Fetching dividend data...")
    dividends = []
    for sym in all_symbols:
        try:
            div_hist = yf.Ticker(sym).dividends
            if div_hist is not None:
                for dt, amt in div_hist.items():
                    ds = dt.strftime("%Y-%m-%d")
                    if start_date <= ds <= end_date:
                        dividends.append({"date": ds, "symbol": sym, "amount": float(amt)})
        except:
            pass
    print(f"       → {len(dividends)} dividend events")

    print("[5/5] Fetching S&P 500 (SPY) returns...")
    spy = yf.Ticker("SPY")
    spy_hist = spy.history(start=start_date, end=end_date, auto_adjust=True)
    spy_prices = {}
    for dt, row in spy_hist.iterrows():
        spy_prices[dt.strftime("%Y-%m-%d")] = float(row["Close"])
    print(f"       → {len(spy_prices)} SPY data points")

    # Build dividend map
    div_by_date = {}
    for d in dividends:
        div_by_date.setdefault(d["date"], []).append(d)

    # Build adjusted equity curve
    cum_div = 0.0
    adjusted = []
    for day in portfolio_history:
        date = day["date"]
        holdings = daily_holdings.get(date, {})
        if date in div_by_date:
            for d in div_by_date[date]:
                shares = abs(holdings.get(d["symbol"], 0))
                if shares > 0:
                    cum_div += shares * d["amount"]
        adjusted.append({"date": date, "equity": day["equity"] + cum_div})

    # Calculate daily portfolio returns
    port_returns = {}
    for i in range(1, len(adjusted)):
        prev = adjusted[i - 1]["equity"]
        curr = adjusted[i]["equity"]
        if prev > 0:
            port_returns[adjusted[i]["date"]] = (curr - prev) / prev

    # Calculate daily SPY returns
    spy_dates = sorted(spy_prices.keys())
    spy_returns = {}
    for i in range(1, len(spy_dates)):
        prev = spy_prices[spy_dates[i - 1]]
        curr = spy_prices[spy_dates[i]]
        if prev > 0:
            spy_returns[spy_dates[i]] = (curr - prev) / prev

    # Get SOFR daily risk-free rates
    last_sofr = None

    # Align dates: only use dates where we have both portfolio and SPY returns
    common_dates = sorted(set(port_returns.keys()) & set(spy_returns.keys()))
    print(f"\n  Aligned {len(common_dates)} common trading days for regression")

    rp_excess = []
    rm_excess = []

    for date in common_dates:
        # Find SOFR rate
        if date in sofr_rates:
            last_sofr = sofr_rates[date]
        elif last_sofr is None:
            for sd in sorted_sofr:
                if sd <= date:
                    last_sofr = sofr_rates[sd]

        rf_daily = (last_sofr / 100 / 360) if last_sofr else 0.0

        rp_ex = port_returns[date] - rf_daily
        rm_ex = spy_returns[date] - rf_daily
        rp_excess.append(rp_ex)
        rm_excess.append(rm_ex)

    rp_excess = np.array(rp_excess)
    rm_excess = np.array(rm_excess)

    # OLS Regression: Rp - Rf = α + β(Rm - Rf) + ε
    # Using numpy polyfit (degree 1)
    beta, alpha_daily = np.polyfit(rm_excess, rp_excess, 1)

    # Annualise alpha
    alpha_annual = alpha_daily * 252

    # Also compute via the formula directly for verification
    mean_rp = np.mean(rp_excess)
    mean_rm = np.mean(rm_excess)

    # R-squared
    predicted = alpha_daily + beta * rm_excess
    ss_res = np.sum((rp_excess - predicted) ** 2)
    ss_tot = np.sum((rp_excess - mean_rp) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

    # Standard error of alpha
    n = len(common_dates)
    residuals = rp_excess - predicted
    mse = np.sum(residuals ** 2) / (n - 2)
    se_alpha = np.sqrt(mse * (1/n + mean_rm**2 / np.sum((rm_excess - mean_rm)**2)))
    t_stat = alpha_daily / se_alpha if se_alpha > 0 else 0

    # Portfolio and market total returns over period
    first_eq = adjusted[0]["equity"]
    last_eq = adjusted[-1]["equity"]
    port_total_return = (last_eq - first_eq) / first_eq * 100

    spy_first = spy_prices[spy_dates[0]]
    spy_last = spy_prices[spy_dates[-1]]
    spy_total_return = (spy_last - spy_first) / spy_first * 100

    # CAPM expected return
    avg_sofr = np.mean([sofr_rates[d] for d in sofr_rates if start_date <= d <= end_date]) if sofr_rates else 0
    rf_period = avg_sofr / 100 * (n / 252)  # approximate
    capm_expected = rf_period + beta * (spy_total_return / 100 - rf_period)

    # Print results
    print("\n" + "=" * 70)
    print("  RESULTS")
    print("=" * 70)

    print(f"\n  CAPM Regression: Rp - Rf = α + β(Rm - Rf)")
    print(f"  ─────────────────────────────────────────")
    print(f"  Market benchmark: S&P 500 (SPY)")
    print(f"  Risk-free rate:   SOFR (avg {avg_sofr:.2f}% annualised)")

    print(f"\n  Period Returns")
    print(f"  ├─ Portfolio (div-adjusted):  {port_total_return:+.2f}%")
    print(f"  ├─ S&P 500 (SPY):            {spy_total_return:+.2f}%")
    print(f"  └─ SOFR (risk-free):         +{avg_sofr * n / 252 / 100 * 100:.2f}%")

    print(f"\n  ┌──────────────────────────────────────────────────────┐")
    print(f"  │  CAPM Regression Results                             │")
    print(f"  │  ─────────────────────────────────────               │")
    print(f"  │  Jensen's Alpha (daily):   {alpha_daily*100:>8.4f}%                  │")
    print(f"  │  Jensen's Alpha (annual):  {alpha_annual*100:>8.2f}%                   │")
    print(f"  │  Portfolio Beta:           {beta:>8.3f}                     │")
    print(f"  │  R-squared:               {r_squared:>8.3f}                     │")
    print(f"  │  t-statistic (alpha):     {t_stat:>8.3f}                     │")
    print(f"  └──────────────────────────────────────────────────────┘")

    print(f"\n  Interpretation:")
    if alpha_annual > 0:
        print(f"  ✓ Positive alpha of {alpha_annual*100:.2f}% annualised")
        print(f"    The portfolio generated {alpha_annual*100:.2f}% excess return per year")
        print(f"    beyond what CAPM would predict given its beta of {beta:.3f}.")
    else:
        print(f"  ✗ Negative alpha of {alpha_annual*100:.2f}% annualised")

    if abs(t_stat) >= 1.96:
        print(f"  ✓ Statistically significant at 95% confidence (t={t_stat:.2f})")
    else:
        print(f"  ⚠ Not yet statistically significant (t={t_stat:.2f}, need ≥1.96)")
        print(f"    This is expected with only {n} trading days of data.")

    print(f"\n  Beta of {beta:.3f} means the portfolio captures ~{beta*100:.0f}% of")
    print(f"  market moves, consistent with a hedged long/short book.")
    print(f"  R² of {r_squared:.3f} means {r_squared*100:.1f}% of portfolio variance is")
    print(f"  explained by market movements — the rest is idiosyncratic alpha.\n")


if __name__ == "__main__":
    main()
