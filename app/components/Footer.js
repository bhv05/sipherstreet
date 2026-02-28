export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #111",
        padding: "40px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#444" }}>
        © 2026 Sipher Street. Student-run investment fund.
      </div>
      <div style={{ fontSize: 11, color: "#333" }}>
        Paper trading via Alpaca · Not real capital
      </div>
    </footer>
  );
}