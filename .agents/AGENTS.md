# Sipher Street Portfolio Rules

## Portfolio Risk & Alpha Metrics Calculation

When the user asks for Sharpe ratio, Sortino ratio, Jensen's Alpha, or any risk-adjusted return / alpha metrics:

1. **Dividends**: Alpaca paper trading accounts do NOT pay dividends. Always adjust the equity curve by adding hypothetical dividend income using actual ex-dates and per-share amounts from Yahoo Finance, based on shares held on each ex-date.

2. **Cash Interest**: The portfolio cash balance earned NO interest until 2026-07-29 when BOXX (Alpha Architect 1-3 Month Box ETF) was purchased. From that date onward, idle cash earns a return via BOXX. The Alpaca equity curve already reflects this (no interest before, BOXX returns after).

3. **Risk-Free Rate**: Always use actual daily SOFR rates from the NY Federal Reserve API (`https://markets.newyorkfed.org/api/rates/secured/sofr/last/500.json`) as the risk-free rate. Compound daily using ACT/360 convention.

4. **Market Benchmark (for Alpha & Beta)**: Use S&P 500 (`SPY`) as the market benchmark for CAPM regressions and Jensen's Alpha calculations ($R_p - R_f = \alpha + \beta(R_m - R_f)$).

5. **BOXX Exclusion**: The BOXX holding is a cash-equivalent tax instrument (short-term treasury yield ETF). It must be excluded from net long exposure, gross exposure, beta, and position count calculations. The exclusion logic is in `app/api/activity/route.js` via the `CASH_EQUIVALENTS` set.

6. **Calculation Scripts**:
   - Sharpe & Sortino ratios: `python3 scripts/calculate_sharpe_sortino.py`
   - Jensen's Alpha & CAPM Regression: `python3 scripts/calculate_jensens_alpha.py`

7. **Annualisation**: Use 252 trading days per year. Volatility scaled by $\sqrt{252}$, daily alpha multiplied by 252.
