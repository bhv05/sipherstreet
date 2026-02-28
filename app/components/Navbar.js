"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
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
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #111" : "1px solid transparent",
        transition: "all 0.3s",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 16,
          fontWeight: 300,
          color: "#f0f0f0",
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
          color: "#ccc",
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
              background: "none",
              border: "none",
              color: pathname === item.href ? "#10b981" : "#777",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: pathname === item.href ? 600 : 400,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (pathname !== item.href) e.target.style.color = "#ccc";
            }}
            onMouseLeave={(e) => {
              if (pathname !== item.href) e.target.style.color = "#777";
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
            background: "rgba(5,5,5,0.97)",
            borderBottom: "1px solid #1a1a1a",
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
                color: pathname === item.href ? "#10b981" : "#999",
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
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}