"use client";
import useReveal from "../components/useReveal";

/*
  HOW TO ADD HEADSHOTS:
  1. Put your photos in public/team/ folder (e.g. public/team/bhavya.jpg)
  2. Update the "image" field below to match the filename
  3. Push to GitHub and Vercel will auto-deploy
  
  Recommended: square images, at least 300x300px
*/

const TEAM = [
  {
    name: "Bhavya Patel",
    role: "Founder",
    desc: "",
    image: "/team/BhavyaPatelHeadShot.jpg",
    email: "bhavya@sipherstreet.com",
    linkedin: "https://www.linkedin.com/in/bhavyampatel/",
  },
  {
    name: "Henish Patel",
    role: "Founder",
    desc: "",
    image: "/team/HenishPatelHeadShot.png",
    email: "henish@sipherstreet.com",
    linkedin: "https://www.linkedin.com/in/henish-patel-526729270/",
  },
];

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#1a2a44" strokeWidth="1.8" fill="none" />
      <path d="M2 6l10 7 10-7" stroke="#1a2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="#0A66C2" />
    </svg>
  );
}

export default function Team() {
  var headerReveal = useReveal();
  var cardsReveal = useReveal();

  return (
    <div className="page-section" style={{ maxWidth: 800 }}>
      <div ref={headerReveal.ref} className={"reveal" + (headerReveal.inView ? " in-view" : "")}>
        <p className="section-label">Our People</p>
        <h2 className="section-title">
          The <span>Team</span>
        </h2>
      </div>

      <div
        ref={cardsReveal.ref}
        className={"reveal" + (cardsReveal.inView ? " in-view" : "")}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 32,
          justifyItems: "center",
        }}
      >
        {TEAM.map(function (m) {
          return (
            <div
              key={m.name}
              className="hover-card"
              style={{
                padding: 40,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                textAlign: "center",
                width: "100%",
                maxWidth: 340,
              }}
            >
              {/* Headshot circle */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1e3a5f, #2c3e5a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 300,
                  color: "#fff",
                  margin: "0 auto 24px",
                  overflow: "hidden",
                }}
              >
                {m.image ? (
                  <img
                    src={m.image}
                    alt={m.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={function (e) {
                      e.target.style.display = "none";
                      e.target.parentElement.innerText = m.name
                        .split(" ")
                        .map(function (n) { return n[0]; })
                        .join("");
                    }}
                  />
                ) : (
                  m.name
                    .split(" ")
                    .map(function (n) { return n[0]; })
                    .join("")
                )}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1a2a44",
                  marginBottom: 6,
                }}
              >
                {m.name}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#1e3a5f",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                {m.role}
              </p>

              {/* Email row */}
              {m.email && (
                <a
                  href={"mailto:" + m.email}
                  title={m.email}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#5a6a7e",
                    transition: "color 0.2s",
                    marginBottom: 14,
                  }}
                  onMouseEnter={function (e) { e.currentTarget.style.color = "#1a2a44"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.color = "#5a6a7e"; }}
                >
                  <MailIcon />
                  <span>{m.email}</span>
                </a>
              )}

              {/* LinkedIn button */}
              {m.linkedin && (
                <div style={{ marginTop: 2 }}>
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.borderColor = "#0A66C2";
                      e.currentTarget.style.background = "rgba(10, 102, 194, 0.08)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(10, 102, 194, 0.15)";
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              )}

              {m.desc && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#5a6a7e",
                    lineHeight: 1.6,
                    marginTop: 12,
                  }}
                >
                  {m.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}