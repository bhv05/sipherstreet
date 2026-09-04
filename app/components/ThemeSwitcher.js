"use client";

import { useEffect, useState, useRef } from "react";

export const PALETTES = [
  {
    key: "slate",
    name: "Slate & Terracotta",
    category: "Heritage",
    badge: "Original",
    tagline: "British Forest Slate, Rich Slate Surfaces & Warm Terracotta",
    baseColor: "#00232c",
    surfaceColor: "#072e38",
    accentColor: "#d56d4a",
    textColor: "#f4f3ef",
  },
  {
    key: "navy",
    name: "Mayfair Midnight & Gold",
    category: "Sovereign & Macro",
    badge: "Prestige",
    tagline: "Midnight Navy, Royal Navy Surfaces & Champagne Gold",
    baseColor: "#07131e",
    surfaceColor: "#0e2236",
    accentColor: "#d4af37",
    textColor: "#f8f7f4",
  },
  {
    key: "forest",
    name: "Savile Row Forest & Bronze",
    category: "Heritage",
    badge: "Heritage",
    tagline: "Deep Black Emerald, Spruce Surfaces & Burnished Bronze",
    baseColor: "#071815",
    surfaceColor: "#0e2823",
    accentColor: "#c98a58",
    textColor: "#f4f6f3",
  },
  {
    key: "obsidian",
    name: "Obsidian & Ice Platinum",
    category: "Modern & Quant",
    badge: "Quant",
    tagline: "Charcoal Obsidian, Carbon Surfaces & Electric Cyan",
    baseColor: "#0a0c10",
    surfaceColor: "#13171f",
    accentColor: "#38bdf8",
    textColor: "#ffffff",
  },
  {
    key: "cordovan",
    name: "Cordovan & Warm Amber",
    category: "Heritage",
    badge: "Bespoke",
    tagline: "Deep Cordovan Oxblood, Espresso Wine & Glowing Amber",
    baseColor: "#140b0f",
    surfaceColor: "#201218",
    accentColor: "#d98850",
    textColor: "#fbf8f5",
  },
  {
    key: "cognac",
    name: "Kensington Espresso & Cognac",
    category: "Heritage",
    badge: "Merchant",
    tagline: "Aged Walnut Peat, Espresso Dark & Vintage Amber Caramel",
    baseColor: "#15100c",
    surfaceColor: "#231b14",
    accentColor: "#df9244",
    textColor: "#faf6ee",
  },
  {
    key: "alpine",
    name: "Swiss Vault & Alpine Mint",
    category: "Sovereign & Macro",
    badge: "Geneva",
    tagline: "Swiss Private Bank Slate, Alpine Granite & Luminous Mint",
    baseColor: "#0c1514",
    surfaceColor: "#142422",
    accentColor: "#2dd4bf",
    textColor: "#f2f5f4",
  },
  {
    key: "azure",
    name: "Monaco Sovereign & Azure",
    category: "Sovereign & Macro",
    badge: "Riviera",
    tagline: "Mediterranean Deep Sapphire, Maritime Cobalt & Azure",
    baseColor: "#071426",
    surfaceColor: "#0c223f",
    accentColor: "#60a5fa",
    textColor: "#f8fafc",
  },
  {
    key: "manhattan",
    name: "Manhattan & Rose Copper",
    category: "Modern & Quant",
    badge: "Park Ave",
    tagline: "Park Avenue Graphite Noir, Titanium Slate & Rose Copper",
    baseColor: "#0e0e11",
    surfaceColor: "#181820",
    accentColor: "#e08c79",
    textColor: "#faf8f7",
  },
  {
    key: "nordic",
    name: "Nordic Aurora & Glacial Petrol",
    category: "Sovereign & Macro",
    badge: "Sovereign",
    tagline: "Scandinavian Sovereign Wealth Petrol & Aurora Emerald",
    baseColor: "#06131a",
    surfaceColor: "#0b212d",
    accentColor: "#38e1b6",
    textColor: "#f0fdfa",
  },
];

