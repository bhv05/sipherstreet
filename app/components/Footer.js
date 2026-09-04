"use client";
import { Link } from "next-view-transitions";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand & Partnership */}
        <div className="footer-col footer-brand" style={{ maxWidth: 360 }}>
          <img
            src="/logo.png"
            alt="Sipher Street Capital"
            width={34}
            height={34}
            style={{
              height: 34,
              width: 34,
              objectFit: "contain",
              display: "block",
              filter: "brightness(1.2)",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.7)", lineHeight: 1.7, marginBottom: 20 }}>
            Sipher Street Capital is an independent investment partnership deploying concentrated long/short equity strategies across global markets.
          </p>
          <span className="footer-copy">
            © 2026 Sipher Street Capital. All rights reserved.
          </span>
        </div>

        {/* Navigation */}
        <div className="footer-col">
          <div className="footer-heading">Navigation</div>
          <Link href="/about" className="footer-link">Strategy & Culture</Link>
          <Link href="/portfolio" className="footer-link">Live Portfolio</Link>
          <Link href="/pitches" className="footer-link">Research & Pitches</Link>
          <Link href="/team" className="footer-link">Our People</Link>
          <Link href="/contact" className="footer-link">Investor Enquiries</Link>
        </div>

        {/* Fund Architecture & Terms */}
        <div className="footer-col">
          <div className="footer-heading">Fund Architecture</div>
          <div className="footer-term">
            <span className="footer-term-label">Management Fee</span>
            <span className="footer-term-value">1.00%</span>
          </div>
          <div className="footer-term">
            <span className="footer-term-label">Performance Fee</span>
            <span className="footer-term-value">17.50%</span>
          </div>
          <div className="footer-term">
            <span className="footer-term-label">Strategy</span>
            <span className="footer-term-value">Long / Short Equity</span>
          </div>
          <div className="footer-term">
            <span className="footer-term-label">Benchmark</span>
            <span className="footer-term-value">SOFR</span>
          </div>
          <div className="footer-term">
            <span className="footer-term-label">Co-Investment</span>
            <span className="footer-term-value">$10k Partner AUM</span>
          </div>
        </div>
      </div>

      {/* Institutional Legal & Regulatory Footnote */}
      <div className="footer-disclaimer">
        <p>
          Past performance is no guarantee of future results. All figures, including Rebased NAV, returns, and ratios, are computed pro-forma from live brokerage trade executions and point-in-time equity curves since inception (26 February 2026). Cash interest is calculated strictly on uninvested long cash at SOFR using ACT/360 money-market conventions, excluding short sale proceeds. Dividends are reconciled net of borrow charges on short positions. This website does not constitute an offer of investment advisory services or a solicitation to buy securities in any jurisdiction.
        </p>
      </div>

      <style jsx>{`
        .site-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 64px 40px 36px;
          background: var(--bg-primary);
          color: #f4f3ef;
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 1.4fr 0.8fr 1.1fr;
          gap: 56px;
          max-width: 1160px;
          margin: 0 auto;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
        }
        .footer-copy {
          font-size: 12px;
          color: rgba(244, 243, 239, 0.5);
        }
        .footer-heading {
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-bottom: 20px;
        }
        .footer-link {
          font-size: 13px;
          color: rgba(244, 243, 239, 0.72);
          margin-bottom: 12px;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #ffffff;
        }
        .footer-term {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          gap: 12px;
        }
        .footer-term:last-child {
          border-bottom: none;
        }
        .footer-term-label {
          font-size: 12px;
          color: rgba(244, 243, 239, 0.65);
        }
        .footer-term-value {
          font-size: 12px;
          color: #ffffff;
          font-weight: 600;
        }
        .footer-disclaimer {
          max-width: 1160px;
          margin: 48px auto 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .footer-disclaimer p {
          font-size: 11px;
          color: rgba(244, 243, 239, 0.45);
          line-height: 1.7;
          letter-spacing: 0.01em;
        }
        @media (max-width: 860px) {
          .site-footer {
            padding: 48px 24px 28px;
          }
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }
        @media (max-width: 480px) {
          .site-footer {
            padding: 36px 16px 24px;
          }
        }
      `}</style>
    </footer>
  );
}
