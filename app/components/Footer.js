"use client";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="Sipher Street"
            width={100}
            height={28}
            style={{
              height: 28,
              width: "auto",
              objectFit: "contain",
              display: "block",
              verticalAlign: "middle",
            }}
          />
        </span>
        <span>© 2026 Sipher Street. Student-run investment fund.</span>
      </div>

      <style jsx>{`
        .site-footer {
          border-top: 1px solid #e2e8f0;
          padding: 40px 32px;
          background: #f8fafc;
        }
        .footer-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #8896a6;
        }
        @media (max-width: 768px) {
          .site-footer {
            padding: 32px 20px;
          }
          .footer-inner {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
        }
      `}</style>
    </footer>
  );
}