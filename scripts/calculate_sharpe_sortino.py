"""
Sharpe & Sortino Ratio Calculator for Sipher Street Portfolio
─────────────────────────────────────────────────────────────
• Uses Alpaca portfolio equity history (daily)
• Adjusts for hypothetical dividend income (paper accounts don't receive dividends)
• Uses actual SOFR rates from NY Fed as the risk-free rate
• Accounts for the fact that idle cash earned NO interest until BOXX was purchased (2026-07-29)
"""

import requests
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import json

# ── Config ──
API_KEY = "PKKGL6NZKPRD6KGI3YNQSZLVSU"
SECRET_KEY = "3aMfBfnsVG77BSgEVg8JSt2PpjNWZLGvyVXYREQXENEf"
BASE_URL = "https://paper-api.alpaca.markets"
DATA_URL = "https://data.alpaca.markets"
SOFR_API = "https://markets.newyorkfed.org/api/rates/secured/sofr/last/500.json"
INITIAL_CAPITAL = 100000
BOXX_START_DATE = "2026-07-29"  # Date BOXX was purchased, cash starts earning from here

headers = {
    "APCA-API-KEY-ID": API_KEY,
    "APCA-API-SECRET-KEY": SECRET_KEY,
}


def fetch_portfolio_history():
    """Get daily portfolio equity from Alpaca."""
    url = f"{BASE_URL}/v2/account/portfolio/history?period=all&timeframe=1D"
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    timestamps = data.get("timestamp", [])
    equities = data.get("equity", [])
    series = []
    for i, ts in enumerate(timestamps):
        date_str = datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d")
        series.append({"date": date_str, "equity": equities[i]})
    return series


def fetch_positions():
    """Get current positions from Alpaca."""
    url = f"{BASE_URL}/v2/positions"
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()


def fetch_account():
    """Get account details."""
    url = f"{BASE_URL}/v2/account"
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()


def fetch_fills():
    """Get all fills to reconstruct position history (paginated)."""
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
        # Use the last item's id as page_token for next page
        page_token = data[-1].get("id")
        if not page_token:
            break
    return all_fills


def fetch_sofr_rates():
    """Get SOFR rates from NY Fed."""
    resp = requests.get(SOFR_API)
    resp.raise_for_status()
    data = resp.json()
    rates = {}
    for r in data.get("refRates", []):
        if r["type"] == "SOFR":
            rates[r["effectiveDate"]] = r["percentRate"]
    return rates


def reconstruct_daily_holdings(fills, portfolio_history):
    """
    Reconstruct what was held on each day by replaying fills chronologically.
    Returns: {date: {symbol: signed_qty}} for each portfolio date.
    """
    # Sort fills by date ascending
    fill_list = []
    for f in fills:
        date_str = (f.get("transaction_time") or f.get("timestamp", "")).split("T")[0]
        qty = float(f["qty"])
        side = f["side"]
        symbol = f["symbol"]
        signed_qty = qty if side == "buy" else -qty
        fill_list.append({"date": date_str, "symbol": symbol, "qty": signed_qty})

    fill_list.sort(key=lambda x: x["date"])

    # Build cumulative positions day by day
    all_dates = sorted(set(p["date"] for p in portfolio_history))
    cumulative = {}  # symbol -> total signed qty
    fill_idx = 0

    daily_holdings = {}
    for date in all_dates:
        # Apply fills that occurred on or before this date
        while fill_idx < len(fill_list) and fill_list[fill_idx]["date"] <= date:
            f = fill_list[fill_idx]
            sym = f["symbol"]
            cumulative[sym] = cumulative.get(sym, 0) + f["qty"]
            # Remove if position is closed (qty ~0)
            if abs(cumulative[sym]) < 0.001:
                del cumulative[sym]
            fill_idx += 1
        daily_holdings[date] = dict(cumulative)

    return daily_holdings