const CATEGORIES = ["All", "Heritage", "Sovereign & Macro", "Modern & Quant"];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("azure");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const drawerRef = useRef(null);

  // Initialize theme from localStorage or default to slate
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sipher_theme");
      if (saved && PALETTES.some((p) => p.key === saved)) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "azure");
      }
    } catch {
      // Fallback if localStorage unavailable
    }
  }, []);

  const selectTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    try {
      localStorage.setItem("sipher_theme", themeKey);
    } catch {}
    document.documentElement.setAttribute("data-theme", themeKey);
  };

  const cycleTheme = () => {
    const currentIndex = PALETTES.findIndex((p) => p.key === currentTheme);
    const nextIndex = (currentIndex + 1) % PALETTES.length;
    selectTheme(PALETTES[nextIndex].key);
  };

  // Keyboard shortcut: Press 'p' or 'P' to cycle themes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }
      if (e.key === "p" || e.key === "P") {
        cycleTheme();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTheme]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activePalette = PALETTES.find((p) => p.key === currentTheme) || PALETTES[0];

  const filteredPalettes =
    activeCategory === "All"
      ? PALETTES
      : PALETTES.filter((p) => p.category === activeCategory);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title="Open Palette Switcher (Press P to cycle)"
        style={{
          position: "fixed",
          bottom: 18,
          left: 18,
          zIndex: 9999,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-light)",
          color: "var(--accent-light)",
          borderRadius: 20,
          padding: "6px 12px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 7,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          backdropFilter: "blur(14px)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: activePalette.accentColor,
            boxShadow: `0 0 6px ${activePalette.accentColor}`,
          }}
        />
        <span>PALETTE (10)</span>
      </button>
    );
  }

  return (
    <div
      ref={drawerRef}
      style={{
        position: "fixed",
        bottom: 18,
        left: 18,
        zIndex: 9999,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Floating Main Capsule Pill */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-light)",
          borderRadius: 4,
          padding: "6px 8px 6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(16px)",
          color: "var(--text-primary)",
        }}
      >
        {/* Swatch indicator dot */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: activePalette.accentColor,
              boxShadow: `0 0 8px ${activePalette.accentColor}`,
              display: "inline-block",
            }}
          />
        </div>

        {/* Current Theme Label Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "2px 0",
          }}
          title="Click to view all 10 curated palettes"
        >
          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>PALETTE:</span>
          <span style={{ color: "var(--accent-light)" }}>{activePalette.name}</span>
          <span
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              background: "rgba(255,255,255,0.08)",
              padding: "1px 5px",
              borderRadius: 2,
            }}
          >
            {PALETTES.findIndex((p) => p.key === currentTheme) + 1}/10
          </span>
          <span style={{ fontSize: 9, color: "var(--text-muted)", marginLeft: 2 }}>
            {isOpen ? "▲" : "▼"}
          </span>
        </button>

        {/* Quick Cycle Button */}
        <button
          onClick={cycleTheme}
          style={{
            background: "var(--bg-subsurface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            borderRadius: 2,
            padding: "4px 8px",
            fontSize: 10.5,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.2s ease",
          }}
          title="Cycle to next palette (or press keyboard key 'P')"
        >
          <span style={{ fontSize: 11 }}>↻</span>
          <span>Next</span>
          <span
            style={{
              fontSize: 9,
              padding: "1px 4px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              marginLeft: 2,
              color: "var(--text-muted)",
            }}
          >
            P
          </span>
        </button>

        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          title="Minimize switcher pill"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Expanded Palette Selector Modal / Drawer */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: 0,
            width: 480,
            maxWidth: "calc(100vw - 36px)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-light)",
            borderRadius: 4,
            padding: "18px 20px",
            boxShadow: "0 20px 48px rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(24px)",
            color: "var(--text-primary)",
            animation: "fadeInUp 0.2s ease forwards",
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
              borderBottom: "1px solid var(--border)",
              paddingBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--accent-light)",
                }}
              >
                Institutional Palettes (10)
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Curated high-conviction aesthetics across global hedge funds
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "4px 10px",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 2,
                  border:
                    activeCategory === cat
                      ? "1px solid var(--accent-light)"
                      : "1px solid var(--border)",
                  background:
                    activeCategory === cat ? "var(--bg-subsurface)" : "transparent",
                  color:
                    activeCategory === cat ? "var(--accent-light)" : "var(--text-muted)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Palette List Scrollable */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "52vh",
              paddingRight: 4,
              display: "flex",
              flexDirection: "column",
              gap: 7,
              marginBottom: 12,
            }}
          >
            {filteredPalettes.map((palette) => {
              const isSelected = palette.key === currentTheme;
              return (
                <div
                  key={palette.key}
                  onClick={() => selectTheme(palette.key)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 3,
                    background: isSelected ? "var(--bg-subsurface)" : "transparent",
                    border: isSelected
                      ? `1px solid ${palette.accentColor}`
                      : "1px solid var(--border)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    {/* Swatch Pill (Base, Surface, Accent) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: 18,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.2)",
                        width: 44,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          height: "100%",
                          background: palette.baseColor,
                        }}
                        title={`Base: ${palette.baseColor}`}
                      />
                      <span
                        style={{
                          flex: 1,
                          height: "100%",
                          background: palette.surfaceColor,
                        }}
                        title={`Surface: ${palette.surfaceColor}`}
                      />
                      <span
                        style={{
                          flex: 1,
                          height: "100%",
                          background: palette.accentColor,
                        }}
                        title={`Accent: ${palette.accentColor}`}
                      />
                    </div>

                    {/* Name & Tagline */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? palette.accentColor : "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{palette.name}</span>
                        {palette.badge && (
                          <span
                            style={{
                              fontSize: 8.5,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              padding: "1px 5px",
                              borderRadius: 2,
                              background: isSelected
                                ? "rgba(255,255,255,0.14)"
                                : "rgba(255,255,255,0.05)",
                              color: isSelected ? "#ffffff" : "var(--text-muted)",
                            }}
                          >
                            {palette.badge}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginTop: 2,
                          lineHeight: 1.25,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {palette.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isSelected && (
                    <span
                      style={{
                        fontSize: 13,
                        color: palette.accentColor,
                        fontWeight: 700,
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Controls: Reset & Shortcut Hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border)",
              paddingTop: 10,
              fontSize: 10.5,
            }}
          >
            <button
              onClick={() => selectTheme("slate")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-light)",
                cursor: "pointer",
                padding: "2px 0",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
              title="Reset to original Slate & Terracotta palette"
            >
              ↺ Reset to Original
            </button>
            <div style={{ color: "var(--text-muted)", fontSize: 10 }}>
              Tip: Press <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 4px", borderRadius: 2, color: "var(--text-primary)" }}>P</kbd> to cycle
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
