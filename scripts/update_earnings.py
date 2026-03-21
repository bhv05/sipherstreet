"""
Sipher Street — Automated Earnings Data Pipeline
=================================================
Fetches earnings dates, consensus estimates, historical patterns, and implied
moves for every ticker currently held in the Alpaca portfolio. Outputs a
JSON file that the frontend earnings cards consume automatically.

Data sources:
  - Alpaca Trading API   → current holdings (ticker list)
  - Yahoo Finance (yfinance) → earnings dates, consensus EPS, revenue,
    historical beat/miss, company names, implied move from ATM straddle pricing

Required environment variables:
  ALPACA_API_KEY, ALPACA_SECRET_KEY

Usage:
  python scripts/update_earnings.py
"""

import os
import sys
import json
import time
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
ALPACA_BASE = "https://paper-api.alpaca.markets"
ALPACA_KEY = os.environ.get("ALPACA_API_KEY", "")
ALPACA_SECRET = os.environ.get("ALPACA_SECRET_KEY", "")

ALPACA_HEADERS = {
    "APCA-API-KEY-ID": ALPACA_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET,
}

KNOWN_ETFS = {
    "SPY", "QQQ", "IWM", "XLU", "XLF", "XLK", "XLE", "XLV", "XLI",
    "XLP", "XLY", "XLB", "XLRE", "XLC", "GLD", "SLV", "TLT", "HYG",
    "LQD", "VXX", "ARKK", "DIA", "EEM", "VTI", "VOO",
}

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
# Utility
# ---------------------------------------------------------------------------
def format_revenue(revenue_value):
    """Convert a raw revenue number into a human-friendly string like $1.48B."""
    if revenue_value is None or pd.isna(revenue_value):
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

def is_etf(symbol, ticker_obj):
    """Check whether a symbol is an ETF."""
    if symbol in KNOWN_ETFS:
        return True
    try:
        quote_type = ticker_obj.info.get("quoteType", "")
        if quote_type == "ETF":
            return True
    except Exception:
        pass
    return False


# ---------------------------------------------------------------------------
# yfinance Extraction
# ---------------------------------------------------------------------------
def get_earnings_info(symbol, ticker_obj):
    """
    Extract earnings calendar and historical surprises from yfinance.
    Returns (date, timing, eps, rev, last_q_result, last_q_surprise, beat_rate)
    """
    date_str, timing, eps, rev = None, None, None, None
    last_res, last_surp, beat_rate = None, None, None
    
    # 1. Consensus & Upcoming Date
    try:
        cal = ticker_obj.calendar
        if cal and isinstance(cal, dict):
            # Earnings Date is usually a list of datetime.date objects
            dt_list = cal.get("Earnings Date")
            if dt_list and len(dt_list) > 0:
                nxt_dt = dt_list[0]
                date_str = nxt_dt.strftime("%Y-%m-%d")
                # yfinance calendar dates usually imply AMC or BMO. We default to AMC because yfinance strips time.
                timing = "AMC"
            
            eps_val = cal.get("Earnings Average")
            if eps_val is not None and not pd.isna(eps_val):
                eps = round(float(eps_val), 2)
                
            rev_val = cal.get("Revenue Average")
            if rev_val is not None:
                rev = format_revenue(rev_val)
    except Exception as e:
        print(f"  [warn] Failed parsing calendar for {symbol}: {e}")

    # 2. Historical Surprises
    try:
        if hasattr(ticker_obj, "earnings_dates") and ticker_obj.earnings_dates is not None:
            df = ticker_obj.earnings_dates
            # df has columns: 'EPS Estimate', 'Reported EPS', 'Surprise(%)'
            # Index is typically a DatetimeIndex
            
            # Filter to past reported earnings only (where Reported EPS is not NaN)
            past = df[df["Reported EPS"].notna()].sort_index(ascending=False)
            
            if len(past) > 0:
                # Last quarter performance
                last_q = past.iloc[0]
                actual = last_q["Reported EPS"]
                estim = last_q["EPS Estimate"]
                
                if pd.notna(actual) and pd.notna(estim):
                    surp = round(float(actual - estim), 2)
                    last_surp = surp
                    if surp > 0:
                        last_res = "beat"
                    elif surp < 0:
                        last_res = "miss"
                    else:
                        last_res = "inline"
                        
                # 4-Quarter trailing beat rate
                recent_4 = past.head(4)
                beats = 0
                total = 0
                for _, row in recent_4.iterrows():
                    a = row["Reported EPS"]
                    e = row["EPS Estimate"]
                    if pd.notna(a) and pd.notna(e):
                        total += 1
                        if a > e:
                            beats += 1
                if total > 0:
                    beat_rate = f"{beats}/{total}"

    except Exception as e:
        print(f"  [warn] Failed parsing historical surprises for {symbol}: {e}")

    return date_str, timing, eps, rev, last_res, last_surp, beat_rate


