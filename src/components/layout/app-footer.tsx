export function AppFooter() {
  return (
    <footer className="vault-footer border-t border-bd0 bg-e1 px-2 py-2 sm:px-5 sm:py-[10px]">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <div className="font-mono text-micro leading-snug tracking-[0.03em] text-t0 sm:text-label sm:tracking-[0.04em]">
          © 2024 HNTR INSTITUTIONAL
        </div>
        <div className="flex items-center gap-[5px] font-mono text-micro leading-snug tracking-[0.03em] text-green sm:text-label sm:tracking-[0.04em]">
          <span
            className="size-[4px] shrink-0 rounded-full bg-green sm:size-[5px]"
            aria-hidden
          />
          <span className="sm:hidden">STATUS: OPTIMAL</span>
          <span className="hidden sm:inline">TERMINAL STATUS: OPTIMAL</span>
        </div>
        <div className="footer-links hidden items-center gap-5 sm:flex">
          <span className="footer-link cursor-pointer font-mono text-caption tracking-[0.03em] transition-colors hover:text-t2 lg:text-micro">
            TERMS OF SERVICE
          </span>
          <span className="footer-link cursor-pointer font-mono text-caption tracking-[0.03em] transition-colors hover:text-t2 lg:text-micro">
            PRIVACY POLICY
          </span>
          <span className="footer-link cursor-pointer font-mono text-caption tracking-[0.03em] transition-colors hover:text-t2 lg:text-micro">
            RISK DISCLOSURE
          </span>
        </div>
      </div>
    </footer>
  );
}
