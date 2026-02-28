"use client";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="page-section" style={{ maxWidth: 600 }}>
      <p className="section-label">Get In Touch</p>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Contact <span>Us</span>
      </h2>
      <p
        style={{
          color: "#666",
          fontSize: 14,
          lineHeight: 1.7,
          marginBottom: 48,
        }}
      >
        Interested in joining our team or learning more about our investment
        process? We'd love to hear from you.
      </p>

      {sent ? (
        <div
          style={{
            padding: 40,
            border: "1px solid #10b981",
            background: "rgba(16,185,129,0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, color: "#10b981", marginBottom: 12 }}>
            ✓
          </div>
          <p style={{ color: "#ccc", fontSize: 15 }}>
            Message sent successfully. We'll be in touch.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {[
            ["Name", "text"],
            ["Email", "email"],
            ["Subject", "text"],
          ].map(([label, type]) => (
            <div key={label}>
              <label className="form-label">{label}</label>
              <input type={type} className="form-input" />
            </div>
          ))}
          <div>
            <label className="form-label">Message</label>
            <textarea
              rows={5}
              className="form-input"
              style={{ resize: "vertical" }}
            />
          </div>
          <button
            onClick={() => setSent(true)}
            className="btn-primary"
            style={{ justifySelf: "start" }}
          >
            Send Message
          </button>
        </div>
      )}

      {/* Contact info */}
      <div
        style={{
          marginTop: 64,
          display: "flex",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        {[
          ["Email", "fund@university.edu"],
          ["Location", "University Campus"],
          ["Meeting", "Tuesdays, 6:00 PM"],
        ].map(([label, value]) => (
          <div key={label}>
            <div
              style={{
                fontSize: 11,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 14, color: "#ccc" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}