def fetch_dividend_data(symbols, start_date, end_date):
    """
    Fetch actual dividend ex-dates and amounts from yfinance.
    Returns: list of {date, symbol, dividend_per_share}
    """
    dividends = []
    for sym in symbols:
        try:
            ticker = yf.Ticker(sym)
            div_history = ticker.dividends
            if div_history is not None and len(div_history) > 0:
                for dt, amount in div_history.items():
                    date_str = dt.strftime("%Y-%m-%d")
                    if start_date <= date_str <= end_date:
                        dividends.append({
                            "date": date_str,
                            "symbol": sym,
                            "amount": float(amount),
                        })
        except Exception as e:
            print(f"  [warn] Could not fetch dividends for {sym}: {e}")
    return dividends


def fetch_daily_prices(symbols, start_date, end_date):
    """Fetch daily closing prices for position sizing."""
    prices = {}  # {symbol: {date: close_price}}
    for sym in symbols:
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(start=start_date, end=end_date, auto_adjust=True)
            sym_prices = {}
            for dt, row in hist.iterrows():
                date_str = dt.strftime("%Y-%m-%d")
                sym_prices[date_str] = float(row["Close"])
            prices[sym] = sym_prices
        except Exception as e:
            print(f"  [warn] Could not fetch prices for {sym}: {e}")
    return prices


