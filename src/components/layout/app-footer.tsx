export function AppFooter() {
  return (
    <footer className="vault-footer flex items-center justify-between border-t border-bd0 bg-e1 px-5 py-[10px] font-mono text-[9px] tracking-[0.04em] text-t0">
      <div>© 2024 HNTR INSTITUTIONAL</div>
      <div className="flex items-center gap-[5px] text-green">
        <span
          className="size-[5px] shrink-0 rounded-full bg-green"
          aria-hidden
        />
        TERMINAL STATUS: OPTIMAL
      </div>
      <div className="footer-links hidden items-center gap-5 sm:flex">
        <span className="footer-link cursor-pointer transition-colors hover:text-t2">
          TERMS OF SERVICE
        </span>
        <span className="footer-link cursor-pointer transition-colors hover:text-t2">
          PRIVACY POLICY
        </span>
        <span className="footer-link cursor-pointer transition-colors hover:text-t2">
          RISK DISCLOSURE
        </span>
      </div>
    </footer>
  );
}
