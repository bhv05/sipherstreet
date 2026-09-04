"use client";
import { useState, useEffect, Suspense } from "react";
import { Link } from "next-view-transitions";
import { useSearchParams } from "next/navigation";
import useReveal from "../components/useReveal";

function ContactContent() {
  const searchParams = useSearchParams();
  const defaultSubject = searchParams.get("subject") || "";

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: defaultSubject,
    message: "",
  });

  var [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (defaultSubject) {
      setForm((prev) => ({ ...prev, subject: defaultSubject }));
    }
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, [defaultSubject]);

  var headerReveal = useReveal();
  var formReveal = useReveal();
  var infoReveal = useReveal();

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in all required fields.");
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
          subject: `Sipher Street Allocator / LP Enquiry: ${form.subject}`,
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
        setError("Unable to submit message. Please try again or email us directly at team@sipherstreet.com.");
      }
    } catch (err) {
      setError("Failed to send message. Please contact us at team@sipherstreet.com");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingTop: 100 }}>
      <div className="page-section" style={{ maxWidth: 740, paddingTop: 32 }}>
        <div className={"reveal-group" + (mounted ? " in-view" : "")}>
          <p className="section-label reveal-item" style={{ color: "var(--accent-light)" }}>Institutional Investor Dialogue</p>
          <h1 className="section-title reveal-item reveal-delay-1" style={{ marginBottom: 16 }}>
            Allocating Capital to <em>SSC</em>
          </h1>
          <p
            className="reveal-item reveal-delay-2"
            style={{
              color: "rgba(244, 243, 239, 0.8)",
              fontSize: 15,
              lineHeight: 1.75,
              marginBottom: 44,
            }}
          >
            We welcome direct discussions with qualified institutional allocators, single and multi-family offices, and LP co-investors seeking to allocate capital to Sipher Street Capital. Please submit your inquiry below to initiate due diligence.
          </p>
        </div>

        <div ref={formReveal.ref} className={"reveal-group" + (formReveal.inView ? " in-view" : "")}>
          {sent ? (
            <div
              style={{
                padding: 44,
                border: "1px solid rgba(52, 211, 153, 0.3)",
                background: "rgba(52, 211, 153, 0.08)",
                textAlign: "center",
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div style={{ fontSize: 28, color: "#34d399", marginBottom: 12 }}>
                ✓
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>
                Allocation Inquiry Received
              </h3>
              <p style={{ color: "rgba(244, 243, 239, 0.85)", fontSize: 15 }}>
                Thank you for your interest in allocating capital to Sipher Street Capital. A managing partner will review your inquiry and provide confidential fund documentation.
              </p>
            </div>
          ) : (
            <div
              className="contact-form-card"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "36px 32px",
                borderRadius: 2,
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
                display: "grid",
                gap: 20,
              }}
            >
              {error && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(248, 113, 113, 0.1)",
                    border: "1px solid rgba(248, 113, 113, 0.25)",
                    color: "#f87171",
                    fontSize: 13,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="form-label" style={{ color: "rgba(244, 243, 239, 0.75)" }}>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ background: "var(--bg-primary)", border: "1px solid rgba(255, 255, 255, 0.14)", color: "#ffffff" }}
                  placeholder="e.g. Eleanor Vance"
                  value={form.name}
                  onChange={handleChange("name")}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: "rgba(244, 243, 239, 0.75)" }}>Institutional / Allocator Email *</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ background: "var(--bg-primary)", border: "1px solid rgba(255, 255, 255, 0.14)", color: "#ffffff" }}
                  placeholder="e.g. name@familyoffice.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: "rgba(244, 243, 239, 0.75)" }}>Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ background: "var(--bg-primary)", border: "1px solid rgba(255, 255, 255, 0.14)", color: "#ffffff" }}
                  placeholder="e.g. Allocating Capital to SSC / LP Co-Investment Inquiry"
                  value={form.subject}
                  onChange={handleChange("subject")}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: "rgba(244, 243, 239, 0.75)" }}>Message / Allocation Parameters *</label>
                <textarea
                  rows={5}
                  className="form-input"
                  style={{ resize: "vertical", background: "var(--bg-primary)", border: "1px solid rgba(255, 255, 255, 0.14)", color: "#ffffff" }}
                  placeholder="e.g. We are interested in reviewing the partnership terms, discussing a potential capital allocation to SSC, and receiving the latest portfolio due diligence materials..."
                  value={form.message}
                  onChange={handleChange("message")}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={sending}
                className="btn-primary contact-submit-btn"
                style={{
                  justifySelf: "start",
                  opacity: sending ? 0.7 : 1,
                  cursor: sending ? "default" : "pointer",
                }}
              >
                {sending ? "Submitting Inquiry..." : "Submit Allocation Inquiry"}
              </button>
            </div>
          )}
        </div>

        {/* Office & Direct Contact Info */}
        <div
          ref={infoReveal.ref}
          className={"reveal-group contact-info-grid" + (infoReveal.inView ? " in-view" : "")}
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
            paddingTop: 36,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="reveal-item reveal-delay-1">
            <div style={{ fontSize: 10, color: "rgba(244, 243, 239, 0.5)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6, fontWeight: 700 }}>
              Direct LP Inquiries
            </div>
            <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>
              team@sipherstreet.com
            </div>
          </div>
          <div className="reveal-item reveal-delay-2">
            <div style={{ fontSize: 10, color: "rgba(244, 243, 239, 0.5)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6, fontWeight: 700 }}>
              Partnership Office
            </div>
            <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>
              London, United Kingdom
            </div>
          </div>
          <div className="reveal-item reveal-delay-3">
            <div style={{ fontSize: 10, color: "rgba(244, 243, 239, 0.5)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6, fontWeight: 700 }}>
              Live Portfolio
            </div>
            <div style={{ fontSize: 14, color: "var(--accent-light)", fontWeight: 600 }}>
              <Link href="/portfolio" style={{ color: "var(--accent-light)" }}>View Reconciled Portfolio Holdings →</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .contact-info-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .contact-form-card {
            padding: 24px 18px !important;
          }
          .contact-submit-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function Contact() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg-primary)", minHeight: "100vh" }} />}>
      <ContactContent />
    </Suspense>
  );
}

