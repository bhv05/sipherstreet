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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 12,
          color: "#8896a6",
        }}
      >
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="Sipher Street"
            width={100}
            height={28}
            style={{
              height: 28,
              width: "auto",
              objectFit: "contain",
              display: "block",
              verticalAlign: "middle",
            }}
          />
        </span>
        <span>© 2026 Sipher Street. Student-run investment fund.</span>
      </div>
    </footer>
  );
}