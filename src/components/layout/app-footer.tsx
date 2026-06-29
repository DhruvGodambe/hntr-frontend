export function AppFooter() {
  return (
    <footer className="vault-footer border-t border-bd0 bg-e1 px-3 py-2.5 sm:px-5 sm:py-[10px]">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-label tracking-[0.04em] text-t0">
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
      </div>
    </footer>
  );
}
