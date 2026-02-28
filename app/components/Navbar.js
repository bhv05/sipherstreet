"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pitches", href: "/pitches" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
        transition: "all 0.3s",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 16,
          fontWeight: 300,
          color: "#1a2a44",
          letterSpacing: "0.05em",
        }}
      >
        SIPHER<span style={{ fontWeight: 700 }}>STREET</span>
      </Link>

      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: "#1a2a44",
          fontSize: 24,
          cursor: "pointer",
        }}
        className="mobile-menu-btn"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Desktop Navigation */}
      <div style={{ display: "flex", gap: 32 }} className="desktop-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: pathname === item.href ? "#1e3a5f" : "#8896a6",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: pathname === item.href ? 600 : 400,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (pathname !== item.href) e.target.style.color = "#1a2a44";
            }}
            onMouseLeave={(e) => {
              if (pathname !== item.href) e.target.style.color = "#8896a6";
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "rgba(255,255,255,0.98)",
            borderBottom: "1px solid #e2e8f0",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: pathname === item.href ? "#1e3a5f" : "#5a6a7e",
                fontSize: 14,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}