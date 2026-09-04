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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouch = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouch;
      };
    }
  }, [menuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleNavClick = (href) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.dispatchEvent(new CustomEvent("sipher-nav-reset", { detail: { href } }));
    }
  };

  return (
    <>
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
        <Link
          href="/"
          onClick={() => handleNavClick("/")}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
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
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
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
                  onClick={() => handleNavClick(item.href)}
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
      </nav>

      {/* Mobile Navigation Drawer — Rendered as Top-Layer Sibling with Solid Frosted Backdrop */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100vh",
            height: "100dvh",
            zIndex: 999999,
            background: "rgba(5, 14, 26, 0.985)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            display: "flex",
            flexDirection: "column",
            color: "#f4f3ef",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            animation: "mobileFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Top Bar Header inside Drawer matching Nav height */}
          <div
            className="mobile-drawer-header"
            style={{
              height: 64,
              minHeight: 64,
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
              background: "rgba(7, 20, 38, 0.96)",
            }}
          >
            <Link
              href="/"
              onClick={() => {
                handleNavClick("/");
                setMenuOpen(false);
              }}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <img
                src="/logo.png"
                alt="Sipher Street Capital"
                style={{
                  height: 30,
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  filter: "brightness(1.15)",
                }}
              />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#f4f3ef",
                fontSize: 24,
                cursor: "pointer",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>

          {/* Drawer Body with Navigation Links & CTAs */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "24px 24px 36px",
              maxWidth: 480,
              width: "100%",
              margin: "0 auto",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      handleNavClick(item.href);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 0",
                      color: isActive ? "var(--accent-light, #38bdf8)" : "#f4f3ef",
                      fontSize: 15,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 600 : 400,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "color 0.15s ease",
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "var(--accent-light, #38bdf8)",
                          letterSpacing: "0.12em",
                          padding: "2px 8px",
                          borderRadius: 2,
                          background: "rgba(56, 189, 248, 0.12)",
                          border: "1px solid rgba(56, 189, 248, 0.25)",
                        }}
                      >
                        CURRENT
                      </span>
                    ) : (
                      <span style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.28)" }}>›</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* CTAs */}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="btn-primary"
                style={{
                  width: "100%",
                  textAlign: "center",
                  justifyContent: "center",
                  padding: "14px 20px",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  fontWeight: 600,
                  boxSizing: "border-box",
                }}
              >
                CLIENT PORTAL
              </Link>
              <Link
                href="/pitches"
                onClick={() => setMenuOpen(false)}
                className="btn-dark-outline"
                style={{
                  width: "100%",
                  textAlign: "center",
                  justifyContent: "center",
                  padding: "14px 20px",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  fontWeight: 500,
                  boxSizing: "border-box",
                }}
              >
                OUR RESEARCH
              </Link>
            </div>

            {/* Institutional Tagline */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 32,
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(244, 243, 239, 0.45)", textTransform: "uppercase" }}>
                Sipher Street Capital · Mayfair, London
              </div>
              <div style={{ fontSize: 11, color: "rgba(244, 243, 239, 0.32)" }}>
                Institutional Long/Short Equity Partnership
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes mobileFadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
          .mobile-drawer-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
