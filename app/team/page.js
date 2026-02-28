"use client";

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
  },
  {
    name: "Henish Patel",
    role: "Founder",
    desc: "",
    image: "/team/henish.jpg",
  },
];

export default function Team() {
  return (
    <div className="page-section" style={{ maxWidth: 800 }}>
      <p className="section-label">Our People</p>
      <h2 className="section-title">
        The <span>Team</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 32,
          justifyItems: "center",
        }}
      >
        {TEAM.map((m) => (
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
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerText = m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("");
                  }}
                />
              ) : (
                m.name
                  .split(" ")
                  .map((n) => n[0])
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
              }}
            >
              {m.role}
            </p>
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
        ))}
      </div>
    </div>
  );
}