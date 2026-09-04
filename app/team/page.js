"use client";
import { useState, useEffect } from "react";
import useReveal from "../components/useReveal";

/* ══════════════════════════════════════════════════════════════════════════════
   HOW TO EDIT EXPERIENCES & LOGOS:
   
   1. FIRM LOGOS:
      - Place your logo image files in: /public/team/logos/
        (e.g., /public/team/logos/pictet.png, /public/team/logos/ares.svg)
      - Set the "logo" property below to: "/team/logos/your_filename.png"
      - Note: Logos do NOT need to be circular! The badge uses object-fit: contain
        with a clean background, so rectangular/horizontal logos fit automatically.
      - If no logo image is provided or if it fails to load, it will display the 
        "initials" monogram automatically.

   2. CHRONOLOGICAL ORDER:
      - Latest experience at the TOP of the array.
      - Oldest experience (LSE) at the BOTTOM.

   3. ROLES & DESCRIPTIONS:
      - Edit "role", "organization", "year", "tag", and "note" directly below.
   ══════════════════════════════════════════════════════════════════════════════ */

const TEAM_MEMBERS = [
  {
    name: "Bhavya Patel",
    role: "Founder & Portfolio Manager",
    bio: "Directs long/short equity research ideation, DCF modeling, factor exposure controls, and portfolio execution. Combines mathematical rigor with deep bottom-up fundamental equity research.",
    image: "/team/BhavyaPatelHeadShot.jpg",
    email: "bhavya@sipherstreet.com",
    linkedin: "https://www.linkedin.com/in/bhavyampatel/",
    experiences: [
      {
        organization: "Pictet Atlas",
        role: "Long/Short Equity Analyst",
        year: "June 2026 – September 2026",
        tag: "Hedge Fund",
        logo: "/team/logos/pictet.png",
        initials: "PA",
        note: "Worked alongside a 6-person team managing a global L/S equity strategy across a £3.5 billion book. Successfully pitched a £20 million long position initiated into the portfolio. Coverage: Info Services / Brokers / FinTech.",
      },
      {
        organization: "Veritage Capital",
        role: "Equity Research Analyst",
        year: "December 2024 – May 2026",
        tag: "Equity Research",
        logo: "/team/logos/veritage.jpeg",
        initials: "VC",
        note: "Conducted fundamental bottom-up equity research, financial modeling, and thesis formulation on structural compounders with durable moats.",
      },
      {
        organization: "Ares Management",
        role: "Private Equity and Private Credit Spring Intern",
        year: "April 2025",
        tag: "Private Markets",
        logo: "/team/logos/Ares.jpg",
        initials: "ARES",
        note: "Underwrote credit and equity investments, performed forensic accounting, capital structure stress-testing, and cash flow waterfall modeling.",
      },
      {
        organization: "London School of Economics (LSE)",
        role: "BSc Mathematics with Data Science",
        year: "September 2024 – June 2027",
        tag: "Academic Foundation",
        logo: "/team/logos/lse.webp",
        initials: "LSE",
        note: "Rigorous academic training in mathematical analysis, statistical computing, econometrics, and quantitative modeling applied to capital markets.",
      },
    ],
  },
  {
    name: "Henish Patel",
    role: "Founder & Investment Strategist",
    bio: "Leads competitive advantage evaluation, qualitative moat tracking, and downside stress-testing across fund holdings. Specialises in analyzing barriers to entry, corporate governance, and catalysts.",
    image: "/team/HenishPatelHeadShot.png",
    email: "henish@sipherstreet.com",
    linkedin: "https://www.linkedin.com/in/henish-patel-526729270/",
    experiences: [
      {
        organization: "Lincoln Int.",
        role: "Investment Banking Analyst",
        year: "June 2026 – September 2026",
        tag: "Investment Banking",
        logo: "/team/logos/Lincoln.jpg",
        initials: "LI",
        note: "Advised on M&A and leveraged finance transactions across European middle-market mandates, building detailed LBO models, precedent transaction analyses, and management presentation materials for buy-side and sell-side processes.",
      },
      {
        organization: "London School of Economics (LSE)",
        role: "BSc Data Science",
        year: "September 2024 – June 2027",
        tag: "Academic Foundation",
        logo: "/team/logos/lse.webp",
        initials: "LSE",
        note: "Advanced training in machine learning, statistical inference, and computational data science, with independent applications to equity return decomposition and factor-based analysis.",
      },
    ],
  },
];

