export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #e2e8f0",
        padding: "40px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        background: "#f8fafc",
      }}
    >
      <div style={{ fontSize: 12, color: "#8896a6" }}>
        © 2026 Sipher Street. Student-run investment fund.
      </div>
      <div style={{ fontSize: 11, color: "#a0aec0" }}>
        Paper trading via Alpaca · Not real capital
      </div>
    </footer>
  );
}