"use client";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in all fields.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `Sipher Street Contact: ${form.subject}`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-section" style={{ maxWidth: 600 }}>
      <p className="section-label">Get In Touch</p>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Contact <span>Us</span>
      </h2>
      <p
        style={{
          color: "#5a6a7e",
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
            border: "1px solid #1e3a5f",
            background: "rgba(30,58,95,0.04)",
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <div style={{ fontSize: 24, color: "#1e3a5f", marginBottom: 12 }}>
            ✓
          </div>
          <p style={{ color: "#1a2a44", fontSize: 15 }}>
            Message sent successfully. We'll be in touch.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 4,
                color: "#dc2626",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={handleChange("name")}
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange("email")}
            />
          </div>
          <div>
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              value={form.subject}
              onChange={handleChange("subject")}
            />
          </div>
          <div>
            <label className="form-label">Message</label>
            <textarea
              rows={5}
              className="form-input"
              style={{ resize: "vertical" }}
              value={form.message}
              onChange={handleChange("message")}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="btn-primary"
            style={{
              justifySelf: "start",
              opacity: sending ? 0.6 : 1,
              cursor: sending ? "default" : "pointer",
            }}
          >
            {sending ? "Sending..." : "Send Message"}
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
          ["Email", "team@sipherstreet.com"],
          ["Location", "LSE Campus"],
        ].map(([label, value]) => (
          <div key={label}>
            <div
              style={{
                fontSize: 11,
                color: "#8896a6",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 14, color: "#1a2a44" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}