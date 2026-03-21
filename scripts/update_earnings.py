"""
Sipher Street — Automated Earnings Data Pipeline
=================================================
Fetches earnings dates, consensus estimates, historical patterns, and implied
moves for every ticker currently held in the Alpaca portfolio. Outputs a
JSON file that the frontend earnings cards consume automatically.

Data sources:
  - Alpaca Trading API   → current holdings (ticker list)
  - Financial Modeling Prep (FMP) → earnings dates, consensus EPS, revenue,
    historical beat/miss, company names
  - Yahoo Finance (yfinance) → implied move from ATM straddle pricing

Required environment variables:
  ALPACA_API_KEY, ALPACA_SECRET_KEY, FMP_API_KEY

Usage:
  python scripts/update_earnings.py
"""

import os
import sys
import json
import time
import requests
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Optional: yfinance for implied-move calculation (graceful fallback if missing)
# ---------------------------------------------------------------------------
try:
    import yfinance as yf
    HAS_YFINANCE = True
except ImportError:
    HAS_YFINANCE = False
    print("WARNING: yfinance not installed — implied move will use historical fallback only.")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
ALPACA_BASE = "https://paper-api.alpaca.markets"
ALPACA_KEY = os.environ.get("ALPACA_API_KEY", "")
ALPACA_SECRET = os.environ.get("ALPACA_SECRET_KEY", "")
FMP_KEY = os.environ.get("FMP_API_KEY", "")

ALPACA_HEADERS = {
    "APCA-API-KEY-ID": ALPACA_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET,
}

KNOWN_ETFS = {
    "SPY", "QQQ", "IWM", "XLU", "XLF", "XLK", "XLE", "XLV", "XLI",
    "XLP", "XLY", "XLB", "XLRE", "XLC", "GLD", "SLV", "TLT", "HYG",
    "LQD", "VXX", "ARKK", "DIA", "EEM", "VTI", "VOO",
}

# Delay between FMP calls to respect rate limits
FMP_DELAY = 0.6  # seconds

# Output path (relative to repo root)
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "earnings-data.json")