// Reusable Firm Logo Badge: Sized generously at 68px, handles any aspect ratio (rectangular or square)
function FirmLogoBadge({ logo, name, initials }) {
  const [imgError, setImgError] = useState(!logo);

  return (
    <div
      className="firm-logo-badge"
      style={{
        width: 64,
        height: 64,
        borderRadius: 12,
        background: "#ffffff",
        border: "1.5px solid rgba(213, 109, 74, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
        position: "relative",
        padding: 6,
        boxSizing: "border-box",
      }}
    >
      {!imgError && logo ? (
        <img
          src={logo}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--bg-surface)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 2,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--accent-light)",
              letterSpacing: "0.05em",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {initials || name.split(" ").map((w) => w[0]).slice(0, 3).join("")}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const [mounted, setMounted] = useState(false);
  const headerReveal = useReveal();
  const teamReveal = useReveal();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingTop: 110, paddingBottom: 100 }}>
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER (Spanning Full Grid Width)
          ══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "min(1480px, 94vw)", margin: "0 auto", padding: "0 24px 44px 24px" }}>
        <div className={"reveal-group" + (mounted ? " in-view" : "")}>
          <div className="reveal-item" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--accent-light)",
                fontWeight: 600,
              }}
            >
              Investment Team
            </span>
            <span className="reveal-line-expand" style={{ width: 32, height: 1, background: "var(--accent-light)" }} />
          </div>

          <h1
            className="reveal-item reveal-delay-1"
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 200,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              marginBottom: 12,
            }}
          >
            The <em>Team</em>
          </h1>

          <p
            className="reveal-item reveal-delay-2"
            style={{
              fontSize: "clamp(15px, 1.4vw, 17px)",
              color: "rgba(244, 243, 239, 0.75)",
              lineHeight: 1.6,
              maxWidth: 720,
              fontWeight: 300,
            }}
          >
            The founding partners directing research ideation, risk controls, and portfolio execution.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SIDE-BY-SIDE 2-COLUMN PARTNER LAYOUT (WIDESCREEN)
          ══════════════════════════════════════════════════════ */}
      <section
        ref={teamReveal.ref}
        className={"reveal-group" + (teamReveal.inView ? " in-view" : "")}
        style={{ maxWidth: "min(1480px, 94vw)", margin: "0 auto", padding: "0 24px" }}
      >
        <div className="team-columns-grid">
          {TEAM_MEMBERS.map((partner, idx) => (
            <div
              key={partner.name}
              className={"hover-lift reveal-item reveal-delay-" + (idx + 1)}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.28)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Partner Profile Header Card - Symmetrically Aligned */}
              <div
                className="partner-card-header"
                style={{
                  padding: "36px 32px 30px 32px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "var(--bg-surface)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 250,
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
                    {/* Portrait Avatar with B&W Editorial Photoshoot Filter */}
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        background: "var(--bg-primary)",
                        border: "2px solid var(--accent-light)",
                        overflow: "hidden",
                        flexShrink: 0,
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
                        position: "relative",
                      }}
                    >
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="partner-portrait"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "grayscale(100%) contrast(1.25) brightness(1.03)",
                          transition: "all 0.4s ease",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerText = partner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("");
                        }}
                      />
                    </div>

                    {/* Name & Role (Cleanly stacked without badge) */}
                    <div>
                      <h2
                        style={{
                          fontSize: "clamp(24px, 2.3vw, 30px)",
                          fontWeight: 300,
                          color: "#ffffff",
                          marginBottom: 4,
                          lineHeight: 1.2,
                        }}
                      >
                        {partner.name}
                      </h2>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--accent-light)",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                        }}
                      >
                        {partner.role}
                      </div>
                    </div>
                  </div>

                  {/* Symmetrically balanced bio paragraph */}
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "rgba(244, 243, 239, 0.85)",
                      lineHeight: 1.65,
                      marginBottom: 20,
                      minHeight: 44,
                    }}
                  >
                    {partner.bio}
                  </p>
                </div>

                {/* Contact & Social Links (Pinned to bottom for perfect horizontal alignment) */}
                <div className="team-contact-actions" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
                  <a
                    href={`mailto:${partner.email}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#f4f3ef",
                      textDecoration: "none",
                      padding: "8px 14px",
                      background: "var(--bg-primary)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-light)";
                      e.currentTarget.style.color = "var(--accent-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                      e.currentTarget.style.color = "#f4f3ef";
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 6l10 7 10-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{partner.email}</span>
                  </a>

                  {partner.linkedin && (
                    <a
                      href={partner.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: "#38bdf8",
                        textDecoration: "none",
                        padding: "8px 14px",
                        background: "var(--bg-primary)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#38bdf8";
                        e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        e.currentTarget.style.background = "var(--bg-primary)";
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Historical Experience Timeline (Succinct & Clean) */}
              <div className="team-timeline-section" style={{ padding: "30px 32px 36px 32px", background: "var(--bg-subsurface)", flex: 1 }}>
                <div style={{ marginBottom: 24 }}>
                  <p className="section-label" style={{ marginBottom: 4, color: "var(--accent-light)" }}>
                    Career Progression & Track Record
                  </p>
                  <h3 style={{ fontSize: 18, fontWeight: 300, color: "#ffffff" }}>
                    Professional <span className="font-heading" style={{ fontStyle: "italic", color: "var(--accent-light)" }}>Experience Timeline</span>
                  </h3>
                </div>

                {/* Vertical Timeline Track */}
                <div style={{ position: "relative", paddingLeft: 4 }}>
                  {/* Glowing vertical line behind badges */}
                  <div
                    style={{
                      position: "absolute",
                      left: 36,
                      top: 32,
                      bottom: 32,
                      width: 2,
                      background: "linear-gradient(to bottom, var(--accent-light) 0%, var(--accent-dim) 100%)",
                    }}
                  />

                  <div style={{ display: "grid", gap: 20 }}>
                    {partner.experiences.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {/* 64px Firm Logo Badge (supports any aspect ratio cleanly) */}
                        <FirmLogoBadge logo={item.logo} name={item.organization} initials={item.initials} />

                        {/* Experience Milestone Details Card */}
                        <div
                          style={{
                            background: "var(--bg-surface)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 2,
                            padding: "16px 18px",
                            flex: 1,
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 15.5, fontWeight: 600, color: "#ffffff", marginBottom: 2 }}>
                                {item.organization}
                              </div>
                              <div
                                style={{
                                  fontSize: 12.5,
                                  color: "var(--accent-light)",
                                  fontWeight: 500,
                                  lineHeight: 1.4,
                                  whiteSpace: item.organization === "Lincoln Int." ? "nowrap" : undefined,
                                }}
                              >
                                {item.role}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "nowrap" }}>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  color: "rgba(244, 243, 239, 0.6)",
                                  fontWeight: 600,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.year}
                              </span>
                              <span
                                style={{
                                  fontSize: 9.5,
                                  padding: "2px 6px",
                                  background: "rgba(255, 255, 255, 0.08)",
                                  border: "1px solid rgba(255, 255, 255, 0.12)",
                                  borderRadius: 2,
                                  color: "rgba(244, 243, 239, 0.8)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.tag}
                              </span>
                            </div>
                          </div>

                          <p style={{ fontSize: 13, color: "rgba(244, 243, 239, 0.82)", lineHeight: 1.6, margin: 0 }}>
                            {item.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .team-columns-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 36px;
          align-items: stretch;
        }
        @media (max-width: 1080px) {
          .team-columns-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
        @media (max-width: 768px) {
          .partner-card-header {
            padding: 28px 24px 24px 24px !important;
            min-height: auto !important;
          }
          .firm-logo-badge {
            width: 52px !important;
            height: 52px !important;
            border-radius: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .partner-card-header {
            padding: 24px 18px 20px 18px !important;
          }
          .partner-portrait {
            width: 72px !important;
            height: 72px !important;
          }
          .firm-logo-badge {
            width: 44px !important;
            height: 44px !important;
            border-radius: 8px !important;
            padding: 4px !important;
          }
          .team-timeline-section {
            padding: 24px 16px 28px 16px !important;
          }
          .team-contact-actions {
            width: 100%;
          }
          .team-contact-actions a {
            flex: 1 1 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
