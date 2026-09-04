"use client";
import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Strategy", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Research", href: "/pitches" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 76,
        background: scrolled
          ? "var(--bg-nav-scrolled, rgba(7, 20, 38, 0.94))"
          : "var(--bg-nav, rgba(7, 20, 38, 0.80))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Brand / Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/logo.png"
          alt="Sipher Street Capital"
          style={{
            height: 38,
            width: "auto",
            objectFit: "contain",
            display: "block",
            filter: "brightness(1.15)",
          }}
        />
      </Link>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: "#f4f3ef",
          fontSize: 22,
          cursor: "pointer",
          padding: 8,
        }}
        className="mobile-menu-btn"
        aria-label="Toggle navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Desktop Navigation + Client Portal CTA (Redirects to /contact) */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: isActive ? "#ffffff" : "rgba(244, 243, 239, 0.75)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.2s ease",
                  position: "relative",
                  paddingBottom: 4,
                  borderBottom: isActive ? "2px solid var(--accent-light)" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.color = "rgba(244, 243, 239, 0.75)";
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Vertical Divider & Client Portal Button (Redirects to Contact for LP Inquiries) */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 1,
              height: 24,
              background: "rgba(255, 255, 255, 0.18)",
            }}
          />
          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#f4f3ef",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              transition: "all 0.25s ease",
              borderRadius: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-primary)";
              e.currentTarget.style.borderColor = "var(--accent-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
          >
            <span>CLIENT PORTAL</span>
            <svg width="10" height="11" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.61651 5.88465C7.10065 5.88465 8.30821 4.6768 8.30821 3.19232C8.30821 1.70784 7.10065 0.5 5.61651 0.5C4.13237 0.5 2.9248 1.70784 2.9248 3.19232C2.9248 4.6768 4.13237 5.88465 5.61651 5.88465ZM5.61651 1.03846C6.80389 1.03846 7.76987 2.00467 7.76987 3.19232C7.76987 4.37997 6.80389 5.34618 5.61651 5.34618C4.42913 5.34618 3.46315 4.37997 3.46315 3.19232C3.46315 2.00467 4.42913 1.03846 5.61651 1.03846Z" fill="currentColor"/>
              <path d="M5.61681 6.65381C2.59806 6.65381 0.233398 7.95487 0.233398 9.61536V11.2308C0.233398 11.3795 0.353852 11.5 0.502569 11.5H10.731C10.8798 11.5 11.0002 11.3795 11.0002 11.2308V9.61536C11.0002 7.95487 8.63555 6.65381 5.61681 6.65381ZM10.4619 10.9615H0.771739V9.61536C0.771739 8.30185 2.99071 7.19227 5.61681 7.19227C8.2429 7.19227 10.4619 8.30185 10.4619 9.61536V10.9615Z" fill="currentColor"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 76,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--bg-primary)",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            zIndex: 99,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: isActive ? "var(--accent-light)" : "#f4f3ef",
                  fontSize: 16,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: isActive ? 600 : 400,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <div style={{ marginTop: 20 }}>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              CLIENT PORTAL
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 920px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (max-width: 480px) {
          nav[style] {
            padding-left: 16px !important;
            padding-right: 16px !important;
            height: 64px !important;
          }
          nav img[alt="Sipher Street Capital"] {
            height: 30px !important;
          }
        }
      `}</style>
    </nav>
  );
}