# ---------------------------------------------------------------------------
# Alpaca helpers
# ---------------------------------------------------------------------------
def fetch_alpaca(endpoint):
    """Fetch a JSON response from the Alpaca API."""
    url = f"{ALPACA_BASE}{endpoint}"
    resp = requests.get(url, headers=ALPACA_HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()


# ---------------------------------------------------------------------------
# FMP helpers
# ---------------------------------------------------------------------------
def fmp_get(path, params=None):
    """Make a request to the FMP API with the API key injected."""
    if params is None:
        params = {}
    params["apikey"] = FMP_KEY
    url = f"https://financialmodelingprep.com/api/v3/{path}"
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    time.sleep(FMP_DELAY)
    return resp.json()


def get_company_name(symbol):
    """Return the company name for a ticker from FMP profile."""
    try:
        data = fmp_get(f"profile/{symbol}")
        if data and isinstance(data, list) and len(data) > 0:
            return data[0].get("companyName", symbol)
    except Exception as exc:
        print(f"  [warn] Could not fetch company name for {symbol}: {exc}")
    return symbol


def is_etf(symbol):
    """Check whether a symbol is an ETF."""
    if symbol in KNOWN_ETFS:
        return True
    try:
        data = fmp_get(f"profile/{symbol}")
        if data and isinstance(data, list) and len(data) > 0:
            return bool(data[0].get("isEtf"))
    except Exception:
        pass
    return False


def get_earnings_date(symbol):
    """Return the next upcoming earnings date + consensus estimates for a symbol."""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        future = (datetime.now() + timedelta(days=120)).strftime("%Y-%m-%d")
        data = fmp_get("earning_calendar", {"from": today, "to": future})
        for entry in data:
            if entry.get("symbol") == symbol:
                timing = "AMC"
                time_str = str(entry.get("time", "")).lower()
                if "bmo" in time_str or "before" in time_str:
                    timing = "BMO"
                return {
                    "date": entry.get("date"),
                    "timing": timing,
                    "consensus_eps": entry.get("epsEstimated"),
                    "consensus_revenue": format_revenue(entry.get("revenueEstimated")),
                }
    except Exception as exc:
        print(f"  [warn] Could not fetch earnings date for {symbol}: {exc}")
    return None


def get_earnings_history(symbol):
    """Return last-quarter result and rolling 4-quarter beat rate."""
    try:
        data = fmp_get(f"earnings-surprises/{symbol}")
        if not data or not isinstance(data, list):
            return None

        recent = data[:4]
        last_q = recent[0] if recent else None

        last_quarter_result = None
        last_quarter_surprise = None
        if last_q:
            actual = last_q.get("actualEarningResult")
            estimated = last_q.get("estimatedEarning")
            if actual is not None and estimated is not None:
                surprise = round(actual - estimated, 2)
                if surprise > 0:
                    last_quarter_result = "beat"
                elif surprise < 0:
                    last_quarter_result = "miss"
                else:
                    last_quarter_result = "inline"
                last_quarter_surprise = surprise

        beats = 0
        total = 0
        for q in recent:
            actual = q.get("actualEarningResult")
            estimated = q.get("estimatedEarning")
            if actual is not None and estimated is not None:
                total += 1
                if actual > estimated:
                    beats += 1

        return {
            "last_quarter_result": last_quarter_result,
            "last_quarter_surprise": last_quarter_surprise,
            "beat_rate_4q": f"{beats}/{total}" if total > 0 else None,
        }
    except Exception as exc:
        print(f"  [warn] Could not fetch earnings history for {symbol}: {exc}")
    return None


# ---------------------------------------------------------------------------
# Implied move (yfinance)
# ---------------------------------------------------------------------------
def get_implied_move(symbol, earnings_date_str):
    """Calculate the implied move from the ATM straddle nearest to earnings."""
    if not earnings_date_str:
        return None

    # Try options-based calculation first
    if HAS_YFINANCE:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info or {}
            current_price = info.get("regularMarketPrice") or info.get("previousClose")
            if not current_price:
                return _historical_earnings_move(symbol)

            earnings_date = datetime.strptime(earnings_date_str, "%Y-%m-%d")
            expirations = ticker.options
            target_expiry = None
            for exp in expirations:
                exp_date = datetime.strptime(exp, "%Y-%m-%d")
                if exp_date >= earnings_date:
                    target_expiry = exp
                    break

            if not target_expiry:
                return _historical_earnings_move(symbol)

            chain = ticker.option_chain(target_expiry)
            calls = chain.calls
            puts = chain.puts
            strikes = calls["strike"].values
            atm_strike = min(strikes, key=lambda x: abs(x - current_price))

            atm_call = calls[calls["strike"] == atm_strike]
            atm_put = puts[puts["strike"] == atm_strike]
            if atm_call.empty or atm_put.empty:
                return _historical_earnings_move(symbol)

            call_mid = (atm_call["bid"].values[0] + atm_call["ask"].values[0]) / 2
            put_mid = (atm_put["bid"].values[0] + atm_put["ask"].values[0]) / 2
            straddle_pct = round((call_mid + put_mid) / current_price * 100, 1)
            return straddle_pct

        except Exception as exc:
            print(f"  [warn] Options unavailable for {symbol}: {exc}")

    return _historical_earnings_move(symbol)


def _historical_earnings_move(symbol):
    """Fallback: average absolute % move on past earnings days."""
    if not HAS_YFINANCE:
        return None
    try:
        surprises = fmp_get(f"earnings-surprises/{symbol}")
        if not surprises or len(surprises) < 2:
            return None

        ticker = yf.Ticker(symbol)
        moves = []
        for earning in surprises[:4]:
            date_str = earning.get("date")
            if not date_str:
                continue
            try:
                earn_date = datetime.strptime(date_str, "%Y-%m-%d")
                start = earn_date - timedelta(days=3)
                end = earn_date + timedelta(days=3)
                hist = ticker.history(
                    start=start.strftime("%Y-%m-%d"),
                    end=end.strftime("%Y-%m-%d"),
                )
                if len(hist) >= 2:
                    before_idx = hist.index.get_indexer([earn_date], method="ffill")[0]
                    after_idx = min(before_idx + 1, len(hist) - 1)
                    if 0 <= before_idx < len(hist) and after_idx < len(hist):
                        close_before = hist.iloc[before_idx]["Close"]
                        close_after = hist.iloc[after_idx]["Close"]
                        pct_move = abs((close_after - close_before) / close_before * 100)
                        moves.append(pct_move)
            except Exception:
                continue

        if moves:
            return round(sum(moves) / len(moves), 1)
    except Exception as exc:
        print(f"  [warn] Historical move calc failed for {symbol}: {exc}")
    return None


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------
def format_revenue(revenue_value):
    """Convert a raw revenue number into a human-friendly string like $1.48B."""
    if revenue_value is None:
        return None
    try:
        rev = float(revenue_value)
        if rev >= 1e9:
            return f"${rev / 1e9:.2f}B"
        elif rev >= 1e6:
            return f"${rev / 1e6:.0f}M"
        else:
            return f"${rev:,.0f}"
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def build_earnings_data():
    """Assemble earnings data for every current holding and write JSON."""

    if not ALPACA_KEY or not ALPACA_SECRET:
        print("ERROR: ALPACA_API_KEY and ALPACA_SECRET_KEY must be set.")
        sys.exit(1)
    if not FMP_KEY:
        print("ERROR: FMP_API_KEY must be set.")
        sys.exit(1)

    # 1) Fetch current holdings
    print("Fetching Alpaca account + positions...")
    account = fetch_alpaca("/v2/account")
    positions = fetch_alpaca("/v2/positions")
    nav = float(account["equity"])
    print(f"  NAV: ${nav:,.2f}  |  Positions: {len(positions)}")

    # 2) Process each ticker
    earnings_calendar = []

    for pos in positions:
        symbol = pos["symbol"]
        print(f"\nProcessing {symbol}...")

        try:
            company = get_company_name(symbol)
            etf = is_etf(symbol)

            entry = {
                "ticker": symbol,
                "company": company,
            }

            if etf:
                entry["is_etf"] = True
                entry["date"] = None
                entry["timing"] = None
                entry["consensus_eps"] = None
                entry["consensus_revenue"] = None
                entry["implied_move"] = None
                entry["last_quarter_result"] = None
                entry["last_quarter_surprise"] = None
                entry["beat_rate_4q"] = None
                side = "long" if float(pos["qty"]) > 0 else "short"
                entry["note"] = f"ETF, {side} position"
                print(f"  -> ETF ({side})")
            else:
                # Earnings date + consensus
                earnings = get_earnings_date(symbol)
                if earnings:
                    entry["date"] = earnings["date"]
                    entry["timing"] = earnings["timing"]
                    entry["consensus_eps"] = earnings["consensus_eps"]
                    entry["consensus_revenue"] = earnings["consensus_revenue"]
                    print(f"  -> Earnings: {earnings['date']} {earnings['timing']}")
                else:
                    entry["date"] = None
                    entry["timing"] = None
                    entry["consensus_eps"] = None
                    entry["consensus_revenue"] = None
                    print("  -> No upcoming earnings date found")

                # Historical beat/miss
                history = get_earnings_history(symbol)
                if history:
                    entry["last_quarter_result"] = history["last_quarter_result"]
                    entry["last_quarter_surprise"] = history["last_quarter_surprise"]
                    entry["beat_rate_4q"] = history["beat_rate_4q"]
                    print(f"  -> History: {history['last_quarter_result']} | {history['beat_rate_4q']} beats")
                else:
                    entry["last_quarter_result"] = None
                    entry["last_quarter_surprise"] = None
                    entry["beat_rate_4q"] = None

                # Implied move
                impl = get_implied_move(symbol, entry.get("date"))
                entry["implied_move"] = impl
                if impl:
                    print(f"  -> Implied move: ±{impl}%")

            earnings_calendar.append(entry)

        except Exception as exc:
            print(f"  ERROR: {exc}")
            earnings_calendar.append({
                "ticker": symbol,
                "company": symbol,
                "date": None,
                "error": str(exc),
            })

    # 3) Sort by date ascending (nulls last)
    def sort_key(e):
        if e.get("date"):
            return (0, e["date"])
        return (1, "9999-99-99")

    earnings_calendar.sort(key=sort_key)

    # 4) Write output JSON
    output = {
        "last_updated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total_positions": len(positions),
        "earnings_calendar": earnings_calendar,
    }

    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_PATH)), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nDone! Wrote {len(earnings_calendar)} entries to {OUTPUT_PATH}")


if __name__ == "__main__":
    build_earnings_data()
