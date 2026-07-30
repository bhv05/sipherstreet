# Sipher Street Portfolio Rules

## Portfolio Risk & Performance Metrics Calculation

When computing or displaying Sharpe ratio, Sortino ratio, Excess Return, Beta, or risk-adjusted metrics:

1. **Authoritative Equity Endpoint Choice**:
   - `GET /v2/account/portfolio/history?timeframe=1D` is the authoritative daily equity path.
   - **Rationale**: Provides the complete, point-in-time daily equity curve since inception (26 February 2026).
   - **Timestamp Conversion**: 1D timestamps are stamped at 20:00 US Eastern (00:00 UTC next day). Timestamps MUST be converted using `America/New_York` timezone to align with the correct market trading date.
   - **Explicit Date Parameters**: Always pass explicit `start` and `end` parameters (e.g. `start=2026-02-26T00:00:00Z&end=...`) to prevent Alpaca from defaulting to a 1-month window.
   - **Reconciliation Test**: Reconcile final portfolio history equity against `GET /v2/account` `equity` (warn/error if mismatch > 1.0%).

2. **SOFR Benchmark Accrual**:
   - Cash earns interest on every CALENDAR day (including weekends and holidays).
   - Accrue SOFR across calendar days using the money-market **ACT/360** convention (`sofrAnnualRate * (calendarDays / 360)` or daily compounding over calendar days).

3. **Cash Interest Adjustment (Excluding Short Proceeds)**:
   - Brokers do not credit retail accounts interest on short sale proceeds.
   - Walk every fill chronologically from inception to track `cash` and `shortProceeds`.
   - Accrue daily cash interest ONLY on uninvested long cash: `max(cash - shortProceeds, 0) * (sofrAnnualRate / 360)`.
   - Reconstructed cash balance MUST match Alpaca account `cash` within $1.

4. **Net Dividend Adjustment**:
   - `netDividendAdjustment = dividendsReceivableOnLongs - dividendsPayableOnShorts`.
   - Long positions earn dividends (+); short positions owe dividends to the lender (-).
   - Calculate both legs from actual historical ex-dates and share counts held on each ex-date by walking the fill history.

5. **Portfolio Beta & Alignment**:
   - Align portfolio daily returns and SPY benchmark returns strictly on common market trading dates (in NY timezone).
   - OLS regression of daily excess returns: $R_p - R_f = \alpha + \beta(R_m - R_f)$.
   - Compute and display the $t$-statistic on Beta (`beta / standardError(beta)`).
   - **Beta Alignment Guard**: Issue a warning/assertion if regression $R^2 < 0.05$ while absolute net exposure $> 15\%$.

6. **Calculation & Test Modules**:
   - Dynamic Calculation Module: `lib/metrics.js`
   - Unit Test Suite: `scripts/test_metrics.py` (runs cash reconciliation, SOFR day-count, beta alignment guard, short-dividend netting).

7. **Pro-Forma Disclosure**:
   - Always display the full pro-forma disclosure footnote on portfolio pages.
   - Do not display bare unevidenced alpha claims (e.g., "Top Quartile vs L/S Peers"). Display Excess Return vs SOFR with observation count, Sharpe, Sortino, and Beta with $t$-statistic.
