export default function LayoutFooter() {
  return (
    <div className="vault-footer">
      <div>© {new Date().getFullYear()} HNTR . ART .</div>
      <div style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: "5px" }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)" }} />
        ● TERMINAL STATUS: OPTIMAL
      </div>
    </div>
  );
}