def get_implied_move(symbol, ticker_obj, earnings_date_str):
    """
    Calculate earnings-specific implied move using the two-expiry isolation method.
    Compares ATM straddle prices across the earnings date to isolate the event premium.
    Falls back to historical earnings-day average move if options data unavailable.
    """
    if not earnings_date_str:
        return _historical_earnings_move(symbol, ticker_obj)

    try:
        info = ticker_obj.info or {}
        current_price = info.get("regularMarketPrice") or info.get("previousClose")

        if not current_price:
            return _historical_earnings_move(symbol, ticker_obj)

        earnings_date = datetime.strptime(earnings_date_str, "%Y-%m-%d")
        expirations = ticker_obj.options  # List of "YYYY-MM-DD" strings

        if not expirations or len(expirations) < 2:
            return _historical_earnings_move(symbol, ticker_obj)

        # Find the nearest expiry BEFORE earnings and nearest expiry AFTER earnings
        pre_expiry = None
        post_expiry = None

        for exp in expirations:
            exp_date = datetime.strptime(exp, "%Y-%m-%d")
            if exp_date < earnings_date:
                pre_expiry = exp  # Keep overwriting — last one before earnings is the closest
            elif exp_date >= earnings_date and post_expiry is None:
                post_expiry = exp  # First one on or after earnings

        # If we can't find both expiries, fall back to single-expiry method or historical
        if not pre_expiry or not post_expiry:
            if post_expiry:
                # Only have post-earnings expiry — use simple method as rough estimate
                straddle = get_atm_straddle_price(ticker_obj, post_expiry, current_price)
                if straddle:
                    return round(straddle / current_price * 100, 1)
            return _historical_earnings_move(symbol, ticker_obj)

        # Get ATM straddle prices for both expiries
        pre_straddle = get_atm_straddle_price(ticker_obj, pre_expiry, current_price)
        post_straddle = get_atm_straddle_price(ticker_obj, post_expiry, current_price)

        if pre_straddle is None or post_straddle is None:
            return _historical_earnings_move(symbol, ticker_obj)

        # Earnings-implied move = difference in straddle prices / stock price
        earnings_premium = post_straddle - pre_straddle

        if earnings_premium <= 0:
            # Negative or zero means the model can't isolate — fall back
            return _historical_earnings_move(symbol, ticker_obj)

        implied_move = round(earnings_premium / current_price * 100, 1)
        return implied_move

    except Exception as exc:
        print(f"  [warn] Options data unavailable for {symbol}: {exc}")
        return _historical_earnings_move(symbol, ticker_obj)


def get_atm_straddle_price(ticker_obj, expiry, current_price):
    """
    Get the ATM straddle mid-price for a given expiry.
    Returns the combined call + put mid-price, or None if unavailable.
    """
    try:
        chain = ticker_obj.option_chain(expiry)
        calls = chain.calls
        puts = chain.puts

        if calls.empty or puts.empty:
            return None

        # Find ATM strike (closest to current price)
        strikes = calls["strike"].values
        atm_strike = min(strikes, key=lambda x: abs(x - current_price))

        atm_call = calls[calls["strike"] == atm_strike]
        atm_put = puts[puts["strike"] == atm_strike]

        if atm_call.empty or atm_put.empty:
            return None

        call_bid = atm_call["bid"].values[0]
        call_ask = atm_call["ask"].values[0]
        put_bid = atm_put["bid"].values[0]
        put_ask = atm_put["ask"].values[0]

        # Use mid prices; skip if bid/ask are zero or nonsensical
        if call_ask <= 0 or put_ask <= 0:
            return None

        call_mid = (call_bid + call_ask) / 2
        put_mid = (put_bid + put_ask) / 2

        return call_mid + put_mid

    except Exception:
        return None


def _historical_earnings_move(symbol, ticker_obj):
    """Fallback: average absolute % move on past earnings days."""
    try:
        if not hasattr(ticker_obj, "earnings_dates") or ticker_obj.earnings_dates is None:
            return None
            
        df = ticker_obj.earnings_dates
        past = df[df["Reported EPS"].notna()].sort_index(ascending=False).head(4)
        
        if len(past) < 2:
            return None

        moves = []
        for earn_date, _ in past.iterrows():
            try:
                # earn_date is a pandas Timestamp, often tz-aware
                if earn_date.tzinfo is not None:
                    earn_date = earn_date.tz_localize(None)
                    
                start = earn_date - timedelta(days=3)
                end = earn_date + timedelta(days=3)
                hist = ticker_obj.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
                
                if len(hist) >= 2:
                    # Remove tz from hist index if present
                    if hist.index.tz is not None:
                        hist.index = hist.index.tz_localize(None)
                        
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
# Main
# ---------------------------------------------------------------------------
def build_earnings_data():
    """Assemble earnings data for every current holding and write JSON."""

    if not ALPACA_KEY or not ALPACA_SECRET:
        print("ERROR: ALPACA_API_KEY and ALPACA_SECRET_KEY must be set.")
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
            ticker_obj = yf.Ticker(symbol)
            company = ticker_obj.info.get("longName") or ticker_obj.info.get("shortName") or symbol
            etf = is_etf(symbol, ticker_obj)

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
                date_str, timing, eps, rev, last_res, last_surp, beat_rate = get_earnings_info(symbol, ticker_obj)
                
                entry["date"] = date_str
                entry["timing"] = timing
                entry["consensus_eps"] = eps
                entry["consensus_revenue"] = rev
                entry["last_quarter_result"] = last_res
                entry["last_quarter_surprise"] = last_surp
                entry["beat_rate_4q"] = beat_rate
                
                if date_str:
                    print(f"  -> Earnings: {date_str} {timing} | EPS: {eps} | Rev: {rev}")
                    print(f"  -> History: {last_res} | {beat_rate} beats")
                else:
                    print("  -> No upcoming earnings date found in Yahoo Finance")

                # Implied move
                impl = get_implied_move(symbol, ticker_obj, date_str)
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