def main():
    print("=" * 70)
    print("  SIPHER STREET — SHARPE & SORTINO RATIO CALCULATOR")
    print("=" * 70)

    # ── Step 1: Fetch raw data ──
    print("\n[1/6] Fetching portfolio history from Alpaca...")
    portfolio_history = fetch_portfolio_history()
    print(f"       → {len(portfolio_history)} daily data points")
    print(f"       → Date range: {portfolio_history[0]['date']} to {portfolio_history[-1]['date']}")

    print("[2/6] Fetching fills (trade history)...")
    fills = fetch_fills()
    print(f"       → {len(fills)} fills retrieved")

    print("[3/6] Fetching SOFR rates from NY Fed...")
    sofr_rates = fetch_sofr_rates()
    print(f"       → {len(sofr_rates)} SOFR rate observations")

    # ── Step 2: Reconstruct daily holdings ──
    print("[4/6] Reconstructing daily position holdings...")
    daily_holdings = reconstruct_daily_holdings(fills, portfolio_history)

    # Collect all symbols ever held
    all_symbols = set()
    for holdings in daily_holdings.values():
        all_symbols.update(holdings.keys())
    print(f"       → {len(all_symbols)} unique symbols traded: {', '.join(sorted(all_symbols))}")

    start_date = portfolio_history[0]["date"]
    end_date = portfolio_history[-1]["date"]

    # ── Step 3: Fetch dividends ──
    print("[5/6] Fetching dividend data from Yahoo Finance...")
    dividends = fetch_dividend_data(all_symbols, start_date, end_date)
    print(f"       → {len(dividends)} dividend events found in holding period")
    for d in dividends:
        print(f"         • {d['date']}: {d['symbol']} — ${d['amount']:.4f}/share")

    # ── Step 4: Fetch daily prices for position sizing ──
    print("[6/6] Fetching daily prices for dividend calculations...")
    daily_prices = fetch_daily_prices(all_symbols, start_date, end_date)

    # ── Step 5: Build adjusted equity curve ──
    print("\n" + "─" * 70)
    print("  BUILDING ADJUSTED EQUITY CURVE")
    print("─" * 70)

    # Build a map of dividends by date
    div_by_date = {}
    for d in dividends:
        if d["date"] not in div_by_date:
            div_by_date[d["date"]] = []
        div_by_date[d["date"]].append(d)

    # Track cumulative dividend income
    cumulative_div_income = 0.0
    adjusted_equities = []

    for day in portfolio_history:
        date = day["date"]
        equity = day["equity"]
        holdings = daily_holdings.get(date, {})

        # Add dividend income for this date
        if date in div_by_date:
            for div in div_by_date[date]:
                sym = div["symbol"]
                shares = abs(holdings.get(sym, 0))
                if shares > 0:
                    income = shares * div["amount"]
                    cumulative_div_income += income

        # Adjusted equity = Alpaca equity + cumulative dividend income
        adjusted = equity + cumulative_div_income
        adjusted_equities.append({
            "date": date,
            "raw_equity": equity,
            "adjusted_equity": adjusted,
            "div_income_cumulative": cumulative_div_income,
        })

    print(f"  Total hypothetical dividend income: ${cumulative_div_income:,.2f}")

    # ── Step 6: Calculate daily returns ──
    daily_returns = []
    daily_returns_raw = []
    for i in range(1, len(adjusted_equities)):
        prev = adjusted_equities[i - 1]["adjusted_equity"]
        curr = adjusted_equities[i]["adjusted_equity"]
        if prev > 0:
            ret = (curr - prev) / prev
            daily_returns.append({"date": adjusted_equities[i]["date"], "return": ret})

        prev_raw = adjusted_equities[i - 1]["raw_equity"]
        curr_raw = adjusted_equities[i]["raw_equity"]
        if prev_raw > 0:
            daily_returns_raw.append((curr_raw - prev_raw) / prev_raw)

    # ── Step 7: Calculate daily SOFR risk-free returns ──
    # SOFR is annualised, daily rate = SOFR / 360 (ACT/360)
    rf_daily_returns = []
    sorted_sofr_dates = sorted(sofr_rates.keys())
    last_known_sofr = None

    for dr in daily_returns:
        date = dr["date"]
        if date in sofr_rates:
            last_known_sofr = sofr_rates[date]
        elif last_known_sofr is None:
            # Find the nearest prior SOFR rate
            for sd in sorted_sofr_dates:
                if sd <= date:
                    last_known_sofr = sofr_rates[sd]

        if last_known_sofr is not None:
            rf_daily = last_known_sofr / 100 / 360
        else:
            rf_daily = 0.0
        rf_daily_returns.append(rf_daily)

    # ── Step 8: Calculate excess returns ──
    excess_returns = []
    downside_returns = []

    for i, dr in enumerate(daily_returns):
        excess = dr["return"] - rf_daily_returns[i]
        excess_returns.append(excess)
        if excess < 0:
            downside_returns.append(excess)

    excess_arr = np.array(excess_returns)
    downside_arr = np.array(downside_returns) if len(downside_returns) > 0 else np.array([0.0])

    # ── Step 9: Annualise ──
    trading_days = 252
    mean_excess_daily = np.mean(excess_arr)
    std_daily = np.std(excess_arr, ddof=1)
    downside_std_daily = np.std(downside_arr, ddof=1) if len(downside_arr) > 1 else np.std(downside_arr)

    # Annualised metrics
    mean_excess_annual = mean_excess_daily * trading_days
    std_annual = std_daily * np.sqrt(trading_days)
    downside_std_annual = downside_std_daily * np.sqrt(trading_days)

    sharpe = mean_excess_annual / std_annual if std_annual > 0 else 0
    sortino = mean_excess_annual / downside_std_annual if downside_std_annual > 0 else 0

    # ── Also calculate WITHOUT dividend adjustment for comparison ──
    excess_raw = []
    downside_raw = []
    for i, ret_raw in enumerate(daily_returns_raw):
        if i < len(rf_daily_returns):
            ex = ret_raw - rf_daily_returns[i]
            excess_raw.append(ex)
            if ex < 0:
                downside_raw.append(ex)

    excess_raw_arr = np.array(excess_raw)
    downside_raw_arr = np.array(downside_raw) if len(downside_raw) > 0 else np.array([0.0])

    mean_excess_raw = np.mean(excess_raw_arr) * trading_days
    std_raw = np.std(excess_raw_arr, ddof=1) * np.sqrt(trading_days)
    downside_std_raw = np.std(downside_raw_arr, ddof=1) * np.sqrt(trading_days) if len(downside_raw) > 1 else 0

    sharpe_raw = mean_excess_raw / std_raw if std_raw > 0 else 0
    sortino_raw = mean_excess_raw / downside_std_raw if downside_std_raw > 0 else 0

    # ── Step 10: Portfolio summary stats ──
    first_equity = adjusted_equities[0]["adjusted_equity"]
    last_equity = adjusted_equities[-1]["adjusted_equity"]
    total_return_pct = (last_equity - first_equity) / first_equity * 100

    first_raw = adjusted_equities[0]["raw_equity"]
    last_raw = adjusted_equities[-1]["raw_equity"]
    total_return_raw_pct = (last_raw - first_raw) / first_raw * 100

    # SOFR compounded return over same period
    sofr_value = INITIAL_CAPITAL
    for i in range(len(rf_daily_returns)):
        sofr_value *= (1 + rf_daily_returns[i])
    sofr_return_pct = (sofr_value - INITIAL_CAPITAL) / INITIAL_CAPITAL * 100

    # Number of trading days
    n_days = len(daily_returns)

    # Annualised return
    years = n_days / trading_days
    annual_return = ((last_equity / first_equity) ** (1 / years) - 1) * 100 if years > 0 else 0

    # Max drawdown
    peak = adjusted_equities[0]["adjusted_equity"]
    max_dd = 0
    for ae in adjusted_equities:
        if ae["adjusted_equity"] > peak:
            peak = ae["adjusted_equity"]
        dd = (ae["adjusted_equity"] - peak) / peak
        if dd < max_dd:
            max_dd = dd

    # Average SOFR rate over the period
    sofr_values_used = [sofr_rates.get(dr["date"], None) for dr in daily_returns]
    sofr_values_used = [s for s in sofr_values_used if s is not None]
    avg_sofr = np.mean(sofr_values_used) if sofr_values_used else 0

    # ── Print Results ──
    print("\n" + "=" * 70)
    print("  RESULTS")
    print("=" * 70)

    print(f"\n  Portfolio Period")
    print(f"  ├─ Start Date:          {start_date}")
    print(f"  ├─ End Date:            {end_date}")
    print(f"  ├─ Trading Days:        {n_days}")
    print(f"  └─ Years:               {years:.2f}")

    print(f"\n  Returns")
    print(f"  ├─ Alpaca Equity Return:     {total_return_raw_pct:+.2f}%")
    print(f"  ├─ + Dividend Adjustment:    +${cumulative_div_income:,.2f}")
    print(f"  ├─ Adjusted Total Return:    {total_return_pct:+.2f}%")
    print(f"  ├─ Annualised Return:        {annual_return:+.2f}%")
    print(f"  └─ SOFR Return (risk-free):  +{sofr_return_pct:.2f}%")

    print(f"\n  Risk Metrics (vs SOFR risk-free rate)")
    print(f"  ├─ Average SOFR (annualised): {avg_sofr:.2f}%")
    print(f"  ├─ Portfolio Vol (annual):     {std_annual*100:.2f}%")
    print(f"  ├─ Downside Vol (annual):      {downside_std_annual*100:.2f}%")
    print(f"  └─ Max Drawdown:               {max_dd*100:.2f}%")

    print(f"\n  ┌──────────────────────────────────────────────────────┐")
    print(f"  │  WITH DIVIDEND ADJUSTMENT                           │")
    print(f"  │  ─────────────────────────────────────               │")
    print(f"  │  Sharpe Ratio:   {sharpe:>8.3f}                          │")
    print(f"  │  Sortino Ratio:  {sortino:>8.3f}                          │")
    print(f"  │                                                      │")
    print(f"  │  WITHOUT DIVIDEND ADJUSTMENT (Alpaca raw)            │")
    print(f"  │  ─────────────────────────────────────               │")
    print(f"  │  Sharpe Ratio:   {sharpe_raw:>8.3f}                          │")
    print(f"  │  Sortino Ratio:  {sortino_raw:>8.3f}                          │")
    print(f"  └──────────────────────────────────────────────────────┘")

    print(f"\n  Notes:")
    print(f"  • Risk-free rate: Actual daily SOFR from NY Fed (avg {avg_sofr:.2f}% annualised)")
    print(f"  • Cash earned NO interest before {BOXX_START_DATE} (BOXX purchase date)")
    print(f"  • Alpaca paper accounts don't pay dividends; adjustment adds hypothetical income")
    print(f"  • Dividends are added on ex-date based on shares held at that time")
    print(f"  • Annualisation: {trading_days} trading days/year")
    print()


if __name__ == "__main__":
    main()
